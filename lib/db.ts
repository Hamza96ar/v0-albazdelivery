import type {
  Order,
  User,
  Store,
  Product,
  Delivery,
  OrderStatus,
  RegistrationRequest,
  InventoryProduct,
  Customer,
  Supplier,
  Sale,
} from "./types"

// In-memory database (replace with real database in production)
class Database {
  private orders: Map<string, Order> = new Map()
  private users: Map<string, User> = new Map()
  private stores: Map<number, Store> = new Map()
  private products: Map<number, Product> = new Map()
  private deliveries: Map<string, Delivery> = new Map()
  private registrationRequests: Map<string, RegistrationRequest> = new Map()
  private inventoryProducts: Map<number, InventoryProduct> = new Map()
  private customers: Map<string, Customer> = new Map()
  private suppliers: Map<number, Supplier> = new Map()
  private sales: Map<string, Sale> = new Map()

  // Orders
  createOrder(order: Order): Order {
    this.orders.set(order.id, order)
    return order
  }

  getOrder(id: string): Order | undefined {
    return this.orders.get(id)
  }

  getAllOrders(): Order[] {
    return Array.from(this.orders.values())
  }

  getOrdersByCustomer(customerId: string): Order[] {
    return Array.from(this.orders.values()).filter((order) => order.customerId === customerId)
  }

  getOrdersByStore(storeId: number): Order[] {
    return Array.from(this.orders.values()).filter((order) => order.storeId === storeId)
  }

  getOrdersByDriver(driverId: string): Order[] {
    return Array.from(this.orders.values()).filter((order) => order.driverId === driverId)
  }

  getPendingOrders(): Order[] {
    return Array.from(this.orders.values()).filter((order) => order.status === "pending")
  }

  getAvailableDeliveries(): Order[] {
    return Array.from(this.orders.values()).filter((order) => order.status === "ready" && !order.driverId)
  }

  updateOrderStatus(id: string, status: OrderStatus, driverId?: string): Order | undefined {
    const order = this.orders.get(id)
    if (!order) return undefined

    order.status = status
    order.updatedAt = new Date()

    if (status === "accepted") order.acceptedAt = new Date()
    if (status === "preparing") order.preparingAt = new Date()
    if (status === "ready") order.readyAt = new Date()
    if (status === "assigned") {
      order.assignedAt = new Date()
      if (driverId) order.driverId = driverId
    }
    if (status === "delivered") order.deliveredAt = new Date()

    this.orders.set(id, order)
    return order
  }

  assignDriver(orderId: string, driverId: string): Order | undefined {
    const order = this.orders.get(orderId)
    if (!order) return undefined

    order.driverId = driverId
    order.status = "assigned"
    order.assignedAt = new Date()
    order.updatedAt = new Date()

    this.orders.set(orderId, order)
    return order
  }

  // Users
  createUser(user: User): User {
    this.users.set(user.id, user)
    return user
  }

  getUser(id: string): User | undefined {
    return this.users.get(id)
  }

  getUsersByRole(role: string): User[] {
    return Array.from(this.users.values()).filter((user) => user.role === role)
  }

  // Stores
  createStore(store: Store): Store {
    this.stores.set(store.id, store)
    return store
  }

  getStore(id: number): Store | undefined {
    return this.stores.get(id)
  }

  getStoresByVendor(vendorId: string): Store[] {
    return Array.from(this.stores.values()).filter((store) => store.vendorId === vendorId)
  }

  // Products
  createProduct(product: Product): Product {
    this.products.set(product.id, product)
    return product
  }

  getProduct(id: number): Product | undefined {
    return this.products.get(id)
  }

  getProductsByStore(storeId: number): Product[] {
    return Array.from(this.products.values()).filter((product) => product.storeId === storeId)
  }

  updateProductAvailability(id: number, available: boolean): Product | undefined {
    const product = this.products.get(id)
    if (!product) return undefined

    product.available = available
    this.products.set(id, product)
    return product
  }

  // Deliveries
  createDelivery(delivery: Delivery): Delivery {
    this.deliveries.set(delivery.id, delivery)
    return delivery
  }

  getDelivery(id: string): Delivery | undefined {
    return this.deliveries.get(id)
  }

  getDeliveriesByDriver(driverId: string): Delivery[] {
    return Array.from(this.deliveries.values()).filter((delivery) => delivery.driverId === driverId)
  }

  updateDeliveryStatus(
    id: string,
    status: "assigned" | "picked_up" | "in_transit" | "delivered",
  ): Delivery | undefined {
    const delivery = this.deliveries.get(id)
    if (!delivery) return undefined

    delivery.status = status
    if (status === "picked_up") delivery.pickedUpAt = new Date()
    if (status === "delivered") delivery.deliveredAt = new Date()

    this.deliveries.set(id, delivery)
    return delivery
  }

  createRegistrationRequest(request: RegistrationRequest): RegistrationRequest {
    this.registrationRequests.set(request.id, request)
    return request
  }

