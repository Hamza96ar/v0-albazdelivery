import { db } from "@/lib/db"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const city = searchParams.get("city")

    let zones
    if (city) {
      zones = db.getDeliveryZonesByCity(city)
    } else {
      zones = db.getAllDeliveryZones()
    }

    return Response.json({
      success: true,
      zones,
    })
  } catch (error) {
    console.error("[v0] Zones fetch error:", error)
    return Response.json({ success: false, error: "Failed to fetch zones" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const { name, city, coordinates, deliveryFee, estimatedTime } = await request.json()

    if (!name || !city || !coordinates) {
      return Response.json({ success: false, error: "Missing required fields" }, { status: 400 })
    }

    const zone = db.createDeliveryZone({
      id: `zone-${Date.now()}`,
      name,
      city,
      coordinates,
      deliveryFee,
      estimatedTime: estimatedTime || 30,
      activeDrivers: 0,
      createdAt: new Date(),
    })

    return Response.json({
      success: true,
      zone,
    })
  } catch (error) {
    console.error("[v0] Zone creation error:", error)
    return Response.json({ success: false, error: "Failed to create zone" }, { status: 500 })
  }
}
