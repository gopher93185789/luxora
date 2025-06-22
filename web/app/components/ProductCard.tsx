import React, { useState } from "react";
import { motion } from "framer-motion";
import { Link } from "@remix-run/react";
import type { ProductInfo } from "~/pkg/api/products";

interface ProductCardProps {
  product: ProductInfo;
  onDelete?: (productId: string) => void;
  showDeleteButton?: boolean;
}

export function ProductCard({ product, onDelete, showDeleteButton = false }: ProductCardProps) {
  const [imageError, setImageError] = useState(false);
  const [imageLoading, setImageLoading] = useState(true);

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

  const handleDeleteClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (onDelete) {
      onDelete(product.id);
    }
  };

  const handleImageLoad = () => {
    setImageLoading(false);
  };

  const handleImageError = () => {
    setImageError(true);
    setImageLoading(false);
  };

  const primaryImage = product.product_images?.find(img => img.order === 0) || product.product_images?.[0];

  return (
    <Link to={`/product/${product.id}`} className="block">
      <motion.div
        className="bg-primary border border-border/10 rounded-lg overflow-hidden hover:border-border/20 transition-all duration-300 group cursor-pointer"
        whileHover={{ y: -4 }}
        transition={{ duration: 0.2 }}
      >
      <div className="relative aspect-square overflow-hidden bg-primary/50">
        {primaryImage && !imageError ? (
          <>
            {imageLoading && (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="animate-spin h-6 w-6 border-2 border-text-primary/30 border-t-text-primary rounded-full"></div>
              </div>
            )}
            <img
              src={`data:image/jpg;base64,${primaryImage.base_64_image}`}
              alt={product.name}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              onLoad={handleImageLoad}
              onError={handleImageError}
            />
          </>
        ) : (
          <div className="w-full h-full flex items-center justify-center text-text-primary/50">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
              <circle cx="8.5" cy="8.5" r="1.5"/>
              <path d="M21 15l-5-5L5 21"/>
            </svg>
          </div>
        )}

        {showDeleteButton && onDelete && (
          <button
            onClick={handleDeleteClick}
            className="absolute top-2 right-2 bg-red-500 hover:bg-red-600 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-200"
            title="Delete product"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M3 6h18"/>
              <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/>
              <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/>
            </svg>
          </button>
        )}

        <div className="absolute top-2 left-2">
          <span className="bg-secondary/90 text-accent px-2 py-1 rounded-full text-xs font-medium">
            {product.category}
          </span>
        </div>
      </div>

      <div className="p-4 space-y-3">
        <h3 className="font-semibold text-text-primary text-lg line-clamp-1 group-hover:text-text-secondary transition-colors">
          {product.name}
        </h3>

        <p className="text-text-primary/70 text-sm line-clamp-2 min-h-[2.5rem]">
          {product.description}
        </p>

        <div className="flex items-center justify-between">
          <span className="text-text-secondary font-bold text-xl">
            {formatPrice(product.price, product.currency)}
          </span>
          <span className="text-text-primary/50 text-xs">
            {formatDate(product.created_at)}
          </span>
        </div>

        {product.product_images && product.product_images.length > 1 && (
          <div className="flex items-center gap-1">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-text-primary/50">
              <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
              <circle cx="8.5" cy="8.5" r="1.5"/>
              <path d="M21 15l-5-5L5 21"/>
            </svg>
            <span className="text-text-primary/50 text-xs">
              +{product.product_images.length - 1} more
            </span>
          </div>
        )}
      </div>

      <div className="absolute inset-0 bg-gradient-to-t from-primary/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
    </motion.div>
    </Link>
  );
}


export function SimpleProductCard({ product }: { product: ProductInfo}) {
  return (
    <div className="bg-primary border border-border/10 rounded-lg overflow-hidden hover:border-border/20 transition-all duration-300">
      <Link to={`/product/${product.id}`} className="block">
        <div className="relative aspect-square overflow-hidden bg-primary/50">
          {product.product_images && product.product_images.length > 0 ? (
            <img
              src={`data:image/jpg;base64,${product.product_images[0].base_64_image}`}
              alt={product.name}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-text-primary/50">
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
                <circle cx="8.5" cy="8.5" r="1.5"/>
                <path d="M21 15l-5-5L5 21"/>
              </svg>
            </div>
          )}
        </div>
        <div className="p-4 space-y-2">
          <h3 className="font-semibold text-text-primary text-lg line-clamp-1">{product.name}</h3>
          <p className="text-text-primary/70 text-sm line-clamp-2">{product.description}</p>
          <span className="text-text-secondary font-bold text-xl">
            {new Intl.NumberFormat('en-US', {
              style: 'currency',
              currency: product.currency || 'USD',
            }).format(product.price)}
          </span>
        </div>
      </Link>
    </div>
  );
}