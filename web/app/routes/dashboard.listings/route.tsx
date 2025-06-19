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
      <div className="space-y-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-text-primary">My Listings</h1>
        </div>
        <div className="flex items-center justify-center min-h-64">
          <ShinyText text="Loading your listings ..." speed={1} />
        </div>
      </div>
    );
  }

  return (      
  <div className="space-y-6">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold text-text-primary">My Listings</h1>
            <p className="text-text-primary/70 mt-1">Manage your products and listings</p>
          </div>
          <div className="flex gap-3">
            <Link
              to="/marketplace"
              className="bg-accent/10 hover:bg-accent/20 text-text-primary px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M3 3h2l.4 2M7 13h10l4-8H5.4m-2.4 0L3 3H1m6 10a1 1 0 100 2 1 1 0 000-2zm10 0a1 1 0 100 2 1 1 0 000-2"/>
              </svg>
              Browse Marketplace
            </Link>
            <motion.button
              onClick={() => setShowCreateForm(true)}
              className="bg-secondary hover:bg-secondary/80 text-accent px-6 py-3 rounded-lg font-medium transition-colors flex items-center gap-2"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 5v14M5 12h14"/>
              </svg>
              Create New Listing
            </motion.button>
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
        className="min-h-[60vh]"
      />
    </div>
  );
}