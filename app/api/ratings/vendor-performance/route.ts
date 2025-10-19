import { db } from "@/lib/db"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const vendorId = searchParams.get("vendorId")

    if (!vendorId) {
      return Response.json({ success: false, error: "Missing vendorId" }, { status: 400 })
    }

    const performance = db.getVendorPerformance(vendorId)

    if (!performance) {
      return Response.json({ success: false, error: "No performance data found" }, { status: 404 })
    }

    return Response.json({ success: true, performance })
  } catch (error) {
    console.error("[v0] Error fetching vendor performance:", error)
    return Response.json({ success: false, error: "Failed to fetch vendor performance" }, { status: 500 })
  }
}
