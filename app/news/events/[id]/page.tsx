import Link from "next/link";
import { notFound } from "next/navigation";

type Event = {
  _id: string;
  titre: string;
  description: string;
  date: string;
  lieu: string;
  image?: string;
  categoryId?: string;
  categoryName?: string;
  published?: boolean;
  createdAt: string;
};

async function getEvent(id: string): Promise<Event | null> {
  try {
    const baseUrl =
      process.env.NEXT_PUBLIC_BASE_URL ||
      (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "http://localhost:3000");
    const res = await fetch(`${baseUrl}/api/events/${id}`, { cache: "no-store" });
    if (!res.ok) return null;
    const data = await res.json();
    return data.item || null;
  } catch {
    return null;
  }
}

async function getRelatedEvents(currentId: string): Promise<Event[]> {
  try {
    const baseUrl =
      process.env.NEXT_PUBLIC_BASE_URL ||
      (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "http://localhost:3000");
    const res = await fetch(`${baseUrl}/api/events`, { cache: "no-store" });
    const data = await res.json();
    const all: Event[] = Array.isArray(data) ? data : data.items || [];
    return all.filter((e) => e._id !== currentId).slice(0, 3);
  } catch {
    return [];
  }
}

function isUpcoming(dateStr: string) {
  return new Date(dateStr) >= new Date();
}

