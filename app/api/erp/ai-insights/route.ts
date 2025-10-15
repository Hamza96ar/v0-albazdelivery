import { type NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"

// GET - Fetch AI-powered insights
export async function GET(request: NextRequest) {
  try {
    const sales = db.getAllSales()
    const products = db.getAllInventoryProducts()

    // Simple sales forecasting based on historical data
    const weekSales = db.getWeekSales()
    const monthSales = db.getMonthSales()

    const forecast = {
      week: weekSales * 1.1, // Simple 10% growth prediction
      month: monthSales * 1.15, // Simple 15% growth prediction
      trend: weekSales > monthSales / 4 ? "up" : weekSales < monthSales / 4 ? "down" : "stable",
    }

    // Inventory recommendations based on low stock
    const lowStockProducts = db.getLowStockProducts()
    const recommendations = lowStockProducts.map((product) => ({
      productId: product.id,
      productName: product.name,
      currentStock: product.stock,
      recommendedQuantity: product.lowStockThreshold * 3,
      reason: "Stock faible - réapprovisionnement recommandé",
    }))

    // Product bundling suggestions (simplified)
    const bundles = [
      {
        products: [1, 2],
        frequency: 5,
        suggestedDiscount: 10,
      },
    ]

    return NextResponse.json({
      success: true,
      forecast,
      recommendations,
      bundles,
    })
  } catch (error) {
    console.error("[v0] AI Insights error:", error)
    return NextResponse.json({ success: false, error: "Failed to fetch AI insights" }, { status: 500 })
  }
}
