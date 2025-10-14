import { NextResponse } from "next/server"
import { db } from "@/lib/db"

export async function GET() {
  try {
    const customers = db.getUsersByRole("customer")
    const drivers = db.getUsersByRole("driver")
    const vendors = db.getUsersByRole("vendor")

    const users = [...customers, ...drivers, ...vendors]

    return NextResponse.json({ success: true, users })
  } catch (error) {
    console.error("[v0] Error fetching users:", error)
    return NextResponse.json({ success: false, error: "Failed to fetch users" }, { status: 500 })
  }
}
