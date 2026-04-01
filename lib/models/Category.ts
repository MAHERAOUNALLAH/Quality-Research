import { ObjectId } from "mongodb";
import { getDb } from "@/lib/mongodb";

export interface Category {
  _id?: ObjectId;
  nom: string;
  description?: string;
  createdAt: Date;
  updatedAt: Date;
}

export async function getCategoriesCollection() {
  const db = await getDb();
  return db.collection<Category>("categories");
}