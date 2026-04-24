import { NextResponse } from "next/server";
import { ObjectId } from "mongodb";
import { getDb } from "@/lib/mongodb";
import { isSuperAdminRole } from "@/lib/auth";
import { requireAdmin } from "@/lib/requireAdmin";

const ALLOWED_ROLES = new Set(["USER", "ADMIN", "admin", "superadmin"]);

export async function PATCH(request: Request) {
  try {
    const admin = await requireAdmin();

    if (!admin || !isSuperAdminRole(admin.role)) {
      return NextResponse.json(
        { error: "Acces refuse. Autorisation Super Admin requise." },
        { status: 403 }
      );
    }

    const { userId, newRole } = await request.json();

    if (!userId || !newRole) {
      return NextResponse.json(
        { error: "Donnees manquantes (ID ou role)." },
        { status: 400 }
      );
    }

    if (!ObjectId.isValid(userId)) {
      return NextResponse.json(
        { error: "ID utilisateur invalide." },
        { status: 400 }
      );
    }

    if (!ALLOWED_ROLES.has(newRole)) {
      return NextResponse.json(
        { error: "Role invalide." },
        { status: 400 }
      );
    }

    const db = await getDb();
    const result = await db.collection("users").updateOne(
      { _id: new ObjectId(userId) },
      { $set: { role: newRole } }
    );

    if (result.matchedCount === 0) {
      return NextResponse.json(
        { error: "Utilisateur non trouve." },
        { status: 404 }
      );
    }

    return NextResponse.json({
      message: `Succes : nouveau role ${newRole}`,
    });
  } catch (error) {
    console.error("PATCH /api/admin/promote error:", error);
    return NextResponse.json(
      { error: "Erreur serveur lors de la mise a jour." },
      { status: 500 }
    );
  }
}
