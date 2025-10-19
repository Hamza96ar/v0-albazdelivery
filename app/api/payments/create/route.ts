import { db } from "@/lib/db"
import type { Payment } from "@/lib/types"
import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const { orderId, customerId, amount, method, transactionId } = await request.json()

    if (!orderId || !customerId || !amount || !method) {
      return NextResponse.json({ success: false, error: "Missing required fields" }, { status: 400 })
    }

    const payment: Payment = {
      id: `payment-${Date.now()}`,
      orderId,
      customerId,
      amount,
      method,
      status: "pending",
      transactionId,
      createdAt: new Date(),
    }

    const createdPayment = db.createPayment(payment)

    // If payment method is wallet, deduct from wallet
    if (method === "wallet") {
      const wallet = db.getWallet(customerId)
      if (!wallet || wallet.balance < amount) {
        return NextResponse.json({ success: false, error: "Insufficient wallet balance" }, { status: 400 })
      }

      db.updateWalletBalance(customerId, -amount)
      db.updatePaymentStatus(createdPayment.id, "completed")
    }

    return NextResponse.json({ success: true, payment: createdPayment })
  } catch (error) {
    console.error("[v0] Payment creation error:", error)
    return NextResponse.json({ success: false, error: "Failed to create payment" }, { status: 500 })
  }
}
