import { NextResponse } from "next/server";
// Fix 1: Use relative path if @ alias fails
import { getDb } from "@/lib/mongodb"; 
// Fix 2: Standard import (ensure @types/nodemailer is installed)
import nodemailer from "nodemailer";

export async function POST(req: Request) {
  try {
    const { name, email, subject, message } = await req.json();

    if (!name || !email || !subject || !message) {
      return NextResponse.json({ error: "Tous les champs sont requis" }, { status: 400 });
    }

    const db = await getDb();

    // 1. Save to MongoDB
    await db.collection("messages").insertOne({
      name,
      email,
      subject,
      message,
      status: "unread",
      createdAt: new Date(),
    });

    // 2. Email Transporter
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    // 3. Send Email
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: process.env.EMAIL_USER, 
      subject: `[Contact] ${subject} - de ${name}`,
      html: `
        <div style="font-family: sans-serif; padding: 20px; border: 1px solid #1a9e5c;">
          <h2 style="color: #1a9e5c;">Nouveau Message Reçu</h2>
          <p><strong>De:</strong> ${name} (${email})</p>
          <p><strong>Sujet:</strong> ${subject}</p>
          <hr />
          <p><strong>Message:</strong></p>
          <p style="white-space: pre-wrap;">${message}</p>
        </div>
      `,
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("API_ERROR:", error);
    // Log more specific error for debugging
    return NextResponse.json({ error: error.message || "Erreur lors de l'envoi" }, { status: 500 });
  }
}