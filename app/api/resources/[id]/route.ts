import { NextResponse } from "next/server";
import { ObjectId } from "mongodb";
import { getResourcesCollection } from "@/lib/models/Resource";
import { requireAdmin } from "@/lib/requireAdmin";

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const admin = await requireAdmin();
    if (!admin) return NextResponse.json({ ok: false, message: "Forbidden" }, { status: 403 });

    const { id } = await params;
    const body = await req.json();
    const col = await getResourcesCollection();

    await col.updateOne(
      { _id: new ObjectId(id) },
      { $set: { title: body.title, category: body.category || "", type: body.type || "pdf", fileUrl: body.fileUrl || "", externalUrl: body.externalUrl || "", size: body.size || "", published: body.published !== false, updatedAt: new Date() } }
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
    const col = await getResourcesCollection();
    await col.deleteOne({ _id: new ObjectId(id) });

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ ok: false, message: "Failed to delete" }, { status: 500 });
  }
}
