import { getDb } from "@/lib/mongodb";

export const dynamic = "force-dynamic";
export const revalidate = 0;

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
  published?: boolean;
};

function normalizeReport(doc: any): Report {
  return {
    _id: String(doc._id),
    title: doc.title || "",
    content: doc.content || "",
    excerpt: doc.excerpt || "",
    type: doc.type || "autre",
    year:
      typeof doc.year === "number"
        ? doc.year
        : doc.year
          ? Number(doc.year)
          : undefined,
    fileUrl: doc.fileUrl || "",
    publishedAt:
      doc.publishedAt instanceof Date
        ? doc.publishedAt.toISOString()
        : String(doc.publishedAt || ""),
    createdAt:
      doc.createdAt instanceof Date
        ? doc.createdAt.toISOString()
        : String(doc.createdAt || ""),
    published: doc.published,
  };
}

async function getReports(): Promise<Report[]> {
  try {
    const db = await getDb();

    const docs = await db
      .collection("reports")
      .find({
        $or: [{ published: true }, { published: { $exists: false } }],
      })
      .sort({ year: -1, publishedAt: -1, createdAt: -1 })
      .toArray();

    return docs.map(normalizeReport);
  } catch (error) {
    console.error("Failed to load reports from MongoDB:", error);
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

function getReportYear(report: Report) {
  if (report.year) return String(report.year);

  const date = safeDate(report.publishedAt || report.createdAt);

  if (!date) return "Non classé";

  return String(date.getFullYear());
}

function getExcerpt(report: Report) {
  const text = report.excerpt || report.content || "";

  if (!text) return "";

  const clean = text.replace(/\s+/g, " ").trim();

  return clean.length > 160 ? clean.slice(0, 160).trimEnd() + "…" : clean;
}

const typeLabels: Record<string, string> = {
  activite: "Rapport d'activité",
  financier: "Rapport financier",
  autre: "Autre",
};

export default async function ReportsPage() {
  const reports = await getReports();

  const byYear = reports.reduce<Record<string, Report[]>>((acc, report) => {
    const key = getReportYear(report);

    acc[key] = acc[key] || [];
    acc[key].push(report);

    return acc;
  }, {});

  const years = Object.keys(byYear).sort((a, b) => {
    if (a === "Non classé") return 1;
    if (b === "Non classé") return -1;

    return Number(b) - Number(a);
  });

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b border-gray-100">
        <div className="mx-auto max-w-7xl px-6 py-16">
          <p className="text-sm font-semibold uppercase tracking-wider text-primary">
            Transparence
          </p>

          <h1 className="mt-2 text-4xl font-bold text-gray-900 md:text-5xl">
            Rapports &amp; Publications
          </h1>

          <p className="mt-4 max-w-2xl text-gray-600">
            Accédez aux rapports d'activité, rapports financiers et autres
            publications officielles de l'association.
          </p>

          {reports.length > 0 && (
            <div className="mt-6 flex items-center gap-2 text-sm text-gray-400">
              <span className="h-2 w-2 rounded-full bg-primary" />
              {reports.length} rapport{reports.length !== 1 ? "s" : ""} publié
              {reports.length !== 1 ? "s" : ""}
            </div>
          )}
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-6 py-12 space-y-12">
        {reports.length === 0 && (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-lightgreen">
              <svg
                className="h-8 w-8 text-primary"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
            </div>

            <h3 className="text-lg font-semibold text-gray-900">
              Aucun rapport disponible
            </h3>

            <p className="mt-1 text-sm text-gray-500">
              Les rapports publiés apparaîtront ici.
            </p>
          </div>
        )}

        {years.map((year) => (
          <section key={year}>
            <h2 className="mb-6 text-2xl font-bold text-gray-900 border-b border-gray-200 pb-3">
              {year}
            </h2>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {byYear[year].map((report) => {
                const reportExcerpt = getExcerpt(report);
                const dateLabel = formatDate(
                  report.publishedAt || report.createdAt
                );

                return (
                  <article
                    key={report._id}
                    className="group flex flex-col rounded-2xl border border-gray-100 bg-white shadow-sm transition hover:shadow-md p-6"
                  >
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

                    {reportExcerpt && (
                      <p className="flex-1 text-sm leading-relaxed text-gray-600 mb-4">
                        {reportExcerpt}
                      </p>
                    )}

                    <div className="mt-auto pt-4 border-t border-gray-50 flex items-center justify-between gap-4">
                      <span className="text-xs text-gray-400">
                        {dateLabel}
                      </span>

                      {report.fileUrl ? (
                        <a
                          href={report.fileUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-1.5 rounded-lg bg-primary px-4 py-2 text-xs font-semibold text-white transition hover:bg-primary-dark"
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
                              d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                            />
                          </svg>
                          Télécharger
                        </a>
                      ) : (
                        <span className="text-xs text-gray-400 italic">
                          Fichier non disponible
                        </span>
                      )}
                    </div>
                  </article>
                );
              })}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}