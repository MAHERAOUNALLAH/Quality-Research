import Link from "next/link";
import { getDb } from "@/lib/mongodb";

export const dynamic = "force-dynamic";
export const revalidate = 0;

type Report = {
  _id: string;
  title: string;
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
    type: doc.type || "",
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

async function getActivityReports(): Promise<Report[]> {
  try {
    const db = await getDb();

    const docs = await db
      .collection("reports")
      .find({
        $or: [
          { type: "activite" },
          { type: { $exists: false } },
          { type: "" },
          { type: null },
        ],
        $and: [
          {
            $or: [{ published: true }, { published: { $exists: false } }],
          },
        ],
      })
      .sort({ year: -1, publishedAt: -1, createdAt: -1 })
      .toArray();

    return docs.map(normalizeReport);
  } catch (error) {
    console.error("Failed to load activity reports from MongoDB:", error);
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
  if (report.year) return report.year;

  const date = safeDate(report.createdAt);

  return date ? date.getFullYear() : "";
}

export default async function RapportActivitePage() {
  const reports = await getActivityReports();

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b border-gray-100">
        <div className="mx-auto max-w-7xl px-6 py-16">
          <p className="text-sm font-semibold uppercase tracking-wider text-primary">
            À propos
          </p>

          <h1 className="mt-2 text-4xl font-bold text-gray-900 md:text-5xl">
            Rapport d&apos;activité
          </h1>

          <p className="mt-4 max-w-2xl text-gray-600">
            Consultez nos rapports d&apos;activité annuels.
          </p>

          {reports.length > 0 && (
            <div className="mt-6 flex items-center gap-2 text-sm text-gray-400">
              <span className="h-2 w-2 rounded-full bg-primary" />
              {reports.length} rapport d&apos;activité
              {reports.length !== 1 ? "s" : ""} disponible
              {reports.length !== 1 ? "s" : ""}
            </div>
          )}
        </div>
      </div>

      <div className="mx-auto max-w-4xl px-6 py-14">
        {reports.length === 0 ? (
          <div className="flex flex-col items-center py-24 text-center">
            <div className="mb-5 flex h-20 w-20 items-center justify-center rounded-2xl bg-lightgreen shadow-sm text-4xl">
              📄
            </div>

            <p className="text-gray-500">
              Aucun rapport d&apos;activité disponible pour le moment.
            </p>

            <Link
              href="/reports"
              className="mt-4 text-primary underline text-sm"
            >
              Voir tous les rapports
            </Link>
          </div>
        ) : (
          <div className="space-y-5">
            {reports.map((report) => {
              const year = getReportYear(report);
              const dateLabel = formatDate(
                report.publishedAt || report.createdAt
              );

              return (
                <div
                  key={report._id}
                  className="flex items-center justify-between gap-6 rounded-2xl border border-gray-100 bg-white p-6 shadow-sm hover:shadow-md transition"
                >
                  <div>
                    <h3 className="font-bold text-gray-900">
                      {report.title}
                    </h3>

                    <p className="text-xs text-gray-400 mt-1">
                      {year}
                      {dateLabel ? ` · ${dateLabel}` : ""}
                    </p>
                  </div>

                  {report.fileUrl ? (
                    <a
                      href={report.fileUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white hover:bg-primary-dark transition"
                    >
                      Télécharger
                    </a>
                  ) : (
                    <span className="text-xs text-gray-400 italic">
                      Non disponible
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}