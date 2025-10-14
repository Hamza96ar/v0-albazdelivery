import { type NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"
import type { Order } from "@/lib/types"
import { emitOrderCreated } from "@/lib/events"

// GET /api/orders - Get all orders or filter by customer
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const customerId = searchParams.get("customerId")

    let orders: Order[]

    if (customerId) {
      orders = db.getOrdersByCustomer(customerId)
    } else {
      orders = db.getAllOrders()
    }

    return NextResponse.json({ success: true, orders })
  } catch (error) {
    console.error("[v0] Error fetching orders:", error)
    return NextResponse.json({ success: false, error: "Failed to fetch orders" }, { status: 500 })
  }
}

// POST /api/orders - Create a new order
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      customerId,
      storeId,
      items,
      subtotal,
      deliveryFee,
      total,
      paymentMethod,
      deliveryAddress,
      city,
      customerPhone,
    } = body

    // Validate required fields
    if (!customerId || !storeId || !items || !deliveryAddress || !city || !customerPhone) {
      return NextResponse.json({ success: false, error: "Missing required fields" }, { status: 400 })
    }

    // Create order
    const order: Order = {
      id: `ALB${Date.now().toString().slice(-8)}`,
      customerId,
      storeId,
      items,
      subtotal,
      deliveryFee,
      total,
      status: "pending",
      paymentMethod: paymentMethod || "cash",
      deliveryAddress,
      city,
      customerPhone,
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    const createdOrder = db.createOrder(order)

    console.log("[v0] Order created:", createdOrder.id)

    emitOrderCreated(createdOrder)

    return NextResponse.json({ success: true, order: createdOrder }, { status: 201 })
  } catch (error) {
    console.error("[v0] Error creating order:", error)
    return NextResponse.json({ success: false, error: "Failed to create order" }, { status: 500 })
  }
}
