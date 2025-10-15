import { type NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"
import type { Sale } from "@/lib/types"

// GET - Fetch all sales
export async function GET(request: NextRequest) {
  try {
    const sales = db.getAllSales()
    return NextResponse.json({ success: true, sales })
  } catch (error) {
    console.error("[v0] Sales GET error:", error)
    return NextResponse.json({ success: false, error: "Failed to fetch sales" }, { status: 500 })
  }
}

// POST - Create new sale
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const sale: Sale = {
      id: `sale-${Date.now()}`,
      customerId: body.customerId,
      items: body.items,
      subtotal: body.subtotal,
      discount: body.discount,
      total: body.total,
      paymentMethod: body.paymentMethod,
      createdAt: new Date(),
    }

    const created = db.createSale(sale)
    return NextResponse.json({ success: true, sale: created })
  } catch (error) {
    console.error("[v0] Sales POST error:", error)
    return NextResponse.json({ success: false, error: "Failed to create sale" }, { status: 500 })
  }
}
