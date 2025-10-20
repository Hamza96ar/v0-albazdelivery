import { db } from "@/lib/db"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const driverId = searchParams.get("driverId")

    if (driverId) {
      const performance = db.getDriverPerformance(driverId)
      return Response.json({
        success: true,
        performance,
      })
    }

    // Get top performing drivers
    const topDrivers = db.getTopPerformingDrivers(10)
    return Response.json({
      success: true,
      drivers: topDrivers,
    })
  } catch (error) {
    console.error("[v0] Performance fetch error:", error)
    return Response.json({ success: false, error: "Failed to fetch performance data" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const { driverId, totalDeliveries, averageDeliveryTime, onTimePercentage, rating, earnings } = await request.json()

    if (!driverId) {
      return Response.json({ success: false, error: "Driver ID required" }, { status: 400 })
    }

    const performance = db.createDriverPerformance({
      driverId,
      totalDeliveries: totalDeliveries || 0,
      averageDeliveryTime: averageDeliveryTime || 0,
      onTimePercentage: onTimePercentage || 0,
      rating: rating || 0,
      earnings: earnings || 0,
      createdAt: new Date(),
      updatedAt: new Date(),
    })

    return Response.json({
      success: true,
      performance,
    })
  } catch (error) {
    console.error("[v0] Performance creation error:", error)
    return Response.json({ success: false, error: "Failed to create performance record" }, { status: 500 })
  }
}
