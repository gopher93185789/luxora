import { useState } from "react";
import { motion } from "framer-motion";
import { CreateListing } from "~/pkg/api/products";
import type { Product } from "~/pkg/models/api";

interface CreateListingFormProps {
  onClose: () => void;
  onSuccess: () => void;
}

export function CreateListingForm({ onClose, onSuccess }: CreateListingFormProps) {
  const [formData, setFormData] = useState({
    itemName: "",
    category: "",
    description: "",
    price: "",
    images: [] as string[]
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    
    files.forEach(file => {
      const reader = new FileReader();
      reader.onload = (event) => {
        const base64String = event.target?.result as string;
        setFormData(prev => ({
          ...prev,
          images: [...prev.images, base64String]
        }));
      };
      reader.readAsDataURL(file);
    });
  };

  const removeImage = (index: number) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      const productData: Product = {
        name: formData.itemName,
        category: formData.category,
        description: formData.description,
        price: parseFloat(formData.price),
        product_images: formData.images.map((image, index) => ({
          base_64_image: image.split(',')[1],
          order: index
        }))
      };


      console.log(productData)

      const result = await CreateListing(productData);
      
      if ("code" in result) {
        setError(result.message);
      } else {
        onSuccess();
      }
    } catch (err) {
      setError("Failed to create listing. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <motion.div
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <motion.div
        className="bg-primary border border-border/10 rounded-lg p-8 w-full max-w-2xl max-h-[90vh] overflow-y-auto"
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
      >
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-text-primary">Create New Listing</h2>
          <button
            onClick={onClose}
            className="text-text-primary/70 hover:text-text-primary transition-colors"
            aria-label="Close"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M18 6L6 18M6 6l12 12"/>
            </svg>
          </button>
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4 mb-6">
            <p className="text-red-400">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-text-primary mb-2">
              Product Name *
            </label>
            <input
              type="text"
              required
              value={formData.itemName}
              onChange={(e) => setFormData(prev => ({ ...prev, itemName: e.target.value }))}
              className="w-full px-4 py-3 bg-accent/5 border border-border/20 rounded-lg text-text-primary placeholder-text-primary/50 focus:outline-none focus:ring-2 focus:ring-secondary/50"
              placeholder="Enter product name"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-text-primary mb-2">
              Category *
            </label>
            <select
              required
              value={formData.category}
              onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
              className="w-full px-4 py-3 bg-accent/5 border border-border/20 rounded-lg text-text-primary focus:outline-none focus:ring-2 focus:ring-secondary/50"
            >
              <option value="">Select a category</option>
              <option value="electronics">Electronics</option>
              <option value="clothing">Clothing</option>
              <option value="home">Home & Garden</option>
              <option value="sports">Sports & Outdoors</option>
              <option value="books">Books</option>
              <option value="toys">Toys & Games</option>
              <option value="automotive">Automotive</option>
              <option value="other">Other</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-text-primary mb-2">
              Price *
            </label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-text-primary/70">$</span>
              <input
                type="number"
                step="0.01"
                min="0"
                required
                value={formData.price}
                onChange={(e) => setFormData(prev => ({ ...prev, price: e.target.value }))}
                className="w-full pl-8 pr-4 py-3 bg-accent/5 border border-border/20 rounded-lg text-text-primary placeholder-text-primary/50 focus:outline-none focus:ring-2 focus:ring-secondary/50"
                placeholder="0.00"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-text-primary mb-2">
              Description *
            </label>
            <textarea
              required
              rows={4}
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              className="w-full px-4 py-3 bg-accent/5 border border-border/20 rounded-lg text-text-primary placeholder-text-primary/50 focus:outline-none focus:ring-2 focus:ring-secondary/50 resize-none"
              placeholder="Describe your product..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-text-primary mb-2">
              Images
            </label>
            <input
              type="file"
              multiple
              accept="image/*"
              onChange={handleImageUpload}
              className="w-full px-4 py-3 bg-accent/5 border border-border/20 rounded-lg text-text-primary file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-secondary file:text-accent hover:file:bg-secondary/80"
            />
            
            {formData.images.length > 0 && (
              <div className="mt-4 grid grid-cols-2 md:grid-cols-3 gap-4">
                {formData.images.map((image, index) => (
                  <div key={index} className="relative group">
                    <img
                      src={image}
                      alt={`Upload ${index + 1}`}
                      className="w-full h-24 object-cover rounded-lg border border-border/20"
                    />
                    <button
                      type="button"
                      onClick={() => removeImage(index)}
                      className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="flex gap-4 pt-6">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-6 py-3 border border-border/20 text-text-primary rounded-lg hover:bg-accent/10 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 px-6 py-3 bg-secondary hover:bg-secondary/80 disabled:opacity-50 disabled:cursor-not-allowed text-accent rounded-lg transition-colors font-medium flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M21 12a9 9 0 11-6.219-8.56"/>
                  </svg>
                  Creating...
                </>
              ) : (
                "Create Listing"
              )}
            </button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
}