export default async function EventDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const event = await getEvent(id);
  if (!event) notFound();

  const related = await getRelatedEvents(id);
  const upcoming = isUpcoming(event.date);
  const paragraphs = event.description.split(/\n+/).filter(Boolean);

  const eventDate = new Date(event.date);
  const dayNum = eventDate.toLocaleDateString("fr-FR", { day: "numeric" });
  const monthName = eventDate.toLocaleDateString("fr-FR", { month: "long" });
  const yearNum = eventDate.getFullYear();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero */}
      <div className={`border-b ${upcoming ? "bg-gradient-to-br from-green-50 to-white" : "bg-white"} border-gray-100`}>
        {event.image && (
          <div className="h-72 w-full overflow-hidden md:h-96">
            <img src={event.image} alt={event.titre} className="h-full w-full object-cover" />
          </div>
        )}
        <div className="mx-auto max-w-4xl px-6 py-10">
          {/* Breadcrumb */}
          <nav className="mb-5 flex items-center gap-2 text-sm text-gray-500">
            <Link href="/" className="hover:text-primary transition-colors">Accueil</Link>
            <span>/</span>
            <Link href="/news/events" className="hover:text-primary transition-colors">Événements</Link>
            <span>/</span>
            <span className="text-gray-700 truncate max-w-xs">{event.titre}</span>
          </nav>

          <div className="flex flex-col gap-6 md:flex-row md:items-start">
            {/* Date badge */}
            <div className="flex-shrink-0 text-center rounded-2xl bg-primary text-white p-4 w-24 shadow-md">
              <p className="text-3xl font-bold leading-none">{dayNum}</p>
              <p className="text-sm font-medium mt-1 capitalize">{monthName}</p>
              <p className="text-xs opacity-75 mt-0.5">{yearNum}</p>
            </div>

            <div className="flex-1">
              <div className="mb-3 flex flex-wrap gap-2">
                {upcoming ? (
                  <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-semibold text-green-700 flex items-center gap-1">
                    <span className="h-2 w-2 rounded-full bg-green-500 animate-pulse inline-block" />
                    À venir
                  </span>
                ) : (
                  <span className="rounded-full bg-gray-100 px-3 py-1 text-xs text-gray-500">Passé</span>
                )}
                {event.categoryName && (
                  <span className="rounded-full bg-lightgreen px-3 py-1 text-xs font-semibold text-primary">
                    {event.categoryName}
                  </span>
                )}
              </div>

              <h1 className="text-3xl font-bold text-gray-900 leading-snug md:text-4xl">{event.titre}</h1>

              {/* Key info */}
              <div className="mt-4 flex flex-wrap gap-4">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <svg className="h-5 w-5 text-primary flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                      d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <span>
                    {eventDate.toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}
                    {" à "}
                    {eventDate.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })}
                  </span>
                </div>
                {event.lieu && (
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <svg className="h-5 w-5 text-primary flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                        d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    <span>{event.lieu}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="mx-auto max-w-4xl px-6 py-10">
        <div className="grid gap-10 lg:grid-cols-[1fr_280px]">
          {/* Main */}
          <article className="rounded-2xl bg-white border border-gray-100 p-8 shadow-sm">
            <h2 className="text-xl font-bold text-gray-900 mb-5">À propos de l'événement</h2>
            <div>
              {paragraphs.map((p, i) => (
                <p key={i} className="mb-5 text-gray-700 leading-relaxed text-base">{p}</p>
              ))}
            </div>

            <div className="mt-8 border-t border-gray-100 pt-6 flex items-center justify-between flex-wrap gap-4">
              <div className="text-sm text-gray-500">
                Organisé par <span className="font-medium text-gray-700">Quality &amp; Research</span>
              </div>
              <Link href="/news/events"
                className="rounded-xl border border-gray-200 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 transition">
                ← Retour aux événements
              </Link>
            </div>
          </article>

          {/* Sidebar */}
          <aside className="space-y-6">
            {/* Register CTA if upcoming */}
            {upcoming && (
              <div className="rounded-2xl bg-primary p-5 text-white shadow-md">
                <h3 className="font-bold text-lg mb-2">S'inscrire</h3>
                <p className="text-green-100 text-xs leading-relaxed mb-4">
                  Places limitées — inscrivez-vous dès maintenant pour participer à cet événement.
                </p>
                <Link href="/contact"
                  className="block w-full rounded-xl bg-white py-2.5 text-center text-sm font-semibold text-primary hover:bg-green-50 transition">
                  Demander une inscription
                </Link>
              </div>
            )}

            {/* Details card */}
            <div className="rounded-2xl bg-white border border-gray-100 p-5 shadow-sm">
              <h3 className="font-semibold text-gray-900 mb-4">Informations</h3>
              <ul className="space-y-3 text-sm">
                <li className="flex items-start gap-3">
                  <svg className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                      d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <div>
                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Date</p>
                    <p className="text-gray-800">
                      {eventDate.toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" })}
                    </p>
                  </div>
                </li>
                {event.lieu && (
                  <li className="flex items-start gap-3">
                    <svg className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                        d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    <div>
                      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Lieu</p>
                      <p className="text-gray-800">{event.lieu}</p>
                    </div>
                  </li>
                )}
                {event.categoryName && (
                  <li className="flex items-start gap-3">
                    <svg className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                        d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                    </svg>
                    <div>
                      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Catégorie</p>
                      <p className="text-gray-800">{event.categoryName}</p>
                    </div>
                  </li>
                )}
              </ul>
            </div>

            {/* Related */}
            {related.length > 0 && (
              <div className="rounded-2xl bg-white border border-gray-100 p-5 shadow-sm">
                <h3 className="font-semibold text-gray-900 mb-4">Autres événements</h3>
                <div className="space-y-3">
                  {related.map((r) => (
                    <Link key={r._id} href={`/news/events/${r._id}`}
                      className="group block rounded-xl border border-gray-50 p-3 hover:border-primary/20 hover:bg-lightgreen/30 transition">
                      <p className="text-sm font-medium text-gray-800 group-hover:text-primary transition-colors leading-snug line-clamp-2">
                        {r.titre}
                      </p>
                      <p className="mt-1 text-xs text-gray-400 flex items-center gap-1">
                        <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                            d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        {new Date(r.date).toLocaleDateString("fr-FR", { day: "numeric", month: "short", year: "numeric" })}
                      </p>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </aside>
        </div>
      </div>
    </div>
  );
}
