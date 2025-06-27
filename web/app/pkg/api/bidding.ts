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

  const searchParams = new URLSearchParams();
  if (params.limit) searchParams.append('limit', params.limit.toString());
  if (params.page) searchParams.append('page', params.page.toString());

  const req = async (): Promise<Response> => {
    const headers: Record<string, string> = {};
    
    if (token) {
      headers['Authorization'] = `${token}`;
    }

    const url = getApiUrl(`/user/bids${searchParams.toString() ? `?${searchParams.toString()}` : ''}`);
    return fetch(url, {
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

    const bids = await resp.json() as BidDetails[];
    
    // Apply client-side filtering if status is provided (since server doesn't support it yet)
    if (params.status && params.status !== 'all') {
      return bids.filter(bid => bid.bid_status === params.status);
    }
    
    return bids;
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

export interface BidsOnUserListing {
  product_id: string;
  product_name: string;
  product_image?: string;
  bids: BidDetails[];
}

export async function GetBidsOnUserListings(): Promise<BidsOnUserListing[] | ErrorResponse> {
  const token = GetTokenFromLocalStorage();

  const req = async (): Promise<Response> => {
    const headers: Record<string, string> = {};
    
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    return fetch(getApiUrl('/user/listings/bids'), {
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

    return await resp.json() as BidsOnUserListing[];
  } catch (error) {
    console.error('GetBidsOnUserListings error:', error);
    return {
      code: 500,
      message: "Failed to load bids on user listings"
    } as ErrorResponse;
  }
}

export async function AcceptBid(bidId: string, productId: string): Promise<{ success: boolean; message?: string } | ErrorResponse> {
  const token = GetTokenFromLocalStorage();

  const req = async (): Promise<Response> => {
    const headers: Record<string, string> = {};
    
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const url = getApiUrl(`/listing/bid/${bidId}/accept?product_id=${productId}`);
    return fetch(url, {
      method: 'PUT',
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

    const result = await resp.json() as { success: boolean };
    return { ...result, message: "Bid accepted successfully! The item has been marked as sold." };
  } catch (error) {
    console.error('AcceptBid error:', error);
    return {
      code: 500,
      message: "Failed to accept bid"
    } as ErrorResponse;
  }
}
