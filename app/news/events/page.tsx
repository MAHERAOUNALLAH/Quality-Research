import Link from "next/link";

type EventItem = {
  _id: string;
  titre: string;
  description: string;
  date: string;
  lieu: string;
  categoryId?: string | { nom?: string } | null;
  image?: string;
  createdAt: string;
};

async function getEvents(): Promise<EventItem[]> {
  try {
    const baseUrl =
      process.env.NEXT_PUBLIC_BASE_URL ||
      (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "http://localhost:3000");
    const res = await fetch(`${baseUrl}/api/events`, { cache: "no-store" });
    const data = await res.json();
    return Array.isArray(data) ? data : data.items || [];
  } catch { return []; }
}

function isUpcoming(dateStr: string) { return new Date(dateStr) >= new Date(); }

function catName(c: EventItem["categoryId"]) {
  return typeof c === "object" && c?.nom ? c.nom : null;
}

export default async function EventsPage() {
  const events = await getEvents();
  const upcoming = events.filter((e) => isUpcoming(e.date));
  const past = events.filter((e) => !isUpcoming(e.date));

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero */}
      <div className="relative overflow-hidden bg-white border-b border-gray-100">
        <div className="absolute inset-0 bg-gradient-to-br from-lightgreen via-white to-white pointer-events-none" />
        <div className="relative mx-auto max-w-7xl px-6 py-20">
          <div className="flex items-center gap-2 mb-4">
            <span className="h-1 w-8 rounded-full bg-primary" />
            <p className="text-sm font-semibold uppercase tracking-widest text-primary">Agenda</p>
          </div>
          <h1 className="text-4xl font-bold text-gray-900 md:text-5xl lg:text-6xl leading-tight">
            Événements &amp; <br className="hidden sm:block" />
            <span className="text-primary">Rencontres</span>
          </h1>
          <p className="mt-5 max-w-2xl text-lg text-gray-500 leading-relaxed">
            Retrouvez nos congrès, ateliers, webinaires et rencontres scientifiques.
          </p>
          <div className="mt-6 flex items-center gap-6 text-sm text-gray-400">
            {upcoming.length > 0 && (
              <span className="flex items-center gap-1.5">
                <span className="h-2 w-2 animate-pulse rounded-full bg-green-500" />
                {upcoming.length} à venir
              </span>
            )}
            {past.length > 0 && (
              <span className="flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-gray-300" />
                {past.length} passé{past.length !== 1 ? "s" : ""}
              </span>
            )}
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-6 py-14 space-y-16">
        {events.length === 0 && (
          <div className="flex flex-col items-center justify-center py-28 text-center">
            <div className="mb-5 flex h-20 w-20 items-center justify-center rounded-2xl bg-lightgreen shadow-sm">
              <svg className="h-10 w-10 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-gray-900">Aucun événement pour le moment</h3>
            <p className="mt-2 text-gray-500">Les événements publiés apparaîtront ici.</p>
          </div>
        )}

        {upcoming.length > 0 && (
          <section>
            <div className="flex items-center gap-3 mb-8">
              <span className="inline-block h-3 w-3 rounded-full bg-green-500 animate-pulse" />
              <h2 className="text-2xl font-bold text-gray-900">Événements à venir</h2>
              <span className="rounded-full bg-green-50 px-3 py-1 text-sm font-semibold text-green-700">{upcoming.length}</span>
            </div>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {upcoming.map((e) => <EventCard key={e._id} event={e} upcoming />)}
            </div>
          </section>
        )}

        {past.length > 0 && (
          <section>
            <div className="flex items-center gap-3 mb-8">
              <h2 className="text-2xl font-bold text-gray-900">Événements passés</h2>
              <span className="rounded-full bg-gray-100 px-3 py-1 text-sm font-medium text-gray-500">{past.length}</span>
            </div>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 opacity-80">
              {past.map((e) => <EventCard key={e._id} event={e} upcoming={false} />)}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}

function EventCard({ event, upcoming }: { event: EventItem; upcoming: boolean }) {
  const cat = catName(event.categoryId);
  const d = new Date(event.date);

  return (
    <Link
      href={`/news/events/${event._id}`}
      className={`group flex flex-col rounded-2xl bg-white shadow-sm border overflow-hidden transition-all duration-300 hover:shadow-xl hover:-translate-y-1 ${upcoming ? "border-green-100" : "border-gray-100"}`}
    >
      {event.image ? (
        <div className="relative h-48 w-full overflow-hidden">
          <img src={event.image} alt={event.titre} className="h-full w-full object-cover transition duration-500 group-hover:scale-105" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
          {upcoming && (
            <div className="absolute top-3 left-3">
              <span className="flex items-center gap-1.5 rounded-full bg-white/90 backdrop-blur-sm px-3 py-1 text-xs font-semibold text-green-700 shadow-sm">
                <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-green-500" />
                À venir
              </span>
            </div>
          )}
          {/* Date badge overlaid on image */}
          <div className="absolute bottom-3 right-3 rounded-xl bg-white/90 backdrop-blur-sm px-3 py-2 text-center shadow-sm">
            <div className="text-xl font-black text-gray-900 leading-none">{d.getDate()}</div>
            <div className="text-xs font-semibold uppercase text-primary tracking-wide">
              {d.toLocaleDateString("fr-FR", { month: "short" })}
            </div>
          </div>
        </div>
      ) : (
        <div className={`relative h-2 w-full ${upcoming ? "bg-gradient-to-r from-primary to-green-400" : "bg-gray-200"}`} />
      )}

      <div className="flex flex-1 flex-col p-6">
        <div className="mb-3 flex flex-wrap gap-2">
          {!event.image && upcoming && (
            <span className="flex items-center gap-1.5 rounded-full bg-green-50 px-3 py-1 text-xs font-semibold text-green-700">
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-green-500" />
              À venir
            </span>
          )}
          {cat && (
            <span className="rounded-full bg-lightgreen px-3 py-1 text-xs font-semibold text-primary">{cat}</span>
          )}
        </div>

        <h2 className="mb-3 text-lg font-bold text-gray-900 group-hover:text-primary transition-colors leading-snug line-clamp-2">
          {event.titre}
        </h2>
        <p className="mb-4 flex-1 text-sm leading-relaxed text-gray-500 line-clamp-3">{event.description}</p>

        <div className="mt-auto space-y-2 border-t border-gray-50 pt-4">
          {!event.image && (
            <div className="flex items-center gap-2 text-xs text-gray-500">
              <svg className="h-3.5 w-3.5 text-primary flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              {d.toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" })}
            </div>
          )}
          {event.lieu && (
            <div className="flex items-center gap-2 text-xs text-gray-500">
              <svg className="h-3.5 w-3.5 text-primary flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              {event.lieu}
            </div>
          )}
          <div className="pt-1 flex items-center gap-1 text-xs font-semibold text-primary group-hover:gap-2 transition-all">
            Voir les détails
            <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </div>
        </div>
      </div>
    </Link>
  );
}
