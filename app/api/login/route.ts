import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";
import { cookies } from "next/headers";

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json();
    const client = await clientPromise;
    const db = client.db("qualityandresearch");

    const user = await db.collection("users").findOne({ email });

    if (!user || user.password !== password) {
      return NextResponse.json({ error: "Identifiants invalides" }, { status: 401 });
    }

    // AUTOMATION: Set the cookie based on the DB role
    const cookieStore = await cookies();
    cookieStore.set("user-role", user.role, {
      path: "/",
      httpOnly: false, // Accessible by your frontend logic
      maxAge: 60 * 60 * 24, // Valid for 24 hours
    });

    return NextResponse.json({ role: user.role });
  } catch (error) {
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}