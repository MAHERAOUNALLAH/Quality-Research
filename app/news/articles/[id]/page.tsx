import Link from "next/link";
import { notFound } from "next/navigation";

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

async function getArticle(id: string): Promise<Article | null> {
  try {
    const baseUrl =
      process.env.NEXT_PUBLIC_BASE_URL ||
      (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "http://localhost:3000");
    const res = await fetch(`${baseUrl}/api/articles/${id}`, { cache: "no-store" });
    if (!res.ok) return null;
    const data = await res.json();
    return data.item || null;
  } catch {
    return null;
  }
}

async function getRelated(currentId: string): Promise<Article[]> {
  try {
    const baseUrl =
      process.env.NEXT_PUBLIC_BASE_URL ||
      (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "http://localhost:3000");
    const res = await fetch(`${baseUrl}/api/articles`, { cache: "no-store" });
    const data = await res.json();
    const all: Article[] = Array.isArray(data) ? data : data.items || [];
    return all.filter((a) => a._id !== currentId).slice(0, 3);
  } catch {
    return [];
  }
}

export default async function ArticleDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const article = await getArticle(id);
  if (!article) notFound();

  const related = await getRelated(id);

  const displayDate = article.publishedAt || article.createdAt;
  const paragraphs = article.contenu.split(/\n+/).filter(Boolean);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero */}
      <div className="bg-white border-b border-gray-100">
        {article.image && (
          <div className="h-72 w-full overflow-hidden md:h-96">
            <img src={article.image} alt={article.titre} className="h-full w-full object-cover" />
          </div>
        )}
        <div className="mx-auto max-w-4xl px-6 py-10">
          {/* Breadcrumb */}
          <nav className="mb-5 flex items-center gap-2 text-sm text-gray-500">
            <Link href="/" className="hover:text-primary transition-colors">Accueil</Link>
            <span>/</span>
            <Link href="/news/articles" className="hover:text-primary transition-colors">Articles</Link>
            <span>/</span>
            <span className="text-gray-700 truncate max-w-xs">{article.titre}</span>
          </nav>

          {/* Meta badges */}
          <div className="mb-4 flex flex-wrap gap-2">
            {article.categoryName && (
              <span className="rounded-full bg-lightgreen px-3 py-1 text-xs font-semibold text-primary">
                {article.categoryName}
              </span>
            )}
            <span className="rounded-full bg-gray-100 px-3 py-1 text-xs text-gray-500">
              {new Date(displayDate).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" })}
            </span>
          </div>

          <h1 className="text-3xl font-bold text-gray-900 leading-snug md:text-4xl">{article.titre}</h1>

          {article.excerpt && (
            <p className="mt-4 text-lg text-gray-600 leading-relaxed border-l-4 border-primary pl-4">
              {article.excerpt}
            </p>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="mx-auto max-w-4xl px-6 py-10">
        {/* Back button (top) */}
        <div className="mb-6">
          <Link
            href="/news/articles"
            className="inline-flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 hover:text-primary transition-all"
          >
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Retour aux articles
          </Link>
        </div>

        <div className="grid gap-10 lg:grid-cols-[1fr_280px]">
          {/* Main content */}
          <article className="rounded-2xl bg-white border border-gray-100 p-8 shadow-sm">
            <div className="prose prose-gray max-w-none">
              {paragraphs.map((p, i) => (
                <p key={i} className="mb-6 text-gray-700 text-base" style={{ lineHeight: "1.9" }}>{p}</p>
              ))}
            </div>

            {/* Footer */}
            <div className="mt-10 border-t border-gray-100 pt-6 flex items-center justify-between flex-wrap gap-4">
              <div className="text-sm text-gray-500">
                Publié le{" "}
                <span className="font-medium text-gray-700">
                  {new Date(displayDate).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" })}
                </span>
              </div>
              <Link
                href="/news/articles"
                className="inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-white hover:bg-primary/90 transition-all shadow-sm"
              >
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
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
                <a href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(typeof window !== "undefined" ? window.location.href : "")}`}
                  target="_blank" rel="noopener noreferrer"
                  className="flex-1 rounded-xl bg-[#0077b5] px-3 py-2 text-center text-xs font-semibold text-white hover:opacity-90 transition">
                  LinkedIn
                </a>
                <a href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(article.titre)}`}
                  target="_blank" rel="noopener noreferrer"
                  className="flex-1 rounded-xl bg-black px-3 py-2 text-center text-xs font-semibold text-white hover:opacity-90 transition">
                  X / Twitter
                </a>
              </div>
            </div>

            {/* Related articles */}
            {related.length > 0 && (
              <div className="rounded-2xl bg-white border border-gray-100 p-5 shadow-sm">
                <h3 className="font-semibold text-gray-900 mb-4">Articles récents</h3>
                <div className="space-y-4">
                  {related.map((r) => (
                    <Link key={r._id} href={`/news/articles/${r._id}`}
                      className="group block rounded-xl border border-gray-50 p-3 hover:border-primary/20 hover:bg-lightgreen/30 transition">
                      <p className="text-sm font-medium text-gray-800 group-hover:text-primary transition-colors leading-snug line-clamp-2">
                        {r.titre}
                      </p>
                      <p className="mt-1 text-xs text-gray-400">
                        {new Date(r.createdAt).toLocaleDateString("fr-FR", { day: "numeric", month: "short", year: "numeric" })}
                      </p>
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {/* CTA */}
            <div className="rounded-2xl bg-primary p-5 text-white">
              <h3 className="font-bold mb-2">Rejoignez l'association</h3>
              <p className="text-green-100 text-xs leading-relaxed mb-3">
                Participez à nos activités et contribuez à la promotion de la qualité en santé.
              </p>
              <Link href="/contact"
                className="inline-block rounded-xl bg-white px-4 py-2 text-xs font-semibold text-primary hover:bg-green-50 transition">
                Nous contacter
              </Link>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
