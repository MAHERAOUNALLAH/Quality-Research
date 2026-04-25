import { NextResponse } from "next/server";
import { ObjectId } from "mongodb";
import { getDb } from "@/lib/mongodb";

export async function DELETE(
  _: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    if (!ObjectId.isValid(id)) {
      return NextResponse.json(
        { ok: false, message: "Invalid message id" },
        { status: 400 }
      );
    }

    const db = await getDb();
    const result = await db
      .collection("messages")
      .deleteOne({ _id: new ObjectId(id) });

    if (!result.deletedCount) {
      return NextResponse.json(
        { ok: false, message: "Message not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ ok: true, message: "Message deleted" });
  } catch (error) {
    console.error("DELETE /api/messages/[id] error:", error);
    return NextResponse.json(
      { ok: false, message: "Failed to delete message" },
      { status: 500 }
    );
  }
}
