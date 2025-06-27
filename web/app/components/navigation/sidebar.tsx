import { Link, useLocation, useNavigate } from "@remix-run/react";
import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";

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

const mobileMenuVariants = {
  hidden: { x: "-100%" },
  visible: { x: 0 },
};

export function BackButton() {
  const navigate = useNavigate();

  return (
    <button
      onClick={() => navigate(-1)}
      className="block px-4 md:px-6 py-2 text-lg md:text-2xl bg-primary rounded-lg text-text-primary/50 hover:text-text-primary hover:bg-accent/20 transition-colors duration-200 flex items-center gap-2 font-family"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        className="h-5 w-5 md:h-6 md:w-6 text-text-primary/50 hover:text-text-primary"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
      </svg>
      <span className="hidden sm:inline">Back</span>
    </button>
  );
}

export function MobileMenuButton({ isOpen, onClick }: { isOpen: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="md:hidden fixed top-4 left-4 z-[60] p-2 rounded-lg bg-primary/80 backdrop-blur-sm border border-border/20 text-text-primary hover:bg-primary transition-colors"
      aria-label="Toggle menu"
    >
      <motion.div
        animate={{ rotate: isOpen ? 90 : 0 }}
        transition={{ duration: 0.2 }}
      >
        {isOpen ? (
          <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        ) : (
          <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        )}
      </motion.div>
    </button>
  );
}

export function Sidebar() {
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const isProduct = location.pathname.startsWith("/product");
  const isDashboard = location.pathname.startsWith("/dashboard");

  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isMobileMenuOpen]);

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

  const NavContent = () => (
    <nav className="flex flex-col gap-2 h-full justify-between items-center">
      <ul className="flex flex-col gap-2 h-full justify-center items-start w-full">
        <BackButton />
        {getFilteredNavLinks().map(link => (
          <motion.li key={link.to} variants={itemVariants} className="w-full">
            <Link
              to={link.to}
              className={`block px-4 md:px-6 py-2 text-lg md:text-2xl w-full ${
                location.pathname === link.to
                  ? "text-text-primary"
                  : "text-text-primary/50 hover:text-text-primary"
              } duration-200 ease-in-out rounded-lg transition-all hover:bg-accent/20 font-family`}
              onClick={() => setIsMobileMenuOpen(false)}
            >
              {link.label}
            </Link>
          </motion.li>
        ))}
      </ul>
    </nav>
  );

  return (
    <>
      <MobileMenuButton 
        isOpen={isMobileMenuOpen} 
        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} 
      />
      
      <motion.div
        className="hidden md:block w-56 lg:w-64 select-none text-text-primary h-screen p-6 lg:p-10 pl-0 sticky top-0 z-40"
        initial="hidden"
        animate="visible"
        variants={sidebarVariants}
      >
        <NavContent />
      </motion.div>

      <AnimatePresence>
        {isMobileMenuOpen && (
          <>
            <motion.div
              className="md:hidden fixed inset-0 bg-black/50 z-[45]"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMobileMenuOpen(false)}
            />
            <motion.div
              className="md:hidden fixed top-0 left-0 w-72 h-full bg-primary border-r border-border/20 z-[55] p-6"
              initial="hidden"
              animate="visible"
              exit="hidden"
              variants={mobileMenuVariants}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
            >
              <div className="mt-16">
                <NavContent />
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
