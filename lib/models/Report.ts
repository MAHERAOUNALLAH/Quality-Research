import { ObjectId } from "mongodb";
import { getDb } from "@/lib/mongodb";

export interface Report {
  _id?: ObjectId;
  title: string;
  content: string;
  type: "activite" | "financier" | "autre";
  year: number;
  fileUrl?: string;
  publishedAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

export async function getReportsCollection() {
  const db = await getDb();
  return db.collection<Report>("reports");
}