import Link from "next/link";

type Formation = {
  _id: string;
  title: string;
  description: string;
  duration: string;
  level: string;
  format: string;
  image?: string;
  published: boolean;
};

async function getFormations(): Promise<Formation[]> {
  try {
    const baseUrl =
      process.env.NEXT_PUBLIC_BASE_URL ||
      (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "http://localhost:3000");
    const res = await fetch(`${baseUrl}/api/formations`, { cache: "no-store" });
    const data = await res.json();
    const all: Formation[] = Array.isArray(data) ? data : data.items || [];
    return all.filter((f) => f.published !== false);
  } catch { return []; }
}

const LEVEL_STYLE: Record<string, { bg: string; text: string; badge: string }> = {
  "Débutant":      { bg: "bg-emerald-50",  text: "text-emerald-700", badge: "🌱" },
  "Intermédiaire": { bg: "bg-amber-50",    text: "text-amber-700",   badge: "📈" },
  "Avancé":        { bg: "bg-red-50",      text: "text-red-700",     badge: "🎯" },
};
const FORMAT_ICON: Record<string, string> = {
  "Présentiel": "🏫", "En ligne": "💻", "Hybride": "🔄", "Présentiel / En ligne": "🔄",
};

export default async function FormationPage() {
  const formations = await getFormations();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero */}
      <div className="relative overflow-hidden bg-white border-b border-gray-100">
        <div className="absolute inset-0 bg-gradient-to-br from-lightgreen via-white to-white pointer-events-none" />
        <div className="relative mx-auto max-w-7xl px-6 py-20">
          <div className="flex items-center gap-2 mb-4">
            <span className="h-1 w-8 rounded-full bg-primary" />
            <p className="text-sm font-semibold uppercase tracking-widest text-primary">Apprentissage</p>
          </div>
          <h1 className="text-4xl font-bold text-gray-900 md:text-5xl lg:text-6xl leading-tight">
            Programmes de <br className="hidden sm:block" />
            <span className="text-primary">Formation</span>
          </h1>
          <p className="mt-5 max-w-2xl text-lg text-gray-500 leading-relaxed">
            Développez vos compétences grâce à nos programmes certifiants en qualité et recherche en santé.
          </p>
          {formations.length > 0 && (
            <div className="mt-6 flex items-center gap-1.5 text-sm text-gray-400">
              <span className="h-2 w-2 rounded-full bg-primary" />
              {formations.length} formation{formations.length !== 1 ? "s" : ""} disponible{formations.length !== 1 ? "s" : ""}
            </div>
          )}
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-6 py-14">
        {formations.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-28 text-center">
            <div className="mb-5 flex h-20 w-20 items-center justify-center rounded-2xl bg-lightgreen shadow-sm text-4xl">🎓</div>
            <h3 className="text-xl font-semibold text-gray-900">Aucune formation disponible</h3>
            <p className="mt-2 text-gray-500">Les formations publiées apparaîtront ici.</p>
          </div>
        ) : (
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {formations.map((f) => {
              const lvl = LEVEL_STYLE[f.level] ?? { bg: "bg-gray-100", text: "text-gray-600", badge: "📘" };
              return (
                <article key={f._id}
                  className="group flex flex-col rounded-2xl bg-white border border-gray-100 shadow-sm overflow-hidden transition-all duration-300 hover:shadow-xl hover:-translate-y-1">
                  {f.image ? (
                    <div className="relative h-48 w-full overflow-hidden">
                      <img src={f.image} alt={f.title} className="h-full w-full object-cover transition duration-500 group-hover:scale-105" />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                  ) : (
                    <div className="h-2 w-full bg-gradient-to-r from-primary to-green-400" />
                  )}

                  <div className="flex flex-1 flex-col p-6">
                    <div className="mb-4 flex flex-wrap gap-2">
                      {f.level && (
                        <span className={`flex items-center gap-1 rounded-full px-3 py-1 text-xs font-semibold ${lvl.bg} ${lvl.text}`}>
                          <span>{lvl.badge}</span> {f.level}
                        </span>
                      )}
                      {f.duration && (
                        <span className="rounded-full bg-gray-100 px-3 py-1 text-xs text-gray-600">
                          ⏱ {f.duration}
                        </span>
                      )}
                      {f.format && (
                        <span className="rounded-full bg-gray-100 px-3 py-1 text-xs text-gray-600">
                          {FORMAT_ICON[f.format] || "📍"} {f.format}
                        </span>
                      )}
                    </div>

                    <h2 className="mb-3 text-xl font-bold text-gray-900 group-hover:text-primary transition-colors leading-snug line-clamp-2">
                      {f.title}
                    </h2>

                    <p className="flex-1 text-sm leading-relaxed text-gray-500 line-clamp-4">{f.description}</p>

                    <div className="mt-6 flex items-center justify-between border-t border-gray-50 pt-4">
                      <Link
                        href="/contact"
                        className="inline-flex items-center gap-1.5 rounded-xl bg-lightgreen px-4 py-2 text-sm font-semibold text-primary transition-all hover:bg-primary hover:text-white"
                      >
                        S'inscrire
                        <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                        </svg>
                      </Link>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}

        {/* CTA banner */}
        <div className="mt-20 relative overflow-hidden rounded-3xl bg-primary p-12 text-white shadow-2xl">
          <div className="absolute inset-0 opacity-10">
            <div className="absolute -right-12 -top-12 h-64 w-64 rounded-full bg-white" />
            <div className="absolute -left-8 -bottom-8 h-48 w-48 rounded-full bg-white" />
          </div>
          <div className="relative text-center max-w-xl mx-auto">
            <div className="mb-4 inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-white/20 text-3xl">🎓</div>
            <h2 className="text-2xl font-bold mb-3">Formation sur mesure ?</h2>
            <p className="text-green-100 mb-7 text-lg leading-relaxed">
              Notre équipe conçoit des programmes adaptés aux besoins spécifiques de votre établissement de santé.
            </p>
            <Link
              href="/contact"
              className="inline-flex items-center gap-2 rounded-2xl bg-white px-7 py-3.5 font-semibold text-primary transition hover:bg-green-50 shadow-lg hover:shadow-xl"
            >
              Contactez-nous
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
