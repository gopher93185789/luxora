import { Link } from "@remix-run/react";
import { motion } from "framer-motion";

export function Navbar() {
  return (
    <motion.nav 
      className="fixed top-0 left-0 w-full z-50 bg-black/20 backdrop-blur-sm "
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8 }}
    >
      <div className="max-w-10xl mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-8">
            <Link to="/" className="flex items-center">
                <img 
                    src="/logo.png" 
                    alt="Luxora Logo" 
                    className="h-10 w-10 rounded-full"
                />
                
            </Link>
            
            <div className="hidden md:flex items-center space-x-6">
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
          </div>

          {/* Right side - Auth buttons */}
          <div className="flex items-center space-x-4">
            <Link to="/auth">
              <motion.button
                className="text-luxora hover:text-white border border-luxora/50 hover:border-luxora px-6 py-2 rounded-md transition-all duration-200 font-medium"
                whileHover={{ scale: 1.05, backgroundColor: "rgba(255, 215, 0, 0.1)" }}
                whileTap={{ scale: 0.95 }}
              >
                Login
              </motion.button>
            </Link>
            
            <Link to="/auth">
              <motion.button
                className="bg-luxora text-black hover:bg-luxora/90 px-6 py-2 rounded-md transition-all duration-200 font-medium"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Sign Up
              </motion.button>
            </Link>
          </div>
        </div>
      </div>
    </motion.nav>
  );
}
