import { ApiClient } from '@/lib/api-client';
import {
  DeliveryOrder,
  CreateDeliveryOrderRequest,
  UpdateDeliveryOrderItemsRequest,
} from '@/types/api';

export class DeliveryOrdersService {
  static async getAllOrders(): Promise<DeliveryOrder[]> {
    return ApiClient.get<DeliveryOrder[]>('/api/delivery-orders');
  }

  static async getOrderById(orderId: number): Promise<DeliveryOrder> {
    return ApiClient.get<DeliveryOrder>(`/api/delivery-orders/${orderId}`);
  }

  static async createOrder(
    order: CreateDeliveryOrderRequest
  ): Promise<DeliveryOrder> {
    return ApiClient.post<DeliveryOrder>('/api/delivery-orders', order);
  }

  static async updateOrder(
    orderId: number,
    updates: UpdateDeliveryOrderItemsRequest
  ): Promise<DeliveryOrder> {
    return ApiClient.put<DeliveryOrder>(
      `/api/delivery-orders/${orderId}/items`,
      updates
    );
  }

  static async updateOrderItems(
    orderId: number,
    updates: UpdateDeliveryOrderItemsRequest
  ): Promise<DeliveryOrder> {
    return ApiClient.put<DeliveryOrder>(
      `/api/delivery-orders/${orderId}/items`,
      updates
    );
  }

  static async updateOrderStatus(
    orderId: number,
    status: 'DRAFT' | 'FINAL'
  ): Promise<DeliveryOrder> {
    return ApiClient.put<DeliveryOrder>(
      `/api/delivery-orders/${orderId}/status?status=${status}`
    );
  }
}
