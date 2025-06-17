import { useLoaderData, useNavigate, Link } from "@remix-run/react";
import { json, type LoaderFunctionArgs } from "@remix-run/cloudflare";
import { useState } from "react";
import { motion } from "framer-motion";
import { GetProduct, type ProductInfo } from "~/pkg/api/products";
import type { ErrorResponse } from "~/pkg/models/api";
import { Sidebar } from "~/components/navigation/sidebar";

export async function loader({ params }: LoaderFunctionArgs) {
  const { productId } = params;
  
  if (!productId) {
    throw new Response("Product ID is required", { status: 400 });
  }

  const result = await GetProduct(productId);
  
  if ("code" in result) {
    throw new Response(result.message, { status: result.code });
  }

  return json({ product: result });
}

export default function ProductPage() {
  const { product } = useLoaderData<typeof loader>();
  const navigate = useNavigate();
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [imageError, setImageError] = useState(false);

  const formatPrice = (price: number, currency: string) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency || 'USD',
    }).format(price);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleImageError = () => {
    setImageError(true);
  };

  const selectedImage = product.product_images?.[selectedImageIndex];

  return (
    <main className="min-h-screen flex">
      <Sidebar />
      <div className="flex-1 px-64 pl-5 p-5">
        <div className="max-w-7xl w-full mx-auto">
          <nav className="flex items-center space-x-2 text-sm text-text-primary/60 mb-6">
            <Link to="/marketplace" className="hover:text-text-secondary transition-colors">
              Marketplace
            </Link>
            <span>/</span>
            <span className="text-text-primary">{product.name}</span>
          </nav>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="space-y-4">
              <div className="aspect-square bg-primary/50 rounded-lg overflow-hidden border border-border/10">
                {selectedImage && !imageError ? (
                  <img
                    src={`data:image/jpeg;base64,${selectedImage.base_64_image}`}
                    alt={product.name}
                    className="w-full h-full object-cover"
                    onError={handleImageError}
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-text-primary/50">
                    <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
                      <circle cx="8.5" cy="8.5" r="1.5"/>
                      <path d="M21 15l-5-5L5 21"/>
                    </svg>
                  </div>
                )}
              </div>

              {product.product_images && product.product_images.length > 1 && (
                <div className="flex space-x-2 overflow-x-auto">
                  {product.product_images.map((image, index) => (
                    <button
                      key={index}
                      onClick={() => setSelectedImageIndex(index)}
                      className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition-all ${
                        selectedImageIndex === index 
                          ? 'border-accent' 
                          : 'border-border/10 hover:border-border/20'
                      }`}
                    >
                      <img
                        src={`data:image/jpeg;base64,${image.base_64_image}`}
                        alt={`${product.name} ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="space-y-6">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <span className="bg-secondary/90 text-accent px-3 py-1 rounded-full text-sm font-medium">
                    {product.category}
                  </span>
                  <span className="text-text-primary/50 text-sm">
                    Listed on {formatDate(product.created_at)}
                  </span>
                </div>
                <h1 className="text-3xl font-bold text-text-primary mb-4">
                  {product.name}
                </h1>
                <p className="text-4xl font-bold text-text-secondary mb-6">
                  {formatPrice(product.price, product.currency)}
                </p>
              </div>

              <div className="space-y-4">
                <h2 className="text-xl font-semibold text-text-primary">Description</h2>
                <p className="text-text-primary/80 leading-relaxed whitespace-pre-wrap">
                  {product.description}
                </p>
              </div>

              <div className="space-y-3 pt-6">
                <motion.button
                  className="w-full bg-accent hover:bg-accent/90 text-white font-semibold py-3 px-6 rounded-lg transition-colors"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  Contact Seller
                </motion.button>
                
                <motion.button
                  className="w-full bg-primary border border-border/20 hover:border-border/40 text-text-primary font-semibold py-3 px-6 rounded-lg transition-colors"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  Add to Watchlist
                </motion.button>
              </div>

              <div className="pt-6 border-t border-border/10">
                <h3 className="text-lg font-semibold text-text-primary mb-3">Product Details</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-text-primary/60">Product ID</span>
                    <span className="text-text-primary font-mono">{product.id}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-text-primary/60">Category</span>
                    <span className="text-text-primary">{product.category}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-text-primary/60">Listed by</span>
                    <span className="text-text-primary">{product.created_by}</span>
                  </div>
                  {product.product_images && (
                    <div className="flex justify-between">
                      <span className="text-text-primary/60">Images</span>
                      <span className="text-text-primary">{product.product_images.length}</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="pt-4">
                <button
                  onClick={() => navigate(-1)}
                  className="flex items-center space-x-2 text-text-primary/60 hover:text-text-secondary transition-colors"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M19 12H5"/>
                    <path d="M12 19l-7-7 7-7"/>
                  </svg>
                  <span>Back to Marketplace</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
