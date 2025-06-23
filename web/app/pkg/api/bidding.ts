import { GetTokenFromLocalStorage } from "../helpers/tokenHandling";
import { withRefresh } from "../helpers/api";
import { getApiUrl } from "../config/api";
import type { ErrorResponse, BidDetails, CreateBidResponse, Bid } from "../models/api";

export interface GetUserBidsParams {
  limit?: number;
  page?: number;
  status?: 'active' | 'won' | 'lost' | 'all';
}

export async function GetUserBids(params: GetUserBidsParams = {}): Promise<BidDetails[] | ErrorResponse> {
  const mockBids: BidDetails[] = [
    {
      bid_id: "1",
      message: "Interested in this luxury watch",
      created_by: "current_user_id",
      amount: 15000,
      product_id: "product_1",
      created_at: "2025-06-15T10:30:00Z",
      product_name: "Rolex Submariner",
      product_image: "base64_image_data",
      current_highest_bid: 16000,
      bid_status: 'outbid'
    },
    {
      bid_id: "2",
      message: "Beautiful piece for my collection",
      created_by: "current_user_id",
      amount: 25000,
      product_id: "product_2",
      created_at: "2025-06-14T14:20:00Z",
      product_name: "Vintage Ferrari Model",
      product_image: "base64_image_data",
      current_highest_bid: 25000,
      bid_status: 'winning'
    },
    {
      bid_id: "3",
      message: "This would complete my art collection",
      created_by: "current_user_id",
      amount: 50000,
      product_id: "product_3",
      created_at: "2025-06-13T09:15:00Z",
      product_name: "Abstract Art Piece",
      product_image: "base64_image_data",
      current_highest_bid: 50000,
      bid_status: 'won'
    }
  ];

  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(mockBids);
    }, 500);
  });
}

export async function CreateBid(bid: Bid): Promise<CreateBidResponse | ErrorResponse> {
  const token = GetTokenFromLocalStorage();

  const req = async (): Promise<Response> => {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };
    
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    return fetch(getApiUrl('/listings/bid'), {
      method: 'POST',
      headers,
      body: JSON.stringify(bid),
    });
  };

  try {
    const resp = await withRefresh(req);
    
    if (!resp) {
      return {
        code: 500,
        message: "Failed to refresh token"
      } as ErrorResponse;
    }

    if (!resp.ok) {
      const errorData = await resp.json().catch(() => ({ message: 'Unknown error' })) as { message?: string };
      return {
        code: resp.status,
        message: errorData.message || `HTTP ${resp.status}: ${resp.statusText}`
      } as ErrorResponse;
    }

    return await resp.json() as CreateBidResponse;
  } catch (error) {
    console.error('CreateBid error:', error);
    return {
      code: 500,
      message: "Network error or failed to submit bid"
    } as ErrorResponse;
  }
}

export async function GetBidsForProduct(productId: string, params: { limit: number; page: number }): Promise<BidDetails[] | ErrorResponse> {
  const token = GetTokenFromLocalStorage();

  const searchParams = new URLSearchParams({
    productid: productId,
    limit: params.limit.toString(),
    page: params.page.toString(),
  });

  const req = async (): Promise<Response> => {
    const headers: Record<string, string> = {};
    
    if (token) {
      headers['Authorization'] = token;
    }

    return fetch(getApiUrl(`/listings/bids?${searchParams.toString()}`), {
      method: 'GET',
      headers,
    });
  };

  try {
    const resp = await withRefresh(req);
    
    if (!resp) {
      return {
        code: 500,
        message: "Failed to refresh token"
      } as ErrorResponse;
    }

    if (!resp.ok) {
      const errorData = await resp.json().catch(() => ({ message: 'Unknown error' })) as { message?: string };
      return {
        code: resp.status,
        message: errorData.message || `HTTP ${resp.status}: ${resp.statusText}`
      } as ErrorResponse;
    }

    return await resp.json() as BidDetails[];
  } catch (error) {
    console.error('GetBidsForProduct error:', error);
    return {
      code: 500,
      message: "Failed to load bids"
    } as ErrorResponse;
  }
}
