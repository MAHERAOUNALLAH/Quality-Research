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
  } catch {
    return [];
  }
}

const statusColors: Record<string, { bg: string; text: string; dot: string; label: string }> = {
  active:    { bg: "bg-green-50",  text: "text-green-700",  dot: "bg-green-500",  label: "En cours" },
  planned:   { bg: "bg-blue-50",   text: "text-blue-700",   dot: "bg-blue-400",   label: "Planifié" },
  completed: { bg: "bg-gray-100",  text: "text-gray-600",   dot: "bg-gray-400",   label: "Terminé" },
  archived:  { bg: "bg-gray-100",  text: "text-gray-500",   dot: "bg-gray-300",   label: "Archivé" },
};

export default async function ProjectsPage() {
  const projects = await getProjects();
  const active = projects.filter((p) => p.status === "active" || p.status === "planned" || !p.status);
  const other = projects.filter((p) => p.status && p.status !== "active" && p.status !== "planned");

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b border-gray-100">
        <div className="mx-auto max-w-7xl px-6 py-16">
          <p className="text-sm font-semibold uppercase tracking-wider text-primary">Notre travail</p>
          <h1 className="mt-2 text-4xl font-bold text-gray-900 md:text-5xl">Projets &amp; Collaboration</h1>
          <p className="mt-4 max-w-2xl text-gray-600">
            Découvrez les projets de recherche et les collaborations portés par Quality &amp; Research.
          </p>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-6 py-12 space-y-14">
        {projects.length === 0 && (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-lightgreen">
              <svg className="h-8 w-8 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                  d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-900">Aucun projet pour le moment</h3>
          </div>
        )}

        {active.length > 0 && (
          <section>
            <h2 className="mb-6 flex items-center gap-3 text-2xl font-bold text-gray-900">
              <span className="inline-block h-3 w-3 rounded-full bg-green-500 animate-pulse" />
              Projets en cours
            </h2>
            <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
              {active.map((p) => <ProjectCard key={p._id} project={p} />)}
            </div>
          </section>
        )}

        {other.length > 0 && (
          <section>
            <h2 className="mb-6 text-2xl font-bold text-gray-900">Autres projets</h2>
            <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3 opacity-80">
              {other.map((p) => <ProjectCard key={p._id} project={p} />)}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}

function ProjectCard({ project }: { project: Project }) {
  const status = statusColors[project.status || "active"] ?? statusColors.active;
  const desc = project.excerpt || project.description || "";

  return (
    <Link
      href={`/projects/${project._id}`}
      className="group flex flex-col rounded-2xl border border-gray-100 bg-white shadow-sm transition hover:shadow-lg hover:-translate-y-0.5"
    >
      {project.image ? (
        <div className="h-40 w-full overflow-hidden rounded-t-2xl">
          <img src={project.image} alt={project.title} className="h-full w-full object-cover transition group-hover:scale-105" />
        </div>
      ) : (
        <div className="h-1.5 w-full rounded-t-2xl bg-gradient-to-r from-primary to-green-400" />
      )}
      <div className="flex flex-1 flex-col p-6">
        <div className="mb-3 flex flex-wrap gap-2">
          <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold ${status.bg} ${status.text}`}>
            <span className={`h-1.5 w-1.5 rounded-full ${status.dot}`} />
            {status.label}
          </span>
        </div>
        <h2 className="mb-3 text-xl font-bold text-gray-900 group-hover:text-primary transition-colors leading-snug">
          {project.title}
        </h2>
        {desc && (
          <p className="flex-1 text-sm leading-relaxed text-gray-600">
            {desc.length > 180 ? desc.slice(0, 180) + "…" : desc}
          </p>
        )}
        <div className="mt-5 space-y-1 border-t border-gray-50 pt-4">
          {project.startDate && (
            <p className="text-xs text-gray-400">
              Début : {new Date(project.startDate).toLocaleDateString("fr-FR", { month: "long", year: "numeric" })}
            </p>
          )}
          {project.members && project.members.length > 0 && (
            <p className="text-xs text-gray-400">{project.members.length} membre{project.members.length > 1 ? "s" : ""}</p>
          )}
          <p className="text-xs font-medium text-primary group-hover:underline pt-1">Voir le projet →</p>
        </div>
      </div>
    </Link>
  );
}
