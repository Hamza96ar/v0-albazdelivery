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

export type ApprovalStatus = "pending" | "approved" | "rejected"

export interface User {
  id: string
  name: string
  email: string
  phone: string
  role: UserRole
  createdAt: Date
  approvalStatus?: ApprovalStatus
  licenseNumber?: string
  shopType?: string
}

export interface RegistrationRequest {
  id: string
  role: UserRole
  name: string
  email: string
  phone: string
  password: string
  licenseNumber?: string
  shopType?: string
  status: ApprovalStatus
  createdAt: Date
  reviewedAt?: Date
  reviewedBy?: string
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

export interface InventoryProduct {
  id: number
  sku: string
  name: string
  category: string
  supplierId?: number
  costPrice: number
  sellingPrice: number
  stock: number
  lowStockThreshold: number
  image?: string
  barcode?: string
  createdAt: Date
  updatedAt: Date
}

export interface Customer {
  id: string
  name: string
  email?: string
  phone: string
  totalPurchases: number
  lastPurchaseDate?: Date
  createdAt: Date
}

export interface Supplier {
  id: number
  name: string
  contactPerson: string
  phone: string
  email?: string
  address?: string
  productsSupplied: string[]
  createdAt: Date
}

export interface Sale {
  id: string
  customerId?: string
  items: SaleItem[]
  subtotal: number
  discount: number
  total: number
  paymentMethod: "cash" | "card"
  createdAt: Date
}

export interface SaleItem {
  productId: number
  productName: string
  quantity: number
  price: number
  discount: number
}

export interface SalesForecast {
  period: "week" | "month"
  predictedSales: number
  confidence: number
  trend: "up" | "down" | "stable"
}

export interface InventoryRecommendation {
  productId: number
  productName: string
  currentStock: number
  recommendedQuantity: number
  reason: string
}

export interface ProductBundle {
  products: number[]
  frequency: number
  suggestedDiscount: number
}
