import Link from "next/link";
import { getDb } from "@/lib/mongodb";

export const dynamic = "force-dynamic";
export const revalidate = 0;

type CallItem = {
  _id: string;
  title: string;
  excerpt?: string;
  content?: string;
  deadline?: string;
  isOpen?: boolean;
  type?: string;
  link?: string;
  createdAt: string;
  published?: boolean;
};

function normalizeCall(doc: any): CallItem {
  return {
    _id: String(doc._id),
    title: doc.title || "",
    excerpt: doc.excerpt || "",
    content: doc.content || "",
    deadline:
      doc.deadline instanceof Date
        ? doc.deadline.toISOString()
        : String(doc.deadline || ""),
    isOpen: doc.isOpen,
    type: doc.type || "",
    link: doc.link || "",
    createdAt:
      doc.createdAt instanceof Date
        ? doc.createdAt.toISOString()
        : String(doc.createdAt || ""),
    published: doc.published,
  };
}

async function getCalls(): Promise<CallItem[]> {
  try {
    const db = await getDb();

    const docs = await db
      .collection("calls")
      .find({
        $or: [{ published: true }, { published: { $exists: false } }],
      })
      .sort({ deadline: 1, createdAt: -1 })
      .toArray();

    return docs.map(normalizeCall);
  } catch (error) {
    console.error("Failed to load calls from MongoDB:", error);
    return [];
  }
}

function safeDate(dateStr?: string) {
  if (!dateStr) return null;

  const date = new Date(dateStr);

  return Number.isNaN(date.getTime()) ? null : date;
}

function isExpired(deadline?: string) {
  const deadlineDate = safeDate(deadline);

  if (!deadlineDate) return false;

  const today = new Date();

  deadlineDate.setHours(23, 59, 59, 999);
  today.setHours(0, 0, 0, 0);

  return deadlineDate < today;
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

function getSnippet(call: CallItem) {
  const text = call.excerpt || call.content || "";

  if (!text) return "";

  const clean = text.replace(/\s+/g, " ").trim();

  return clean.length > 200 ? clean.slice(0, 200).trimEnd() + "…" : clean;
}

export default async function AppelACandidaturesPage() {
  const calls = await getCalls();

  const open = calls.filter(
    (call) => !isExpired(call.deadline) && call.isOpen !== false
  );

  const closed = calls.filter(
    (call) => isExpired(call.deadline) || call.isOpen === false
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b border-gray-100">
        <div className="mx-auto max-w-7xl px-6 py-16">
          <p className="text-sm font-semibold uppercase tracking-wider text-primary">
            Nouveautés
          </p>

          <h1 className="mt-2 text-4xl font-bold text-gray-900 md:text-5xl">
            Appels à candidatures
          </h1>

          <p className="mt-4 max-w-2xl text-gray-600">
            Consultez nos appels à candidatures, bourses, formations et
            opportunités en cours.
          </p>

          {calls.length > 0 && (
            <div className="mt-6 flex items-center gap-6 text-sm text-gray-400">
              {open.length > 0 && (
                <span className="flex items-center gap-1.5">
                  <span className="h-2 w-2 animate-pulse rounded-full bg-green-500" />
                  {open.length} ouvert{open.length !== 1 ? "s" : ""}
                </span>
              )}

              {closed.length > 0 && (
                <span className="flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-full bg-gray-300" />
                  {closed.length} clôturé{closed.length !== 1 ? "s" : ""}
                </span>
              )}
            </div>
          )}
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-6 py-12 space-y-12">
        {calls.length === 0 && (
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
                  d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                />
              </svg>
            </div>

            <h3 className="text-lg font-semibold text-gray-900">
              Aucun appel en cours
            </h3>

            <p className="mt-1 text-sm text-gray-500">
              Revenez prochainement.
            </p>
          </div>
        )}

        {open.length > 0 && (
          <section>
            <h2 className="mb-6 flex items-center gap-3 text-2xl font-bold text-gray-900">
              <span className="inline-block h-3 w-3 rounded-full bg-green-500 animate-pulse" />
              Appels ouverts
            </h2>

            <div className="grid gap-6 md:grid-cols-2">
              {open.map((call) => (
                <CallCard key={call._id} call={call} open />
              ))}
            </div>
          </section>
        )}

        {closed.length > 0 && (
          <section>
            <h2 className="mb-6 text-2xl font-bold text-gray-400">
              Appels clôturés
            </h2>

            <div className="grid gap-6 md:grid-cols-2 opacity-70">
              {closed.map((call) => (
                <CallCard key={call._id} call={call} open={false} />
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}

function CallCard({ call, open }: { call: CallItem; open: boolean }) {
  const snippet = getSnippet(call);
  const deadlineLabel = formatDate(call.deadline);

  return (
    <Link
      href={`/news/appel-a-candidatures/${call._id}`}
      className={`group rounded-2xl border bg-white p-6 shadow-sm transition hover:shadow-md hover:-translate-y-0.5 block ${
        open ? "border-green-200" : "border-gray-100"
      }`}
    >
      <div className="mb-3 flex flex-wrap gap-2">
        <span
          className={`rounded-full px-3 py-1 text-xs font-semibold ${
            open ? "bg-green-50 text-green-700" : "bg-gray-100 text-gray-500"
          }`}
        >
          {open ? "✓ Ouvert" : "Clôturé"}
        </span>

        {call.type && (
          <span className="rounded-full bg-lightgreen px-3 py-1 text-xs font-semibold text-primary capitalize">
            {call.type}
          </span>
        )}
      </div>

      <h2 className="mb-2 text-lg font-bold text-gray-900 group-hover:text-primary transition-colors">
        {call.title}
      </h2>

      {snippet && (
        <p className="mb-4 text-sm leading-relaxed text-gray-600">
          {snippet}
        </p>
      )}

      <div className="mt-4 flex items-center justify-between gap-4 border-t border-gray-50 pt-4">
        {deadlineLabel ? (
          <span className="text-xs text-gray-500">
            Date limite : <strong>{deadlineLabel}</strong>
          </span>
        ) : (
          <span />
        )}

        <span className="text-sm font-medium text-primary group-hover:underline">
          Voir les détails →
        </span>
      </div>
    </Link>
  );
}