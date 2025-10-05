import { ApiClient } from '@/lib/api-client';
import { Item, CreateItemRequest, UpdateItemRequest } from '@/types/api';

export class ItemsService {
  static async getAllItems(): Promise<Item[]> {
    return ApiClient.get<Item[]>('/api/items');
  }

  static async getItem(itemCode: string): Promise<Item> {
    return ApiClient.get<Item>(`/api/items/${itemCode}`);
  }

  static async createItem(item: CreateItemRequest): Promise<Item> {
    return ApiClient.post<Item>('/api/items', item);
  }

  static async updateItem(
    itemCode: string,
    updates: UpdateItemRequest
  ): Promise<Item> {
    return ApiClient.put<Item>(`/api/items/${itemCode}`, updates);
  }
}
