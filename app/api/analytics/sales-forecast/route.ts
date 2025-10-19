import { db } from "@/lib/db"
import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  try {
    const vendorId = request.nextUrl.searchParams.get("vendorId")
    const period = request.nextUrl.searchParams.get("period") || "week"

    if (!vendorId) {
      return NextResponse.json({ success: false, error: "Missing vendorId" }, { status: 400 })
    }

    const stores = db.getStoresByVendor(vendorId)
    const storeIds = stores.map((s) => s.id)
    const allOrders = db.getAllOrders()
    const vendorOrders = allOrders.filter((o) => storeIds.includes(o.storeId))

    // Calculate historical average
    const periodDays = period === "week" ? 7 : 30
    const periodStart = new Date()
    periodStart.setDate(periodStart.getDate() - periodDays)

    const periodOrders = vendorOrders.filter((o) => o.createdAt >= periodStart)
    const periodRevenue = periodOrders.reduce((sum, o) => sum + o.total, 0)
    const avgDailyRevenue = periodRevenue / periodDays

    // Simple forecast: assume trend continues
    const predictedRevenue = avgDailyRevenue * periodDays
    const trend = periodOrders.length > 0 ? "stable" : "down"

    return NextResponse.json({
      success: true,
      forecast: {
        period,
        predictedSales: Math.round(predictedRevenue),
        confidence: 0.75,
        trend,
        avgDailyRevenue: Math.round(avgDailyRevenue),
      },
    })
  } catch (error) {
    console.error("[v0] Forecast error:", error)
    return NextResponse.json({ success: false, error: "Failed to generate forecast" }, { status: 500 })
  }
}
