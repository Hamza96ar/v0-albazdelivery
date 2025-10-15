import { type NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"
import type { Supplier } from "@/lib/types"

// GET - Fetch all suppliers
export async function GET(request: NextRequest) {
  try {
    const suppliers = db.getAllSuppliers()
    return NextResponse.json({ success: true, suppliers })
  } catch (error) {
    console.error("[v0] Suppliers GET error:", error)
    return NextResponse.json({ success: false, error: "Failed to fetch suppliers" }, { status: 500 })
  }
}

// POST - Create new supplier
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const supplier: Supplier = {
      id: Date.now(),
      name: body.name,
      contactPerson: body.contactPerson,
      phone: body.phone,
      email: body.email,
      address: body.address,
      productsSupplied: [],
      createdAt: new Date(),
    }

    const created = db.createSupplier(supplier)
    return NextResponse.json({ success: true, supplier: created })
  } catch (error) {
    console.error("[v0] Suppliers POST error:", error)
    return NextResponse.json({ success: false, error: "Failed to create supplier" }, { status: 500 })
  }
}
