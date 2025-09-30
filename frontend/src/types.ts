export interface Item {
  id: number;
  name: string;
  description: string;
  price: number;
  image_url?: string;
  created_at: string;
  updated_at: string;
}

export interface CreateItemRequest {
  name: string;
  description: string;
  price: number;
  image_url?: string;
}

export interface UpdateItemRequest {
  name?: string;
  description?: string;
  price?: number;
  image_url?: string;
}

export interface SearchItemRequest {
  q: string;
  min_price?: number;
  max_price?: number;
  limit?: number;
  offset?: number;
}

export interface SearchItemResponse {
  items: Item[];
  total: number;
  limit: number;
  offset: number;
  has_more: boolean;
  total_pages: number;
}

export interface PaginatedItemResponse {
  items: Item[];
  total: number;
  page: number;
  limit: number;
  total_pages: number;
  has_more: boolean;
}
