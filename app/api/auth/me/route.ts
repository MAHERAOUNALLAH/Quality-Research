import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { verifyToken } from "@/lib/auth";

export async function GET() {
  const token = (await cookies()).get("token")?.value;
  if (!token) return NextResponse.json({ ok: false }, { status: 401 });

  try {
    const payload = await verifyToken(token);
    return NextResponse.json({ ok: true, user: payload });
  } catch {
    return NextResponse.json({ ok: false }, { status: 401 });
  }
}