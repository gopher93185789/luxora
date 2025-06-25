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
  
  console.warn('GetUserBids: Using mock data - /user/bids endpoint not implemented on server');
  
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

  // Simulate API delay and filter by status if provided
  return new Promise((resolve) => {
    setTimeout(() => {
      let filteredBids = mockBids;
      
      if (params.status && params.status !== 'all') {
        filteredBids = mockBids.filter(bid => bid.bid_status === params.status);
      }
      
      resolve(filteredBids);
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
      headers['Authorization'] = `Bearer ${token}`;
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
  // TODO: Replace with real API call when backend implements this endpoint
  console.warn('GetBidsOnUserListings: Using mock data - endpoint not implemented on server');

  const mockData: BidsOnUserListing[] = [
    {
      product_id: "user_product_1",
      product_name: "My Vintage Leather Jacket",
      product_image: "base64_image_data_here",
      bids: [
        {
          bid_id: "bid_1",
          amount: 120,
          created_by: "bidder_user_1", 
          created_at: "2025-06-24T10:00:00Z",
          message: "Love this jacket! Perfect for my collection.",
          product_id: "user_product_1",
          bid_status: 'active'
        },
        {
          bid_id: "bid_2", 
          amount: 150,
          created_by: "bidder_user_2",
          created_at: "2025-06-24T11:30:00Z", 
          message: "Willing to pay top dollar for this piece.",
          product_id: "user_product_1",
          bid_status: 'active'
        }
      ]
    },
    {
      product_id: "user_product_2", 
      product_name: "My Signed First Edition Book",
      product_image: "base64_image_data_here",
      bids: [
        {
          bid_id: "bid_3",
          amount: 300,
          created_by: "bidder_user_3",
          created_at: "2025-06-23T18:00:00Z",
          message: "This is a rare find! Must have it.",
          product_id: "user_product_2", 
          bid_status: 'active'
        }
      ]
    }
  ];

  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(mockData);
    }, 500);
  });
}

export async function AcceptBid(bidId: string, productId: string): Promise<{ success: boolean; message?: string } | ErrorResponse> {
  // TODO: Replace with real API call when backend implements this endpoint
  console.warn('AcceptBid: Using mock data - endpoint not implemented on server');
  
  return new Promise((resolve) => {
    setTimeout(() => {
      console.log(`Mock: Accepting bid ${bidId} for product ${productId}`);
      resolve({ success: true, message: "Bid accepted successfully! The item has been marked as sold." });
    }, 1000);
  });
}
