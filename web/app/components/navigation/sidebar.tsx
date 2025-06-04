import { Link } from "@remix-run/react";
import { motion } from "framer-motion";
import { useHref } from "@remix-run/react";
import { useState } from "react";


const navLinks = [
    { to: "/dashboard", label: "Dashboard" },
    { to: "/dashboard/listings", label: "Listings"},
];

const sidebarVariants = {
    hidden: { x: -80, opacity: 0 },
    visible: { x: 0, opacity: 1,},
};

const itemVariants = {
    hidden: { x: -30, opacity: 0 },
    visible: { x: 0, opacity: 1,},
};



export function Sidebar() {
    const [currPath, setCurrPath] = useState<string>("Dashboard")

    return (
      <motion.div
        className="w-64 select-none text-text-primary h-screen p-10  sticky top-0 z-50"
        initial="hidden"
        animate="visible"
        variants={sidebarVariants}
      >
        <nav className="flex flex-col gap-2">
          <ul className="flex flex-col gap-2">
            {navLinks.map((link, idx) => (
              <motion.li key={link.to} variants={itemVariants}>
                <Link
                  onClick={() => setCurrPath(link.label)}
                  to={link.to}
                  className={`block px-6 py-2 text-2xl ${
                    currPath === link.label
                      ? "text-text-primary"
                      : "text-text-primary/50 hover:text-text-primary"
                  } duration-200 ease-in-out rounded-lg transition-all hover:bg-accent/20 font-family`}
                >
                  {link.label}
                </Link>
              </motion.li>
            ))}
          </ul>
        </nav>
      </motion.div>
    );
}