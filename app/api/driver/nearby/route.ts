import { type NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const lat = Number.parseFloat(searchParams.get("lat") || "0")
    const lng = Number.parseFloat(searchParams.get("lng") || "0")
    const radius = Number.parseFloat(searchParams.get("radius") || "5")

    const nearbyDrivers = db.getNearbyDrivers(lat, lng, radius)
    return NextResponse.json(nearbyDrivers)
  } catch (error) {
    console.error("[v0] Error fetching nearby drivers:", error)
    return NextResponse.json({ error: "Failed to fetch nearby drivers" }, { status: 500 })
  }
}
