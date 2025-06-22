import { useState } from 'react';
import { Link } from '@remix-run/react';
import { motion, AnimatePresence } from 'framer-motion';

export function DropdownMenu() {
    const [open, setOpen] = useState(false);

    return (        <div className="relative">
            <button
                onClick={() => setOpen((prev) => !prev)}
                className="relative z-50 p-2 rounded-lg bg-white/10 backdrop-blur-sm hover:bg-white/20 transition-colors"
                title='Toggle Menu'
            >
                <motion.div 
                    animate={{ rotate: open ? 90 : 0 }}
                    transition={{ duration: 0.3 }}
                >
                    <svg 
                        xmlns="http://www.w3.org/2000/svg" 
                        width="24" 
                        height="24" 
                        viewBox="0 0 24 24" 
                        fill="none" 
                        stroke="white" 
                        strokeWidth="2" 
                        strokeLinecap="round" 
                        strokeLinejoin="round"
                    >
                        <line x1="3" y1="12" x2="21" y2="12"></line>
                        <line x1="3" y1="6" x2="21" y2="6"></line>
                        <line x1="3" y1="18" x2="21" y2="18"></line>
                    </svg>
                </motion.div>
            </button>            <AnimatePresence>
                {open && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.3 }}
                        className="fixed top-0 left-0 w-screen h-screen bg-black z-40 flex items-center justify-center"
                        style={{ 
                            position: 'fixed',
                            top: 0, 
                            left: 0, 
                            width: '100vw', 
                            height: '100vh',
                            minHeight: '100vh'
                        }}
                    >
                        <motion.div 
                            className="w-full h-full flex items-center justify-center px-4 py-8 sm:px-6"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: 20 }}
                            transition={{ duration: 0.3, delay: 0.1 }}
                        >
                            <motion.ul className="w-full max-w-md space-y-8 sm:space-y-12">
                                <motion.li 
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -20 }}
                                    transition={{ duration: 0.3, delay: 0.2 }}
                                >
                                    <Link
                                        to="/auth"
                                        className="block text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-white/70 hover:text-luxora duration-300 ease-in-out transition-colors text-center py-3 sm:py-4"
                                        onClick={() => setOpen(false)}
                                    >
                                        Login
                                    </Link>
                                </motion.li>
                                
                                <motion.li 
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -20 }}
                                    transition={{ duration: 0.3, delay: 0.3 }}
                                >
                                    <Link
                                        to="/marketplace"
                                        className="block text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-white/70 hover:text-luxora duration-300 ease-in-out transition-colors text-center py-3 sm:py-4"
                                        onClick={() => setOpen(false)}
                                    >
                                        Marketplace
                                    </Link>
                                </motion.li>
                                
                                <motion.li 
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -20 }}
                                    transition={{ duration: 0.3, delay: 0.4 }}
                                >
                                    <Link
                                        to="/listings"
                                        className="block text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-white/70 hover:text-luxora duration-300 ease-in-out transition-colors text-center py-3 sm:py-4"
                                        onClick={() => setOpen(false)}
                                    >
                                        Listings
                                    </Link>
                                </motion.li>
                                
                                <motion.li 
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -20 }}
                                    transition={{ duration: 0.3, delay: 0.5 }}
                                >
                                    <Link
                                        to="/about"
                                        className="block text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-white/70 hover:text-luxora duration-300 ease-in-out transition-colors text-center py-3 sm:py-4"
                                        onClick={() => setOpen(false)}
                                    >
                                        About
                                    </Link>
                                </motion.li>
                            </motion.ul>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
