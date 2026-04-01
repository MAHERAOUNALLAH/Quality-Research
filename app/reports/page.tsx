type Report = {
  _id: string;
  title: string;
  content?: string;
  excerpt?: string;
  type?: string;
  year?: number;
  fileUrl?: string;
  publishedAt?: string;
  createdAt: string;
};

async function getReports(): Promise<Report[]> {
  try {
    const baseUrl =
      process.env.NEXT_PUBLIC_BASE_URL ||
      (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "http://localhost:3000");
    const res = await fetch(`${baseUrl}/api/reports`, { cache: "no-store" });
    const data = await res.json();
    return Array.isArray(data) ? data : data.items || [];
  } catch {
    return [];
  }
}

const typeLabels: Record<string, string> = {
  activite: "Rapport d'activité",
  financier: "Rapport financier",
  autre: "Autre",
};

export default async function ReportsPage() {
  const reports = await getReports();

  // Group by year or type
  const byYear = reports.reduce<Record<string, Report[]>>((acc, r) => {
    const key = String(r.year || new Date(r.createdAt).getFullYear());
    acc[key] = acc[key] || [];
    acc[key].push(r);
    return acc;
  }, {});

  const years = Object.keys(byYear).sort((a, b) => Number(b) - Number(a));

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b border-gray-100">
        <div className="mx-auto max-w-7xl px-6 py-16">
          <p className="text-sm font-semibold uppercase tracking-wider text-primary">Transparence</p>
          <h1 className="mt-2 text-4xl font-bold text-gray-900 md:text-5xl">Rapports &amp; Publications</h1>
          <p className="mt-4 max-w-2xl text-gray-600">
            Accédez aux rapports d'activité, rapports financiers et autres publications officielles de l'association.
          </p>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-6 py-12 space-y-12">
        {reports.length === 0 && (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-lightgreen">
              <svg className="h-8 w-8 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                  d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-900">Aucun rapport disponible</h3>
            <p className="mt-1 text-sm text-gray-500">Les rapports publiés apparaîtront ici.</p>
          </div>
        )}

        {years.map((year) => (
          <section key={year}>
            <h2 className="mb-6 text-2xl font-bold text-gray-900 border-b border-gray-200 pb-3">
              {year}
            </h2>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {byYear[year].map((report) => (
                <article key={report._id}
                  className="group flex flex-col rounded-2xl border border-gray-100 bg-white shadow-sm transition hover:shadow-md p-6">
                  <div className="mb-3 flex gap-2">
                    {report.type && (
                      <span className="rounded-full bg-lightgreen px-3 py-1 text-xs font-semibold text-primary">
                        {typeLabels[report.type] || report.type}
                      </span>
                    )}
                  </div>
                  <h3 className="mb-2 text-lg font-bold text-gray-900 group-hover:text-primary transition-colors">
                    {report.title}
                  </h3>
                  {(report.excerpt || report.content) && (
                    <p className="flex-1 text-sm leading-relaxed text-gray-600 mb-4">
                      {(report.excerpt || report.content || "").slice(0, 160)}
                      {((report.excerpt || report.content || "").length > 160) ? "…" : ""}
                    </p>
                  )}
                  <div className="mt-auto pt-4 border-t border-gray-50 flex items-center justify-between">
                    <span className="text-xs text-gray-400">
                      {new Date(report.publishedAt || report.createdAt).toLocaleDateString("fr-FR")}
                    </span>
                    {report.fileUrl ? (
                      <a href={report.fileUrl} target="_blank" rel="noopener noreferrer"
                        className="flex items-center gap-1.5 rounded-lg bg-primary px-4 py-2 text-xs font-semibold text-white transition hover:bg-primary-dark">
                        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                            d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                        </svg>
                        Télécharger
                      </a>
                    ) : (
                      <span className="text-xs text-gray-400 italic">Fichier non disponible</span>
                    )}
                  </div>
                </article>
              ))}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}
