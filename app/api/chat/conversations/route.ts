import { type NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"

export async function GET(request: NextRequest) {
  try {
    const userId = request.nextUrl.searchParams.get("userId")

    if (!userId) {
      return NextResponse.json({ success: false, error: "User ID required" }, { status: 400 })
    }

    const conversations = db.getConversationsByUser(userId)

    return NextResponse.json({
      success: true,
      conversations: conversations.map((c) => ({
        ...c,
        createdAt: c.createdAt.toISOString(),
        updatedAt: c.updatedAt.toISOString(),
        lastMessageTime: c.lastMessageTime?.toISOString(),
      })),
    })
  } catch (error) {
    console.error("[v0] Error fetching conversations:", error)
    return NextResponse.json({ success: false, error: "Failed to fetch conversations" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { participantIds, participantRoles, type, orderId } = body

    if (!participantIds || !participantRoles || !type) {
      return NextResponse.json({ success: false, error: "Missing required fields" }, { status: 400 })
    }

    const conversation = db.getOrCreateConversation(participantIds, participantRoles, type, orderId)

    return NextResponse.json({
      success: true,
      conversation: {
        ...conversation,
        createdAt: conversation.createdAt.toISOString(),
        updatedAt: conversation.updatedAt.toISOString(),
        lastMessageTime: conversation.lastMessageTime?.toISOString(),
      },
    })
  } catch (error) {
    console.error("[v0] Error creating conversation:", error)
    return NextResponse.json({ success: false, error: "Failed to create conversation" }, { status: 500 })
  }
}
