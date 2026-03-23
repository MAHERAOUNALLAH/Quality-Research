import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";
import bcrypt from "bcryptjs";
import { z } from "zod";

const RegisterSchema = z
  .object({
    firstName: z.string().min(1),
    lastName: z.string().min(1),
    email: z.string().email().transform((v) => v.toLowerCase().trim()),
    profession: z.string().min(1),
    password: z.string().min(8),
    confirmPassword: z.string().min(8),
    agreeTerms: z.boolean().refine((v) => v === true, "Terms required"),
  })
  .refine((d) => d.password === d.confirmPassword, {
    path: ["confirmPassword"],
    message: "Passwords do not match",
  });

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const data = RegisterSchema.parse(body);

    const client = await clientPromise;
    const db = client.db();
    const users = db.collection("users");

    // index unique sur email (idempotent)
    await users.createIndex({ email: 1 }, { unique: true });

    const exists = await users.findOne({ email: data.email });
    if (exists) {
      return NextResponse.json(
        { ok: false, error: "Cet email est déjà utilisé." },
        { status: 409 }
      );
    }

    const passwordHash = await bcrypt.hash(data.password, 10);

    await users.insertOne({
      firstName: data.firstName,
      lastName: data.lastName,
      email: data.email,
      profession: data.profession,
      passwordHash,
      role: "USER",
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    return NextResponse.json({ ok: true });
  } catch (err: any) {
    const msg =
      err?.issues?.[0]?.message ||
      err?.message ||
      "Erreur lors de l'inscription.";
    return NextResponse.json({ ok: false, error: msg }, { status: 400 });
  }
}