import { useState, useCallback, useEffect } from "react";
import { useNavigate, useSearchParams } from "@remix-run/react";
import { motion } from "framer-motion";

interface SearchBarProps {
  onSearch?: (query: string) => void;
  placeholder?: string;
  className?: string;
  autoFocus?: boolean;
}

export default function SearchBar({ 
  onSearch, 
  placeholder = "Search products, categories...", 
  className = "",
  autoFocus = false 
}: SearchBarProps) {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [query, setQuery] = useState(searchParams.get("search") || "");
  const [isFocused, setIsFocused] = useState(false);

  const handleSearch = useCallback((searchQuery: string) => {
    const trimmedQuery = searchQuery.trim();
    
    if (onSearch) {
      onSearch(trimmedQuery);
    } else {
      if (trimmedQuery) {
        navigate(`/marketplace?search=${encodeURIComponent(trimmedQuery)}`);
      } else {
        navigate('/marketplace');
      }
    }
  }, [onSearch, navigate]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleSearch(query);
  };

  const handleClear = () => {
    setQuery("");
    handleSearch("");
  };

  useEffect(() => {
    const urlQuery = searchParams.get("search") || "";
    if (urlQuery !== query) {
      setQuery(urlQuery);
    }
  }, [searchParams]);

  return (
    <div className={`relative w-full px-4 md:px-8 lg:px-15 sticky top-5 z-40 pb-4 pt-4 ${className}`}>
      <form onSubmit={handleSubmit} className="relative">
        <div className="relative">
          <div className="absolute left-3 md:left-4 top-1/2 transform -translate-y-1/2 text-text-primary/50">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="md:w-5 md:h-5">
              <circle cx="11" cy="11" r="8"/>
              <path d="M21 21l-4.35-4.35"/>
            </svg>
          </div>

          <motion.input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            placeholder={placeholder}
            autoFocus={autoFocus}
            className={`
              w-full pl-10 md:pl-12 pr-16 md:pr-20 py-2.5 md:py-3 
              bg-primary border border-border/20 rounded-lg 
              text-sm md:text-base text-text-primary placeholder-text-primary/50
              focus:outline-none focus:ring-2 focus:ring-secondary/50 focus:border-secondary/50
              transition-all duration-200
              ${isFocused ? 'shadow-lg' : 'shadow-sm'}
            `}
            whileFocus={{ scale: 1.01 }}
          />

          {query && (
            <motion.button
              type="button"
              onClick={handleClear}
              className="absolute right-12 md:right-14 top-1/2 transform -translate-y-1/2 text-text-primary/50 hover:text-text-primary/80 transition-colors"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="md:w-4 md:h-4">
                <path d="M18 6L6 18M6 6l12 12"/>
              </svg>
            </motion.button>
          )}

          <motion.button
            type="submit"
            className={`
              absolute right-1.5 md:right-2 top-1/2 transform -translate-y-1/2 
              bg-secondary hover:bg-secondary/80 text-accent 
              px-3 md:px-4 py-1 md:py-1.5 rounded-md font-medium text-sm md:text-base
              transition-colors duration-200
              ${query ? 'opacity-100' : 'opacity-70'}
            `}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <span className="hidden sm:inline">Search</span>
            <svg className="sm:hidden w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="8"/>
              <path d="M21 21l-4.35-4.35"/>
            </svg>
          </motion.button>
        </div>
      </form>

      {isFocused && query.length > 0 && (
        <motion.div
          className="absolute top-full left-0 right-0 mt-2 bg-primary border border-border/20 rounded-lg shadow-lg z-50 max-h-60 overflow-y-auto"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
        >
          <div className="p-4">
            <div className="text-sm text-text-primary/70 mb-2">Search suggestions</div>
            <div className="space-y-1">
              <button
                type="button"
                onClick={() => handleSearch(query)}
                className="w-full text-left px-3 py-2 hover:bg-accent/10 rounded text-text-primary transition-colors"
              >
                Search for "{query}"
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
}