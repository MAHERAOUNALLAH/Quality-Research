import Link from "next/link";
import { notFound } from "next/navigation";

type CallItem = {
  _id: string;
  title: string;
  excerpt?: string;
  content?: string;
  type?: string;
  deadline?: string;
  link?: string;
  isOpen?: boolean;
  createdAt: string;
  updatedAt?: string;
};

async function getCall(id: string): Promise<CallItem | null> {
  try {
    const baseUrl =
      process.env.NEXT_PUBLIC_BASE_URL ||
      (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "http://localhost:3000");
    const res = await fetch(`${baseUrl}/api/calls/${id}`, { cache: "no-store" });
    if (!res.ok) return null;
    const data = await res.json();
    return data.item || null;
  } catch {
    return null;
  }
}

async function getRelatedCalls(currentId: string): Promise<CallItem[]> {
  try {
    const baseUrl =
      process.env.NEXT_PUBLIC_BASE_URL ||
      (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "http://localhost:3000");
    const res = await fetch(`${baseUrl}/api/calls`, { cache: "no-store" });
    const data = await res.json();
    const all: CallItem[] = Array.isArray(data) ? data : data.items || [];
    return all.filter((c) => c._id !== currentId).slice(0, 3);
  } catch {
    return [];
  }
}

function isExpired(deadline?: string) {
  if (!deadline) return false;
  return new Date(deadline) < new Date();
}

const typeLabels: Record<string, string> = {
  candidature: "Candidature",
  participation: "Participation",
  communication: "Communication",
  projet: "Projet",
  autre: "Autre",
};

