import { db } from "@/lib/db"
import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  try {
    const vendorId = request.nextUrl.searchParams.get("vendorId")

    if (!vendorId) {
      return NextResponse.json({ success: false, error: "Missing vendorId" }, { status: 400 })
    }

    // Get vendor's stores
    const stores = db.getStoresByVendor(vendorId)
    const storeIds = stores.map((s) => s.id)

    // Get all orders for vendor's stores
    const allOrders = db.getAllOrders()
    const vendorOrders = allOrders.filter((o) => storeIds.includes(o.storeId))

    // Calculate metrics
    const todayStart = new Date()
    todayStart.setHours(0, 0, 0, 0)
    const todayOrders = vendorOrders.filter((o) => o.createdAt >= todayStart)
    const todayRevenue = todayOrders.reduce((sum, o) => sum + o.total, 0)

    const weekStart = new Date()
    weekStart.setDate(weekStart.getDate() - 7)
    const weekOrders = vendorOrders.filter((o) => o.createdAt >= weekStart)
    const weekRevenue = weekOrders.reduce((sum, o) => sum + o.total, 0)

    const monthStart = new Date()
    monthStart.setMonth(monthStart.getMonth() - 1)
    const monthOrders = vendorOrders.filter((o) => o.createdAt >= monthStart)
    const monthRevenue = monthOrders.reduce((sum, o) => sum + o.total, 0)

    // Order status breakdown
    const pendingOrders = vendorOrders.filter((o) => o.status === "pending").length
    const completedOrders = vendorOrders.filter((o) => o.status === "delivered").length
    const cancelledOrders = vendorOrders.filter((o) => o.status === "cancelled").length

    // Top products
    const topProducts = new Map<number, { name: string; quantity: number; revenue: number }>()
    vendorOrders.forEach((order) => {
      order.items.forEach((item) => {
        const existing = topProducts.get(item.productId)
        if (existing) {
          existing.quantity += item.quantity
          existing.revenue += item.price * item.quantity
        } else {
          const product = db.getProduct(item.productId)
          topProducts.set(item.productId, {
            name: product?.name || "Unknown",
            quantity: item.quantity,
            revenue: item.price * item.quantity,
          })
        }
      })
    })

    const topProductsList = Array.from(topProducts.entries())
      .map(([id, data]) => ({ id, ...data }))
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 5)

    // Average order value
    const avgOrderValue =
      vendorOrders.length > 0 ? vendorOrders.reduce((sum, o) => sum + o.total, 0) / vendorOrders.length : 0

    return NextResponse.json({
      success: true,
      metrics: {
        todayRevenue,
        weekRevenue,
        monthRevenue,
        totalOrders: vendorOrders.length,
        pendingOrders,
        completedOrders,
        cancelledOrders,
        avgOrderValue,
        topProducts: topProductsList,
      },
    })
  } catch (error) {
    console.error("[v0] Analytics error:", error)
    return NextResponse.json({ success: false, error: "Failed to fetch analytics" }, { status: 500 })
  }
}
