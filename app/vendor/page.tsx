"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth-context"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import {
  Package,
  Plus,
  Edit,
  Trash2,
  CheckCircle2,
  Clock,
  ShoppingBag,
  Bell,
  TrendingUp,
  X,
  AlertCircle,
  ChefHat,
  PackageCheck,
  Sun,
  Moon,
  LogOut,
} from "lucide-react"
import type { Order, Product } from "@/lib/types"
import { useSSE } from "@/lib/use-sse"
import { useToast } from "@/hooks/use-toast"

export default function VendorApp() {
  const router = useRouter()
  const { user, logout, isAuthenticated } = useAuth()
  const [currentView, setCurrentView] = useState<"orders" | "products" | "history">("orders")
  const [orders, setOrders] = useState<Order[]>([])
  const [products, setProducts] = useState<Product[]>([])
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)
  const [showProductModal, setShowProductModal] = useState(false)
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)
  const [vendorId] = useState("vendor-1") // Mock vendor ID
  const [storeId] = useState(1) // Mock store ID
  const [isDarkMode, setIsDarkMode] = useState(false)
  const { toast } = useToast()
  const { data: sseData } = useSSE(`/api/notifications/sse?role=vendor&userId=${vendorId}`, true)

  // Fetch orders
  const fetchOrders = async () => {
    try {
      const response = await fetch(`/api/vendors/orders?storeId=${storeId}`)
      const data = await response.json()
      if (data.success) {
        setOrders(data.orders)
        console.log("[v0] Fetched vendor orders:", data.orders.length)
      }
    } catch (error) {
      console.error("[v0] Error fetching orders:", error)
    }
  }

  // Fetch products
  const fetchProducts = async () => {
    try {
      const response = await fetch(`/api/products?storeId=${storeId}`)
      const data = await response.json()
      if (data.success) {
        setProducts(data.products)
        console.log("[v0] Fetched products:", data.products.length)
      }
    } catch (error) {
      console.error("[v0] Error fetching products:", error)
    }
  }

  // Update order status
  const updateOrderStatus = async (orderId: string, status: "accepted" | "preparing" | "ready" | "cancelled") => {
    try {
      const response = await fetch("/api/vendors/orders", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId, status }),
      })
      const data = await response.json()
      if (data.success) {
        fetchOrders()
        setSelectedOrder(null)

        if (status === "ready") {
          toast({
            title: "Commande Prête!",
            description: "La commande est maintenant disponible pour les livreurs",
            duration: 5000,
          })
        }

        console.log("[v0] Order status updated:", orderId, "->", status)
      }
    } catch (error) {
      console.error("[v0] Error updating order:", error)
    }
  }

  // Toggle product availability
  const toggleProductAvailability = async (productId: number, available: boolean) => {
    try {
      const response = await fetch("/api/products", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId, available }),
      })
      const data = await response.json()
      if (data.success) {
        fetchProducts()
        console.log("[v0] Product availability updated:", productId, "->", available)
      }
    } catch (error) {
      console.error("[v0] Error updating product:", error)
    }
  }

  // Initial load
  useEffect(() => {
    fetchOrders()
    fetchProducts()

    // Poll for updates every 10 seconds
    const interval = setInterval(() => {
      fetchOrders()
    }, 10000)

    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    if (!isAuthenticated || user?.role !== "vendor") {
      router.push("/login")
    }
  }, [isAuthenticated, user, router])

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add("dark")
    } else {
      document.documentElement.classList.remove("dark")
    }
  }, [isDarkMode])

  useEffect(() => {
    if (sseData?.type === "order_created") {
      fetchOrders()
      toast({
        title: "Nouvelle Commande!",
        description: `Commande #${sseData.order?.id} reçue`,
        duration: 5000,
      })
      console.log("[v0] New order notification:", sseData.order)
    }
  }, [sseData])

  // Get order counts by status
  const pendingOrders = orders.filter((o) => o.status === "pending")
  const preparingOrders = orders.filter((o) => o.status === "preparing")
  const readyOrders = orders.filter((o) => o.status === "ready")
  const completedOrders = orders.filter((o) => o.status === "delivered")

  // Header Component
  const Header = () => (
    <header className="sticky top-0 z-50 bg-gradient-to-r from-primary to-orange-500 text-white shadow-lg">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
              <ShoppingBag className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-lg font-bold">Le Taj Mahal</h1>
              <p className="text-xs text-white/80">Espace Vendeur</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {pendingOrders.length > 0 && (
              <div className="relative">
                <Bell className="w-6 h-6" />
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">
                  {pendingOrders.length}
                </span>
              </div>
            )}
            <Button
              variant="ghost"
              size="icon"
              className="text-white hover:bg-white/20"
              onClick={() => setIsDarkMode(!isDarkMode)}
            >
              {isDarkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </Button>
            <Button variant="ghost" size="icon" className="text-white hover:bg-white/20" onClick={logout}>
              <LogOut className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </div>
    </header>
  )

  // Orders View
  const OrdersView = () => (
    <div className="container mx-auto px-4 py-6 space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-red-50 to-red-100 border-red-200">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-red-500 flex items-center justify-center">
                <AlertCircle className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-2xl font-bold text-red-900">{pendingOrders.length}</p>
                <p className="text-xs text-red-700">En Attente</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-yellow-50 to-yellow-100 border-yellow-200">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-yellow-500 flex items-center justify-center">
                <ChefHat className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-2xl font-bold text-yellow-900">{preparingOrders.length}</p>
                <p className="text-xs text-yellow-700">En Préparation</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-blue-500 flex items-center justify-center">
                <PackageCheck className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-2xl font-bold text-blue-900">{readyOrders.length}</p>
                <p className="text-xs text-blue-700">Prêt</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-green-500 flex items-center justify-center">
                <CheckCircle2 className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-2xl font-bold text-green-900">{completedOrders.length}</p>
                <p className="text-xs text-green-700">Complétées</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Pending Orders - Priority */}
      {pendingOrders.length > 0 && (
        <div>
          <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
            <AlertCircle className="w-6 h-6 text-red-500" />
            Nouvelles Commandes
          </h2>
          <div className="grid gap-4">
            {pendingOrders.map((order) => (
              <Card key={order.id} className="border-red-200 bg-red-50/50">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <Badge className="bg-red-500">Nouveau</Badge>
                        <span className="font-mono text-sm text-gray-600">#{order.id}</span>
                      </div>
                      <p className="font-semibold text-gray-900 mb-1">{order.items.length} article(s)</p>
                      <p className="text-sm text-gray-600">
                        {order.items.map((item) => `${item.quantity}x Produit #${item.productId}`).join(", ")}
                      </p>
                      <p className="text-xs text-gray-500 mt-2">{new Date(order.createdAt).toLocaleString("fr-DZ")}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold text-gray-900">{order.total} DZD</p>
                    </div>
                  </div>
                  <div className="flex gap-2 mt-4">
                    <Button
                      className="flex-1 bg-green-500 hover:bg-green-600"
                      onClick={() => updateOrderStatus(order.id, "accepted")}
                    >
                      <CheckCircle2 className="w-4 h-4 mr-2" />
                      Accepter
                    </Button>
                    <Button
                      variant="outline"
                      className="flex-1 border-red-300 text-red-600 hover:bg-red-50 bg-transparent"
                      onClick={() => updateOrderStatus(order.id, "cancelled")}
                    >
                      <X className="w-4 h-4 mr-2" />
                      Refuser
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Preparing Orders */}
      {preparingOrders.length > 0 && (
        <div>
          <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
            <ChefHat className="w-6 h-6 text-yellow-500" />
            En Préparation
          </h2>
          <div className="grid gap-4">
            {preparingOrders.map((order) => (
              <Card key={order.id} className="border-yellow-200 bg-yellow-50/50">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <Badge className="bg-yellow-500">En Préparation</Badge>
                        <span className="font-mono text-sm text-gray-600">#{order.id}</span>
                      </div>
                      <p className="font-semibold text-gray-900 mb-1">{order.items.length} article(s)</p>
                      <p className="text-sm text-gray-600">
                        {order.items.map((item) => `${item.quantity}x Produit #${item.productId}`).join(", ")}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold text-gray-900">{order.total} DZD</p>
                    </div>
                  </div>
                  <Button
                    className="w-full mt-4 bg-blue-500 hover:bg-blue-600"
                    onClick={() => updateOrderStatus(order.id, "ready")}
                  >
                    <PackageCheck className="w-4 h-4 mr-2" />
                    Marquer comme Prêt
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Ready Orders */}
      {readyOrders.length > 0 && (
        <div>
          <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
            <PackageCheck className="w-6 h-6 text-blue-500" />
            Prêt pour Récupération
          </h2>
          <div className="grid gap-4">
            {readyOrders.map((order) => (
              <Card key={order.id} className="border-blue-200 bg-blue-50/50">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <Badge className="bg-blue-500">Prêt</Badge>
                        <span className="font-mono text-sm text-gray-600">#{order.id}</span>
                      </div>
                      <p className="font-semibold text-gray-900 mb-1">{order.items.length} article(s)</p>
                      <p className="text-sm text-gray-600">En attente du livreur</p>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold text-gray-900">{order.total} DZD</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {orders.length === 0 && (
        <Card>
          <CardContent className="p-12 text-center">
            <Package className="w-16 h-16 mx-auto mb-4 text-gray-400" />
            <p className="text-lg text-gray-600">Aucune commande</p>
          </CardContent>
        </Card>
      )}
    </div>
  )

  // Products View
  const ProductsView = () => (
    <div className="container mx-auto px-4 py-6 space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">Gestion des Produits</h2>
        <Button onClick={() => setShowProductModal(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Ajouter un Produit
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {products.map((product) => (
          <Card key={product.id} className={!product.available ? "opacity-60" : ""}>
            <CardContent className="p-4">
              <div className="aspect-square bg-gray-100 rounded-lg mb-3 overflow-hidden">
                <img
                  src={product.image || "/placeholder.svg"}
                  alt={product.name}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="space-y-2">
                <div className="flex items-start justify-between">
                  <h3 className="font-semibold text-gray-900">{product.name}</h3>
                  <Badge variant={product.available ? "default" : "secondary"}>
                    {product.available ? "Disponible" : "Rupture"}
                  </Badge>
                </div>
                <p className="text-sm text-gray-600 line-clamp-2">{product.description}</p>
                <p className="text-xl font-bold text-primary">{product.price} DZD</p>
                <div className="flex items-center justify-between pt-2 border-t">
                  <div className="flex items-center gap-2">
                    <Switch
                      checked={product.available}
                      onCheckedChange={(checked) => toggleProductAvailability(product.id, checked)}
                    />
                    <span className="text-sm text-gray-600">En stock</span>
                  </div>
                  <div className="flex gap-1">
                    <Button variant="ghost" size="icon" onClick={() => setEditingProduct(product)}>
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button variant="ghost" size="icon" className="text-red-600 hover:text-red-700">
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {products.length === 0 && (
        <Card>
          <CardContent className="p-12 text-center">
            <Package className="w-16 h-16 mx-auto mb-4 text-gray-400" />
            <p className="text-lg text-gray-600 mb-4">Aucun produit</p>
            <Button onClick={() => setShowProductModal(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Ajouter votre premier produit
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  )

  // History View
  const HistoryView = () => {
    const totalRevenue = completedOrders.reduce((sum, order) => sum + order.total, 0)

    return (
      <div className="container mx-auto px-4 py-6 space-y-6">
        <h2 className="text-2xl font-bold text-gray-900">Historique des Commandes</h2>

        {/* Revenue Card */}
        <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-green-700 mb-1">Revenu Total</p>
                <p className="text-4xl font-bold text-green-900">{totalRevenue} DZD</p>
                <p className="text-sm text-green-700 mt-1">{completedOrders.length} commandes complétées</p>
              </div>
              <div className="w-20 h-20 rounded-full bg-green-500 flex items-center justify-center">
                <TrendingUp className="w-10 h-10 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Orders List */}
        <div className="space-y-3">
          {completedOrders.map((order) => (
            <Card key={order.id}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
                      <CheckCircle2 className="w-5 h-5 text-green-600" />
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900">#{order.id}</p>
                      <p className="text-sm text-gray-600">{order.items.length} article(s)</p>
                      <p className="text-xs text-gray-500">
                        {order.deliveredAt ? new Date(order.deliveredAt).toLocaleString("fr-DZ") : ""}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-xl font-bold text-green-600">{order.total} DZD</p>
                    <Badge variant="outline" className="mt-1">
                      {order.paymentMethod === "cash" ? "Espèces" : "Carte"}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {completedOrders.length === 0 && (
          <Card>
            <CardContent className="p-12 text-center">
              <Clock className="w-16 h-16 mx-auto mb-4 text-gray-400" />
              <p className="text-lg text-gray-600">Aucune commande complétée</p>
            </CardContent>
          </Card>
        )}
      </div>
    )
  }

  // Bottom Navigation
  const BottomNav = () => (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-200 shadow-lg md:hidden">
      <div className="flex items-center justify-around py-3 px-4">
        <button
          onClick={() => setCurrentView("orders")}
          className={`flex flex-col items-center gap-1 transition-colors relative ${
            currentView === "orders" ? "text-primary" : "text-gray-400"
          }`}
        >
          <ShoppingBag className="w-6 h-6" />
          {pendingOrders.length > 0 && (
            <span className="absolute -top-1 right-0 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">
              {pendingOrders.length}
            </span>
          )}
          <span className="text-xs font-medium">Commandes</span>
        </button>
        <button
          onClick={() => setCurrentView("products")}
          className={`flex flex-col items-center gap-1 transition-colors ${
            currentView === "products" ? "text-primary" : "text-gray-400"
          }`}
        >
          <Package className="w-6 h-6" />
          <span className="text-xs font-medium">Produits</span>
        </button>
        <button
          onClick={() => setCurrentView("history")}
          className={`flex flex-col items-center gap-1 transition-colors ${
            currentView === "history" ? "text-primary" : "text-gray-400"
          }`}
        >
          <TrendingUp className="w-6 h-6" />
          <span className="text-xs font-medium">Historique</span>
        </button>
      </div>
    </nav>
  )

  return (
    <div className="min-h-screen bg-background pb-20 md:pb-6">
      <Header />
      <main>
        {currentView === "orders" && <OrdersView />}
        {currentView === "products" && <ProductsView />}
        {currentView === "history" && <HistoryView />}
      </main>
      <BottomNav />
    </div>
  )
}
