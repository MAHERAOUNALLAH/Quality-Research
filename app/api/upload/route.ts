export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/requireAdmin";
import path from "path";
import fs from "fs/promises";

const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif", "image/svg+xml"];
const MAX_SIZE_MB = 5;

export async function POST(req: Request) {
  try {
    const admin = await requireAdmin();
    if (!admin) return NextResponse.json({ ok: false, message: "Forbidden" }, { status: 403 });

    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    const folder = (formData.get("folder") as string) || "general";

    if (!file) return NextResponse.json({ ok: false, message: "Aucun fichier reçu." }, { status: 400 });

    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json(
        { ok: false, message: "Type de fichier non autorisé. Utilisez JPG, PNG, WebP ou GIF." },
        { status: 400 }
      );
    }

    if (file.size > MAX_SIZE_MB * 1024 * 1024) {
      return NextResponse.json(
        { ok: false, message: `La taille du fichier dépasse ${MAX_SIZE_MB} MB.` },
        { status: 400 }
      );
    }

    // Sanitize folder name (only allow alphanumeric + dashes)
    const safeFolder = folder.replace(/[^a-zA-Z0-9-_]/g, "");

    // Build a unique filename
    const ext = file.name.split(".").pop()?.toLowerCase() ?? "jpg";
    const timestamp = Date.now();
    const random = Math.random().toString(36).slice(2, 8);
    const filename = `${timestamp}-${random}.${ext}`;

    // Write to public/uploads/<folder>/
    const uploadDir = path.join(process.cwd(), "public", "uploads", safeFolder);
    await fs.mkdir(uploadDir, { recursive: true });

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    await fs.writeFile(path.join(uploadDir, filename), buffer);

    const url = `/uploads/${safeFolder}/${filename}`;
    return NextResponse.json({ ok: true, url });
  } catch (err) {
    console.error("Upload error:", err);
    return NextResponse.json({ ok: false, message: "Échec de l'upload." }, { status: 500 });
  }
}
