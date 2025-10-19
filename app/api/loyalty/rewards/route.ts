import { type NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"

export async function GET() {
  const rewards = db.getAllLoyaltyRewards()
  return NextResponse.json({ success: true, rewards })
}

export async function POST(request: NextRequest) {
  const { customerId, rewardId } = await request.json()

  if (!customerId || !rewardId) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
  }

  const reward = db.getAllLoyaltyRewards().find((r) => r.id === rewardId)
  const account = db.getLoyaltyAccount(customerId)

  if (!reward || !account) {
    return NextResponse.json({ error: "Reward or account not found" }, { status: 404 })
  }

  if (account.points < reward.pointsCost) {
    return NextResponse.json({ error: "Insufficient points" }, { status: 400 })
  }

  // Deduct points
  db.updateLoyaltyPoints(customerId, -reward.pointsCost)

  // Create redemption
  const redemption = {
    id: `redemption-${Date.now()}`,
    customerId,
    rewardId,
    status: "active" as const,
    expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
    createdAt: new Date(),
  }

  db.createCustomerRedemption(redemption)

  return NextResponse.json({ success: true, redemption })
}
