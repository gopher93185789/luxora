import { Link } from "@remix-run/react";
import { motion } from "framer-motion";

export function Hero() {
  return (
    <div className="absolute inset-0 flex items-center justify-center px-4 sm:px-6 md:justify-start md:pl-8 lg:pl-16 xl:pl-24">
      {/* Background decorative elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          className="absolute top-10 right-10 sm:top-20 sm:right-20 w-32 h-32 sm:w-48 sm:h-48 md:w-64 md:h-64 bg-luxora/5 rounded-full blur-2xl sm:blur-3xl"
          animate={{ 
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.5, 0.3]
          }}
          transition={{ duration: 8, repeat: Infinity }}
        />
        <motion.div
          className="absolute bottom-10 left-5 sm:bottom-20 sm:left-10 w-24 h-24 sm:w-32 sm:h-32 md:w-48 md:h-48 bg-white/5 rounded-full blur-xl sm:blur-2xl"
          animate={{ 
            scale: [1.2, 1, 1.2],
            opacity: [0.2, 0.4, 0.2]
          }}
          transition={{ duration: 6, repeat: Infinity, delay: 2 }}
        />
      </div>

      <motion.div
        className="w-full max-w-sm sm:max-w-lg md:max-w-2xl lg:max-w-4xl mx-auto md:mx-0 px-4 sm:px-6 md:px-8 lg:px-10 py-6 sm:py-8 md:py-10 lg:py-12 text-center md:text-left bg-black/50 backdrop-blur-md rounded-xl sm:rounded-2xl border border-white/10 shadow-2xl relative"
        initial={{ opacity: 0, y: 60 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1, delay: 0.5 }}
      >        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.6 }}
          className="mb-3 sm:mb-4 md:mb-2"
        > 
          <span className="text-luxora text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-8xl font-bold tracking-wider block">
            Luxoras
          </span>       
        </motion.div>
        
        <motion.h1
          className="text-white text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold leading-tight mb-4 sm:mb-6"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1, delay: 0.8 }}
        >
          The World's Most{" "}
          <span className="text-luxora relative inline-block">
            Luxurious
            <motion.div
              className="absolute -bottom-1 sm:-bottom-2 left-0 right-0 h-0.5 sm:h-1 bg-gradient-to-r from-luxora/0 via-luxora to-luxora/0"
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{ duration: 2, delay: 1.0 }}
            />
          </span>{" "}
          Marketplace
        </motion.h1>        <motion.p
          className="text-white/80 text-base sm:text-lg md:text-xl lg:text-2xl mb-6 sm:mb-8 max-w-xl sm:max-w-2xl mx-auto md:mx-0 leading-relaxed"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 1.2 }}
        >
          Where extraordinary meets exclusive. Trade ultra-premium assets with verified collectors and connoisseurs worldwide.
        </motion.p>

        {/* CTA Buttons */}
        <motion.div 
          className="flex flex-col sm:flex-row gap-3 sm:gap-4 md:gap-6 items-center justify-center md:justify-start mb-8 sm:mb-12"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 1.5 }}
        >
          <Link to="/auth" className="w-full sm:w-auto">
            <motion.button
              className="w-full sm:w-auto bg-luxora text-black font-medium text-base sm:text-lg md:text-xl px-6 sm:px-8 py-3 sm:py-4 rounded-lg hover:bg-luxora/90 transition-all duration-300 shadow-lg hover:shadow-luxora/25"
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.98 }}
            >
              Start Trading
            </motion.button>
          </Link>
          
          <Link to="#linkje" className="w-full sm:w-auto">
            <motion.button
              className="w-full sm:w-auto border-2 border-white/30 text-white font-medium text-base sm:text-lg md:text-xl px-6 sm:px-8 py-3 sm:py-4 rounded-lg hover:border-luxora hover:text-luxora hover:bg-white/5 transition-all duration-300 backdrop-blur-sm"
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.98 }}
            >
              Explore Marketplace
            </motion.button>
          </Link>
        </motion.div>        {/* Trust Indicators */}
        <motion.div
          className="flex flex-col sm:flex-row items-center justify-center md:justify-start gap-4 sm:gap-6 text-white/60 text-sm sm:text-base"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 2 }}
        >
          <div className="flex items-center gap-2">
            <motion.div 
              className="w-2 h-2 bg-luxora rounded-full"
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
            />
            <span>Verified Luxury Dealers</span>
          </div>
          <div className="flex items-center gap-2">
            <motion.div 
              className="w-2 h-2 bg-luxora rounded-full"
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 2, repeat: Infinity, delay: 0.3 }}
            />
            <span>Secure Transactions</span>
          </div>
          <div className="flex items-center gap-2">
            <motion.div 
              className="w-2 h-2 bg-luxora rounded-full"
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 2, repeat: Infinity, delay: 0.6 }}
            />
            <span>Global Network</span>
          </div>
        </motion.div>

        {/* Premium Features - Empty for now */}
        <motion.div
          className="mt-6 sm:mt-8 flex flex-wrap gap-3 justify-center md:justify-start"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 2.2 }}
        >
          {/* Content can be added here later */}
        </motion.div>
      </motion.div>
    </div>
  );
}
      