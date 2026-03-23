import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { signToken } from "@/lib/auth";

const LoginSchema = z.object({
  email: z.string().email().transform((v) => v.toLowerCase().trim()),
  password: z.string().min(1),
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const data = LoginSchema.parse(body);

    const client = await clientPromise;
    const db = client.db();
    const users = db.collection("users");

    const user = await users.findOne({ email: data.email });
    if (!user) {
      return NextResponse.json(
        { ok: false, error: "Email ou mot de passe incorrect." },
        { status: 401 }
      );
    }

    const ok = await bcrypt.compare(data.password, user.passwordHash);
    if (!ok) {
      return NextResponse.json(
        { ok: false, error: "Email ou mot de passe incorrect." },
        { status: 401 }
      );
    }

    const token = await signToken({
      sub: user._id.toString(),
      email: user.email,
      role: user.role ?? "USER",
    });

    const res = NextResponse.json({ ok: true });
    res.cookies.set("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 7, // 7 jours
    });
    return res;
  } catch (err: any) {
    const msg =
      err?.issues?.[0]?.message || err?.message || "Erreur lors du login.";
    return NextResponse.json({ ok: false, error: msg }, { status: 400 });
  }
}