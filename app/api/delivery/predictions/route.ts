import { db } from "@/lib/db"
import type { DeliveryPrediction } from "@/lib/types"

export async function POST(request: Request) {
  try {
    const { orderId } = await request.json()

    if (!orderId) {
      return Response.json({ success: false, error: "Order ID required" }, { status: 400 })
    }

    const order = db.getOrder(orderId)
    if (!order) {
      return Response.json({ success: false, error: "Order not found" }, { status: 404 })
    }

    // Get store and calculate preparation time
    const store = db.getStore(order.storeId)
    const preparationTime = 15 // Average preparation time in minutes

    // Get zone info for delivery time
    const zones = db.getDeliveryZonesByCity(order.city)
    const zone = zones[0] // Get first matching zone
    const deliveryTime = zone ? zone.estimatedTime : 30

    // Calculate confidence based on order complexity
    const itemCount = order.items.length
    const confidence = Math.min(0.95, 0.7 + itemCount * 0.05)

    const factors = [
      `${itemCount} items in order`,
      `Store: ${store?.name || "Unknown"}`,
      `Zone: ${order.city}`,
      `Time: ${new Date().getHours()}:00`,
    ]

    const prediction: DeliveryPrediction = {
      orderId,
      estimatedPickupTime: preparationTime,
      estimatedDeliveryTime: deliveryTime,
      confidence,
      factors,
    }

    return Response.json({
      success: true,
      prediction,
    })
  } catch (error) {
    console.error("[v0] Prediction error:", error)
    return Response.json({ success: false, error: "Failed to predict delivery time" }, { status: 500 })
  }
}
