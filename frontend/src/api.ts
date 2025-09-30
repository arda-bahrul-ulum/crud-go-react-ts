import axios from 'axios'
import { Item, CreateItemRequest, UpdateItemRequest } from './types'

const API_BASE_URL = '/api/v1'

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

export const getItems = async (): Promise<Item[]> => {
  const response = await api.get('/items')
  return response.data
}

export const getItem = async (id: number): Promise<Item> => {
  const response = await api.get(`/items/${id}`)
  return response.data
}

export const createItem = async (data: CreateItemRequest): Promise<Item> => {
  const response = await api.post('/items', data)
  return response.data
}

export const updateItem = async (id: number, data: UpdateItemRequest): Promise<Item> => {
  const response = await api.put(`/items/${id}`, data)
  return response.data
}

export const deleteItem = async (id: number): Promise<void> => {
  await api.delete(`/items/${id}`)
}