export default async function CallDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const call = await getCall(id);
  if (!call) notFound();

  const related = await getRelatedCalls(id);
  const expired = isExpired(call.deadline);
  const open = call.isOpen !== false && !expired;
  const paragraphs = (call.content || "").split(/\n+/).filter(Boolean);

  const daysLeft = call.deadline
    ? Math.ceil((new Date(call.deadline).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
    : null;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero */}
      <div className={`border-b ${open ? "bg-gradient-to-br from-green-50 to-white" : "bg-white"} border-gray-100`}>
        <div className="mx-auto max-w-4xl px-6 py-10">
          {/* Breadcrumb */}
          <nav className="mb-5 flex items-center gap-2 text-sm text-gray-500">
            <Link href="/" className="hover:text-primary transition-colors">Accueil</Link>
            <span>/</span>
            <Link href="/news/appel-a-candidatures" className="hover:text-primary transition-colors">Appels</Link>
            <span>/</span>
            <span className="text-gray-700 truncate max-w-xs">{call.title}</span>
          </nav>

          <div className="mb-4 flex flex-wrap gap-2">
            <span className={`rounded-full px-3 py-1 text-xs font-semibold ${open ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"}`}>
              {open ? "✓ Ouvert" : "Clôturé"}
            </span>
            {call.type && (
              <span className="rounded-full bg-lightgreen px-3 py-1 text-xs font-semibold text-primary capitalize">
                {typeLabels[call.type] || call.type}
              </span>
            )}
            {open && daysLeft !== null && daysLeft > 0 && (
              <span className="rounded-full bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-700">
                ⏳ {daysLeft} jour{daysLeft > 1 ? "s" : ""} restant{daysLeft > 1 ? "s" : ""}
              </span>
            )}
          </div>

          <h1 className="text-3xl font-bold text-gray-900 leading-snug md:text-4xl">{call.title}</h1>

          {call.excerpt && (
            <p className="mt-4 text-lg text-gray-600 leading-relaxed border-l-4 border-primary pl-4">
              {call.excerpt}
            </p>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="mx-auto max-w-4xl px-6 py-10">
        <div className="grid gap-10 lg:grid-cols-[1fr_280px]">
          {/* Main */}
          <article className="rounded-2xl bg-white border border-gray-100 p-8 shadow-sm">
            {paragraphs.length > 0 ? (
              <>
                <h2 className="text-xl font-bold text-gray-900 mb-5">Détails de l'appel</h2>
                <div className="space-y-4">
                  {paragraphs.map((p, i) => (
                    <p key={i} className="text-gray-700 leading-relaxed text-base">{p}</p>
                  ))}
                </div>
              </>
            ) : (
              <p className="text-gray-500 italic">Aucune description disponible.</p>
            )}

            <div className="mt-8 border-t border-gray-100 pt-6 flex items-center justify-between flex-wrap gap-4">
              <Link href="/news/appel-a-candidatures"
                className="rounded-xl border border-gray-200 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 transition">
                ← Retour aux appels
              </Link>
              {call.link && open && (
                <a href={call.link} target="_blank" rel="noopener noreferrer"
                  className="rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-white hover:bg-primary/90 transition">
                  Postuler maintenant →
                </a>
              )}
            </div>
          </article>

          {/* Sidebar */}
          <aside className="space-y-6">
            {/* Key info */}
            <div className="rounded-2xl bg-white border border-gray-100 p-5 shadow-sm">
              <h3 className="font-semibold text-gray-900 mb-4">Informations clés</h3>
              <ul className="space-y-4 text-sm">
                <li className="flex items-start gap-3">
                  <div className="mt-0.5 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-lightgreen text-primary">
                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                        d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Statut</p>
                    <p className={`font-medium ${open ? "text-green-700" : "text-gray-500"}`}>
                      {open ? "Ouvert" : "Clôturé"}
                    </p>
                  </div>
                </li>

                {call.type && (
                  <li className="flex items-start gap-3">
                    <div className="mt-0.5 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-lightgreen text-primary">
                      <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                          d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Type</p>
                      <p className="text-gray-800 capitalize">{typeLabels[call.type] || call.type}</p>
                    </div>
                  </li>
                )}

                {call.deadline && (
                  <li className="flex items-start gap-3">
                    <div className={`mt-0.5 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg ${expired ? "bg-red-50 text-red-500" : "bg-amber-50 text-amber-600"}`}>
                      <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                          d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Date limite</p>
                      <p className={`font-medium ${expired ? "text-red-600" : "text-gray-800"}`}>
                        {new Date(call.deadline).toLocaleDateString("fr-FR", {
                          day: "numeric", month: "long", year: "numeric",
                        })}
                      </p>
                      {!expired && daysLeft !== null && daysLeft > 0 && (
                        <p className="text-xs text-amber-600 mt-0.5">dans {daysLeft} jour{daysLeft > 1 ? "s" : ""}</p>
                      )}
                    </div>
                  </li>
                )}
              </ul>
            </div>

            {/* CTA */}
            {open && call.link && (
              <div className="rounded-2xl bg-primary p-5 text-white shadow-md">
                <h3 className="font-bold text-lg mb-2">Prêt à postuler ?</h3>
                <p className="text-green-100 text-xs leading-relaxed mb-4">
                  Ne manquez pas cette opportunité. Soumettez votre candidature avant la date limite.
                </p>
                <a href={call.link} target="_blank" rel="noopener noreferrer"
                  className="block w-full rounded-xl bg-white py-2.5 text-center text-sm font-semibold text-primary hover:bg-green-50 transition">
                  Accéder au formulaire →
                </a>
              </div>
            )}

            {/* Related */}
            {related.length > 0 && (
              <div className="rounded-2xl bg-white border border-gray-100 p-5 shadow-sm">
                <h3 className="font-semibold text-gray-900 mb-4">Autres appels</h3>
                <div className="space-y-3">
                  {related.map((r) => {
                    const rOpen = r.isOpen !== false && !isExpired(r.deadline);
                    return (
                      <Link key={r._id} href={`/news/appel-a-candidatures/${r._id}`}
                        className="group block rounded-xl border border-gray-50 p-3 hover:border-primary/20 hover:bg-lightgreen/30 transition">
                        <div className="flex items-center gap-2 mb-1">
                          <span className={`h-2 w-2 rounded-full flex-shrink-0 ${rOpen ? "bg-green-500" : "bg-gray-300"}`} />
                          <p className="text-sm font-medium text-gray-800 group-hover:text-primary transition-colors leading-snug line-clamp-2">
                            {r.title}
                          </p>
                        </div>
                        {r.deadline && (
                          <p className="text-xs text-gray-400 ml-4">
                            Limite : {new Date(r.deadline).toLocaleDateString("fr-FR")}
                          </p>
                        )}
                      </Link>
                    );
                  })}
                </div>
              </div>
            )}
          </aside>
        </div>
      </div>
    </div>
  );
}
