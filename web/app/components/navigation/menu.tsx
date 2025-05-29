import React, { useState } from 'react';
import { Link } from '@remix-run/react';
import { motion, AnimatePresence } from 'framer-motion';
import { FcMenu } from 'react-icons/fc';

export function DropdownMenu() {
    const [open, setOpen] = useState(false);

    return (
        <div className="inline-block text-left absolute top-4 left-4 z-50">
            <button
                onClick={() => setOpen((prev) => !prev)}
                className="z-50 relative"
            >
                <FcMenu fill='white' className="w-12 h-12 text-white" />
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
                        className="fixed top-0 left-0 w-screen h-screen bg-black flex items-center justify-center z-40"
                    >
                        <ul className="py-6 flex flex-col items-center w-full">
                            <li className="w-full max-w-md">
                                <Link
                                    to="/auth"
                                    className="block px-6 py-4 text-xl text-center text-white rounded-lg transition-all"
                                    onClick={() => setOpen(false)}
                                >
                                    Login
                                </Link>
                            </li>
                            <li className="w-full max-w-md">
                                <Link
                                    to="/marketplace"
                                    className="block px-6 py-4 text-xl text-center text-white rounded-lg transition-all"
                                    onClick={() => setOpen(false)}
                                >
                                    Marketplace
                                </Link>
                            </li>
                            <li className="w-full max-w-md">
                                <Link
                                    to="/about"
                                    className="block px-6 py-4 text-xl text-center text-white rounded-lg transition-all"
                                    onClick={() => setOpen(false)}
                                >
                                    About Us
                                </Link>
                            </li>
                        </ul>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
