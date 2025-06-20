import { useState, useEffect } from "react";
import { useSearchParams } from "@remix-run/react";
import { DashboardButton } from "~/components/DashButton";
import SearchBar from "~/components/navigation/searchBar";
import { Sidebar } from "~/components/navigation/sidebar";
import { ProductGrid } from "~/components/ProductGrid";
import type { GetProductsParams } from "~/pkg/api/products";

export default function Marketplace() {
  const [searchParams] = useSearchParams();
  const [filterParams, setFilterParams] = useState<GetProductsParams>({
    limit: 12,
    page: 1
  });

  // Update filter params when URL search params change
  useEffect(() => {
    const search = searchParams.get("search");
    const category = searchParams.get("category");
    const startprice = searchParams.get("startprice");
    const endprice = searchParams.get("endprice");

    setFilterParams(prev => ({
      ...prev,
      searchquery: search || undefined,
      category: category || undefined,
      startprice: startprice || undefined,
      endprice: endprice || undefined,
      page: 1 // Reset to first page when filters change
    }));
  }, [searchParams]);

  const handleSearch = (query: string) => {
    setFilterParams(prev => ({
      ...prev,
      searchquery: query || undefined,
      page: 1
    }));
  };

  const handleFiltersChange = (newParams: GetProductsParams) => {
    setFilterParams(newParams);
  };

  return (
    <main className="min-h-screen flex">
      <Sidebar />
      <div className="flex-1 flex flex-col">

        <div className="flex-1 px-64 pl-5 p-5">

          <div className="max-w-7xl w-full mx-auto">
        <SearchBar onSearch={handleSearch} />
            {filterParams.searchquery && (
              <div className="mb-6">
                <h2 className="text-2xl font-bold text-text-primary mb-2">
                  Search Results
                </h2>
                <p className="text-text-primary/70">
                  Showing results for "{filterParams.searchquery}"
                </p>
              </div>
            )}
            <ProductGrid
              key={JSON.stringify(filterParams)} 
              initialParams={filterParams}
              showDeleteButtons={false}
              className="min-h-[60vh]"
            />
          </div>
        </div>
      </div>
    </main>
  );
}
