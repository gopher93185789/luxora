import { useState } from "react";
import type { GetProductsParams } from "~/pkg/api/products";

export default function Marketplace() {
  const [filterParams, setFilterParams] = useState<GetProductsParams>({
    limit: 12,
    page: 1
  });

  const categories = [
    "Art",
    "Jewelry",
    "Vehicles",
  ];

  return (
    <main className="max-w-7xl mx-auto px-4 py-8 space-y-6">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-text-primary mb-2">
          Luxora Marketplace
        </h1>
        <p className="text-text-primary/70 text-lg">
          Discover exclusive luxury items from verified sellers
        </p>
      </div>
    </main>
  );
}
