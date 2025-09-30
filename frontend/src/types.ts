export interface Item {
  id: number
  name: string
  description: string
  price: number
  created_at: string
  updated_at: string
}

export interface CreateItemRequest {
  name: string
  description: string
  price: number
}

export interface UpdateItemRequest {
  name?: string
  description?: string
  price?: number
}
