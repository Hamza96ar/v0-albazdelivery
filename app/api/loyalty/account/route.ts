import { type NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"
import { v4 as uuidv4 } from "uuid"

export async function GET(request: NextRequest) {
  const customerId = request.nextUrl.searchParams.get("customerId")

  if (!customerId) {
    return NextResponse.json({ error: "Customer ID required" }, { status: 400 })
  }

  let account = db.getLoyaltyAccount(customerId)

  // Create account if it doesn't exist
  if (!account) {
    const referralCode = `ALBAZ${customerId.slice(-4).toUpperCase()}${Math.random().toString(36).substring(2, 7).toUpperCase()}`
    account = {
      id: uuidv4(),
      customerId,
      points: 0,
      totalPointsEarned: 0,
      totalPointsRedeemed: 0,
      tier: "bronze",
      referralCode,
      referralCount: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
    }
    db.createLoyaltyAccount(account)
  }

  return NextResponse.json({ success: true, account })
}

export async function POST(request: NextRequest) {
  const { customerId, points, description, orderId } = await request.json()

  if (!customerId || points === undefined) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
  }

  const account = db.updateLoyaltyPoints(customerId, points)

  if (!account) {
    return NextResponse.json({ error: "Account not found" }, { status: 404 })
  }

  // Create transaction record
  const transaction = {
    id: uuidv4(),
    loyaltyAccountId: account.id,
    type: points > 0 ? ("earn" as const) : ("redeem" as const),
    points: Math.abs(points),
    description,
    relatedOrderId: orderId,
    createdAt: new Date(),
  }

  db.createLoyaltyTransaction(transaction)

  return NextResponse.json({ success: true, account, transaction })
}
