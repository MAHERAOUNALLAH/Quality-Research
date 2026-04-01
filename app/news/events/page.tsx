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
  } catch {
    return [];
  }
}

function isUpcoming(dateStr: string) { return new Date(dateStr) >= new Date(); }

export default async function EventsPage() {
  const events = await getEvents();
  const upcoming = events.filter((e) => isUpcoming(e.date));
  const past = events.filter((e) => !isUpcoming(e.date));

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b border-gray-100">
        <div className="mx-auto max-w-7xl px-6 py-16">
          <p className="text-sm font-semibold uppercase tracking-wider text-primary">Nouveautés</p>
          <h1 className="mt-2 text-4xl font-bold text-gray-900 md:text-5xl">Événements</h1>
          <p className="mt-4 max-w-2xl text-gray-600">
            Retrouvez les congrès, ateliers, webinaires et rencontres de l'association.
          </p>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-6 py-12 space-y-14">
        {events.length === 0 && (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-lightgreen">
              <svg className="h-8 w-8 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                  d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-900">Aucun événement pour le moment</h3>
            <p className="mt-1 text-sm text-gray-500">Les événements publiés apparaîtront ici.</p>
          </div>
        )}

        {upcoming.length > 0 && (
          <section>
            <h2 className="mb-6 text-2xl font-bold text-gray-900 flex items-center gap-3">
              <span className="inline-block h-3 w-3 rounded-full bg-green-500 animate-pulse" />
              Événements à venir
            </h2>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {upcoming.map((e) => <EventCard key={e._id} event={e} upcoming />)}
            </div>
          </section>
        )}

        {past.length > 0 && (
          <section>
            <h2 className="mb-6 text-2xl font-bold text-gray-900">Événements passés</h2>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {past.map((e) => <EventCard key={e._id} event={e} upcoming={false} />)}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}

function EventCard({ event, upcoming }: { event: EventItem; upcoming: boolean }) {
  const cat = typeof event.categoryId === "object" && event.categoryId?.nom ? event.categoryId.nom : null;

  return (
    <Link
      href={`/news/events/${event._id}`}
      className={`group flex flex-col rounded-2xl border bg-white shadow-sm transition hover:shadow-lg hover:-translate-y-0.5 ${upcoming ? "border-green-200" : "border-gray-100"}`}
    >
      {event.image ? (
        <div className="h-40 w-full overflow-hidden rounded-t-2xl">
          <img src={event.image} alt={event.titre} className="h-full w-full object-cover transition group-hover:scale-105" />
        </div>
      ) : (
        upcoming && <div className="h-1.5 w-full rounded-t-2xl bg-gradient-to-r from-primary to-green-400" />
      )}
      <div className="flex flex-1 flex-col p-6">
        <div className="mb-3 flex flex-wrap gap-2">
          {upcoming && (
            <span className="rounded-full bg-green-50 px-3 py-1 text-xs font-semibold text-green-700">À venir</span>
          )}
          {cat && (
            <span className="rounded-full bg-lightgreen px-3 py-1 text-xs font-semibold text-primary">{cat}</span>
          )}
        </div>
        <h2 className="mb-2 text-lg font-bold text-gray-900 group-hover:text-primary transition-colors leading-snug">
          {event.titre}
        </h2>
        <p className="mb-4 flex-1 text-sm leading-relaxed text-gray-600 line-clamp-3">{event.description}</p>
        <div className="mt-auto space-y-1 border-t border-gray-50 pt-4">
          <div className="flex items-center gap-2 text-xs text-gray-500">
            <svg className="h-4 w-4 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            {new Date(event.date).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" })}
          </div>
          {event.lieu && (
            <div className="flex items-center gap-2 text-xs text-gray-500">
              <svg className="h-4 w-4 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              {event.lieu}
            </div>
          )}
          <div className="pt-2 text-xs font-medium text-primary group-hover:underline">Voir les détails →</div>
        </div>
      </div>
    </Link>
  );
}
