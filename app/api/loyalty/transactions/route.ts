import { type NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"

export async function GET(request: NextRequest) {
  const customerId = request.nextUrl.searchParams.get("customerId")

  if (!customerId) {
    return NextResponse.json({ error: "Customer ID required" }, { status: 400 })
  }

  const account = db.getLoyaltyAccount(customerId)
  if (!account) {
    return NextResponse.json({ error: "Account not found" }, { status: 404 })
  }

  const transactions = db.getLoyaltyTransactions(account.id)
  return NextResponse.json({ success: true, transactions })
}
