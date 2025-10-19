import { db } from "@/lib/db"
import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  try {
    const customerId = request.nextUrl.searchParams.get("customerId")

    if (!customerId) {
      return NextResponse.json({ success: false, error: "Missing customerId" }, { status: 400 })
    }

    let wallet = db.getWallet(customerId)

    // Create wallet if it doesn't exist
    if (!wallet) {
      wallet = {
        id: `wallet-${customerId}`,
        customerId,
        balance: 0,
        totalSpent: 0,
        totalEarned: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
      }
      wallet = db.createWallet(wallet)
    }

    return NextResponse.json({ success: true, wallet })
  } catch (error) {
    console.error("[v0] Wallet balance error:", error)
    return NextResponse.json({ success: false, error: "Failed to fetch wallet balance" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const { customerId, amount, description, relatedOrderId } = await request.json()

    if (!customerId || amount === undefined) {
      return NextResponse.json({ success: false, error: "Missing required fields" }, { status: 400 })
    }

    let wallet = db.getWallet(customerId)

    // Create wallet if it doesn't exist
    if (!wallet) {
      wallet = {
        id: `wallet-${customerId}`,
        customerId,
        balance: 0,
        totalSpent: 0,
        totalEarned: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
      }
      wallet = db.createWallet(wallet)
    }

    // Update wallet balance
    const updatedWallet = db.updateWalletBalance(customerId, amount)

    // Create transaction record
    const transaction = {
      id: `transaction-${Date.now()}`,
      walletId: wallet.id,
      type: amount > 0 ? ("credit" as const) : ("debit" as const),
      amount: Math.abs(amount),
      description: description || "Wallet transaction",
      relatedOrderId,
      createdAt: new Date(),
    }

    db.createWalletTransaction(transaction)

    return NextResponse.json({ success: true, wallet: updatedWallet, transaction })
  } catch (error) {
    console.error("[v0] Wallet update error:", error)
    return NextResponse.json({ success: false, error: "Failed to update wallet" }, { status: 500 })
  }
}
