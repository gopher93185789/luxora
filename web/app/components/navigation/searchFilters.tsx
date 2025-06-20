import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { GetProductsParams } from "~/pkg/api/products";

interface SearchFiltersProps {
  params: GetProductsParams;
  onParamsChange: (newParams: GetProductsParams) => void;
}

const categories = [
  "electronics",
  "clothing", 
  "home",
  "sports",
  "books",
  "toys",
  "automotive",
  "other"
];

export function SearchFilters({ params, onParamsChange }: SearchFiltersProps) {
  const [showFilters, setShowFilters] = useState(false);
  const [priceRange, setPriceRange] = useState({
    min: params.startprice || "",
    max: params.endprice || ""
  });

  const handleCategoryChange = (category: string) => {
    onParamsChange({
      ...params,
      category: category === params.category ? undefined : category,
      page: 1
    });
  };

  const handlePriceChange = (type: 'min' | 'max', value: string) => {
    const newPriceRange = { ...priceRange, [type]: value };
    setPriceRange(newPriceRange);
    
    onParamsChange({
      ...params,
      startprice: newPriceRange.min || undefined,
      endprice: newPriceRange.max || undefined,
      page: 1
    });
  };

  const clearFilters = () => {
    setPriceRange({ min: "", max: "" });
    onParamsChange({
      ...params,
      category: undefined,
      startprice: undefined,
      endprice: undefined,
      page: 1
    });
  };

  const activeFiltersCount = [
    params.category,
    params.startprice,
    params.endprice
  ].filter(Boolean).length;

  return (
    <div className="w-full">
      {/* Filter Toggle Button */}
      <motion.button
        onClick={() => setShowFilters(!showFilters)}
        className={`
          flex items-center gap-2 px-4 py-2 rounded-lg border transition-colors
          ${showFilters 
            ? 'bg-secondary text-accent border-secondary' 
            : 'bg-primary text-text-primary border-border/20 hover:border-border/40'
          }
        `}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/>
        </svg>
        Filters
        {activeFiltersCount > 0 && (
          <span className="bg-accent text-white text-xs px-2 py-1 rounded-full">
            {activeFiltersCount}
          </span>
        )}
        <svg 
          width="16" 
          height="16" 
          viewBox="0 0 24 24" 
          fill="none" 
          stroke="currentColor" 
          strokeWidth="2"
          className={`transition-transform ${showFilters ? 'rotate-180' : ''}`}
        >
          <path d="M6 9l6 6 6-6"/>
        </svg>
      </motion.button>

      {/* Filters Panel */}
      <AnimatePresence>
        {showFilters && (
          <motion.div
            className="bg-primary border border-border/10 rounded-lg p-6 mt-4"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
          >
            <div className="space-y-6">
              {/* Categories */}
              <div>
                <h4 className="text-sm font-medium text-text-primary mb-3">Categories</h4>
                <div className="flex flex-wrap gap-2">
                  {categories.map((category) => (
                    <motion.button
                      key={category}
                      onClick={() => handleCategoryChange(category)}
                      className={`
                        px-3 py-2 rounded-full text-sm font-medium transition-colors capitalize
                        ${params.category === category
                          ? "bg-secondary text-accent"
                          : "bg-accent/10 text-text-primary hover:bg-accent/20"
                        }
                      `}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      {category}
                    </motion.button>
                  ))}
                </div>
              </div>

              {/* Price Range */}
              <div>
                <h4 className="text-sm font-medium text-text-primary mb-3">Price Range</h4>
                <div className="flex items-center gap-4">
                  <div className="flex-1">
                    <label className="block text-xs text-text-primary/70 mb-1">Min Price</label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-text-primary/70">$</span>
                      <input
                        type="number"
                        value={priceRange.min}
                        onChange={(e) => handlePriceChange('min', e.target.value)}
                        placeholder="0"
                        className="w-full pl-7 pr-3 py-2 bg-accent/5 border border-border/20 rounded-lg text-text-primary placeholder-text-primary/50 focus:outline-none focus:ring-2 focus:ring-secondary/50"
                      />
                    </div>
                  </div>
                  <div className="text-text-primary/50">-</div>
                  <div className="flex-1">
                    <label className="block text-xs text-text-primary/70 mb-1">Max Price</label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-text-primary/70">$</span>
                      <input
                        type="number"
                        value={priceRange.max}
                        onChange={(e) => handlePriceChange('max', e.target.value)}
                        placeholder="Any"
                        className="w-full pl-7 pr-3 py-2 bg-accent/5 border border-border/20 rounded-lg text-text-primary placeholder-text-primary/50 focus:outline-none focus:ring-2 focus:ring-secondary/50"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Clear Filters */}
              {activeFiltersCount > 0 && (
                <div className="pt-4 border-t border-border/10">
                  <button
                    onClick={clearFilters}
                    className="text-text-primary/70 hover:text-text-primary text-sm font-medium transition-colors"
                  >
                    Clear all filters
                  </button>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
