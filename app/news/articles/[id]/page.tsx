import Link from "next/link";
import { notFound } from "next/navigation";
import { ObjectId } from "mongodb";
import { getDb } from "@/lib/mongodb";

export const dynamic = "force-dynamic";
export const revalidate = 0;

type Article = {
  _id: string;
  titre: string;
  contenu: string;
  excerpt?: string;
  image?: string;
  categoryId?: string;
  categoryName?: string;
  authorId?: string;
  published?: boolean;
  publishedAt?: string;
  createdAt: string;
  updatedAt: string;
};

function normalizeArticle(doc: any): Article {
  return {
    _id: String(doc._id),
    titre: doc.titre || doc.title || "",
    contenu: doc.contenu || doc.content || "",
    excerpt: doc.excerpt || "",
    image: doc.image || "",
    categoryId: doc.categoryId ? String(doc.categoryId) : undefined,
    categoryName: doc.categoryName || "",
    authorId: doc.authorId ? String(doc.authorId) : undefined,
    published: doc.published,
    publishedAt:
      doc.publishedAt instanceof Date
        ? doc.publishedAt.toISOString()
        : String(doc.publishedAt || ""),
    createdAt:
      doc.createdAt instanceof Date
        ? doc.createdAt.toISOString()
        : String(doc.createdAt || ""),
    updatedAt:
      doc.updatedAt instanceof Date
        ? doc.updatedAt.toISOString()
        : String(doc.updatedAt || ""),
  };
}

async function getArticle(id: string): Promise<Article | null> {
  try {
    const db = await getDb();

    const query = ObjectId.isValid(id)
      ? {
          _id: new ObjectId(id),
          $or: [{ published: true }, { published: { $exists: false } }],
        }
      : {
          slug: id,
          $or: [{ published: true }, { published: { $exists: false } }],
        };

    const doc = await db.collection("articles").findOne(query as any);

    if (!doc) return null;

    return normalizeArticle(doc);
  } catch (error) {
    console.error("Failed to load article detail from MongoDB:", error);
    return null;
  }
}

async function getRelated(currentId: string): Promise<Article[]> {
  try {
    const db = await getDb();

    const excludeQuery = ObjectId.isValid(currentId)
      ? { _id: { $ne: new ObjectId(currentId) } }
      : { slug: { $ne: currentId } };

    const docs = await db
      .collection("articles")
      .find({
        ...excludeQuery,
        $or: [{ published: true }, { published: { $exists: false } }],
      } as any)
      .sort({ publishedAt: -1, createdAt: -1 })
      .limit(3)
      .toArray();

    return docs.map(normalizeArticle);
  } catch (error) {
    console.error("Failed to load related articles from MongoDB:", error);
    return [];
  }
}

function safeDate(dateStr?: string) {
  if (!dateStr) return null;

  const date = new Date(dateStr);

  return Number.isNaN(date.getTime()) ? null : date;
}

