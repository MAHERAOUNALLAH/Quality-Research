import { NextResponse } from "next/server";
import { getPartnersCollection } from "@/lib/models/Partner";
import { requireAdmin } from "@/lib/requireAdmin";

export async function GET() {
  try {
    const col = await getPartnersCollection();
    const items = await col.find({}).sort({ order: 1 }).toArray();
    return NextResponse.json({ ok: true, items });
  } catch {
    return NextResponse.json({ ok: false, message: "Failed to fetch partners" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const admin = await requireAdmin();
    if (!admin) return NextResponse.json({ ok: false, message: "Forbidden" }, { status: 403 });

    const body = await req.json();
    if (!body.name?.trim()) {
      return NextResponse.json({ ok: false, message: "name is required" }, { status: 400 });
    }

    const col = await getPartnersCollection();
    const count = await col.countDocuments();
    const result = await col.insertOne({
      name: body.name.trim(),
      type: body.type || "",
      country: body.country || "",
      logo: body.logo || "",
      website: body.website || "",
      order: body.order ?? count + 1,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    return NextResponse.json({ ok: true, insertedId: result.insertedId });
  } catch {
    return NextResponse.json({ ok: false, message: "Failed to create partner" }, { status: 500 });
  }
}
