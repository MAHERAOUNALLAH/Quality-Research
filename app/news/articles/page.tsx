import Link from "next/link";

type Article = {
  _id: string;
  titre: string;
  contenu: string;
  excerpt?: string;
  categoryId?: string | { nom?: string } | null;
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
  } catch { return []; }
}

function excerpt(text: string, max = 150) {
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
      {/* Hero */}
      <div className="relative overflow-hidden bg-white border-b border-gray-100">
        <div className="absolute inset-0 bg-gradient-to-br from-lightgreen via-white to-white pointer-events-none" />
        <div className="relative mx-auto max-w-7xl px-6 py-20">
          <div className="flex items-center gap-2 mb-4">
            <span className="h-1 w-8 rounded-full bg-primary" />
            <p className="text-sm font-semibold uppercase tracking-widest text-primary">Publications</p>
          </div>
          <h1 className="text-4xl font-bold text-gray-900 md:text-5xl lg:text-6xl leading-tight">
            Articles &amp; <br className="hidden sm:block" />
            <span className="text-primary">Recherches</span>
          </h1>
          <p className="mt-5 max-w-2xl text-lg text-gray-500 leading-relaxed">
            Découvrez nos dernières publications scientifiques, analyses et études sur la qualité et la recherche en santé.
          </p>
          <div className="mt-6 flex items-center gap-6 text-sm text-gray-400">
            <span className="flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-primary" />
              {articles.length} article{articles.length !== 1 ? "s" : ""} publié{articles.length !== 1 ? "s" : ""}
            </span>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-6 py-14">
        {articles.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-28 text-center">
            <div className="mb-5 flex h-20 w-20 items-center justify-center rounded-2xl bg-lightgreen shadow-sm">
              <svg className="h-10 w-10 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-gray-900">Aucun article pour le moment</h3>
            <p className="mt-2 text-gray-500">Les articles publiés apparaîtront ici.</p>
          </div>
        ) : (
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {articles.map((article) => {
              const cat = categoryLabel(article.categoryId);
              return (
                <Link
                  key={article._id}
                  href={`/news/articles/${article._id}`}
                  className="group flex flex-col rounded-2xl bg-white shadow-sm border border-gray-100 overflow-hidden transition-all duration-300 hover:shadow-xl hover:-translate-y-1"
                >
                  {article.image ? (
                    <div className="relative h-52 w-full overflow-hidden">
                      <img src={article.image} alt={article.titre} className="h-full w-full object-cover transition duration-500 group-hover:scale-105" />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    </div>
                  ) : (
                    <div className="h-2 w-full bg-gradient-to-r from-primary via-green-400 to-emerald-300" />
                  )}

                  <div className="flex flex-1 flex-col p-6">
                    <div className="mb-3 flex flex-wrap gap-2">
                      {cat && (
                        <span className="rounded-full bg-lightgreen px-3 py-1 text-xs font-semibold text-primary">
                          {cat}
                        </span>
                      )}
                      <span className="rounded-full bg-gray-100 px-3 py-1 text-xs text-gray-500">
                        {new Date(article.createdAt).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" })}
                      </span>
                    </div>

                    <h2 className="mb-3 text-xl font-bold text-gray-900 group-hover:text-primary transition-colors leading-snug line-clamp-2">
                      {article.titre}
                    </h2>

                    <p className="flex-1 text-sm leading-relaxed text-gray-500 line-clamp-3">
                      {article.excerpt || excerpt(article.contenu)}
                    </p>

                    <div className="mt-5 flex items-center justify-between border-t border-gray-50 pt-4">
                      <span className="text-xs text-gray-400">Quality &amp; Research</span>
                      <span className="inline-flex items-center gap-1 text-sm font-semibold text-primary group-hover:gap-2 transition-all">
                        Lire
                        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                        </svg>
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
