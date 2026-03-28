import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";

export async function POST(request: Request) {
  try {
    const { email, password, name } = await request.json();

    const client = await clientPromise;
    const db = client.db("qualityandresearch");

    // 1. Check if user already exists
    const existingUser = await db.collection("users").findOne({ email });
    if (existingUser) {
      return NextResponse.json({ error: "Cet email est déjà utilisé." }, { status: 400 });
    }

    // 2. AUTOMATION: Force the role to "user"
    const newUser = {
      name,
      email,
      password, // Note: In a real project, use bcrypt to hash this!
      role: "user", // Every new signup starts here
      createdAt: new Date(),
    };

    await db.collection("users").insertOne(newUser);

    return NextResponse.json({ message: "Compte créé avec succès !" }, { status: 201 });

  } catch (error) {
    return NextResponse.json({ error: "Erreur lors de l'inscription." }, { status: 500 });
  }
}