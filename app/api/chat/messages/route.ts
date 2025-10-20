import { type NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"

export async function GET(request: NextRequest) {
  try {
    const conversationId = request.nextUrl.searchParams.get("conversationId")
    const userId = request.nextUrl.searchParams.get("userId")
    const limit = Number.parseInt(request.nextUrl.searchParams.get("limit") || "50")

    if (!conversationId) {
      return NextResponse.json({ success: false, error: "Conversation ID required" }, { status: 400 })
    }

    // Mark messages as read
    if (userId) {
      db.markMessagesAsRead(conversationId, userId)
    }

    const messages = db.getChatMessages(conversationId, limit)

    return NextResponse.json({
      success: true,
      messages: messages.map((m) => ({
        ...m,
        createdAt: m.createdAt.toISOString(),
        updatedAt: m.updatedAt.toISOString(),
      })),
    })
  } catch (error) {
    console.error("[v0] Error fetching messages:", error)
    return NextResponse.json({ success: false, error: "Failed to fetch messages" }, { status: 500 })
  }
}
