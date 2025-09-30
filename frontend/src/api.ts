import axios from "axios";
import {
  Item,
  CreateItemRequest,
  UpdateItemRequest,
  SearchItemRequest,
  SearchItemResponse,
  PaginatedItemResponse,
} from "./types";

const API_BASE_URL = "/api/v1";

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

export const getItems = async (
  page: number = 1,
  limit: number = 6
): Promise<PaginatedItemResponse> => {
  const response = await api.get("/items", { params: { page, limit } });
  return response.data;
};

export const getItem = async (id: number): Promise<Item> => {
  const response = await api.get(`/items/${id}`);
  return response.data;
};

export const createItem = async (data: CreateItemRequest): Promise<Item> => {
  const response = await api.post("/items", data);
  return response.data;
};

export const updateItem = async (
  id: number,
  data: UpdateItemRequest
): Promise<Item> => {
  const response = await api.put(`/items/${id}`, data);
  return response.data;
};

export const deleteItem = async (id: number): Promise<void> => {
  await api.delete(`/items/${id}`);
};

export const searchItems = async (
  params: SearchItemRequest
): Promise<SearchItemResponse> => {
  const response = await api.get("/items/search", { params });
  return response.data;
};

export const uploadImage = async (
  file: File
): Promise<{ image_url: string }> => {
  const formData = new FormData();
  formData.append("image", file);

  const response = await api.post("/upload", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
  return response.data;
};

export const updateItemImage = async (
  id: number,
  file: File
): Promise<{ message: string; image_url: string; item: Item }> => {
  const formData = new FormData();
  formData.append("image", file);

  const response = await api.post(`/items/${id}/image`, formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
  return response.data;
};

export const deleteUploadedImage = async (
  imageUrl: string
): Promise<{ message: string }> => {
  const response = await api.delete("/upload", {
    data: { image_url: imageUrl },
  });
  return response.data;
};
