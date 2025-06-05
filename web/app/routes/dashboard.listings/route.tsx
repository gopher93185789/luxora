import { useState } from "react";
import { ProductGrid, ProductFilters } from "~/components/ProductGrid";
import { useUserInfo } from "~/hooks/use-user-info";
import type { GetProductsParams } from "~/pkg/api/products";

export default function Listings() {
  const user = useUserInfo();
  const [filterParams, setFilterParams] = useState<GetProductsParams>({
    limit: 12,
    page: 1,
    creator: user.user?.username
  });

  const categories = [
    "Art",
    "Jewelry",
    "Vehicles"
  ];

  return (
    <main className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-text-primary">My Listings</h1>
      </div>

      <ProductFilters
        params={filterParams}
        onParamsChange={setFilterParams}
        categories={categories}
      />

      <ProductGrid
        initialParams={filterParams}
        showDeleteButtons={true}
        className="min-h-screen"
      />
    </main>
  );
}