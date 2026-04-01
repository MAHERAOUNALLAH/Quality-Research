import { NextResponse } from "next/server";
import { getResourcesCollection } from "@/lib/models/Resource";
import { requireAdmin } from "@/lib/requireAdmin";

export async function GET() {
  try {
    const col = await getResourcesCollection();
    const items = await col.find({ published: true }).sort({ createdAt: -1 }).toArray();
    return NextResponse.json({ ok: true, items });
  } catch {
    return NextResponse.json({ ok: false, message: "Failed to fetch resources" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const admin = await requireAdmin();
    if (!admin) return NextResponse.json({ ok: false, message: "Forbidden" }, { status: 403 });

    const body = await req.json();
    if (!body.title?.trim()) {
      return NextResponse.json({ ok: false, message: "title is required" }, { status: 400 });
    }

    const col = await getResourcesCollection();
    const result = await col.insertOne({
      title: body.title.trim(),
      category: body.category || "",
      type: body.type || "pdf",
      fileUrl: body.fileUrl || "",
      externalUrl: body.externalUrl || "",
      size: body.size || "",
      published: body.published !== false,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    return NextResponse.json({ ok: true, insertedId: result.insertedId });
  } catch {
    return NextResponse.json({ ok: false, message: "Failed to create resource" }, { status: 500 });
  }
}
