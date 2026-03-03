import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";

export async function GET() {
  const client = await clientPromise;
  await client.db().command({ ping: 1 });
  return NextResponse.json({ ok: true, message: "MongoDB connected" });
}