import { useState } from "react";
import { useUserInfo } from "~/hooks/use-user-info";
import type { GetProductsParams } from "~/pkg/api/products";
import { ProductGrid } from "~/components/ProductGrid";

export default function Listings() {
  const user = useUserInfo();
  const [filterParams, setFilterParams] = useState<GetProductsParams>({
    limit: 12,
    page: 1,
    creator: user.user?.username
  });

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-text-primary">My Listings</h1>
      </div>
      <ProductGrid
        key={JSON.stringify(filterParams)}
        initialParams={filterParams}
        showDeleteButtons={true}
        className="min-h-[80vh]"
      />
    </div>
  );
}