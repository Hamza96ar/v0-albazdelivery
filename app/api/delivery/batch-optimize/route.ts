import { db } from "@/lib/db"

export async function POST(request: Request) {
  try {
    const { city, maxDeliveriesPerRoute } = await request.json()

    if (!city) {
      return Response.json({ success: false, error: "City required" }, { status: 400 })
    }

    // Get all available deliveries in the city
    const availableDeliveries = db.getAvailableDeliveries().filter((order) => order.city === city)

    if (availableDeliveries.length === 0) {
      return Response.json({
        success: true,
        routes: [],
        message: "No deliveries available for optimization",
      })
    }

    // Get available drivers in the zone
    const drivers = db.getUsersByRole("driver")
    const limit = maxDeliveriesPerRoute || 5

    // Create optimized routes
    const routes = []
    let deliveryIndex = 0

    for (let i = 0; i < drivers.length && deliveryIndex < availableDeliveries.length; i++) {
      const driver = drivers[i]
      const routeDeliveries = availableDeliveries.slice(deliveryIndex, deliveryIndex + limit)

      if (routeDeliveries.length === 0) break

      const route = db.createDeliveryRoute({
        id: `route-${Date.now()}-${i}`,
        driverId: driver.id,
        deliveries: routeDeliveries.map((d) => d.id),
        optimizedSequence: routeDeliveries.map((d) => d.id),
        totalDistance: routeDeliveries.length * 2,
        estimatedTime: routeDeliveries.length * 5 + (routeDeliveries.length - 1) * 2,
        status: "planned",
        createdAt: new Date(),
      })

      routes.push(route)
      deliveryIndex += limit
    }

    return Response.json({
      success: true,
      routes,
      totalDeliveries: availableDeliveries.length,
      routesCreated: routes.length,
    })
  } catch (error) {
    console.error("[v0] Batch optimization error:", error)
    return Response.json({ success: false, error: "Failed to optimize batch deliveries" }, { status: 500 })
  }
}
