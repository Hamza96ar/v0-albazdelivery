import { NextResponse } from "next/server"
import { db } from "@/lib/db"

export async function GET() {
  try {
    const requests = db.getPendingRegistrationRequests()
    return NextResponse.json({ success: true, requests })
  } catch (error) {
    console.error("[v0] Error fetching registration requests:", error)
    return NextResponse.json({ success: false, error: "Erreur serveur" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { requestId, action, adminId } = body

    if (!requestId || !action || !adminId) {
      return NextResponse.json({ success: false, error: "Paramètres manquants" }, { status: 400 })
    }

    if (action === "approve") {
      const user = db.approveRegistrationRequest(requestId, adminId)
      if (!user) {
        return NextResponse.json({ success: false, error: "Demande introuvable" }, { status: 404 })
      }
      return NextResponse.json({ success: true, user, message: "Utilisateur approuvé avec succès" })
    } else if (action === "reject") {
      const success = db.rejectRegistrationRequest(requestId, adminId)
      if (!success) {
        return NextResponse.json({ success: false, error: "Demande introuvable" }, { status: 404 })
      }
      return NextResponse.json({ success: true, message: "Demande rejetée" })
    } else {
      return NextResponse.json({ success: false, error: "Action invalide" }, { status: 400 })
    }
  } catch (error) {
    console.error("[v0] Error processing registration request:", error)
    return NextResponse.json({ success: false, error: "Erreur serveur" }, { status: 500 })
  }
}
