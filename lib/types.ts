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

export type PaymentMethod = "cash" | "card" | "wallet"
export type PaymentStatus = "pending" | "completed" | "failed" | "refunded"

export type MembershipTier = "bronze" | "silver" | "gold" | "platinum"

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

export interface Payment {
  id: string
  orderId: string
  customerId: string
  amount: number
  method: PaymentMethod
  status: PaymentStatus
  transactionId?: string
  createdAt: Date
  completedAt?: Date
}

export interface Wallet {
  id: string
  customerId: string
  balance: number
  totalSpent: number
  totalEarned: number
  createdAt: Date
  updatedAt: Date
}

export interface WalletTransaction {
  id: string
  walletId: string
  type: "credit" | "debit"
  amount: number
  description: string
  relatedOrderId?: string
  createdAt: Date
}

export interface Refund {
  id: string
  paymentId: string
  orderId: string
  amount: number
  reason: string
  status: "pending" | "approved" | "rejected" | "completed"
  createdAt: Date
  processedAt?: Date
}

export interface LoyaltyAccount {
  id: string
  customerId: string
  points: number
  totalPointsEarned: number
  totalPointsRedeemed: number
  tier: MembershipTier
  tierExpiresAt?: Date
  referralCode: string
  referralCount: number
  createdAt: Date
  updatedAt: Date
}

export interface LoyaltyTransaction {
  id: string
  loyaltyAccountId: string
  type: "earn" | "redeem"
  points: number
  description: string
  relatedOrderId?: string
  createdAt: Date
}

export interface LoyaltyReward {
  id: string
  name: string
  description: string
  pointsCost: number
  discount: number
  expiresAt: Date
  category: "discount" | "free_item" | "bonus_points"
  createdAt: Date
}

export interface CustomerRedemption {
  id: string
  customerId: string
  rewardId: string
  status: "active" | "used" | "expired"
  redeemedAt?: Date
  usedAt?: Date
  expiresAt: Date
  createdAt: Date
}

export interface VendorReview {
  id: string
  vendorId: string
  customerId: string
  orderId: string
  rating: number // 1-5
  foodQuality: number // 1-5
  deliveryTime: number // 1-5
  customerService: number // 1-5
  comment: string
  photos?: string[]
  helpful: number
  unhelpful: number
  createdAt: Date
  updatedAt: Date
}

export interface VendorPerformance {
  vendorId: string
  totalReviews: number
  averageRating: number
  foodQualityRating: number
  deliveryTimeRating: number
  customerServiceRating: number
  responseRate: number
  responseTime: number // in hours
  badges: string[] // "top_rated", "fast_delivery", "excellent_service"
  tier: "bronze" | "silver" | "gold" | "platinum"
  createdAt: Date
  updatedAt: Date
}

export interface VendorResponse {
  id: string
  reviewId: string
  vendorId: string
  response: string
  createdAt: Date
}
