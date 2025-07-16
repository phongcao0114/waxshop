export interface OrderItem {
  id: number;
  productId: number;
  productName: string;
  productImage: string;
  price: number;
  quantity: number;
  total?: number;
}

export interface Order {
  id: number;
  status: string;
  createdAt: string;
  totalAmount: number;
  shippingAddress: string;
  shippingCity: string;
  shippingPostalCode: string;
  shippingCountry: string;
  phoneNumber: string;
  paymentMethod: string;
  items: OrderItem[];
} 