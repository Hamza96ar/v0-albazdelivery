import { db } from "@/lib/db"
import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  try {
    const customerId = request.nextUrl.searchParams.get("customerId")

    if (!customerId) {
      return NextResponse.json({ success: false, error: "Missing customerId" }, { status: 400 })
    }

    const payments = db.getPaymentsByCustomer(customerId)

    return NextResponse.json({ success: true, payments })
  } catch (error) {
    console.error("[v0] Payment history error:", error)
    return NextResponse.json({ success: false, error: "Failed to fetch payment history" }, { status: 500 })
  }
}
