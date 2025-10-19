import { db } from "@/lib/db"
import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  try {
    const customerId = request.nextUrl.searchParams.get("customerId")

    if (!customerId) {
      return NextResponse.json({ success: false, error: "Missing customerId" }, { status: 400 })
    }

    const wallet = db.getWallet(customerId)

    if (!wallet) {
      return NextResponse.json({ success: true, transactions: [] })
    }

    const transactions = db.getWalletTransactions(wallet.id)

    return NextResponse.json({ success: true, transactions })
  } catch (error) {
    console.error("[v0] Wallet transactions error:", error)
    return NextResponse.json({ success: false, error: "Failed to fetch transactions" }, { status: 500 })
  }
}
