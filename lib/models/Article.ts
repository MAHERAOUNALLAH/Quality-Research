import { ObjectId } from "mongodb";
import { getDb } from "@/lib/mongodb";

export interface Article {
  _id?: ObjectId;
  titre: string;
  contenu: string;
  categoryId?: ObjectId | string;
  authorId?: ObjectId | string;
  image?: string;
  createdAt: Date;
  updatedAt: Date;
}

export async function getArticlesCollection() {
  const db = await getDb();
  return db.collection<Article>("articles");
}