  getRegistrationRequest(id: string): RegistrationRequest | undefined {
    return this.registrationRequests.get(id)
  }

  getAllRegistrationRequests(): RegistrationRequest[] {
    return Array.from(this.registrationRequests.values())
  }

  getPendingRegistrationRequests(): RegistrationRequest[] {
    return Array.from(this.registrationRequests.values()).filter((req) => req.status === "pending")
  }

  approveRegistrationRequest(id: string, adminId: string): User | undefined {
    const request = this.registrationRequests.get(id)
    if (!request || request.status !== "pending") return undefined

    // Update request status
    request.status = "approved"
    request.reviewedAt = new Date()
    request.reviewedBy = adminId
    this.registrationRequests.set(id, request)

    // Create user account
    const user: User = {
      id: `${request.role}-${Date.now()}`,
      name: request.name,
      email: request.email,
      phone: request.phone,
      role: request.role,
      createdAt: new Date(),
      approvalStatus: "approved",
      licenseNumber: request.licenseNumber,
      shopType: request.shopType,
    }

    this.createUser(user)
    return user
  }

  rejectRegistrationRequest(id: string, adminId: string): boolean {
    const request = this.registrationRequests.get(id)
    if (!request || request.status !== "pending") return false

    request.status = "rejected"
    request.reviewedAt = new Date()
    request.reviewedBy = adminId
    this.registrationRequests.set(id, request)

    // Optionally delete the request after rejection
    // this.registrationRequests.delete(id)

    return true
  }

  // Inventory Products
  createInventoryProduct(product: InventoryProduct): InventoryProduct {
    this.inventoryProducts.set(product.id, product)
    return product
  }

  getInventoryProduct(id: number): InventoryProduct | undefined {
    return this.inventoryProducts.get(id)
  }

  getAllInventoryProducts(): InventoryProduct[] {
    return Array.from(this.inventoryProducts.values())
  }

  updateInventoryProduct(id: number, updates: Partial<InventoryProduct>): InventoryProduct | undefined {
    const product = this.inventoryProducts.get(id)
    if (!product) return undefined

    const updated = { ...product, ...updates, updatedAt: new Date() }
    this.inventoryProducts.set(id, updated)
    return updated
  }

  deleteInventoryProduct(id: number): boolean {
    return this.inventoryProducts.delete(id)
  }

  updateStock(id: number, quantity: number): InventoryProduct | undefined {
    const product = this.inventoryProducts.get(id)
    if (!product) return undefined

    product.stock += quantity
    product.updatedAt = new Date()
    this.inventoryProducts.set(id, product)
    return product
  }

  getLowStockProducts(): InventoryProduct[] {
    return Array.from(this.inventoryProducts.values()).filter((p) => p.stock <= p.lowStockThreshold)
  }

  // Customers
  createCustomer(customer: Customer): Customer {
    this.customers.set(customer.id, customer)
    return customer
  }

  getCustomer(id: string): Customer | undefined {
    return this.customers.get(id)
  }

  getAllCustomers(): Customer[] {
    return Array.from(this.customers.values())
  }

  updateCustomer(id: string, updates: Partial<Customer>): Customer | undefined {
    const customer = this.customers.get(id)
    if (!customer) return undefined

    const updated = { ...customer, ...updates }
    this.customers.set(id, updated)
    return updated
  }

  getTopCustomers(limit = 10): Customer[] {
    return Array.from(this.customers.values())
      .sort((a, b) => b.totalPurchases - a.totalPurchases)
      .slice(0, limit)
  }

  // Suppliers
  createSupplier(supplier: Supplier): Supplier {
    this.suppliers.set(supplier.id, supplier)
    return supplier
  }

  getSupplier(id: number): Supplier | undefined {
    return this.suppliers.get(id)
  }

  getAllSuppliers(): Supplier[] {
    return Array.from(this.suppliers.values())
  }

  updateSupplier(id: number, updates: Partial<Supplier>): Supplier | undefined {
    const supplier = this.suppliers.get(id)
    if (!supplier) return undefined

    const updated = { ...supplier, ...updates }
    this.suppliers.set(id, updated)
    return updated
  }

  deleteSupplier(id: number): boolean {
    return this.suppliers.delete(id)
  }

  // Sales
  createSale(sale: Sale): Sale {
    this.sales.set(sale.id, sale)

    // Update customer purchase history
    if (sale.customerId) {
      const customer = this.customers.get(sale.customerId)
      if (customer) {
        customer.totalPurchases += sale.total
        customer.lastPurchaseDate = sale.createdAt
        this.customers.set(sale.customerId, customer)
      }
    }

    // Update inventory stock
    sale.items.forEach((item) => {
      this.updateStock(item.productId, -item.quantity)
    })

    return sale
  }

  getSale(id: string): Sale | undefined {
    return this.sales.get(id)
  }

  getAllSales(): Sale[] {
    return Array.from(this.sales.values())
  }

