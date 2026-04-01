import Link from "next/link";
import { notFound } from "next/navigation";

type Project = {
  _id: string;
  title: string;
  description?: string;
  excerpt?: string;
  image?: string;
  status?: string;
  startDate?: string;
  endDate?: string;
  members?: string[];
  createdAt: string;
  updatedAt?: string;
};

async function getProject(id: string): Promise<Project | null> {
  try {
    const baseUrl =
      process.env.NEXT_PUBLIC_BASE_URL ||
      (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "http://localhost:3000");
    const res = await fetch(`${baseUrl}/api/projects/${id}`, { cache: "no-store" });
    if (!res.ok) return null;
    const data = await res.json();
    return data.item || null;
  } catch {
    return null;
  }
}

async function getRelatedProjects(currentId: string): Promise<Project[]> {
  try {
    const baseUrl =
      process.env.NEXT_PUBLIC_BASE_URL ||
      (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "http://localhost:3000");
    const res = await fetch(`${baseUrl}/api/projects`, { cache: "no-store" });
    const data = await res.json();
    const all: Project[] = Array.isArray(data) ? data : data.items || [];
    return all.filter((p) => p._id !== currentId).slice(0, 3);
  } catch {
    return [];
  }
}

const statusConfig: Record<string, { bg: string; text: string; dot: string; label: string }> = {
  active:    { bg: "bg-green-50",  text: "text-green-700",  dot: "bg-green-500",  label: "En cours" },
  planned:   { bg: "bg-blue-50",   text: "text-blue-700",   dot: "bg-blue-500",   label: "Planifié" },
  completed: { bg: "bg-gray-100",  text: "text-gray-600",   dot: "bg-gray-400",   label: "Terminé" },
  archived:  { bg: "bg-gray-100",  text: "text-gray-500",   dot: "bg-gray-300",   label: "Archivé" },
};

