import { useState } from 'react';
import { Link } from '@remix-run/react';
import { motion, AnimatePresence } from 'framer-motion';

export function DropdownMenu() {
    const [open, setOpen] = useState(false);

    return (
        <motion.div 
        className="inline-block text-left z-50 absolute m-10 mt-6"
        >
            <button
                onClick={() => setOpen((prev) => !prev)}
                className="z-50 relative"
            >
                <motion.div 
                    animate={{ rotate: open ? 90 : 0, opacity: 1, y: 0, scale: 1 }}
                    initial={{ opacity: 0, y: -20, scale: 0.95 }}
                    exit={{ opacity: 0, y: -20, scale: 0.95 }}
                    transition={{ duration: 0.3 }}
                    className="p-2 rounded bg-white/10 backdrop-blur-sm hover:bg-white/20 transition-colors"
                >
                    <svg 
                        xmlns="http://www.w3.org/2000/svg" 
                        width="30" 
                        height="30" 
                        viewBox="0 0 24 24" 
                        fill="none" 
                        stroke="white" 
                        strokeWidth="2" 
                        strokeLinecap="round" 
                        strokeLinejoin="round" 
                        className="text-text-primary duration-200 ease-in-out"
                    >
                        <line x1="3" y1="12" x2="21" y2="12"></line>
                        <line x1="3" y1="6" x2="21" y2="6"></line>
                        <line x1="3" y1="18" x2="21" y2="18"></line>
                    </svg>
                </motion.div>
            </button>
            <AnimatePresence>
                {open && (
                    <motion.div
                        initial={{ opacity: 0, y: 0.95 }}
                        animate={{ opacity: 1, y: 1 }}
                        exit={{ opacity: 0, y: 0.95 }}
                        transition={{ 
                            type: "spring", 
                            stiffness: 300, 
                            damping: 30 
                        }}
                        className="fixed top-0 left-0 w-screen h-screen bg-black flex  z-40"
                    >
                        <motion.ul 
                        className="py-6 flex flex-col items-center justify-center h-full gap-4"
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        transition={{ duration: 0.3}}
                        >
                            <motion.li 
                            className="w-full max-w-md"
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            transition={{ duration: 0.3, delay: 0.2 }}
                            >
                                <Link
                                    to="/auth"
                                    className="block px-6 py-4 text-8xl text-text-primary/50 hover:text-text-primary duration-200 ease-in-out rounded-lg transition-all"
                                    onClick={() => setOpen(false)}
                                >
                                    Login
                                </Link>
                            </motion.li>
                            <motion.li 
                            className="w-full max-w-md"
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            transition={{ duration: 0.3, delay: 0.4 }}
                            >
                                <Link
                                    to="/marketplace"
                                    className="block px-6 py-4 text-8xl text-text-primary/50 hover:text-text-primary duration-200 ease-in-out rounded-lg transition-all"
                                    onClick={() => setOpen(false)}
                                >
                                    Marketplace
                                </Link>
                            </motion.li>
                            <motion.li 
                            className="w-full max-w-md"
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            transition={{ duration: 0.3, delay: 0.6 }}
                            >
                                <Link
                                    to="/about"
                                    className="block px-6 py-4 text-8xl text-text-primary/50 hover:text-text-primary duration-200 ease-in-out rounded-lg transition-all"
                                    onClick={() => setOpen(false)}
                                >
                                    About Us
                                </Link>
                            </motion.li>
                        </motion.ul>
                    </motion.div>
                )}
                
            </AnimatePresence>
        </motion.div>
    );
}
