import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { ObjectId } from "mongodb";
import nodemailer from "nodemailer";

import { getDb } from "@/lib/mongodb";
import { verifyToken } from "@/lib/auth";

export async function GET() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value;

    if (!token) {
      return NextResponse.json(
        { ok: false, message: "Non authentifié" },
        { status: 401 }
      );
    }

    const payload = await verifyToken(token);
    const db = await getDb();

    const user = await db.collection("users").findOne({
      _id: new ObjectId(payload.sub),
    });

    if (!user || (user.role !== "admin" && user.role !== "superadmin")) {
      return NextResponse.json(
        { ok: false, message: "Accès refusé" },
        { status: 403 }
      );
    }

    const messages = await db
      .collection("messages")
      .find({})
      .sort({ createdAt: -1 })
      .toArray();

    return NextResponse.json({
      ok: true,
      messages,
    });
  } catch (error) {
    console.error("GET_CONTACT_ERROR:", error);
    return NextResponse.json(
      { ok: false, message: "Erreur lors du chargement des messages" },
      { status: 500 }
    );
  }
}


export async function POST(req: Request) {
  try {
    const { name, email, subject, message } = await req.json();

    if (!name || !email || !subject || !message) {
      return NextResponse.json(
        { ok: false, error: "Tous les champs sont requis" },
        { status: 400 }
      );
    }

    const db = await getDb();

    await db.collection("messages").insertOne({
      name,
      email,
      subject,
      message,
      status: "unread",
      createdAt: new Date(),
    });

    try {
      const transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASS,
        },
        tls: {
          rejectUnauthorized: false,
        },
      });

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
    } catch (mailError) {
      console.error("MAIL_ERROR:", mailError);
    }

    return NextResponse.json({
      ok: true,
      success: true,
      message: "Message enregistré avec succès",
    });
  } catch (error: any) {
    console.error("POST_CONTACT_ERROR:", error);
    return NextResponse.json(
      { ok: false, error: error.message || "Erreur lors de l'envoi" },
      { status: 500 }
    );
  }
}