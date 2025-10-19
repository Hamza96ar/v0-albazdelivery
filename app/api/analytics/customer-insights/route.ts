import { db } from "@/lib/db"
import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  try {
    const vendorId = request.nextUrl.searchParams.get("vendorId")

    if (!vendorId) {
      return NextResponse.json({ success: false, error: "Missing vendorId" }, { status: 400 })
    }

    const stores = db.getStoresByVendor(vendorId)
    const storeIds = stores.map((s) => s.id)
    const allOrders = db.getAllOrders()
    const vendorOrders = allOrders.filter((o) => storeIds.includes(o.storeId))

    // Customer metrics
    const uniqueCustomers = new Set(vendorOrders.map((o) => o.customerId))
    const repeatCustomers = new Map<string, number>()

    vendorOrders.forEach((order) => {
      const count = repeatCustomers.get(order.customerId) || 0
      repeatCustomers.set(order.customerId, count + 1)
    })

    const repeatCount = Array.from(repeatCustomers.values()).filter((c) => c > 1).length
    const repeatRate = uniqueCustomers.size > 0 ? (repeatCount / uniqueCustomers.size) * 100 : 0

    // Top customers
    const topCustomers = Array.from(repeatCustomers.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([customerId, orderCount]) => ({
        customerId,
        orderCount,
        totalSpent: vendorOrders.filter((o) => o.customerId === customerId).reduce((sum, o) => sum + o.total, 0),
      }))

    return NextResponse.json({
      success: true,
      insights: {
        totalCustomers: uniqueCustomers.size,
        repeatCustomers: repeatCount,
        repeatRate: Math.round(repeatRate),
        topCustomers,
      },
    })
  } catch (error) {
    console.error("[v0] Customer insights error:", error)
    return NextResponse.json({ success: false, error: "Failed to fetch customer insights" }, { status: 500 })
  }
}
