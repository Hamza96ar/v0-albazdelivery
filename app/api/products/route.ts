import { type NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"

// GET /api/products - Get products by store
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const storeId = searchParams.get("storeId")

    if (!storeId) {
      return NextResponse.json({ success: false, error: "storeId is required" }, { status: 400 })
    }

    const products = db.getProductsByStore(Number.parseInt(storeId))

    return NextResponse.json({ success: true, products })
  } catch (error) {
    console.error("[v0] Error fetching products:", error)
    return NextResponse.json({ success: false, error: "Failed to fetch products" }, { status: 500 })
  }
}

// PATCH /api/products - Update product availability
export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json()
    const { productId, available } = body

    if (productId === undefined || available === undefined) {
      return NextResponse.json({ success: false, error: "productId and available are required" }, { status: 400 })
    }

    const updatedProduct = db.updateProductAvailability(productId, available)

    if (!updatedProduct) {
      return NextResponse.json({ success: false, error: "Product not found" }, { status: 404 })
    }

    console.log("[v0] Product availability updated:", productId, "->", available)

    return NextResponse.json({ success: true, product: updatedProduct })
  } catch (error) {
    console.error("[v0] Error updating product:", error)
    return NextResponse.json({ success: false, error: "Failed to update product" }, { status: 500 })
  }
}
