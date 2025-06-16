export interface ErrorResponse {
  code: number;
  message: string;
}

export interface Bid {
  amount: number;
  mesage: string;
  product_id: string;
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
