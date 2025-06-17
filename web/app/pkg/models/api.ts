export interface ErrorResponse {
  code: number;
  message: string;
}

export interface Bid {
  amount: number;
  mesage: string;
  product_id: string;
}

export interface BidDetails {
  bid_id: string;
  message: string;
  created_by: string;
  amount: number;
  product_id: string;
  created_at: string;
  product_name?: string;
  product_image?: string;
  current_highest_bid?: number;
  bid_status?: 'active' | 'outbid' | 'winning' | 'won' | 'lost';
}

export interface CartItems {
  products: string[];
}

export interface CreateBidResponse {
  bid_id: string;
}

export interface Product {
  name: string;
  category: string;
  description: string;
  price: number;
  product_images: ProductImage[];
}

export interface ProductImage {
  image: string;
  order: number;
}

export interface SellItemViaBid {
  bid_id: string;
  item_id: string;
}

export interface Email {
  Valid: boolean;
  String: string;
}

export interface UserDetails {
  email: Email;
  id: string;
  profile_image_link: string;
  username: string;
}

export interface AccessTokenResponse {
  access_token: string;
}

export interface CreateListingResponse {
  product_id: string;
}
