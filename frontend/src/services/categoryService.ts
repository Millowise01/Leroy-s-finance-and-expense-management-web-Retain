import { api } from "./api";
import type { Category } from "../types/category";

export type CategoryInput = {
  name: string;
  description?: string;
};

export async function getCategories(): Promise<Category[]> {
  const response = await api.get<{ categories: Category[] }>("/categories");
  return response.data.categories;
}

export async function createCategory(data: CategoryInput): Promise<Category> {
  const response = await api.post<{ category: Category }>("/categories", data);
  return response.data.category;
}

export async function updateCategory(id: string, data: CategoryInput): Promise<Category> {
  const response = await api.put<{ category: Category }>(`/categories/${id}`, data);
  return response.data.category;
}

export async function deleteCategory(id: string): Promise<void> {
  await api.delete(`/categories/${id}`);
}
