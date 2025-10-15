import { type NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"
import type { InventoryProduct } from "@/lib/types"

// GET - Fetch all inventory products
export async function GET(request: NextRequest) {
  try {
    const products = db.getAllInventoryProducts()
    return NextResponse.json({ success: true, products })
  } catch (error) {
    console.error("[v0] Inventory GET error:", error)
    return NextResponse.json({ success: false, error: "Failed to fetch inventory" }, { status: 500 })
  }
}

// POST - Create new product
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const product: InventoryProduct = {
      id: Date.now(),
      sku: body.sku,
      name: body.name,
      category: body.category,
      supplierId: body.supplierId ? Number.parseInt(body.supplierId) : undefined,
      costPrice: body.costPrice,
      sellingPrice: body.sellingPrice,
      stock: body.stock,
      lowStockThreshold: body.lowStockThreshold,
      barcode: body.barcode,
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    const created = db.createInventoryProduct(product)
    return NextResponse.json({ success: true, product: created })
  } catch (error) {
    console.error("[v0] Inventory POST error:", error)
    return NextResponse.json({ success: false, error: "Failed to create product" }, { status: 500 })
  }
}

// PUT - Update product
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const updated = db.updateInventoryProduct(body.id, body)

    if (!updated) {
      return NextResponse.json({ success: false, error: "Product not found" }, { status: 404 })
    }

    return NextResponse.json({ success: true, product: updated })
  } catch (error) {
    console.error("[v0] Inventory PUT error:", error)
    return NextResponse.json({ success: false, error: "Failed to update product" }, { status: 500 })
  }
}

// DELETE - Delete product
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = Number.parseInt(searchParams.get("id") || "")

    if (!id) {
      return NextResponse.json({ success: false, error: "Product ID required" }, { status: 400 })
    }

    const deleted = db.deleteInventoryProduct(id)

    if (!deleted) {
      return NextResponse.json({ success: false, error: "Product not found" }, { status: 404 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("[v0] Inventory DELETE error:", error)
    return NextResponse.json({ success: false, error: "Failed to delete product" }, { status: 500 })
  }
}
