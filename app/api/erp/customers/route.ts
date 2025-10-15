import { type NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"
import type { Customer } from "@/lib/types"

// GET - Fetch all customers
export async function GET(request: NextRequest) {
  try {
    const customers = db.getAllCustomers()
    return NextResponse.json({ success: true, customers })
  } catch (error) {
    console.error("[v0] Customers GET error:", error)
    return NextResponse.json({ success: false, error: "Failed to fetch customers" }, { status: 500 })
  }
}

// POST - Create new customer
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const customer: Customer = {
      id: `customer-${Date.now()}`,
      name: body.name,
      email: body.email,
      phone: body.phone,
      totalPurchases: 0,
      createdAt: new Date(),
    }

    const created = db.createCustomer(customer)
    return NextResponse.json({ success: true, customer: created })
  } catch (error) {
    console.error("[v0] Customers POST error:", error)
    return NextResponse.json({ success: false, error: "Failed to create customer" }, { status: 500 })
  }
}
