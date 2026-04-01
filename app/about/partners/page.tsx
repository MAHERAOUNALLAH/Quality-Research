type Partner = {
  _id: string;
  name: string;
  type: string;
  country: string;
  logo: string;
  website: string;
  order: number;
};

async function getPartners(): Promise<Partner[]> {
  try {
    const baseUrl =
      process.env.NEXT_PUBLIC_BASE_URL ||
      (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "http://localhost:3000");
    const res = await fetch(`${baseUrl}/api/partners`, { cache: "no-store" });
    const data = await res.json();
    return Array.isArray(data) ? data : data.items || [];
  } catch {
    return [];
  }
}

const typeColors: Record<string, string> = {
  Université: "bg-amber-50 text-amber-700",
  Institution: "bg-blue-50 text-blue-700",
  "Organisation internationale": "bg-purple-50 text-purple-700",
  Académique: "bg-amber-50 text-amber-700",
  Scientifique: "bg-pink-50 text-pink-700",
  Réseau: "bg-gray-100 text-gray-700",
  Technique: "bg-lightgreen text-primary",
};

export default async function PartnersPage() {
  const partners = await getPartners();

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b border-gray-100">
        <div className="mx-auto max-w-7xl px-6 py-16">
          <p className="text-sm font-semibold uppercase tracking-wider text-primary">À propos</p>
          <h1 className="mt-2 text-4xl font-bold text-gray-900 md:text-5xl">Partenaires</h1>
          <p className="mt-4 max-w-2xl text-gray-600">
            Quality &amp; Research s'appuie sur un réseau solide de partenaires institutionnels,
            académiques et internationaux.
          </p>
        </div>
      </div>

      <div className="mx-auto max-w-6xl px-6 py-14">
        {partners.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-lightgreen">
              <svg className="h-8 w-8 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                  d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-900">Aucun partenaire</h3>
            <p className="mt-1 text-sm text-gray-500">Les partenaires apparaîtront ici.</p>
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {partners.map((p) => (
              <div
                key={p._id}
                className="group rounded-2xl border border-gray-100 bg-white p-6 shadow-sm transition hover:shadow-md hover:border-primary/30"
              >
                {p.logo ? (
                  <img src={p.logo} alt={p.name} className="mb-4 h-14 w-auto object-contain" />
                ) : (
                  <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-xl bg-lightgreen">
                    <svg className="h-7 w-7 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                        d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                    </svg>
                  </div>
                )}
                <h3 className="font-bold text-gray-900 mb-2 group-hover:text-primary transition-colors">{p.name}</h3>
                <div className="flex flex-wrap gap-2">
                  {p.type && (
                    <span className={`rounded-full px-3 py-1 text-xs font-semibold ${typeColors[p.type] || "bg-gray-100 text-gray-600"}`}>
                      {p.type}
                    </span>
                  )}
                  {p.country && (
                    <span className="rounded-full bg-gray-50 px-3 py-1 text-xs text-gray-500">{p.country}</span>
                  )}
                </div>
                {p.website && (
                  <a href={p.website} target="_blank" rel="noopener noreferrer"
                    className="mt-3 inline-block text-xs text-primary hover:underline">
                    Visiter le site →
                  </a>
                )}
              </div>
            ))}
          </div>
        )}

        <div className="mt-14 rounded-2xl bg-primary p-10 text-center text-white shadow-lg">
          <h2 className="text-2xl font-bold mb-3">Devenir partenaire</h2>
          <p className="text-green-100 mb-6 max-w-xl mx-auto">
            Vous souhaitez rejoindre notre réseau et contribuer au développement de la qualité et de
            la recherche en santé ?
          </p>
          <a href="/contact"
            className="inline-block rounded-xl bg-white px-6 py-3 font-semibold text-primary transition hover:bg-green-50">
            Prendre contact
          </a>
        </div>
      </div>
    </div>
  );
}
