import { ObjectId } from "mongodb";
import { getDb } from "@/lib/mongodb";

export interface Resource {
  _id?: ObjectId;
  title: string;
  category: string;
  type: "pdf" | "docx" | "link" | "video" | "autre";
  fileUrl: string;
  externalUrl: string;
  size: string;
  published: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export async function getResourcesCollection() {
  const db = await getDb();
  return db.collection<Resource>("resources");
}
