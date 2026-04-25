import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { ObjectId } from "mongodb";
import { getDb } from "@/lib/mongodb";
import { verifyToken } from "@/lib/auth";

async function getOptionalUserId() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value;
    if (!token) return null;

    const payload = await verifyToken(token);
    return new ObjectId(payload.sub);
  } catch {
    return null;
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const amount = Number(body.amount) || 0;

    if (amount <= 0) {
      return NextResponse.json(
        { ok: false, message: "Montant invalide" },
        { status: 400 }
      );
    }

    const db = await getDb();
    const now = new Date();
    const donation = {
      userId: await getOptionalUserId(),
      donorName: String(body.donorName || "").trim(),
      donorEmail: String(body.donorEmail || "").trim(),
      amount,
      currency: "TND",
      status: "paid",
      provider: "manual",
      createdAt: now,
      updatedAt: now,
    };

    const result = await db.collection("payments").insertOne({
      ...donation,
      type: "donation",
    });

    return NextResponse.json({
      ok: true,
      donation: { _id: result.insertedId, ...donation },
    });
  } catch (error) {
    console.error("POST /api/donations error:", error);
    return NextResponse.json(
      { ok: false, message: "Impossible d'enregistrer le don" },
      { status: 500 }
    );
  }
}
