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
    return Array.isArray(data) ? data : data.items || [];
  } catch {
    return [];
  }
}

const levelColors: Record<string, string> = {
  "Débutant":     "bg-green-50 text-green-700",
  "Intermédiaire":"bg-amber-50 text-amber-700",
  "Avancé":       "bg-red-50 text-red-700",
};

const formatIcons: Record<string, string> = {
  "Présentiel":         "🏫",
  "En ligne":           "💻",
  "Hybride":            "🔄",
  "Présentiel / En ligne": "🔄",
};

export default async function FormationPage() {
  const formations = await getFormations();

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b border-gray-100">
        <div className="mx-auto max-w-7xl px-6 py-16">
          <p className="text-sm font-semibold uppercase tracking-wider text-primary">Nouveautés</p>
          <h1 className="mt-2 text-4xl font-bold text-gray-900 md:text-5xl">Formation</h1>
          <p className="mt-4 max-w-2xl text-gray-600">
            Développez vos compétences grâce à nos programmes de formation en qualité et recherche en santé.
          </p>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-6 py-12">
        {formations.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-lightgreen text-3xl">🎓</div>
            <h3 className="text-lg font-semibold text-gray-900">Aucune formation disponible</h3>
            <p className="mt-1 text-sm text-gray-500">Les formations publiées apparaîtront ici.</p>
          </div>
        ) : (
          <div className="grid gap-8 md:grid-cols-2">
            {formations.map((f) => (
              <article key={f._id}
                className="group rounded-2xl border border-gray-100 bg-white shadow-sm transition hover:shadow-lg">
                {f.image ? (
                  <div className="h-44 w-full overflow-hidden rounded-t-2xl">
                    <img src={f.image} alt={f.title} className="h-full w-full object-cover transition group-hover:scale-105" />
                  </div>
                ) : (
                  <div className="h-1.5 w-full rounded-t-2xl bg-gradient-to-r from-primary to-green-400" />
                )}
                <div className="p-6">
                  <div className="mb-3 flex flex-wrap gap-2">
                    {f.level && (
                      <span className={`rounded-full px-3 py-1 text-xs font-semibold ${levelColors[f.level] || "bg-gray-100 text-gray-600"}`}>
                        {f.level}
                      </span>
                    )}
                    {f.duration && (
                      <span className="rounded-full bg-gray-100 px-3 py-1 text-xs text-gray-600">⏱ {f.duration}</span>
                    )}
                    {f.format && (
                      <span className="rounded-full bg-gray-100 px-3 py-1 text-xs text-gray-600">
                        {formatIcons[f.format] || "📍"} {f.format}
                      </span>
                    )}
                  </div>
                  <h2 className="mb-3 text-xl font-bold text-gray-900 group-hover:text-primary transition-colors">
                    {f.title}
                  </h2>
                  <p className="text-sm leading-relaxed text-gray-600">{f.description}</p>
                  <div className="mt-5 pt-4 border-t border-gray-50">
                    <a href="/contact"
                      className="inline-block rounded-lg bg-lightgreen px-4 py-2 text-sm font-semibold text-primary transition hover:bg-primary hover:text-white">
                      S'inscrire / En savoir plus →
                    </a>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}

        <div className="mt-16 rounded-2xl bg-primary p-10 text-white text-center shadow-lg">
          <h2 className="text-2xl font-bold mb-3">Formation sur mesure ?</h2>
          <p className="text-green-100 mb-6 max-w-xl mx-auto">
            Notre équipe peut concevoir un programme adapté aux besoins spécifiques de votre établissement.
          </p>
          <a href="/contact"
            className="inline-block rounded-xl bg-white px-6 py-3 font-semibold text-primary transition hover:bg-green-50">
            Contactez-nous
          </a>
        </div>
      </div>
    </div>
  );
}
