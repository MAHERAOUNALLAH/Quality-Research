// app/api/admin/users/route.ts
import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb"; // Assure-toi que le chemin est correct

export async function GET() {
  try {
    const client = await clientPromise;
    const db = client.db("qualityandresearch");

    // On récupère tous les utilisateurs de la collection "user"
    // On exclut les mots de passe par sécurité ({ password: 0 })
    const users = await db
      .collection("users")
      .find({}, { projection: { password: 0 } }) 
      .toArray();

    return NextResponse.json(users);
  } catch (error) {
    console.error("Erreur API Users:", error);
    return NextResponse.json(
      { error: "Impossible de récupérer les utilisateurs" },
      { status: 500 }
    );
  }
}