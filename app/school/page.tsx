import { getDb } from "@/lib/mongodb";

export const dynamic = "force-dynamic";
export const revalidate = 0;

type Resource = {
  _id: string;
  title: string;
  category: string;
  type: string;
  fileUrl: string;
  externalUrl: string;
  size: string;
  published: boolean;
  createdAt?: string;
};

function normalizeResource(doc: any): Resource {
  return {
    _id: String(doc._id),
    title: doc.title || "",
    category: doc.category || "Général",
    type: doc.type || "autre",
    fileUrl: doc.fileUrl || "",
    externalUrl: doc.externalUrl || "",
    size: doc.size || "",
    published: doc.published !== false,
    createdAt:
      doc.createdAt instanceof Date
        ? doc.createdAt.toISOString()
        : String(doc.createdAt || ""),
  };
}

async function getResources(): Promise<Resource[]> {
  try {
    const db = await getDb();

    const docs = await db
      .collection("resources")
      .find({
        $or: [{ published: true }, { published: { $exists: false } }],
      })
      .sort({ category: 1, createdAt: -1 })
      .toArray();

    return docs.map(normalizeResource);
  } catch (error) {
    console.error("Failed to load school resources from MongoDB:", error);
    return [];
  }
}

const typeIcons: Record<string, { icon: string; color: string; label: string }> = {
  pdf: {
    icon: "📄",
    color: "bg-red-50 text-red-700",
    label: "PDF",
  },
  docx: {
    icon: "📝",
    color: "bg-blue-50 text-blue-700",
    label: "Word",
  },
  link: {
    icon: "🔗",
    color: "bg-purple-50 text-purple-700",
    label: "Lien",
  },
  video: {
    icon: "🎬",
    color: "bg-amber-50 text-amber-700",
    label: "Vidéo",
  },
  autre: {
    icon: "📁",
    color: "bg-gray-100 text-gray-600",
    label: "Fichier",
  },
};

export default async function SchoolPage() {
  const resources = await getResources();

  const categories = Array.from(
    new Set(resources.map((resource) => resource.category).filter(Boolean))
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b border-gray-100">
        <div className="mx-auto max-w-7xl px-6 py-16">
          <p className="text-sm font-semibold uppercase tracking-wider text-primary">
            School
          </p>

          <h1 className="mt-2 text-4xl font-bold text-gray-900 md:text-5xl">
            Centre de ressources
          </h1>

          <p className="mt-4 max-w-2xl text-gray-600">
            Guides, outils, templates et liens utiles pour la recherche et la
            qualité en santé.
          </p>

          {resources.length > 0 && (
            <div className="mt-6 flex items-center gap-2 text-sm text-gray-400">
              <span className="h-2 w-2 rounded-full bg-primary" />
              {resources.length} ressource{resources.length !== 1 ? "s" : ""}{" "}
              disponible{resources.length !== 1 ? "s" : ""}
            </div>
          )}
        </div>
      </div>

      <div className="mx-auto max-w-6xl px-6 py-14">
        {resources.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-lightgreen text-3xl">
              📚
            </div>

            <h3 className="text-lg font-semibold text-gray-900">
              Aucune ressource disponible
            </h3>

            <p className="mt-1 text-sm text-gray-500">
              Les ressources publiées apparaîtront ici.
            </p>
          </div>
        ) : (
          <div className="space-y-12">
            {(categories.length > 0 ? categories : ["Général"]).map(
              (category) => {
                const group = resources.filter(
                  (resource) => resource.category === category
                );

                if (group.length === 0) return null;

                return (
                  <section key={category}>
                    <h2 className="mb-5 text-xl font-bold text-gray-900 flex items-center gap-3">
                      <span className="h-1 w-8 rounded-full bg-primary inline-block" />
                      {category}
                    </h2>

                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                      {group.map((resource) => {
                        const meta = typeIcons[resource.type] || typeIcons.autre;

                        const href =
                          resource.type === "link"
                            ? resource.externalUrl
                            : resource.fileUrl;

                        const isExternal =
                          resource.type === "link" ||
                          Boolean(resource.externalUrl);

                        if (!href) {
                          return (
                            <div
                              key={resource._id}
                              className="group flex items-start gap-4 rounded-2xl border border-gray-100 bg-white p-5 shadow-sm opacity-70"
                            >
                              <div
                                className={`flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl text-2xl ${meta.color}`}
                              >
                                {meta.icon}
                              </div>

                              <div className="flex-1 min-w-0">
                                <p className="font-semibold text-gray-900 leading-snug">
                                  {resource.title}
                                </p>

                                <div className="mt-1 flex items-center gap-2">
                                  <span
                                    className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${meta.color}`}
                                  >
                                    {meta.label}
                                  </span>

                                  <span className="text-xs text-gray-400 italic">
                                    Lien non disponible
                                  </span>
                                </div>
                              </div>
                            </div>
                          );
                        }

                        return (
                          <a
                            key={resource._id}
                            href={href}
                            target={isExternal ? "_blank" : undefined}
                            rel={isExternal ? "noopener noreferrer" : undefined}
                            download={
                              resource.type !== "link" && resource.fileUrl
                                ? true
                                : undefined
                            }
                            className="group flex items-start gap-4 rounded-2xl border border-gray-100 bg-white p-5 shadow-sm transition hover:shadow-md hover:border-primary/30"
                          >
                            <div
                              className={`flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl text-2xl ${meta.color}`}
                            >
                              {meta.icon}
                            </div>

                            <div className="flex-1 min-w-0">
                              <p className="font-semibold text-gray-900 group-hover:text-primary transition-colors leading-snug">
                                {resource.title}
                              </p>

                              <div className="mt-1 flex items-center gap-2">
                                <span
                                  className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${meta.color}`}
                                >
                                  {meta.label}
                                </span>

                                {resource.size && (
                                  <span className="text-xs text-gray-400">
                                    {resource.size}
                                  </span>
                                )}
                              </div>
                            </div>

                            <svg
                              className="h-5 w-5 text-gray-300 group-hover:text-primary transition-colors flex-shrink-0 mt-1"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                              />
                            </svg>
                          </a>
                        );
                      })}
                    </div>
                  </section>
                );
              }
            )}
          </div>
        )}
      </div>
    </div>
  );
}