function formatDate(dateStr?: string) {
  const date = safeDate(dateStr);

  if (!date) return "";

  return date.toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

function getSiteUrl() {
  if (process.env.NEXT_PUBLIC_SITE_URL) {
    return process.env.NEXT_PUBLIC_SITE_URL.replace(/\/$/, "");
  }

  if (process.env.NEXT_PUBLIC_BASE_URL) {
    return process.env.NEXT_PUBLIC_BASE_URL.replace(/\/$/, "");
  }

  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`;
  }

  return "http://localhost:3000";
}

export default async function ArticleDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const article = await getArticle(id);

  if (!article) notFound();

  const related = await getRelated(id);

  const displayDate = article.publishedAt || article.createdAt;
  const displayDateLabel = formatDate(displayDate);
  const paragraphs = article.contenu.split(/\n+/).filter(Boolean);

  const articleUrl = `${getSiteUrl()}/news/articles/${article._id}`;
  const linkedInShareUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(
    articleUrl
  )}`;
  const twitterShareUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(
    article.titre
  )}&url=${encodeURIComponent(articleUrl)}`;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero */}
      <div className="bg-white border-b border-gray-100">
        {article.image && (
          <div className="h-72 w-full overflow-hidden md:h-96">
            <img
              src={article.image}
              alt={article.titre}
              className="h-full w-full object-cover"
            />
          </div>
        )}

        <div className="mx-auto max-w-4xl px-6 py-10">
          {/* Breadcrumb */}
          <nav className="mb-5 flex items-center gap-2 text-sm text-gray-500">
            <Link href="/" className="hover:text-primary transition-colors">
              Accueil
            </Link>
            <span>/</span>
            <Link
              href="/news/articles"
              className="hover:text-primary transition-colors"
            >
              Articles
            </Link>
            <span>/</span>
            <span className="text-gray-700 truncate max-w-xs">
              {article.titre}
            </span>
          </nav>

          {/* Meta badges */}
          <div className="mb-4 flex flex-wrap gap-2">
            {article.categoryName && (
              <span className="rounded-full bg-lightgreen px-3 py-1 text-xs font-semibold text-primary">
                {article.categoryName}
              </span>
            )}

            {displayDateLabel && (
              <span className="rounded-full bg-gray-100 px-3 py-1 text-xs text-gray-500">
                {displayDateLabel}
              </span>
            )}
          </div>

          <h1 className="text-3xl font-bold text-gray-900 leading-snug md:text-4xl">
            {article.titre}
          </h1>

          {article.excerpt && (
            <p className="mt-4 text-lg text-gray-600 leading-relaxed border-l-4 border-primary pl-4">
              {article.excerpt}
            </p>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="mx-auto max-w-4xl px-6 py-10">
        {/* Back button */}
        <div className="mb-6">
          <Link
            href="/news/articles"
            className="inline-flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 hover:text-primary transition-all"
          >
            <svg
              className="h-4 w-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M10 19l-7-7m0 0l7-7m-7 7h18"
              />
            </svg>
            Retour aux articles
          </Link>
        </div>

        <div className="grid gap-10 lg:grid-cols-[1fr_280px]">
          {/* Main content */}
          <article className="rounded-2xl bg-white border border-gray-100 p-8 shadow-sm">
            <div className="prose prose-gray max-w-none">
              {paragraphs.length > 0 ? (
                paragraphs.map((p, i) => (
                  <p
                    key={i}
                    className="mb-6 text-gray-700 text-base"
                    style={{ lineHeight: "1.9" }}
                  >
                    {p}
                  </p>
                ))
              ) : (
                <p className="text-gray-500">
                  Aucun contenu disponible pour cet article.
                </p>
              )}
            </div>

            {/* Footer */}
            <div className="mt-10 border-t border-gray-100 pt-6 flex items-center justify-between flex-wrap gap-4">
              {displayDateLabel && (
                <div className="text-sm text-gray-500">
                  Publié le{" "}
                  <span className="font-medium text-gray-700">
                    {displayDateLabel}
                  </span>
                </div>
              )}

              <Link
                href="/news/articles"
                className="inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-white hover:bg-primary/90 transition-all shadow-sm"
              >
                <svg
                  className="h-4 w-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M10 19l-7-7m0 0l7-7m-7 7h18"
                  />
                </svg>
                Retour aux articles
              </Link>
            </div>
          </article>

          {/* Sidebar */}
          <aside className="space-y-6">
            {/* Share */}
            <div className="rounded-2xl bg-white border border-gray-100 p-5 shadow-sm">
              <h3 className="font-semibold text-gray-900 mb-3">Partager</h3>

              <div className="flex gap-2">
                <a
                  href={linkedInShareUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 rounded-xl bg-[#0077b5] px-3 py-2 text-center text-xs font-semibold text-white hover:opacity-90 transition"
                >
                  LinkedIn
                </a>

                <a
                  href={twitterShareUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 rounded-xl bg-black px-3 py-2 text-center text-xs font-semibold text-white hover:opacity-90 transition"
                >
                  X / Twitter
                </a>
              </div>
            </div>

            {/* Related articles */}
            {related.length > 0 && (
              <div className="rounded-2xl bg-white border border-gray-100 p-5 shadow-sm">
                <h3 className="font-semibold text-gray-900 mb-4">
                  Articles récents
                </h3>

                <div className="space-y-4">
                  {related.map((r) => {
                    const relatedDateLabel = formatDate(r.createdAt);

                    return (
                      <Link
                        key={r._id}
                        href={`/news/articles/${r._id}`}
                        className="group block rounded-xl border border-gray-50 p-3 hover:border-primary/20 hover:bg-lightgreen/30 transition"
                      >
                        <p className="text-sm font-medium text-gray-800 group-hover:text-primary transition-colors leading-snug line-clamp-2">
                          {r.titre}
                        </p>

                        {relatedDateLabel && (
                          <p className="mt-1 text-xs text-gray-400">
                            {relatedDateLabel}
                          </p>
                        )}
                      </Link>
                    );
                  })}
                </div>
              </div>
            )}

            {/* CTA */}
            <div className="rounded-2xl bg-primary p-5 text-white">
              <h3 className="font-bold mb-2">Rejoignez l&apos;association</h3>

              <p className="text-green-100 text-xs leading-relaxed mb-3">
                Participez à nos activités et contribuez à la promotion de la
                qualité en santé.
              </p>

              <Link
                href="/contact"
                className="inline-block rounded-xl bg-white px-4 py-2 text-xs font-semibold text-primary hover:bg-green-50 transition"
              >
                Nous contacter
              </Link>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}