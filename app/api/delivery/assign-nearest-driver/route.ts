import { type NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"
import { emitOrderAssigned } from "@/lib/events"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { orderId, latitude, longitude } = body

    const order = db.getOrder(orderId)
    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 })
    }

    // Get nearby drivers within 5km
    const nearbyDrivers = db.getNearbyDrivers(latitude, longitude, 5)

    if (nearbyDrivers.length === 0) {
      return NextResponse.json({ error: "No drivers available nearby" }, { status: 400 })
    }

    // Get driver performance to find the best driver
    const driverScores = nearbyDrivers.map((driverLoc) => {
      const performance = db.getDriverPerformance(driverLoc.driverId)
      const distance =
        Math.sqrt(Math.pow(driverLoc.latitude - latitude, 2) + Math.pow(driverLoc.longitude - longitude, 2)) * 111

      // Score based on distance (lower is better) and rating (higher is better)
      const score = distance * 0.6 - (performance?.rating || 3) * 0.4

      return {
        driverId: driverLoc.driverId,
        distance,
        rating: performance?.rating || 3,
        score,
      }
    })

    // Sort by score and pick the best driver
    const bestDriver = driverScores.sort((a, b) => a.score - b.score)[0]

    // Assign driver to order
    const updatedOrder = db.assignDriver(orderId, bestDriver.driverId)

    // Emit event for real-time notification
    emitOrderAssigned(orderId, bestDriver.driverId)

    return NextResponse.json({
      success: true,
      order: updatedOrder,
      assignedDriver: bestDriver,
    })
  } catch (error) {
    console.error("[v0] Error assigning driver:", error)
    return NextResponse.json({ error: "Failed to assign driver" }, { status: 500 })
  }
}
