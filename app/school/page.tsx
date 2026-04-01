import Link from "next/link";

type Resource = {
  _id: string;
  title: string;
  category: string;
  type: string;
  fileUrl: string;
  externalUrl: string;
  size: string;
  published: boolean;
};

async function getResources(): Promise<Resource[]> {
  try {
    const baseUrl =
      process.env.NEXT_PUBLIC_BASE_URL ||
      (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "http://localhost:3000");
    const res = await fetch(`${baseUrl}/api/resources`, { cache: "no-store" });
    const data = await res.json();
    return Array.isArray(data) ? data : data.items || [];
  } catch {
    return [];
  }
}

const typeIcons: Record<string, { icon: string; color: string; label: string }> = {
  pdf:   { icon: "📄", color: "bg-red-50 text-red-700",    label: "PDF"   },
  docx:  { icon: "📝", color: "bg-blue-50 text-blue-700",  label: "Word"  },
  link:  { icon: "🔗", color: "bg-purple-50 text-purple-700", label: "Lien" },
  video: { icon: "🎬", color: "bg-amber-50 text-amber-700", label: "Vidéo" },
  autre: { icon: "📁", color: "bg-gray-100 text-gray-600",  label: "Fichier" },
};

export default async function ResourcesPage() {
  const resources = await getResources();

  const categories = Array.from(new Set(resources.map((r) => r.category).filter(Boolean)));

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b border-gray-100">
        <div className="mx-auto max-w-7xl px-6 py-16">
          <p className="text-sm font-semibold uppercase tracking-wider text-primary">Ressources</p>
          <h1 className="mt-2 text-4xl font-bold text-gray-900 md:text-5xl">Centre de ressources</h1>
          <p className="mt-4 max-w-2xl text-gray-600">
            Guides, outils, templates et liens utiles pour la recherche et la qualité en santé.
          </p>
        </div>
      </div>

      <div className="mx-auto max-w-6xl px-6 py-14">
        {resources.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-lightgreen text-3xl">📚</div>
            <h3 className="text-lg font-semibold text-gray-900">Aucune ressource disponible</h3>
            <p className="mt-1 text-sm text-gray-500">Les ressources publiées apparaîtront ici.</p>
          </div>
        ) : (
          <div className="space-y-12">
            {(categories.length > 0 ? categories : [""]).map((cat) => {
              const group = cat ? resources.filter((r) => r.category === cat) : resources;
              if (group.length === 0) return null;
              return (
                <section key={cat || "all"}>
                  {cat && (
                    <h2 className="mb-5 text-xl font-bold text-gray-900 flex items-center gap-3">
                      <span className="h-1 w-8 rounded-full bg-primary inline-block" />
                      {cat}
                    </h2>
                  )}
                  <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {group.map((r) => {
                      const meta = typeIcons[r.type] || typeIcons.autre;
                      const href = r.type === "link" ? r.externalUrl : r.fileUrl;
                      return (
                        <a
                          key={r._id}
                          href={href || "#"}
                          target={r.type === "link" ? "_blank" : undefined}
                          rel={r.type === "link" ? "noopener noreferrer" : undefined}
                          download={r.type !== "link" && r.fileUrl ? true : undefined}
                          className="group flex items-start gap-4 rounded-2xl border border-gray-100 bg-white p-5 shadow-sm transition hover:shadow-md hover:border-primary/30"
                        >
                          <div className={`flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl text-2xl ${meta.color}`}>
                            {meta.icon}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-semibold text-gray-900 group-hover:text-primary transition-colors leading-snug">
                              {r.title}
                            </p>
                            <div className="mt-1 flex items-center gap-2">
                              <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${meta.color}`}>
                                {meta.label}
                              </span>
                              {r.size && (
                                <span className="text-xs text-gray-400">{r.size}</span>
                              )}
                            </div>
                          </div>
                          <svg className="h-5 w-5 text-gray-300 group-hover:text-primary transition-colors flex-shrink-0 mt-1"
                            fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                              d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                          </svg>
                        </a>
                      );
                    })}
                  </div>
                </section>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