  getSalesByDateRange(startDate: Date, endDate: Date): Sale[] {
    return Array.from(this.sales.values()).filter((sale) => sale.createdAt >= startDate && sale.createdAt <= endDate)
  }

  getSalesByCustomer(customerId: string): Sale[] {
    return Array.from(this.sales.values()).filter((sale) => sale.customerId === customerId)
  }

  // Analytics
  getTodaySales(): number {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    return Array.from(this.sales.values())
      .filter((sale) => sale.createdAt >= today)
      .reduce((sum, sale) => sum + sale.total, 0)
  }

  getWeekSales(): number {
    const weekAgo = new Date()
    weekAgo.setDate(weekAgo.getDate() - 7)
    return Array.from(this.sales.values())
      .filter((sale) => sale.createdAt >= weekAgo)
      .reduce((sum, sale) => sum + sale.total, 0)
  }

  getMonthSales(): number {
    const monthAgo = new Date()
    monthAgo.setMonth(monthAgo.getMonth() - 1)
    return Array.from(this.sales.values())
      .filter((sale) => sale.createdAt >= monthAgo)
      .reduce((sum, sale) => sum + sale.total, 0)
  }

  getTopSellingProducts(limit = 5): { productId: number; productName: string; totalSold: number }[] {
    const productSales = new Map<number, { name: string; quantity: number }>()

    Array.from(this.sales.values()).forEach((sale) => {
      sale.items.forEach((item) => {
        const existing = productSales.get(item.productId)
        if (existing) {
          existing.quantity += item.quantity
        } else {
          productSales.set(item.productId, { name: item.productName, quantity: item.quantity })
        }
      })
    })

    return Array.from(productSales.entries())
      .map(([productId, data]) => ({
        productId,
        productName: data.name,
        totalSold: data.quantity,
      }))
      .sort((a, b) => b.totalSold - a.totalSold)
      .slice(0, limit)
  }
}

// Singleton instance
export const db = new Database()

// Initialize with some mock data
export function initializeMockData() {
  // Create mock vendors
  const vendor1: User = {
    id: "vendor-1",
    name: "Le Taj Mahal Owner",
    email: "vendor1@tajmahal.dz",
    phone: "+213555123456",
    role: "vendor",
    createdAt: new Date(),
  }

  const vendor2: User = {
    id: "vendor-2",
    name: "Pizza Napoli Owner",
    email: "vendor2@napoli.dz",
    phone: "+213555234567",
    role: "vendor",
    createdAt: new Date(),
  }

  db.createUser(vendor1)
  db.createUser(vendor2)

  // Create mock drivers
  const driver1: User = {
    id: "driver-1",
    name: "Ahmed Benali",
    email: "ahmed@albaz.dz",
    phone: "+213555345678",
    role: "driver",
    createdAt: new Date(),
  }

  const driver2: User = {
    id: "driver-2",
    name: "Fatima Khelifi",
    email: "fatima@albaz.dz",
    phone: "+213555456789",
    role: "driver",
    createdAt: new Date(),
  }

  db.createUser(driver1)
  db.createUser(driver2)

  // Create mock stores
  const store1: Store = {
    id: 1,
    name: "Le Taj Mahal",
    type: "Cuisine Indienne",
    rating: 4.5,
    deliveryTime: "30-45 min",
    categoryId: 1,
    vendorId: "vendor-1",
    address: "123 Rue Didouche Mourad, Alger",
    city: "Alger",
  }

  const store2: Store = {
    id: 4,
    name: "Pizza Napoli",
    type: "Pizzeria",
    rating: 4.6,
    deliveryTime: "25-35 min",
    categoryId: 1,
    vendorId: "vendor-2",
    address: "456 Boulevard Mohamed V, Alger",
    city: "Alger",
  }

  db.createStore(store1)
  db.createStore(store2)

  // Create mock products
  const products: Product[] = [
    {
      id: 1,
      storeId: 1,
      name: "Poulet Tikka Masala",
      description: "Poulet mariné dans une sauce crémeuse aux épices",
      price: 1200,
      image: "/chicken-tikka-masala.png",
      rating: 4.5,
      available: true,
    },
    {
      id: 2,
      storeId: 1,
      name: "Biryani aux Légumes",
      description: "Riz basmati parfumé avec légumes et épices",
      price: 900,
      image: "/vegetable-biryani.png",
      rating: 4.7,
      available: true,
    },
    {
      id: 7,
      storeId: 4,
      name: "Pizza Margherita",
      description: "Tomate, mozzarella, basilic frais",
      price: 1100,
      image: "/margherita-pizza.png",
      rating: 4.8,
      available: true,
    },
    {
      id: 8,
      storeId: 4,
      name: "Pizza 4 Fromages",
      description: "Mozzarella, gorgonzola, parmesan, chèvre",
      price: 1300,
      image: "/four-cheese-pizza.png",
      rating: 4.6,
      available: true,
    },
  ]

  products.forEach((product) => db.createProduct(product))
}

// Initialize mock data on module load
initializeMockData()
