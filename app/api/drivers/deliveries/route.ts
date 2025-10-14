import { type NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"
import { emitOrderAssigned } from "@/lib/events"

// GET /api/drivers/deliveries - Get available deliveries or driver's assigned deliveries
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const driverId = searchParams.get("driverId")
    const available = searchParams.get("available")

    if (available === "true") {
      // Get orders that are ready for pickup and not assigned to any driver
      const availableOrders = db.getAvailableDeliveries()
      return NextResponse.json({ success: true, deliveries: availableOrders })
    }

    if (driverId) {
      // Get orders assigned to this driver
      const driverOrders = db.getOrdersByDriver(driverId)
      return NextResponse.json({ success: true, deliveries: driverOrders })
    }

    return NextResponse.json({ success: false, error: "driverId or available=true is required" }, { status: 400 })
  } catch (error) {
    console.error("[v0] Error fetching deliveries:", error)
    return NextResponse.json({ success: false, error: "Failed to fetch deliveries" }, { status: 500 })
  }
}

// POST /api/drivers/deliveries/accept - Accept a delivery
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { orderId, driverId } = body

    if (!orderId || !driverId) {
      return NextResponse.json({ success: false, error: "orderId and driverId are required" }, { status: 400 })
    }

    const order = db.getOrder(orderId)

    if (!order) {
      return NextResponse.json({ success: false, error: "Order not found" }, { status: 404 })
    }

    if (order.status !== "ready") {
      return NextResponse.json({ success: false, error: "Order is not ready for pickup" }, { status: 400 })
    }

    if (order.driverId) {
      return NextResponse.json({ success: false, error: "Order already assigned to a driver" }, { status: 400 })
    }

    const updatedOrder = db.assignDriver(orderId, driverId)

    console.log("[v0] Driver accepted delivery:", driverId, "->", orderId)

    if (updatedOrder) {
      emitOrderAssigned(updatedOrder, driverId)
    }

    return NextResponse.json({ success: true, order: updatedOrder })
  } catch (error) {
    console.error("[v0] Error accepting delivery:", error)
    return NextResponse.json({ success: false, error: "Failed to accept delivery" }, { status: 500 })
  }
}
