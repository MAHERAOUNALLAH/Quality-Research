import Link from "next/link";

type Project = {
  _id: string;
  title: string;
  excerpt?: string;
  description?: string;
  status?: string;
  startDate?: string;
  endDate?: string;
  members?: string[];
  image?: string;
  createdAt: string;
};

async function getProjects(): Promise<Project[]> {
  try {
    const baseUrl =
      process.env.NEXT_PUBLIC_BASE_URL ||
      (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "http://localhost:3000");
    const res = await fetch(`${baseUrl}/api/projects`, { cache: "no-store" });
    const data = await res.json();
    return Array.isArray(data) ? data : data.items || [];
  } catch { return []; }
}

const STATUS_MAP: Record<string, { bg: string; text: string; dot: string; ring: string; label: string }> = {
  active:    { bg: "bg-green-50",  text: "text-green-700",  dot: "bg-green-500",  ring: "border-green-100", label: "En cours" },
  planned:   { bg: "bg-blue-50",   text: "text-blue-700",   dot: "bg-blue-400",   ring: "border-blue-100",  label: "Planifié" },
  completed: { bg: "bg-gray-100",  text: "text-gray-600",   dot: "bg-gray-400",   ring: "border-gray-100",  label: "Terminé" },
  archived:  { bg: "bg-gray-100",  text: "text-gray-500",   dot: "bg-gray-300",   ring: "border-gray-100",  label: "Archivé" },
};

export default async function ProjectsPage() {
  const projects = await getProjects();
  const active = projects.filter((p) => !p.status || p.status === "active" || p.status === "planned");
  const other  = projects.filter((p) => p.status && p.status !== "active" && p.status !== "planned");

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero */}
      <div className="relative overflow-hidden bg-white border-b border-gray-100">
        <div className="absolute inset-0 bg-gradient-to-br from-lightgreen via-white to-white pointer-events-none" />
        <div className="relative mx-auto max-w-7xl px-6 py-20">
          <div className="flex items-center gap-2 mb-4">
            <span className="h-1 w-8 rounded-full bg-primary" />
            <p className="text-sm font-semibold uppercase tracking-widest text-primary">Notre travail</p>
          </div>
          <h1 className="text-4xl font-bold text-gray-900 md:text-5xl lg:text-6xl leading-tight">
            Projets &amp; <br className="hidden sm:block" />
            <span className="text-primary">Collaborations</span>
          </h1>
          <p className="mt-5 max-w-2xl text-lg text-gray-500 leading-relaxed">
            Découvrez les projets de recherche et les collaborations internationales portés par Quality &amp; Research.
          </p>
          <div className="mt-6 flex flex-wrap gap-4 text-sm text-gray-400">
            {active.length > 0 && (
              <span className="flex items-center gap-1.5">
                <span className="h-2 w-2 animate-pulse rounded-full bg-green-500" />
                {active.length} projet{active.length !== 1 ? "s" : ""} actif{active.length !== 1 ? "s" : ""}
              </span>
            )}
            {other.length > 0 && (
              <span className="flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-gray-300" />
                {other.length} terminé{other.length !== 1 ? "s" : ""}
              </span>
            )}
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-6 py-14 space-y-16">
        {projects.length === 0 && (
          <div className="flex flex-col items-center justify-center py-28 text-center">
            <div className="mb-5 flex h-20 w-20 items-center justify-center rounded-2xl bg-lightgreen shadow-sm">
              <svg className="h-10 w-10 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-gray-900">Aucun projet pour le moment</h3>
            <p className="mt-2 text-gray-500">Les projets publiés apparaîtront ici.</p>
          </div>
        )}

        {active.length > 0 && (
          <section>
            <div className="flex items-center gap-3 mb-8">
              <span className="inline-block h-3 w-3 rounded-full bg-green-500 animate-pulse" />
              <h2 className="text-2xl font-bold text-gray-900">Projets actifs</h2>
              <span className="rounded-full bg-green-50 px-3 py-1 text-sm font-semibold text-green-700">{active.length}</span>
            </div>
            <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
              {active.map((p) => <ProjectCard key={p._id} project={p} />)}
            </div>
          </section>
        )}

        {other.length > 0 && (
          <section>
            <div className="flex items-center gap-3 mb-8">
              <h2 className="text-2xl font-bold text-gray-900">Projets terminés</h2>
              <span className="rounded-full bg-gray-100 px-3 py-1 text-sm font-medium text-gray-500">{other.length}</span>
            </div>
            <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3 opacity-75">
              {other.map((p) => <ProjectCard key={p._id} project={p} />)}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}

function ProjectCard({ project }: { project: Project }) {
  const s = STATUS_MAP[project.status || "active"] ?? STATUS_MAP.active;
  const desc = project.excerpt || project.description || "";

  return (
    <Link
      href={`/projects/${project._id}`}
      className={`group flex flex-col rounded-2xl bg-white border shadow-sm overflow-hidden transition-all duration-300 hover:shadow-xl hover:-translate-y-1 ${s.ring}`}
    >
      {project.image ? (
        <div className="relative h-48 w-full overflow-hidden">
          <img src={project.image} alt={project.title} className="h-full w-full object-cover transition duration-500 group-hover:scale-105" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
          <div className="absolute top-3 left-3">
            <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold shadow-sm ${s.bg} ${s.text}`}>
              <span className={`h-1.5 w-1.5 rounded-full ${s.dot} ${project.status === "active" ? "animate-pulse" : ""}`} />
              {s.label}
            </span>
          </div>
        </div>
      ) : (
        <div className="h-2 w-full bg-gradient-to-r from-primary to-green-400" />
      )}

      <div className="flex flex-1 flex-col p-6">
        {!project.image && (
          <div className="mb-3">
            <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold ${s.bg} ${s.text}`}>
              <span className={`h-1.5 w-1.5 rounded-full ${s.dot} ${project.status === "active" ? "animate-pulse" : ""}`} />
              {s.label}
            </span>
          </div>
        )}

        <h2 className="mb-3 text-xl font-bold text-gray-900 group-hover:text-primary transition-colors leading-snug line-clamp-2">
          {project.title}
        </h2>

        {desc && (
          <p className="flex-1 text-sm leading-relaxed text-gray-500 line-clamp-3 mb-4">
            {desc}
          </p>
        )}

        <div className="mt-auto space-y-1.5 border-t border-gray-50 pt-4">
          {project.startDate && (
            <p className="flex items-center gap-1.5 text-xs text-gray-400">
              <svg className="h-3.5 w-3.5 text-primary flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              Début : {new Date(project.startDate).toLocaleDateString("fr-FR", { month: "long", year: "numeric" })}
            </p>
          )}
          {project.members && project.members.length > 0 && (
            <p className="flex items-center gap-1.5 text-xs text-gray-400">
              <svg className="h-3.5 w-3.5 text-primary flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              {project.members.length} membre{project.members.length > 1 ? "s" : ""}
            </p>
          )}
          <div className="pt-1 flex items-center gap-1 text-xs font-semibold text-primary group-hover:gap-2 transition-all">
            Voir le projet
            <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </div>
        </div>
      </div>
    </Link>
  );
}
