import { Link } from "@remix-run/react";
import { motion } from "framer-motion";
import { DropdownMenu } from "./menu";

export function Navbar() {
  return (    <motion.nav 
      className="fixed top-0 left-0 w-full z-50 bg-black/20 backdrop-blur-sm border-b border-white/5"
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8 }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 sm:py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center">
            <Link to="/" className="flex items-center">
              <img 
                src="/logo.png" 
                alt="Luxora Logo" 
                className="h-8 w-8 sm:h-10 sm:w-10 rounded-full"
              />
              <span className="ml-2 text-luxora font-bold text-lg sm:text-xl hidden xs:block">
                Luxoras
              </span>
            </Link>
          </div>
            
          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center space-x-8">
            <Link 
              to="/marketplace" 
              className="text-white/80 hover:text-luxora transition-colors duration-200 font-medium"
            >
              Marketplace
            </Link>
            <Link 
              to="/listings" 
              className="text-white/80 hover:text-luxora transition-colors duration-200 font-medium"
            >
              Listings
            </Link>
            <Link 
              to="/about" 
              className="text-white/80 hover:text-luxora transition-colors duration-200 font-medium"
            >
              About
            </Link>
          </div>

          {/* Desktop Auth buttons */}
          <div className="hidden lg:flex items-center space-x-3">
            <Link to="/auth">
              <motion.button
                className="text-luxora hover:text-white border border-luxora/50 hover:border-luxora px-4 py-2 rounded-md transition-all duration-200 font-medium text-sm"
                whileHover={{ scale: 1.05, backgroundColor: "rgba(255, 215, 0, 0.1)" }}
                whileTap={{ scale: 0.95 }}
              >
                Login
              </motion.button>
            </Link>
            
            <Link to="/auth">
              <motion.button
                className="bg-luxora text-black hover:bg-luxora/90 px-4 py-2 rounded-md transition-all duration-200 font-medium text-sm"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Sign Up
              </motion.button>
            </Link>
          </div>

          {/* Mobile Menu */}
          <div className="lg:hidden">
            <DropdownMenu />
          </div>
        </div>
      </div>
    </motion.nav>
  );
}
