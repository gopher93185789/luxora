import React, { useState } from "react";
import { motion } from "framer-motion";
import { ProductCard } from "./ProductCard";
import { useProductInfo } from "~/hooks/use-product-info";
import { DeleteListing, type GetProductsParams } from "~/pkg/api/products";
import { DefualtLoader } from "./Loader";

interface ProductGridProps {
  initialParams?: Partial<GetProductsParams>;
  showDeleteButtons?: boolean;
  className?: string;
}

export function ProductGrid({ 
  initialParams = {}, 
  showDeleteButtons = false, 
  className = "" 
}: ProductGridProps) {
  const [params, setParams] = useState<GetProductsParams>({
    limit: 12,
    page: 1,
    ...initialParams
  });

  const { products, error, loading, refetch } = useProductInfo(params, [params]);

  const handleDelete = async (productId: string) => {
    const result = await DeleteListing(productId);
    
    if (!result || !("code" in result)) {
      refetch();
    } else {
      console.error("Failed to delete product:", result.message);
    }
  };

  const handleLoadMore = () => {
    setParams(prev => ({
      ...prev,
      page: prev.page + 1
    }));
  };

  if (loading && products.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <DefualtLoader />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-64 text-center">
        <div className="text-red-500 mb-4">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="10"/>
            <path d="M15 9l-6 6M9 9l6 6"/>
          </svg>
        </div>
        <h3 className="text-lg font-semibold text-text-primary mb-2">
          Something went wrong
        </h3>
        <p className="text-text-primary/70 mb-4">
          {error.message}
        </p>
        <button
          onClick={refetch}
          className="bg-secondary hover:bg-secondary/80 text-accent py-2 px-4 rounded transition-colors"
        >
          Try Again
        </button>
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-64 text-center">
        <div className="text-text-primary/50 mb-4">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
            <circle cx="8.5" cy="8.5" r="1.5"/>
            <path d="M21 15l-5-5L5 21"/>
          </svg>
        </div>
        <h3 className="text-lg font-semibold text-text-primary mb-2">
          No products found
        </h3>
        <p className="text-text-primary/70">
          Try adjusting your search criteria or check back later.
        </p>
      </div>
    );
  }

  return (
    <div className={`w-full ${className}`}>
      <motion.div 
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        {products.map((product, index) => (
          <motion.div
            key={product.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: index * 0.1 }}
          >
            <ProductCard
              product={product}
              onDelete={showDeleteButtons ? handleDelete : undefined}
              showDeleteButton={showDeleteButtons}
            />
          </motion.div>
        ))}
      </motion.div>

      {products.length > 0 && products.length >= params.limit && (
        <div className="flex justify-center mt-8">
          <button
            onClick={handleLoadMore}
            disabled={loading}
            className="bg-secondary hover:bg-secondary/80 disabled:opacity-50 disabled:cursor-not-allowed text-accent py-3 px-6 rounded-lg transition-colors font-medium flex items-center gap-2"
          >
            {loading ? (
              <>
                <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M21 12a9 9 0 11-6.219-8.56"/>
                </svg>
                Loading...
              </>
            ) : (
              "Load More"
            )}
          </button>
        </div>
      )}
    </div>
  );
}

interface ProductFiltersProps {
  params: GetProductsParams;
  onParamsChange: (newParams: GetProductsParams) => void;
  categories?: string[];
}

export function ProductFilters({ params, onParamsChange, categories = [] }: ProductFiltersProps) {
  const handleCategoryChange = (category: string) => {
    onParamsChange({
      ...params,
      category: category === params.category ? undefined : category,
      page: 1
    });
  };

  return (
    <div className="bg-primary border border-border/10 rounded-lg p-6 mb-6">
      <h3 className="text-lg font-semibold text-text-primary mb-4">Filters</h3>
      
      {categories.length > 0 && (
        <div>
          <h4 className="text-sm font-medium text-text-primary mb-2">Categories</h4>
          <div className="flex flex-wrap gap-2">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => handleCategoryChange(category)}
                className={`px-3 py-1 rounded-full text-sm transition-colors ${
                  params.category === category
                    ? "bg-secondary text-accent"
                    : "bg-accent/10 text-text-primary hover:bg-accent/20"
                }`}
              >
                {category}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
