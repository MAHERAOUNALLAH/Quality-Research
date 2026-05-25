import Link from "next/link";
import EventsHeroSlider from "./components/EventsHeroSlider";
import type { EventItem } from "@/data/events";

import { getEventsCollection } from "@/lib/models/Event";
import { getArticlesCollection } from "@/lib/models/Article";
import { getProjectsCollection } from "@/lib/models/Project";
import { getCallsCollection } from "@/lib/models/Call";
import { getReportsCollection } from "@/lib/models/Report";
import { getPartnersCollection } from "@/lib/models/Partner";

export const dynamic = "force-dynamic";
export const revalidate = 0;

type DbItem = Record<string, any>;

function idOf(item: DbItem) {
  return item?._id ? String(item._id) : "";
}

function toDate(value: unknown) {
  if (!value) return null;
  const date = new Date(value as string | Date);
  return Number.isNaN(date.getTime()) ? null : date;
}

function formatDate(value: unknown) {
  const date = toDate(value);

  if (!date) return "";

  return date.toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

function excerpt(text?: string, max = 150) {
  if (!text) return "";
  const clean = text.replace(/\s+/g, " ").trim();
  return clean.length > max ? clean.slice(0, max).trimEnd() + "…" : clean;
}

function isUpcoming(value: unknown) {
  const date = toDate(value);
  if (!date) return false;

  const today = new Date();
  date.setHours(0, 0, 0, 0);
  today.setHours(0, 0, 0, 0);

  return date >= today;
}

async function safe<T>(label: string, action: () => Promise<T>, fallback: T) {
  try {
    return await action();
  } catch (error) {
    console.error(`Home page: failed to load ${label}`, error);
    return fallback;
  }
}

async function getHomeData() {
  const now = new Date();

  const [
    events,
    articles,
    projects,
    calls,
    reports,
    partners,
  ] = await Promise.all([
    safe("events", async () => {
      const col = await getEventsCollection();

      const upcoming = await col
        .find({
          $or: [{ published: true }, { published: { $exists: false } }],
          date: { $gte: now },
        })
        .sort({ date: 1 })
        .limit(6)
        .toArray();

      const past =
        upcoming.length < 6
          ? await col
              .find({
                $or: [{ published: true }, { published: { $exists: false } }],
                date: { $lt: now },
              })
              .sort({ date: -1 })
              .limit(6 - upcoming.length)
              .toArray()
          : [];

      return [...upcoming, ...past];
    }, []),

    safe("articles", async () => {
      const col = await getArticlesCollection();

      return col.find({}).sort({ createdAt: -1 }).limit(3).toArray();
    }, []),

    safe("projects", async () => {
      const col = await getProjectsCollection();

      return col
        .find({})
        .sort({ createdAt: -1 })
        .limit(3)
        .toArray();
    }, []),

    safe("calls", async () => {
      const col = await getCallsCollection();

      return col
        .find({
          $or: [
            { isOpen: true },
            { isOpen: { $exists: false } },
          ],
        })
        .sort({ deadline: 1, createdAt: -1 })
        .limit(3)
        .toArray();
    }, []),

    safe("reports", async () => {
      const col = await getReportsCollection();

      return col
        .find({})
        .sort({ year: -1, publishedAt: -1, createdAt: -1 })
        .limit(3)
        .toArray();
    }, []),

    safe("partners", async () => {
      const col = await getPartnersCollection();

      return col
        .find({})
        .sort({ order: 1, createdAt: -1 })
        .limit(6)
        .toArray();
    }, []),
  ]);

  const sliderEvents: EventItem[] = events.map((event, index) => ({
    id: index + 1,
    title: event.titre || "Événement",
    subtitle: excerpt(event.description, 170),
    date: formatDate(event.date),
    location: event.lieu || "",
    image: event.image || "/events/congres.png",
    link: idOf(event) ? `/news/events/${idOf(event)}` : "/news/events",
    category: isUpcoming(event.date) ? "À venir" : "Événement",
  }));

  return {
    events,
    sliderEvents,
    articles,
    projects,
    calls,
    reports,
    partners,
  };
}

export default async function Home() {
  const {
    events,
    sliderEvents,
    articles,
    projects,
    calls,
    reports,
    partners,
  } = await getHomeData();

  const upcomingEvents = events.filter((event) => isUpcoming(event.date)).slice(0, 3);
  const latestEvents = events.slice(0, 3);

  return (
    <div className="overflow-hidden bg-white">
      {sliderEvents.length > 0 ? (
        <EventsHeroSlider items={sliderEvents} />
      ) : (
        <section className="relative min-h-[70vh] bg-gradient-primary text-white flex items-center">
          <div className="max-w-7xl mx-auto px-6 py-28">
            <div className="max-w-3xl">
              <div className="inline-flex items-center gap-3 text-sm font-semibold tracking-wider uppercase mb-6">
                <span className="w-10 h-1 bg-white rounded-full"></span>
                Quality & Research
              </div>

              <h1 className="font-display text-5xl md:text-7xl font-bold leading-tight mb-8">
                Excellence en Santé, Recherche et Innovation
              </h1>

              <p className="text-xl text-white/90 leading-relaxed mb-10">
                Une plateforme dédiée aux événements, projets, articles et
                ressources scientifiques autour de la qualité en santé.
              </p>

              <div className="flex flex-col sm:flex-row gap-4">
                <Link href="/news/events" className="btn btn-white text-base px-8 py-3">
                  Voir les événements
                </Link>
                <Link href="/news/articles" className="btn btn-outline border-white text-white hover:bg-white hover:text-primary text-base px-8 py-3">
                  Lire les articles
                </Link>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* DYNAMIC STATS */}
      <section className="py-12 bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <StatCard number={String(events.length)} label="Événements" />
            <StatCard number={String(articles.length)} label="Articles récents" />
            <StatCard number={String(projects.length)} label="Projets affichés" />
            <StatCard number={String(calls.length)} label="Appels ouverts" />
          </div>
        </div>
      </section>

      {/* MISSION */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <div className="inline-block text-primary text-sm font-semibold tracking-wider uppercase mb-3">
                Notre Mission
              </div>

              <h2 className="font-display text-4xl md:text-5xl font-bold text-gray-900 mb-6">
                Une Vision Claire pour la Santé de Demain
              </h2>

              <p className="text-xl text-gray-600 leading-relaxed mb-8">
                Nous travaillons à créer un écosystème de santé plus efficace,
                accessible et innovant grâce à la recherche scientifique,
                l’amélioration continue de la qualité et le partage des savoirs.
              </p>

              <div className="flex flex-col sm:flex-row gap-4">
                <Link href="/about/who-we-are" className="btn btn-primary px-8 py-3">
                  Qui sommes-nous ?
                </Link>
                <Link href="/projects" className="btn btn-outline px-8 py-3">
                  Nos projets
                </Link>
              </div>
            </div>

            <div className="grid sm:grid-cols-2 gap-6">
              <FeatureMini icon="🔬" title="Recherche" />
              <FeatureMini icon="⚕️" title="Qualité des soins" />
              <FeatureMini icon="🎓" title="Formation" />
              <FeatureMini icon="🤝" title="Collaboration" />
            </div>
          </div>
        </div>
      </section>

      {/* ARTICLES + EVENTS */}
      <section className="py-24 bg-gradient-soft">
        <div className="max-w-7xl mx-auto px-6">
          <SectionHeader
            eyebrow="Actualités"
            title="Dernières publications et événements"
            description="Retrouvez les dernières informations publiées depuis l’administration."
            link="/news/articles"
            linkLabel="Tous les articles"
          />

          <div className="grid lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <div className="grid md:grid-cols-2 gap-8">
                {articles.length > 0 ? (
                  articles.map((article) => (
                    <ArticleCard key={idOf(article)} article={article} />
                  ))
                ) : (
                  <EmptyCard title="Aucun article" text="Les articles publiés apparaîtront ici." />
                )}
              </div>
            </div>

            <div className="space-y-4">
              <div className="bg-white rounded-3xl p-8 shadow-custom-md border border-gray-100">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="font-display text-2xl font-bold text-gray-900">
                    Agenda
                  </h3>
                  <Link href="/news/events" className="text-primary font-semibold text-sm">
                    Voir tout
                  </Link>
                </div>

                <div className="space-y-4">
                  {(upcomingEvents.length > 0 ? upcomingEvents : latestEvents).map((event) => (
                    <SmallEventCard key={idOf(event)} event={event} />
                  ))}

                  {events.length === 0 && (
                    <p className="text-gray-500">
                      Aucun événement publié pour le moment.
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* PROJECTS */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <SectionHeader
            eyebrow="Projets"
            title="Projets et collaborations"
            description="Découvrez les initiatives de recherche et les collaborations portées par Quality & Research."
            link="/projects"
            linkLabel="Tous les projets"
          />

          <div className="grid md:grid-cols-3 gap-8">
            {projects.length > 0 ? (
              projects.map((project) => (
                <ProjectCard key={idOf(project)} project={project} />
              ))
            ) : (
              <EmptyCard title="Aucun projet" text="Les projets publiés apparaîtront ici." />
            )}
          </div>
        </div>
      </section>

      {/* CALLS + REPORTS */}
      <section className="py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid lg:grid-cols-2 gap-8">
            <div className="bg-white rounded-3xl p-8 shadow-custom-md border border-gray-100">
              <div className="flex items-center justify-between mb-8">
                <div>
                  <div className="text-primary text-sm font-semibold tracking-wider uppercase mb-2">
                    Opportunités
                  </div>
                  <h2 className="font-display text-3xl font-bold text-gray-900">
                    Appels ouverts
                  </h2>
                </div>

                <Link href="/news/appel-a-candidatures" className="text-primary font-semibold text-sm">
                  Voir tout
                </Link>
              </div>

              <div className="space-y-4">
                {calls.length > 0 ? (
                  calls.map((call) => <CallCard key={idOf(call)} call={call} />)
                ) : (
                  <p className="text-gray-500">Aucun appel ouvert pour le moment.</p>
                )}
              </div>
            </div>

            <div className="bg-white rounded-3xl p-8 shadow-custom-md border border-gray-100">
              <div className="flex items-center justify-between mb-8">
                <div>
                  <div className="text-primary text-sm font-semibold tracking-wider uppercase mb-2">
                    Transparence
                  </div>
                  <h2 className="font-display text-3xl font-bold text-gray-900">
                    Rapports récents
                  </h2>
                </div>

                <Link href="/about/rapport-activite" className="text-primary font-semibold text-sm">
                  Voir tout
                </Link>
              </div>

              <div className="space-y-4">
                {reports.length > 0 ? (
                  reports.map((report) => <ReportCard key={idOf(report)} report={report} />)
                ) : (
                  <p className="text-gray-500">Aucun rapport publié pour le moment.</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* PARTNERS */}
      {partners.length > 0 && (
        <section className="py-20 bg-white">
          <div className="max-w-7xl mx-auto px-6">
            <SectionHeader
              eyebrow="Réseau"
              title="Nos partenaires"
              description="Des institutions et organisations qui accompagnent notre mission."
              link="/about/partners"
              linkLabel="Tous les partenaires"
            />

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
              {partners.map((partner) => (
                <PartnerCard key={idOf(partner)} partner={partner} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* CTA */}
      <section className="relative py-24 bg-gradient-primary text-white overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-white opacity-5 rounded-full -mr-48 -mt-48"></div>
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-white opacity-5 rounded-full -ml-40 -mb-40"></div>

        <div className="max-w-4xl mx-auto px-6 text-center relative z-10">
          <h2 className="font-display text-4xl md:text-5xl font-bold mb-6">
            Rejoignez Notre Communauté
          </h2>

          <p className="text-xl text-white/90 mb-10 leading-relaxed">
            Participez à nos événements, contribuez à nos projets de recherche
            et faites partie d’un réseau de professionnels engagés pour
            l’amélioration de la santé.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/register" className="btn btn-white text-base px-8 py-3">
              Devenir Membre
            </Link>
            <Link href="/contact" className="btn btn-outline border-white text-white hover:bg-white hover:text-primary text-base px-8 py-3">
              Nous Contacter
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}

function StatCard({ number, label }: { number: string; label: string }) {
  return (
    <div className="bg-lightgreen rounded-2xl p-6 text-center border border-primary/10">
      <div className="font-display text-4xl font-bold text-primary mb-2">
        {number}
      </div>
      <div className="text-sm text-gray-600 font-medium">
        {label}
      </div>
    </div>
  );
}

function FeatureMini({ icon, title }: { icon: string; title: string }) {
  return (
    <div className="bg-white rounded-2xl p-8 shadow-custom-md border border-gray-100 hover:-translate-y-1 transition-all">
      <div className="w-14 h-14 rounded-2xl bg-lightgreen flex items-center justify-center text-3xl mb-6">
        {icon}
      </div>
      <h3 className="font-display text-xl font-bold text-gray-900">
        {title}
      </h3>
    </div>
  );
}

function SectionHeader({
  eyebrow,
  title,
  description,
  link,
  linkLabel,
}: {
  eyebrow: string;
  title: string;
  description: string;
  link: string;
  linkLabel: string;
}) {
  return (
    <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6 mb-12">
      <div className="max-w-3xl">
        <div className="inline-block text-primary text-sm font-semibold tracking-wider uppercase mb-3">
          {eyebrow}
        </div>
        <h2 className="font-display text-4xl md:text-5xl font-bold text-gray-900 mb-4">
          {title}
        </h2>
        <p className="text-lg text-gray-600 leading-relaxed">
          {description}
        </p>
      </div>

      <Link href={link} className="btn btn-outline px-6 py-3 w-fit">
        {linkLabel}
      </Link>
    </div>
  );
}

function ArticleCard({ article }: { article: DbItem }) {
  const id = idOf(article);

  return (
    <Link
      href={id ? `/news/articles/${id}` : "/news/articles"}
      className="group bg-white rounded-3xl overflow-hidden shadow-custom-md hover:shadow-custom-xl transition-all duration-300 hover:-translate-y-2 border border-gray-100"
    >
      {article.image ? (
        <div className="h-56 bg-gray-100 overflow-hidden">
          <img
            src={article.image}
            alt={article.titre || "Article"}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        </div>
      ) : (
        <div className="h-56 bg-lightgreen flex items-center justify-center text-6xl">
          📰
        </div>
      )}

      <div className="p-8">
        <div className="text-sm text-gray-500 mb-3">
          {formatDate(article.createdAt)}
        </div>

        <h3 className="font-display text-2xl font-bold text-gray-900 mb-4 group-hover:text-primary transition-colors">
          {article.titre || "Article"}
        </h3>

        <p className="text-gray-600 leading-relaxed mb-6 line-clamp-3">
          {excerpt(article.contenu || article.excerpt, 170)}
        </p>

        <div className="text-primary font-semibold">
          Lire l’article →
        </div>
      </div>
    </Link>
  );
}

function SmallEventCard({ event }: { event: DbItem }) {
  const id = idOf(event);

  return (
    <Link
      href={id ? `/news/events/${id}` : "/news/events"}
      className="block p-5 rounded-2xl border border-gray-100 hover:border-primary/30 hover:bg-lightgreen/40 transition-all"
    >
      <div className="flex gap-4">
        <div className="w-16 h-16 rounded-2xl bg-lightgreen flex items-center justify-center text-primary font-bold shrink-0">
          {toDate(event.date)?.getDate() || "📅"}
        </div>

        <div>
          <h4 className="font-bold text-gray-900 mb-1">
            {event.titre || "Événement"}
          </h4>
          <p className="text-sm text-gray-500 mb-1">
            {formatDate(event.date)}
          </p>
          {event.lieu && (
            <p className="text-sm text-gray-500">
              📍 {event.lieu}
            </p>
          )}
        </div>
      </div>
    </Link>
  );
}

function ProjectCard({ project }: { project: DbItem }) {
  const id = idOf(project);
  const status = project.status || "active";

  const statusLabel: Record<string, string> = {
    active: "En cours",
    planned: "Planifié",
    completed: "Terminé",
    archived: "Archivé",
  };

  return (
    <Link
      href={id ? `/projects/${id}` : "/projects"}
      className="group bg-white rounded-3xl p-8 shadow-custom-md hover:shadow-custom-xl transition-all duration-300 hover:-translate-y-2 border border-gray-100"
    >
      <div className="flex items-center justify-between mb-6">
        <span className="px-3 py-1 rounded-full bg-lightgreen text-primary text-xs font-semibold">
          {statusLabel[status] || "Projet"}
        </span>
        <span className="text-3xl">🔬</span>
      </div>

      <h3 className="font-display text-2xl font-bold text-gray-900 mb-4 group-hover:text-primary transition-colors">
        {project.title || "Projet"}
      </h3>

      <p className="text-gray-600 leading-relaxed mb-6 line-clamp-3">
        {excerpt(project.description || project.excerpt, 180)}
      </p>

      {project.startDate && (
        <div className="text-sm text-gray-500 mb-6">
          Début : {formatDate(project.startDate)}
        </div>
      )}

      <div className="text-primary font-semibold">
        Voir le projet →
      </div>
    </Link>
  );
}

function CallCard({ call }: { call: DbItem }) {
  const id = idOf(call);
  const href = call.link || (id ? `/news/appel-a-candidatures/${id}` : "/news/appel-a-candidatures");

  return (
    <Link
      href={href}
      className="block p-5 rounded-2xl border border-gray-100 hover:border-primary/30 hover:bg-lightgreen/40 transition-all"
    >
      <div className="flex items-center gap-2 mb-2">
        <span className="px-3 py-1 rounded-full bg-green-50 text-primary text-xs font-semibold">
          Ouvert
        </span>
        {call.type && (
          <span className="px-3 py-1 rounded-full bg-gray-100 text-gray-600 text-xs font-semibold">
            {call.type}
          </span>
        )}
      </div>

      <h3 className="font-bold text-gray-900 mb-2">
        {call.title || "Appel"}
      </h3>

      {call.description && (
        <p className="text-sm text-gray-600 line-clamp-2 mb-3">
          {excerpt(call.description, 120)}
        </p>
      )}

      {call.deadline && (
        <p className="text-sm text-gray-500">
          Date limite : {formatDate(call.deadline)}
        </p>
      )}
    </Link>
  );
}

function ReportCard({ report }: { report: DbItem }) {
  return (
    <Link
      href={report.fileUrl || "/about/rapport-activite"}
      className="block p-5 rounded-2xl border border-gray-100 hover:border-primary/30 hover:bg-lightgreen/40 transition-all"
    >
      <div className="flex items-center justify-between gap-4">
        <div>
          <h3 className="font-bold text-gray-900 mb-2">
            {report.title || "Rapport"}
          </h3>

          <p className="text-sm text-gray-500">
            {report.type || "rapport"} {report.year ? `• ${report.year}` : ""}
          </p>
        </div>

        <span className="text-2xl">📄</span>
      </div>
    </Link>
  );
}

function PartnerCard({ partner }: { partner: DbItem }) {
  const content = (
    <div className="h-28 rounded-2xl bg-white border border-gray-100 shadow-custom-sm flex items-center justify-center p-4 hover:shadow-custom-md transition-all">
      {partner.logo ? (
        <img
          src={partner.logo}
          alt={partner.name || "Partenaire"}
          className="max-h-14 max-w-full object-contain"
        />
      ) : (
        <span className="text-center font-semibold text-gray-700">
          {partner.name || "Partenaire"}
        </span>
      )}
    </div>
  );

  if (partner.website) {
    return (
      <a href={partner.website} target="_blank" rel="noreferrer">
        {content}
      </a>
    );
  }

  return content;
}

function EmptyCard({ title, text }: { title: string; text: string }) {
  return (
    <div className="bg-white rounded-3xl p-8 border border-gray-100 shadow-custom-md">
      <div className="text-5xl mb-6">📌</div>
      <h3 className="font-display text-2xl font-bold text-gray-900 mb-3">
        {title}
      </h3>
      <p className="text-gray-500">
        {text}
      </p>
    </div>
  );
}