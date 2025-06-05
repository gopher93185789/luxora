import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "@remix-run/react";
import type { ProductInfo } from "~/pkg/api/products";

interface ProductCardProps {
  product: ProductInfo;
  onDelete?: (productId: string) => void;
  showDeleteButton?: boolean;
  className?: string;
}

export function ProductCard({ 
  product, 
  onDelete, 
  showDeleteButton = false, 
  className = "" 
}: ProductCardProps) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const primaryImage = product.product_images?.[0];
  const hasMultipleImages = product.product_images?.length > 1;

  const nextImage = () => {
    if (hasMultipleImages) {
      setCurrentImageIndex((prev) => 
        prev === product.product_images.length - 1 ? 0 : prev + 1
      );
    }
  };

  const prevImage = () => {
    if (hasMultipleImages) {
      setCurrentImageIndex((prev) => 
        prev === 0 ? product.product_images.length - 1 : prev - 1
      );
    }
  };

  const formatPrice = (price: number, currency: string) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency || 'USD',
    }).format(price);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const handleDelete = () => {
    if (onDelete && product.id) {
      onDelete(product.id);
      setShowDeleteConfirm(false);
    }
  };

  return (
    <motion.div
      className={`relative bg-primary border border-border/10 rounded-lg overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 ${className}`}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -4 }}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
    >
      <div className="relative h-64 overflow-hidden">
        {primaryImage ? (
          <div className="relative w-full h-full">
            <img
              src={`data:image/jpeg;base64,${product.product_images[currentImageIndex]?.base_64_image}`}
              alt={product.name}
              className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
            />
            
            {hasMultipleImages && (
              <AnimatePresence>
                {isHovered && (
                  <>
                    <motion.button
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -10 }}
                      onClick={prevImage}
                      className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full transition-colors"
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M15 18l-6-6 6-6"/>
                      </svg>
                    </motion.button>
                    
                    <motion.button
                      initial={{ opacity: 0, x: 10 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 10 }}
                      onClick={nextImage}
                      className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full transition-colors"
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M9 18l6-6-6-6"/>
                      </svg>
                    </motion.button>
                  </>
                )}
              </AnimatePresence>
            )}

            {hasMultipleImages && (
              <div className="absolute bottom-2 right-2 bg-black/50 text-white text-xs px-2 py-1 rounded">
                {currentImageIndex + 1} / {product.product_images.length}
              </div>
            )}
          </div>
        ) : (
          <div className="w-full h-full bg-gray-200 flex items-center justify-center">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-gray-400">
              <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
              <circle cx="8.5" cy="8.5" r="1.5"/>
              <path d="M21 15l-5-5L5 21"/>
            </svg>
          </div>
        )}

        <div className="absolute top-2 left-2">
          <span className="bg-secondary/80 text-accent text-xs px-2 py-1 rounded-full backdrop-blur-sm">
            {product.category}
          </span>
        </div>

        {showDeleteButton && (
          <div className="absolute top-2 right-2">
            <button
              onClick={() => setShowDeleteConfirm(true)}
              className="bg-red-500/80 hover:bg-red-600 text-white p-2 rounded-full transition-colors backdrop-blur-sm"
              title="Delete Product"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M3 6h18M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2m3 0v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6h14zM10 11v6M14 11v6"/>
              </svg>
            </button>
          </div>
        )}
      </div>

      <div className="p-4">
        <div className="flex justify-between items-start mb-2">
          <h3 className="text-lg font-semibold text-text-primary truncate flex-1 mr-2">
            {product.name}
          </h3>
          <span className="text-xl font-bold text-text-secondary whitespace-nowrap">
            {formatPrice(product.price, product.currency)}
          </span>
        </div>

        <p className="text-text-primary/70 text-sm mb-3 line-clamp-2">
          {product.description}
        </p>

        <div className="flex items-center justify-between text-xs text-text-primary/50">
          <span>By {product.created_by}</span>
          <span>{formatDate(product.created_at)}</span>
        </div>

        <div className="mt-4 flex gap-2">
          <Link
            to={`/marketplace/product/${product.id}`}
            className="flex-1 bg-secondary hover:bg-secondary/80 text-accent text-center py-2 px-4 rounded transition-colors font-medium"
          >
            View Details
          </Link>
          <button className="bg-accent/10 hover:bg-accent/20 text-accent p-2 rounded transition-colors" title="Favorite Product">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
            </svg>
          </button>
        </div>
      </div>

      <AnimatePresence>
        {showDeleteConfirm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/80 flex items-center justify-center z-50"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-primary border border-border/20 rounded-lg p-6 max-w-sm mx-4"
            >
              <h4 className="text-lg font-semibold text-text-primary mb-2">
                Delete Product
              </h4>
              <p className="text-text-primary/70 mb-4">
                Are you sure you want to delete "{product.name}"? This action cannot be undone.
              </p>
              <div className="flex gap-2">
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  className="flex-1 bg-gray-600 hover:bg-gray-700 text-white py-2 px-4 rounded transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDelete}
                  className="flex-1 bg-red-600 hover:bg-red-700 text-white py-2 px-4 rounded transition-colors"
                >
                  Delete
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}