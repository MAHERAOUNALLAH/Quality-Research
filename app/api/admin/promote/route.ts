import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";
import { ObjectId } from "mongodb";
import { cookies } from "next/headers";

export async function PATCH(request: Request) {
  try {
    // FIX: Added 'await' before cookies() for Next.js 15+ compatibility
    const cookieStore = await cookies();
    const userRole = cookieStore.get("user-role")?.value;

    // Security check: Only superadmin can promote others
    if (userRole !== "superadmin") {
      return NextResponse.json(
        { error: "Accès refusé. Autorisation Super Admin requise." },
        { status: 403 }
      );
    }

    const { userId, newRole } = await request.json();

    if (!userId || !newRole) {
      return NextResponse.json(
        { error: "Données manquantes (ID ou Rôle)." },
        { status: 400 }
      );
    }

    const client = await clientPromise;
    const db = client.db("qualityandresearch");

    // Update the 'users' collection with the new role
    const result = await db.collection("users").updateOne(
      { _id: new ObjectId(userId) },
      { $set: { role: newRole } }
    );

    if (result.matchedCount === 0) {
      return NextResponse.json(
        { error: "Utilisateur non trouvé." },
        { status: 404 }
      );
    }

    return NextResponse.json({ 
      message: `Succès : Nouveau rôle est ${newRole}` 
    });

  } catch (error) {
    console.error("Erreur de promotion:", error);
    return NextResponse.json(
      { error: "Erreur serveur lors de la mise à jour." },
      { status: 500 }
    );
  }
}