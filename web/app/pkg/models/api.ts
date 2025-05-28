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
  category: string;
  description: string;
  name: string;
  price: number;
  product_images: ProductImage[];
}

export interface ProductImage {
  base_64_image: string;
  checksum: string;
  compressedImage: number[];
  order: number;
}

export interface SellItemViaBid {
  bid_id: string;
  item_id: string;
}

export interface UserDetails {
  email: string;
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
