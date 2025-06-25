import { Link, useLocation, useNavigate } from "@remix-run/react";
import { motion } from "framer-motion";


const navLinks = [

  { to: "/dashboard/listings", label: "Listings" },
  { to: "/dashboard/biddings", label: "Biddings" },
  { to: "/dashboard/marketplace", label: "Marketplace" },
  { to: "/dashboard/profile", label: "Profile" },
];

const sidebarVariants = {
  hidden: { x: -80, opacity: 0 },
  visible: { x: 0, opacity: 1 },
};

const itemVariants = {
  hidden: { x: -30, opacity: 0 },
  visible: { x: 0, opacity: 1 },
};

export function BackButton() {
  const navigate = useNavigate();

  return (
    <button
      onClick={() => navigate(-1)}
      className="block px-6 py-2 text-2xl bg-primary rounded-lg text-text-primary/50 hover:text-text-primary hover:bg-accent/20 transition-colors duration-200 flex items-center gap-2 font-family"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        className="h-6 w-6 text-text-primary/50 hover:text-text-primary"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
      </svg>
      Back
    </button>
  );
}

export function Sidebar() {
  const location = useLocation();
  const isProduct = location.pathname.startsWith("/product");
  const isDashboard = location.pathname.startsWith("/dashboard");

  const getFilteredNavLinks = () => {
    if (isProduct) {
      return navLinks.filter(link => 
        link.to !== "/dashboard/listings" && 
        link.to !== "/dashboard/biddings"
      );
    }
    return navLinks;
  };

  if (!isDashboard && !isProduct) {
    return null;
  }

  return (
    <motion.div
      className="w-64 select-none text-text-primary h-screen p-10 pl-0 sticky top-0 z-50"
      initial="hidden"
      animate="visible"
      variants={sidebarVariants}
    >
      <nav className="flex flex-col gap-2 h-full justify-between items-center">
        <ul className="flex flex-col gap-2 h-full justify-center items-start">
          <BackButton />
          {getFilteredNavLinks().map(link => (
            <motion.li key={link.to} variants={itemVariants}>
              <Link
                to={link.to}
                className={`block px-6 py-2 text-2xl ${
                  location.pathname === link.to
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
