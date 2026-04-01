import { NextResponse } from "next/server";
import { ObjectId } from "mongodb";
import { getPartnersCollection } from "@/lib/models/Partner";
import { requireAdmin } from "@/lib/requireAdmin";

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const admin = await requireAdmin();
    if (!admin) return NextResponse.json({ ok: false, message: "Forbidden" }, { status: 403 });

    const { id } = await params;
    const body = await req.json();
    const col = await getPartnersCollection();

    await col.updateOne(
      { _id: new ObjectId(id) },
      { $set: { name: body.name, type: body.type || "", country: body.country || "", logo: body.logo || "", website: body.website || "", order: body.order ?? 0, updatedAt: new Date() } }
    );

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ ok: false, message: "Failed to update" }, { status: 500 });
  }
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const admin = await requireAdmin();
    if (!admin) return NextResponse.json({ ok: false, message: "Forbidden" }, { status: 403 });

    const { id } = await params;
    const col = await getPartnersCollection();
    await col.deleteOne({ _id: new ObjectId(id) });

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ ok: false, message: "Failed to delete" }, { status: 500 });
  }
}
