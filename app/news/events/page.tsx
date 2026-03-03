import Link from "next/link";
import { events } from "@/data/events";

export default function EventsPage() {
  const sortedEvents = [...events].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  return (
    <div className="max-w-7xl mx-auto px-6 py-16">
      <div className="mb-10">
        <p className="text-sm font-semibold uppercase tracking-wider text-primary">
          News
        </p>
        <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mt-2">
          Événements
        </h1>
        <p className="text-gray-600 mt-4 max-w-2xl">
          Retrouvez les derniers événements, congrès, ateliers et webinaires de l’association.
        </p>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
        {sortedEvents.map((event) => (
          <Link
            key={event.id}
            href={`/news/events/${event.slug}`}
            className="block rounded-2xl border border-gray-100 bg-white shadow-sm hover:shadow-lg transition p-6"
          >
            <div className="flex flex-wrap gap-2 mb-3 text-sm">
              <span className="px-3 py-1 rounded-full bg-lightgreen text-primary font-medium">
                {new Date(event.date).toLocaleDateString("fr-FR")}
              </span>
              <span className="px-3 py-1 rounded-full bg-gray-100 text-gray-700">
                {event.location}
              </span>
            </div>

            <h2 className="text-xl font-semibold text-gray-900 mb-3">
              {event.title}
            </h2>

            <p className="text-gray-600 line-clamp-3">{event.description}</p>

            <div className="mt-4 text-primary font-medium">Voir détails →</div>
          </Link>
        ))}
      </div>
    </div>
  );
}