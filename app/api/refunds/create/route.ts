import { db } from "@/lib/db"
import type { Refund } from "@/lib/types"
import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const { paymentId, orderId, amount, reason } = await request.json()

    if (!paymentId || !orderId || !amount || !reason) {
      return NextResponse.json({ success: false, error: "Missing required fields" }, { status: 400 })
    }

    const payment = db.getPayment(paymentId)

    if (!payment) {
      return NextResponse.json({ success: false, error: "Payment not found" }, { status: 404 })
    }

    const refund: Refund = {
      id: `refund-${Date.now()}`,
      paymentId,
      orderId,
      amount,
      reason,
      status: "pending",
      createdAt: new Date(),
    }

    const createdRefund = db.createRefund(refund)

    return NextResponse.json({ success: true, refund: createdRefund })
  } catch (error) {
    console.error("[v0] Refund creation error:", error)
    return NextResponse.json({ success: false, error: "Failed to create refund" }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    const customerId = request.nextUrl.searchParams.get("customerId")

    if (!customerId) {
      return NextResponse.json({ success: false, error: "Missing customerId" }, { status: 400 })
    }

    const refunds = db.getRefundsByCustomer(customerId)

    return NextResponse.json({ success: true, refunds })
  } catch (error) {
    console.error("[v0] Refund fetch error:", error)
    return NextResponse.json({ success: false, error: "Failed to fetch refunds" }, { status: 500 })
  }
}
