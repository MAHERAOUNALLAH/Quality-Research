import Link from "next/link";

type Article = {
  _id: string;
  titre: string;
  contenu: string;
  excerpt?: string;
  categoryId?: string | { nom?: string } | null;
  authorId?: string;
  image?: string;
  createdAt: string;
};

async function getArticles(): Promise<Article[]> {
  try {
    const baseUrl =
      process.env.NEXT_PUBLIC_BASE_URL ||
      (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "http://localhost:3000");
    const res = await fetch(`${baseUrl}/api/articles`, { cache: "no-store" });
    const data = await res.json();
    return Array.isArray(data) ? data : data.items || [];
  } catch {
    return [];
  }
}

function excerpt(text: string, max = 160) {
  if (!text) return "";
  return text.length > max ? text.slice(0, max).trimEnd() + "…" : text;
}

function categoryLabel(cat: Article["categoryId"]) {
  if (!cat) return null;
  if (typeof cat === "object" && cat.nom) return cat.nom;
  return null;
}

export default async function ArticlesPage() {
  const articles = await getArticles();

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b border-gray-100">
        <div className="mx-auto max-w-7xl px-6 py-16">
          <p className="text-sm font-semibold uppercase tracking-wider text-primary">Nouveautés</p>
          <h1 className="mt-2 text-4xl font-bold text-gray-900 md:text-5xl">Articles</h1>
          <p className="mt-4 max-w-2xl text-gray-600">
            Découvrez nos derniers articles scientifiques, analyses et publications sur la qualité et la recherche en santé.
          </p>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-6 py-12">
        {articles.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-lightgreen">
              <svg className="h-8 w-8 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-900">Aucun article pour le moment</h3>
            <p className="mt-1 text-sm text-gray-500">Les articles publiés apparaîtront ici.</p>
          </div>
        ) : (
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {articles.map((article) => {
              const cat = categoryLabel(article.categoryId);
              return (
                <Link
                  key={article._id}
                  href={`/news/articles/${article._id}`}
                  className="group flex flex-col rounded-2xl border border-gray-100 bg-white shadow-sm transition hover:shadow-lg hover:-translate-y-0.5"
                >
                  {article.image && (
                    <div className="h-44 w-full overflow-hidden rounded-t-2xl">
                      <img src={article.image} alt={article.titre} className="h-full w-full object-cover transition group-hover:scale-105" />
                    </div>
                  )}
                  {!article.image && (
                    <div className="h-1.5 w-full rounded-t-2xl bg-gradient-to-r from-primary to-green-400" />
                  )}

                  <div className="flex flex-1 flex-col p-6">
                    <div className="mb-3 flex flex-wrap gap-2">
                      {cat && (
                        <span className="rounded-full bg-lightgreen px-3 py-1 text-xs font-semibold text-primary">{cat}</span>
                      )}
                      <span className="rounded-full bg-gray-100 px-3 py-1 text-xs text-gray-500">
                        {new Date(article.createdAt).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" })}
                      </span>
                    </div>

                    <h2 className="mb-3 text-xl font-bold text-gray-900 group-hover:text-primary transition-colors leading-snug">
                      {article.titre}
                    </h2>

                    <p className="flex-1 text-sm leading-relaxed text-gray-600">
                      {article.excerpt || excerpt(article.contenu)}
                    </p>

                    <div className="mt-5 flex items-center justify-end border-t border-gray-50 pt-4">
                      <span className="text-sm font-medium text-primary group-hover:underline">
                        Lire la suite →
                      </span>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
