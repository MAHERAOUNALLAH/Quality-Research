import Link from "next/link";

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
};

async function getCalls(): Promise<CallItem[]> {
  try {
    const baseUrl =
      process.env.NEXT_PUBLIC_BASE_URL ||
      (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "http://localhost:3000");
    const res = await fetch(`${baseUrl}/api/calls`, { cache: "no-store" });
    const data = await res.json();
    return Array.isArray(data) ? data : data.items || [];
  } catch {
    return [];
  }
}

function isExpired(deadline?: string) {
  if (!deadline) return false;
  return new Date(deadline) < new Date();
}

export default async function AppelACandidaturesPage() {
  const calls = await getCalls();
  const open = calls.filter((c) => !isExpired(c.deadline) && c.isOpen !== false);
  const closed = calls.filter((c) => isExpired(c.deadline) || c.isOpen === false);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b border-gray-100">
        <div className="mx-auto max-w-7xl px-6 py-16">
          <p className="text-sm font-semibold uppercase tracking-wider text-primary">Nouveautés</p>
          <h1 className="mt-2 text-4xl font-bold text-gray-900 md:text-5xl">Appels à candidatures</h1>
          <p className="mt-4 max-w-2xl text-gray-600">
            Consultez nos appels à candidatures, bourses, formations et opportunités en cours.
          </p>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-6 py-12 space-y-12">
        {calls.length === 0 && (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-lightgreen">
              <svg className="h-8 w-8 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                  d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-900">Aucun appel en cours</h3>
            <p className="mt-1 text-sm text-gray-500">Revenez prochainement.</p>
          </div>
        )}

        {open.length > 0 && (
          <section>
            <h2 className="mb-6 flex items-center gap-3 text-2xl font-bold text-gray-900">
              <span className="inline-block h-3 w-3 rounded-full bg-green-500 animate-pulse" />
              Appels ouverts
            </h2>
            <div className="grid gap-6 md:grid-cols-2">
              {open.map((call) => <CallCard key={call._id} call={call} open />)}
            </div>
          </section>
        )}

        {closed.length > 0 && (
          <section>
            <h2 className="mb-6 text-2xl font-bold text-gray-400">Appels clôturés</h2>
            <div className="grid gap-6 md:grid-cols-2 opacity-70">
              {closed.map((call) => <CallCard key={call._id} call={call} open={false} />)}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}

function CallCard({ call, open }: { call: CallItem; open: boolean }) {
  const snippet = call.excerpt || (call.content ? call.content.slice(0, 200) + (call.content.length > 200 ? "…" : "") : "");
  return (
    <Link
      href={`/news/appel-a-candidatures/${call._id}`}
      className={`group rounded-2xl border bg-white p-6 shadow-sm transition hover:shadow-md hover:-translate-y-0.5 block ${open ? "border-green-200" : "border-gray-100"}`}
    >
      <div className="mb-3 flex flex-wrap gap-2">
        <span className={`rounded-full px-3 py-1 text-xs font-semibold ${open ? "bg-green-50 text-green-700" : "bg-gray-100 text-gray-500"}`}>
          {open ? "✓ Ouvert" : "Clôturé"}
        </span>
        {call.type && (
          <span className="rounded-full bg-lightgreen px-3 py-1 text-xs font-semibold text-primary capitalize">
            {call.type}
          </span>
        )}
      </div>

      <h2 className="mb-2 text-lg font-bold text-gray-900 group-hover:text-primary transition-colors">{call.title}</h2>

      {snippet && (
        <p className="mb-4 text-sm leading-relaxed text-gray-600">{snippet}</p>
      )}

      <div className="mt-4 flex items-center justify-between border-t border-gray-50 pt-4">
        {call.deadline ? (
          <span className="text-xs text-gray-500">
            Date limite : <strong>{new Date(call.deadline).toLocaleDateString("fr-FR")}</strong>
          </span>
        ) : <span />}
        <span className="text-sm font-medium text-primary group-hover:underline">Voir les détails →</span>
      </div>
    </Link>
  );
}
