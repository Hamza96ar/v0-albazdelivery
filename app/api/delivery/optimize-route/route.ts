import { db } from "@/lib/db"
import type { DeliveryRoute } from "@/lib/types"

export async function POST(request: Request) {
  try {
    const { driverId, orderIds, city } = await request.json()

    if (!driverId || !orderIds || orderIds.length === 0) {
      return Response.json({ success: false, error: "Missing required fields" }, { status: 400 })
    }

    // Get all orders to calculate distances
    const orders = orderIds.map((id: string) => db.getOrder(id)).filter((o) => o !== undefined)

    if (orders.length === 0) {
      return Response.json({ success: false, error: "No valid orders found" }, { status: 404 })
    }

    // Simple optimization: sort by delivery address (in production, use actual distance matrix API)
    const optimizedSequence = orders.sort((a, b) => a.deliveryAddress.localeCompare(b.deliveryAddress)).map((o) => o.id)

    // Calculate estimated time (5 min per delivery + 2 min travel between stops)
    const estimatedTime = orders.length * 5 + (orders.length - 1) * 2

    // Calculate total distance (mock: 2km per delivery)
    const totalDistance = orders.length * 2

    const route: DeliveryRoute = {
      id: `route-${Date.now()}`,
      driverId,
      deliveries: orderIds,
      optimizedSequence,
      totalDistance,
      estimatedTime,
      status: "planned",
      createdAt: new Date(),
    }

    db.createDeliveryRoute(route)

    return Response.json({
      success: true,
      route,
      message: "Route optimized successfully",
    })
  } catch (error) {
    console.error("[v0] Route optimization error:", error)
    return Response.json({ success: false, error: "Failed to optimize route" }, { status: 500 })
  }
}
