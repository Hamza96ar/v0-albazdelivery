import { type NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"
import type { SupportTicket } from "@/lib/types"

export async function GET(request: NextRequest) {
  try {
    const customerId = request.nextUrl.searchParams.get("customerId")
    const status = request.nextUrl.searchParams.get("status")

    let tickets: SupportTicket[] = []

    if (customerId) {
      tickets = db.getSupportTicketsByCustomer(customerId)
    } else if (status === "open") {
      tickets = db.getOpenSupportTickets()
    }

    return NextResponse.json({
      success: true,
      tickets: tickets.map((t) => ({
        ...t,
        createdAt: t.createdAt.toISOString(),
        updatedAt: t.updatedAt.toISOString(),
        resolvedAt: t.resolvedAt?.toISOString(),
        messages: t.messages.map((m) => ({
          ...m,
          createdAt: m.createdAt.toISOString(),
          updatedAt: m.updatedAt.toISOString(),
        })),
      })),
    })
  } catch (error) {
    console.error("[v0] Error fetching tickets:", error)
    return NextResponse.json({ success: false, error: "Failed to fetch tickets" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { customerId, subject, description, category, priority } = body

    if (!customerId || !subject || !description) {
      return NextResponse.json({ success: false, error: "Missing required fields" }, { status: 400 })
    }

    const ticket: SupportTicket = {
      id: `ticket-${Date.now()}`,
      customerId,
      subject,
      description,
      category: category || "other",
      priority: priority || "medium",
      status: "open",
      messages: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    const created = db.createSupportTicket(ticket)

    return NextResponse.json({
      success: true,
      ticket: {
        ...created,
        createdAt: created.createdAt.toISOString(),
        updatedAt: created.updatedAt.toISOString(),
        messages: created.messages.map((m) => ({
          ...m,
          createdAt: m.createdAt.toISOString(),
          updatedAt: m.updatedAt.toISOString(),
        })),
      },
    })
  } catch (error) {
    console.error("[v0] Error creating ticket:", error)
    return NextResponse.json({ success: false, error: "Failed to create ticket" }, { status: 500 })
  }
}
