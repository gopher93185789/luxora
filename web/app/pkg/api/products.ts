import { GetTokenFromLocalStorage } from "../helpers/tokenHandling";
import { withRefresh } from "../helpers/api";
import { getApiUrl } from "../config/api";
import type { ErrorResponse, Product, CreateListingResponse } from "../models/api";

export interface ProductInfo {
  id: string;
  name: string;
  created_by: string;
  created_at: string;
  category: string;
  description: string;
  price: number;
  currency: string;
  product_images: ProductImage[];
}

export interface ProductImage {
  base_64_image: string;
  checksum: string;
  compressedImage: number[];
  order: number;
}

export interface GetProductsParams {
  limit: number;
  page: number;
  category?: string;
  startprice?: string;
  endprice?: string;
  searchquery?: string;
  creator?: string;
}

export async function GetProducts(params: GetProductsParams): Promise<ProductInfo[] | ErrorResponse> {
  const token = GetTokenFromLocalStorage();

  const searchParams = new URLSearchParams({
    limit: params.limit.toString(),
    page: params.page.toString(),
  });

  if (params.category) searchParams.append("category", params.category);
  if (params.startprice) searchParams.append("startprice", params.startprice);
  if (params.endprice) searchParams.append("endprice", params.endprice);
  if (params.searchquery) searchParams.append("searchquery", params.searchquery);
  if (params.creator) searchParams.append("creator", params.creator);

  const req = async (): Promise<Response> => {
    const headers: Record<string, string> = {};
    
    if (token && token !== "") {
      headers.Authorization = `Bearer ${token}`;
    }

    return await fetch(getApiUrl(`/listings?${searchParams.toString()}`), {
      method: "GET",
      credentials: "include",
      headers,
    });
  };

  try {
    let resp: Response | undefined;
    
    if (token && token !== "") {
      resp = await withRefresh(req);
      if (!resp) return { code: 500, message: "failed to refresh token" } as ErrorResponse;
    } else {
      resp = await req();
    }

    if (resp.ok) {
      const products = await resp.json();
      return products as ProductInfo[];
    } else {
      const error = await resp.json();
      return error as ErrorResponse;
    }
  } catch (error) {
    return { code: 500, message: "network error" } as ErrorResponse;
  }
}

export async function CreateListing(product: Product): Promise<CreateListingResponse | ErrorResponse> {
  const token = GetTokenFromLocalStorage();
  if (token === "") {
    return { code: 401, message: "no token found" } as ErrorResponse;
  }

  const req = async (): Promise<Response> => {
    return await fetch(getApiUrl("/listings"), {
      method: "POST",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(product),
    });
  };

  try {
    const resp = await withRefresh(req);
    if (!resp) return { code: 500, message: "failed to refresh token" } as ErrorResponse;

    const result = await resp.json();
    if (resp.ok) {
      return result as CreateListingResponse;
    } else {
      return result as ErrorResponse;
    }
  } catch (error) {
    return { code: 500, message: "network error" } as ErrorResponse;
  }
}

export async function DeleteListing(productId: string): Promise<void | ErrorResponse> {
  const token = GetTokenFromLocalStorage();
  if (token === "") {
    return { code: 401, message: "no token found" } as ErrorResponse;
  }

  const req = async (): Promise<Response> => {
    return await fetch(getApiUrl(`/listings?id=${productId}`), {
      method: "DELETE",
      credentials: "include",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  };

  try {
    const resp = await withRefresh(req);
    if (!resp) return { code: 500, message: "failed to refresh token" } as ErrorResponse;

    if (!resp.ok) {
      const error = await resp.json();
      return error as ErrorResponse;
    }
  } catch (error) {
    return { code: 500, message: "network error" } as ErrorResponse;
  }
}
