import { useState } from "react";
import { Link } from "@remix-run/react";
import { useUserInfo } from "~/hooks/use-user-info";
import type { GetProductsParams } from "~/pkg/api/products";
import { ProductGrid } from "~/components/ProductGrid";
import { CreateListingForm } from "~/components/CreateListingForm";
import { motion } from "framer-motion";
import ShinyText from "~/components/ShinyText";

export default function Listings() {
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  const { user, loading: userLoading } = useUserInfo();

  const handleListingCreated = () => {
    setShowCreateForm(false);
    setRefreshKey(prev => prev + 1);
  };

  const userListingsParams: GetProductsParams = {
    limit: 12,
    page: 1,
    creator: user?.id || ""
  };

  if (userLoading || !user?.id) {
    return (
      <div className="space-y-4 md:space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 md:mb-6 gap-4">
          <h1 className="text-2xl md:text-3xl font-bold text-text-primary">My Listings</h1>
        </div>
        <div className="flex items-center justify-center min-h-32 md:min-h-64">
          <ShinyText text="Loading your listings ..." speed={1} />
        </div>
      </div>
    );
  }

  return (      
    <div className="space-y-4 md:space-y-6">
      <div className="flex flex-col gap-4 md:gap-8 items-start w-full">
        <div className="bg-primary rounded-lg p-4 md:p-8 w-full">
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
            <div className="flex-1 min-w-0">
              <h1 className="text-2xl md:text-3xl font-bold text-text-primary mb-2">
                My Listings
              </h1>
              <p className="text-sm md:text-base text-text-primary/70">
                Manage your product listings, create new ones, and browse the marketplace.
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto">
              <Link
                to="/dashboard/marketplace"
                className="bg-accent/10 hover:bg-accent/20 text-text-primary px-4 py-2 rounded-lg font-medium transition-colors flex items-center justify-center gap-2 text-sm md:text-base"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="flex-shrink-0">
                  <path d="M3 3h2l.4 2M7 13h10l4-8H5.4m-2.4 0L3 3H1m6 10a1 1 0 100 2 1 1 0 000-2zm10 0a1 1 0 100 2 1 1 0 000-2"/>
                </svg>
                <span className="hidden sm:inline">Browse Marketplace</span>
                <span className="sm:hidden">Marketplace</span>
              </Link>
              <motion.button
                onClick={() => setShowCreateForm(true)}
                className="bg-secondary hover:bg-secondary/80 text-accent px-4 md:px-6 py-2 md:py-3 rounded-lg font-medium transition-colors flex items-center justify-center gap-2 text-sm md:text-base"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="md:w-5 md:h-5 flex-shrink-0">
                  <path d="M12 5v14M5 12h14"/>
                </svg>
                <span className="hidden sm:inline">Create New Listing</span>
                <span className="sm:hidden">Create</span>
              </motion.button>
            </div>
          </div>
        </div>
      </div>

      {showCreateForm && (
        <CreateListingForm
          onClose={() => setShowCreateForm(false)}
          onSuccess={handleListingCreated}
        />
      )}

      <ProductGrid
        key={`${JSON.stringify(userListingsParams)}-${refreshKey}`}
        initialParams={userListingsParams}
        showDeleteButtons={true}
        className="min-h-[40vh] md:min-h-[60vh]"
      />
    </div>
  );
}