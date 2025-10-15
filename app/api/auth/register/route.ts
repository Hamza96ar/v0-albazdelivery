import { NextResponse } from "next/server"
import { db } from "@/lib/db"
import type { RegistrationRequest } from "@/lib/types"

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { role, name, phone, email, password, licenseNumber, shopType } = body

    // Validation
    if (!role || !name || !phone || !email || !password) {
      return NextResponse.json({ success: false, error: "Tous les champs sont requis" }, { status: 400 })
    }

    if (role === "driver" && !licenseNumber) {
      return NextResponse.json(
        { success: false, error: "Le numéro de permis est requis pour les livreurs" },
        { status: 400 },
      )
    }

    if (role === "vendor" && !shopType) {
      return NextResponse.json(
        { success: false, error: "Le type de magasin est requis pour les vendeurs" },
        { status: 400 },
      )
    }

    // Create registration request
    const registrationRequest: RegistrationRequest = {
      id: `req-${Date.now()}`,
      role,
      name,
      email,
      phone,
      password, // In production, hash this password
      licenseNumber,
      shopType,
      status: "pending",
      createdAt: new Date(),
    }

    // For customers, auto-approve
    if (role === "customer") {
      const user = db.approveRegistrationRequest(registrationRequest.id, "system")
      return NextResponse.json({ success: true, user, autoApproved: true })
    }

    // For drivers and vendors, require admin approval
    db.createRegistrationRequest(registrationRequest)

    return NextResponse.json({
      success: true,
      message: "Votre demande a été soumise et est en attente d'approbation",
      requestId: registrationRequest.id,
    })
  } catch (error) {
    console.error("[v0] Registration error:", error)
    return NextResponse.json({ success: false, error: "Erreur lors de l'inscription" }, { status: 500 })
  }
}
