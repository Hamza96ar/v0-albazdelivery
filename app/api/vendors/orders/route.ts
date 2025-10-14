import { type NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"
import { emitOrderUpdated } from "@/lib/events"

// GET /api/vendors/orders - Get orders for a specific vendor's stores
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const vendorId = searchParams.get("vendorId")
    const storeId = searchParams.get("storeId")

    if (!vendorId && !storeId) {
      return NextResponse.json({ success: false, error: "vendorId or storeId is required" }, { status: 400 })
    }

    let orders

    if (storeId) {
      orders = db.getOrdersByStore(Number.parseInt(storeId))
    } else if (vendorId) {
      // Get all stores for this vendor
      const stores = db.getStoresByVendor(vendorId)
      const storeIds = stores.map((s) => s.id)
      orders = db.getAllOrders().filter((order) => storeIds.includes(order.storeId))
    }

    return NextResponse.json({ success: true, orders })
  } catch (error) {
    console.error("[v0] Error fetching vendor orders:", error)
    return NextResponse.json({ success: false, error: "Failed to fetch orders" }, { status: 500 })
  }
}

// PATCH /api/vendors/orders - Update order status (vendor actions)
export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json()
    const { orderId, status } = body

    if (!orderId || !status) {
      return NextResponse.json({ success: false, error: "orderId and status are required" }, { status: 400 })
    }

    // Vendors can only update to: accepted, preparing, ready, cancelled
    const allowedStatuses = ["accepted", "preparing", "ready", "cancelled"]
    if (!allowedStatuses.includes(status)) {
      return NextResponse.json({ success: false, error: "Invalid status for vendor" }, { status: 400 })
    }

    const updatedOrder = db.updateOrderStatus(orderId, status)

    if (!updatedOrder) {
      return NextResponse.json({ success: false, error: "Order not found" }, { status: 404 })
    }

    console.log("[v0] Vendor updated order:", orderId, "->", status)

    emitOrderUpdated(updatedOrder)

    return NextResponse.json({ success: true, order: updatedOrder })
  } catch (error) {
    console.error("[v0] Error updating order:", error)
    return NextResponse.json({ success: false, error: "Failed to update order" }, { status: 500 })
  }
}
