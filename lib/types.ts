export type UserRole = "customer" | "vendor" | "driver" | "admin"

export type OrderStatus =
  | "pending"
  | "accepted"
  | "preparing"
  | "ready"
  | "assigned"
  | "in_delivery"
  | "delivered"
  | "cancelled"

export interface User {
  id: string
  name: string
  email: string
  phone: string
  role: UserRole
  createdAt: Date
}

export interface Store {
  id: number
  name: string
  type: string
  rating: number
  deliveryTime: string
  categoryId: number
  vendorId: string
  address: string
  city: string
}

export interface Product {
  id: number
  storeId: number
  name: string
  description: string
  price: number
  image: string
  rating: number
  available: boolean
}

export interface OrderItem {
  productId: number
  quantity: number
  price: number
}

export interface Order {
  id: string
  customerId: string
  storeId: number
  items: OrderItem[]
  subtotal: number
  deliveryFee: number
  total: number
  status: OrderStatus
  paymentMethod: "cash" | "card"
  deliveryAddress: string
  city: string
  customerPhone: string
  driverId?: string
  createdAt: Date
  updatedAt: Date
  acceptedAt?: Date
  preparingAt?: Date
  readyAt?: Date
  assignedAt?: Date
  deliveredAt?: Date
}

export interface Delivery {
  id: string
  orderId: string
  driverId: string
  status: "assigned" | "picked_up" | "in_transit" | "delivered"
  pickupAddress: string
  deliveryAddress: string
  customerPhone: string
  assignedAt: Date
  pickedUpAt?: Date
  deliveredAt?: Date
}
