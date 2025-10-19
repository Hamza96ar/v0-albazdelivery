import { db } from "@/lib/db"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const limit = Number.parseInt(searchParams.get("limit") || "10")

    const topVendors = db.getTopRatedVendors(limit)

    return Response.json({ success: true, vendors: topVendors })
  } catch (error) {
    console.error("[v0] Error fetching vendor leaderboard:", error)
    return Response.json({ success: false, error: "Failed to fetch vendor leaderboard" }, { status: 500 })
  }
}
