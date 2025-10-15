import { type NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"

export async function GET(request: NextRequest) {
  try {
    const todaySales = db.getTodaySales()
    const weekSales = db.getWeekSales()
    const monthSales = db.getMonthSales()
    const topProducts = db.getTopSellingProducts(5)
    const lowStockProducts = db.getLowStockProducts()

    return NextResponse.json({
      success: true,
      todaySales,
      weekSales,
      monthSales,
      topProducts,
      lowStockProducts,
    })
  } catch (error) {
    console.error("[v0] Dashboard API error:", error)
    return NextResponse.json({ success: false, error: "Failed to fetch dashboard data" }, { status: 500 })
  }
}
