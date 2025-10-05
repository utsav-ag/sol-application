export interface LoginRequest {
  phoneNumber: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  phoneNumber: string;
  role: 'ADMIN' | 'STORE_EMPLOYEE';
}

export interface Item {
  itemCode: string;
  itemName: string;
  itemImage: string | null;
  godown: string;
  rack: string | null;
  qty: number;
  qtyReserved: number;
  basePrice: number;
  gst: number;
  thickness: string | null;
  type: string;
  folder: string | null;
  qtyRemaining: number;
}

export interface CreateItemRequest {
  itemCode: string;
  itemName: string;
  itemImage?: string;
  godown: string;
  qty: number;
  basePrice: number;
  gst: number;
  type: string;
  thickness?: string;
  folder?: string;
}

export interface UpdateItemRequest {
  itemName?: string;
  itemImage?: string;
  godown?: string;
  qty?: number;
  basePrice?: number;
  gst?: number;
}

export interface DeliveryOrderItem {
  id: number;
  item: Item;
  quantity: number;
}

export interface DeliveryOrder {
  id: number;
  createdAt: string;
  deliveryItems: DeliveryOrderItem[];
  status: 'DRAFT' | 'FINAL';
}

export interface CreateDeliveryOrderRequest {
  status: 'DRAFT' | 'FINAL';
  items: Array<{
    itemCode: string;
    quantity: number;
  }>;
}

export interface UpdateDeliveryOrderItemsRequest {
  status: 'DRAFT' | 'FINAL';
  items: Array<{
    itemCode: string;
    quantity: number;
  }>;
}
