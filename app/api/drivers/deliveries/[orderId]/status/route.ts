import { type NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"
import { emitOrderUpdated } from "@/lib/events"

export async function PATCH(request: NextRequest, { params }: { params: { orderId: string } }) {
  try {
    const body = await request.json()
    const { status, driverId } = body
    const { orderId } = params

    if (!status || !driverId) {
      return NextResponse.json(
        {
          success: false,
          error: "Missing status or driverId",
        },
        { status: 400 },
      )
    }

    const order = db.getOrder(orderId)

    if (!order) {
      return NextResponse.json({ success: false, error: "Order not found" }, { status: 404 })
    }

    if (order.driverId !== driverId) {
      return NextResponse.json({ success: false, error: "Order not assigned to this driver" }, { status: 403 })
    }

    const updatedOrder = db.updateOrderStatus(orderId, status, driverId)

    console.log("[v0] Delivery status updated:", orderId, "->", status)

    if (updatedOrder) {
      emitOrderUpdated(updatedOrder)
    }

    return NextResponse.json({
      success: true,
      order: updatedOrder,
    })
  } catch (error) {
    console.error("[v0] Error updating delivery status:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Failed to update delivery status",
      },
      { status: 500 },
    )
  }
}
