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
    <main className="">

      <div className="flex w-full h-full" >
        <Sidebar />
        <div className="w-screen h-full overflow-auto p-5">
          <ProductGrid
            
            key={JSON.stringify(filterParams)} 
            initialParams={filterParams}
            showDeleteButtons={false}
            className="min-h-screen "
          />
        </div>

      </div>
    </main>
    
  );
}
