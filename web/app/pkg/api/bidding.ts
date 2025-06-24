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
  const token = GetTokenFromLocalStorage();

  const searchParams = new URLSearchParams({
    limit: (params.limit || 50).toString(),
    page: (params.page || 1).toString(),
  });

  if (params.status && params.status !== 'all') {
    searchParams.append('status', params.status);
  }

  const req = async (): Promise<Response> => {
    const headers: Record<string, string> = {};
    
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    return fetch(getApiUrl(`/user/bids?${searchParams.toString()}`), {
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
    console.error('GetUserBids error:', error);
    return {
      code: 500,
      message: "Failed to load user bids"
    } as ErrorResponse;
  }
}

export async function CreateBid(bid: Bid): Promise<CreateBidResponse | ErrorResponse> {
  const token = GetTokenFromLocalStorage();

  const req = async (): Promise<Response> => {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };
    
    if (token) {
      headers['Authorization'] = token;
    }

    return fetch(getApiUrl('/listing/bid'), {
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
