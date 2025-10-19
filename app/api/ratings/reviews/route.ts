import { db } from "@/lib/db"
import type { VendorReview } from "@/lib/types"

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { vendorId, customerId, orderId, rating, foodQuality, deliveryTime, customerService, comment, photos } = body

    if (!vendorId || !customerId || !orderId || !rating) {
      return Response.json({ success: false, error: "Missing required fields" }, { status: 400 })
    }

    const review: VendorReview = {
      id: `review-${Date.now()}`,
      vendorId,
      customerId,
      orderId,
      rating,
      foodQuality: foodQuality || rating,
      deliveryTime: deliveryTime || rating,
      customerService: customerService || rating,
      comment,
      photos: photos || [],
      helpful: 0,
      unhelpful: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    db.createVendorReview(review)

    return Response.json({ success: true, review })
  } catch (error) {
    console.error("[v0] Error creating review:", error)
    return Response.json({ success: false, error: "Failed to create review" }, { status: 500 })
  }
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const vendorId = searchParams.get("vendorId")

    if (!vendorId) {
      return Response.json({ success: false, error: "Missing vendorId" }, { status: 400 })
    }

    const reviews = db.getVendorReviews(vendorId)

    return Response.json({ success: true, reviews })
  } catch (error) {
    console.error("[v0] Error fetching reviews:", error)
    return Response.json({ success: false, error: "Failed to fetch reviews" }, { status: 500 })
  }
}
