import { useEffect, useState } from "react";
import { GetProducts, type ProductInfo, type GetProductsParams } from "../pkg/api/products";
import type { ErrorResponse } from "../pkg/models/api";

export function useProductInfo(params: GetProductsParams, dependencies: any[] = []) {
  const [products, setProducts] = useState<ProductInfo[]>([]);
  const [error, setError] = useState<ErrorResponse | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      setError(null);
      
      const result = await GetProducts(params);
      if ("code" in result && result.code !== 200) {
        setError(result as ErrorResponse);
        setProducts([]);
      } else {
        setProducts(result as ProductInfo[]);
      }
      setLoading(false);
    };

    fetchProducts();
  }, [params.limit, params.page, params.category, params.startprice, params.endprice, params.searchquery, params.creator, ...dependencies]);

  const refetch = async () => {
    setLoading(true);
    setError(null);
    
    const result = await GetProducts(params);
    if ("code" in result && result.code !== 200) {
      setError(result as ErrorResponse);
      setProducts([]);
    } else {
      setProducts(result as ProductInfo[]);
    }
    setLoading(false);
  };

  return { products, error, loading, refetch };
}