export default async function ProjectDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const project = await getProject(id);
  if (!project) notFound();

  const related = await getRelatedProjects(id);
  const status = statusConfig[project.status || "active"] ?? statusConfig.active;
  const paragraphs = (project.description || "").split(/\n+/).filter(Boolean);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero */}
      <div className="bg-white border-b border-gray-100">
        {project.image && (
          <div className="h-72 w-full overflow-hidden md:h-80">
            <img src={project.image} alt={project.title} className="h-full w-full object-cover" />
          </div>
        )}
        <div className="mx-auto max-w-4xl px-6 py-10">
          {/* Breadcrumb */}
          <nav className="mb-5 flex items-center gap-2 text-sm text-gray-500">
            <Link href="/" className="hover:text-primary transition-colors">Accueil</Link>
            <span>/</span>
            <Link href="/projects" className="hover:text-primary transition-colors">Projets</Link>
            <span>/</span>
            <span className="text-gray-700 truncate max-w-xs">{project.title}</span>
          </nav>

          <div className="mb-4 flex flex-wrap gap-2">
            <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold ${status.bg} ${status.text}`}>
              <span className={`h-2 w-2 rounded-full ${status.dot} ${project.status === "active" ? "animate-pulse" : ""}`} />
              {status.label}
            </span>
          </div>

          <h1 className="text-3xl font-bold text-gray-900 leading-snug md:text-4xl">{project.title}</h1>

          {project.excerpt && (
            <p className="mt-4 text-lg text-gray-600 leading-relaxed border-l-4 border-primary pl-4">
              {project.excerpt}
            </p>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="mx-auto max-w-4xl px-6 py-10">
        <div className="grid gap-10 lg:grid-cols-[1fr_280px]">
          {/* Main */}
          <article className="rounded-2xl bg-white border border-gray-100 p-8 shadow-sm">
            <h2 className="text-xl font-bold text-gray-900 mb-5">À propos du projet</h2>
            {paragraphs.length > 0 ? (
              <div className="space-y-4">
                {paragraphs.map((p, i) => (
                  <p key={i} className="text-gray-700 leading-relaxed text-base">{p}</p>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 italic">Aucune description disponible.</p>
            )}

            {/* Members */}
            {project.members && project.members.length > 0 && (
              <div className="mt-8 border-t border-gray-100 pt-6">
                <h3 className="text-base font-bold text-gray-900 mb-4">Membres de l'équipe</h3>
                <div className="flex flex-wrap gap-2">
                  {project.members.map((member, i) => (
                    <span key={i}
                      className="rounded-full border border-gray-200 bg-gray-50 px-4 py-1.5 text-sm text-gray-700">
                      {member}
                    </span>
                  ))}
                </div>
              </div>
            )}

            <div className="mt-8 border-t border-gray-100 pt-6 flex items-center justify-between flex-wrap gap-4">
              <div className="text-sm text-gray-500">
                Un projet <span className="font-medium text-gray-700">Quality &amp; Research</span>
              </div>
              <Link href="/projects"
                className="rounded-xl border border-gray-200 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 transition">
                ← Retour aux projets
              </Link>
            </div>
          </article>

          {/* Sidebar */}
          <aside className="space-y-6">
            {/* Project info */}
            <div className="rounded-2xl bg-white border border-gray-100 p-5 shadow-sm">
              <h3 className="font-semibold text-gray-900 mb-4">Informations</h3>
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
                    <p className={`font-medium ${status.text}`}>{status.label}</p>
                  </div>
                </li>

                {project.startDate && (
                  <li className="flex items-start gap-3">
                    <div className="mt-0.5 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-lightgreen text-primary">
                      <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                          d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Début</p>
                      <p className="text-gray-800">
                        {new Date(project.startDate).toLocaleDateString("fr-FR", { month: "long", year: "numeric" })}
                      </p>
                    </div>
                  </li>
                )}

                {project.endDate && (
                  <li className="flex items-start gap-3">
                    <div className="mt-0.5 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-gray-100 text-gray-500">
                      <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                          d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Fin prévue</p>
                      <p className="text-gray-800">
                        {new Date(project.endDate).toLocaleDateString("fr-FR", { month: "long", year: "numeric" })}
                      </p>
                    </div>
                  </li>
                )}

                {project.members && project.members.length > 0 && (
                  <li className="flex items-start gap-3">
                    <div className="mt-0.5 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-lightgreen text-primary">
                      <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                          d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Équipe</p>
                      <p className="text-gray-800">{project.members.length} membre{project.members.length > 1 ? "s" : ""}</p>
                    </div>
                  </li>
                )}
              </ul>
            </div>

            {/* CTA */}
            <div className="rounded-2xl bg-primary p-5 text-white shadow-md">
              <h3 className="font-bold mb-2">Collaborer avec nous</h3>
              <p className="text-green-100 text-xs leading-relaxed mb-4">
                Vous souhaitez rejoindre ce projet ou en savoir plus sur nos collaborations ?
              </p>
              <Link href="/contact"
                className="block w-full rounded-xl bg-white py-2.5 text-center text-sm font-semibold text-primary hover:bg-green-50 transition">
                Nous contacter
              </Link>
            </div>

            {/* Related */}
            {related.length > 0 && (
              <div className="rounded-2xl bg-white border border-gray-100 p-5 shadow-sm">
                <h3 className="font-semibold text-gray-900 mb-4">Autres projets</h3>
                <div className="space-y-3">
                  {related.map((r) => {
                    const rStatus = statusConfig[r.status || "active"] ?? statusConfig.active;
                    return (
                      <Link key={r._id} href={`/projects/${r._id}`}
                        className="group block rounded-xl border border-gray-50 p-3 hover:border-primary/20 hover:bg-lightgreen/30 transition">
                        <div className="flex items-center gap-2 mb-1">
                          <span className={`h-2 w-2 rounded-full flex-shrink-0 ${rStatus.dot}`} />
                          <p className="text-sm font-medium text-gray-800 group-hover:text-primary transition-colors leading-snug line-clamp-2">
                            {r.title}
                          </p>
                        </div>
                        <p className="text-xs text-gray-400 ml-4">{rStatus.label}</p>
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
