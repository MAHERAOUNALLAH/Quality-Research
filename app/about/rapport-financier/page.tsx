import Link from "next/link";

type Report = {
  _id: string;
  title: string;
  type?: string;
  year?: number;
  fileUrl?: string;
  publishedAt?: string;
  createdAt: string;
};

async function getFinancialReports(): Promise<Report[]> {
  try {
    const baseUrl =
      process.env.NEXT_PUBLIC_BASE_URL ||
      (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "http://localhost:3000");
    const res = await fetch(`${baseUrl}/api/reports`, { cache: "no-store" });
    const data = await res.json();
    const all: Report[] = Array.isArray(data) ? data : data.items || [];
    return all.filter((r) => r.type === "financier");
  } catch {
    return [];
  }
}

export default async function RapportFinancierPage() {
  const reports = await getFinancialReports();

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b border-gray-100">
        <div className="mx-auto max-w-7xl px-6 py-16">
          <p className="text-sm font-semibold uppercase tracking-wider text-primary">À propos</p>
          <h1 className="mt-2 text-4xl font-bold text-gray-900 md:text-5xl">Rapport financier</h1>
          <p className="mt-4 max-w-2xl text-gray-600">Consultez nos rapports financiers annuels.</p>
        </div>
      </div>
      <div className="mx-auto max-w-4xl px-6 py-14">
        {reports.length === 0 ? (
          <div className="flex flex-col items-center py-24 text-center">
            <p className="text-gray-500">Aucun rapport financier disponible pour le moment.</p>
            <Link href="/reports" className="mt-4 text-primary underline text-sm">Voir tous les rapports</Link>
          </div>
        ) : (
          <div className="space-y-5">
            {reports.map((r) => (
              <div key={r._id} className="flex items-center justify-between rounded-2xl border border-gray-100 bg-white p-6 shadow-sm hover:shadow-md transition">
                <div>
                  <h3 className="font-bold text-gray-900">{r.title}</h3>
                  <p className="text-xs text-gray-400 mt-1">
                    {r.year || new Date(r.createdAt).getFullYear()} ·{" "}
                    {new Date(r.publishedAt || r.createdAt).toLocaleDateString("fr-FR")}
                  </p>
                </div>
                {r.fileUrl ? (
                  <a href={r.fileUrl} target="_blank" rel="noopener noreferrer"
                    className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white hover:bg-primary-dark transition">
                    Télécharger
                  </a>
                ) : (
                  <span className="text-xs text-gray-400 italic">Non disponible</span>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
