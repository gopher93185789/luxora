import { useState } from "react";
import { DashboardButton } from "~/components/DashButton";
import { Sidebar } from "~/components/navigation/sidebar";
import { ProductGrid } from "~/components/ProductGrid";
import type { GetProductsParams } from "~/pkg/api/products";

export default function Marketplace() {
  const [filterParams, setFilterParams] = useState<GetProductsParams>({
    limit: 12,
    page: 1
  });

  return (
    <main className="min-h-screen flex">
      <Sidebar />
      <div className="flex-1 px-64 pl-5 p-5 flex justify-center">
        <div className="max-w-7xl w-full">
          <ProductGrid
            key={JSON.stringify(filterParams)} 
            initialParams={filterParams}
            showDeleteButtons={false}
            className="min-h-[80vh]"
          />
        </div>
      </div>
    </main>
  );
}
