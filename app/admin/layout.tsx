import { ReactNode } from "react";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { ObjectId } from "mongodb";
import Link from "next/link";
import { verifyToken } from "@/lib/auth";
import { getDb } from "@/lib/mongodb";

const NAV_LINKS = [
  { href: "/admin",             label: "Dashboard",    icon: "📊" },
  { href: "/admin/categories",  label: "Catégories",   icon: "📂" },
  { href: "/admin/events",      label: "Événements",   icon: "📅" },
  { href: "/admin/articles",    label: "Articles",     icon: "📰" },
  { href: "/admin/messages",    label: "Messages",     icon: "✉️"  },
  { href: "/admin/calls",       label: "Appels",       icon: "📣" },
  { href: "/admin/projects",    label: "Projets",      icon: "🔬" },
  { href: "/admin/team",        label: "Équipe",       icon: "👥" },
  { href: "/admin/partners",    label: "Partenaires",  icon: "🤝" },
  { href: "/admin/resources",   label: "Ressources",   icon: "📚" },
  { href: "/admin/formations",  label: "Formations",   icon: "🎓" },
];

export default async function AdminLayout({ children }: { children: ReactNode }) {
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;
  if (!token) redirect("/login");

  try {
    const payload = await verifyToken(token);
    const db = await getDb();
    const user = await db.collection("users").findOne({ _id: new ObjectId(payload.sub) });
    if (!user || (user.role !== "admin" && user.role !== "superadmin")) redirect("/");

    return (
      <div className="flex min-h-screen">
        <aside className="w-56 flex-shrink-0 bg-[#1e1e2e] text-white flex flex-col">
          <div className="p-5 border-b border-white/10">
            <div className="text-base font-bold text-violet-400">Admin Panel</div>
            <div className="text-xs text-slate-400 mt-0.5 truncate">{user.email}</div>
          </div>
          <nav className="flex-1 overflow-y-auto py-3 px-2 space-y-0.5">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-slate-300 hover:bg-white/10 hover:text-white transition"
              >
                <span className="text-base">{link.icon}</span>
                {link.label}
              </Link>
            ))}
          </nav>
          <div className="p-4 border-t border-white/10">
            <Link
              href="/"
              className="flex items-center gap-2 text-xs text-slate-400 hover:text-white transition py-1"
            >
              ← Voir le site
            </Link>
          </div>
        </aside>
        <main className="flex-1 bg-gray-50 overflow-y-auto p-8">
          {children}
        </main>
      </div>
    );
  } catch {
    redirect("/login");
  }
}
