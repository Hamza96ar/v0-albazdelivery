import { NextResponse } from "next/server"
import { db } from "@/lib/db"

export async function GET() {
  try {
    const orders = db.getAllOrders()
    return NextResponse.json({ success: true, orders })
  } catch (error) {
    console.error("[v0] Error fetching all orders:", error)
    return NextResponse.json({ success: false, error: "Failed to fetch orders" }, { status: 500 })
  }
}
