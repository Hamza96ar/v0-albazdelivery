import { type NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"
import type { ChatMessage } from "@/lib/types"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { conversationId, senderId, senderRole, senderName, message, attachments } = body

    if (!conversationId || !senderId || !senderRole || !message) {
      return NextResponse.json({ success: false, error: "Missing required fields" }, { status: 400 })
    }

    const chatMessage: ChatMessage = {
      id: `msg-${Date.now()}`,
      conversationId,
      senderId,
      senderRole,
      senderName,
      message,
      attachments,
      isRead: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    const created = db.createChatMessage(chatMessage)

    return NextResponse.json({
      success: true,
      message: {
        ...created,
        createdAt: created.createdAt.toISOString(),
        updatedAt: created.updatedAt.toISOString(),
      },
    })
  } catch (error) {
    console.error("[v0] Error sending message:", error)
    return NextResponse.json({ success: false, error: "Failed to send message" }, { status: 500 })
  }
}
