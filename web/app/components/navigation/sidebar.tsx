import { Link } from "@remix-run/react";
import { motion } from "framer-motion";
import { useHref } from "@remix-run/react";


const navLinks = [
    { to: "/dashboard", label: "Dashboard" },
    { to: "/dashboard/listings", label: "Listings"},
    { to: "/dashboard/products", label: "Products"},
    { to: "/dashboard/settings", label: "Settings"},
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
    const currentPath = useHref(
        (typeof window !== "undefined" && window.location.pathname) || ""
    );
    const isActive = (to: string) => currentPath === to;

    return (
        <motion.div
            className="w-64 text-white min-h-screen p-4"
            initial="hidden"
            animate="visible"
            variants={sidebarVariants}
        >
            <nav className="flex flex-col gap-2">
                <ul className="flex flex-col gap-2">
                    {navLinks.map((link, idx) => (
                        <motion.li
                            key={link.to}
                            className={idx === 0 ? "mb-4" : ""}
                            variants={itemVariants}
                        >
                            <Link
                                to={link.to}
                                className="block px-6 py-2 text-2xl text-text-primary/50 hover:text-text-primary duration-200 ease-in-out rounded-lg transition-all hover:bg-accent/20 font-family"
                                // style={{
                                //     backgroundColor: isActive(link.to) ? "rgba(255, 255, 255, 0.1)" : "transparent",
                                //     color: isActive(link.to) ? "#fff" : "inherit",
                                // }}
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