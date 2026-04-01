import { NextResponse } from "next/server";
import { ObjectId } from "mongodb";
import { getDb } from "@/lib/mongodb";

export async function DELETE(_: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const db = await getDb();

    const result = await db.collection("messages").deleteOne({ _id: new ObjectId(id) });

    if (!result.deletedCount) {
      return NextResponse.json({ ok: false, message: "Message not found" }, { status: 404 });
    }

    return NextResponse.json({ ok: true, message: "Message deleted" });
  } catch (error) {
    console.error("DELETE /api/messages/[id] error:", error);
    return NextResponse.json({ ok: false, message: "Failed to delete message" }, { status: 500 });
  }
}




export async function GET() {
  try {
    const db = await getDb();
    const items = await db
      .collection("messages")
      .find({})
      .sort({ createdAt: -1 })
      .toArray();

    return NextResponse.json({ ok: true, items });
  } catch (error) {
    console.error("GET /api/messages error:", error);
    return NextResponse.json(
      { ok: false, message: "Failed to fetch messages" },
      { status: 500 }
    );
  }
}
