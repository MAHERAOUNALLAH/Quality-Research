"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BookOpen,
  CalendarDays,
  ChevronRight,
  FileText,
  FlaskConical,
  FolderTree,
  GraduationCap,
  Handshake,
  Home,
  LayoutDashboard,
  LucideIcon,
  Mail,
  Megaphone,
  Newspaper,
  ShieldCheck,
  Users,
} from "lucide-react";

type NavLink = {
  href: string;
  label: string;
  icon: LucideIcon;
};

const NAV_LINKS: NavLink[] = [
  { href: "/admin", label: "Tableau de bord", icon: LayoutDashboard },
  { href: "/admin/categories", label: "Categories", icon: FolderTree },
  { href: "/admin/events", label: "Evenements", icon: CalendarDays },
  { href: "/admin/articles", label: "Articles", icon: Newspaper },
  { href: "/admin/messages", label: "Messages", icon: Mail },
  { href: "/admin/calls", label: "Appels", icon: Megaphone },
  { href: "/admin/projects", label: "Projets", icon: FlaskConical },
  { href: "/admin/team", label: "Equipe", icon: Users },
  { href: "/admin/partners", label: "Partenaires", icon: Handshake },
  { href: "/admin/resources", label: "Ressources", icon: BookOpen },
  { href: "/admin/formations", label: "Formations", icon: GraduationCap },
  { href: "/admin/reports", label: "Rapports", icon: FileText },
];

function isActive(pathname: string, href: string) {
  if (href === "/admin") return pathname === href;
  return pathname === href || pathname.startsWith(`${href}/`);
}

export default function AdminSidebar({
  email,
  role,
}: {
  email: string;
  role?: string;
}) {
  const pathname = usePathname();

  return (
    <aside className="sticky top-0 flex h-screen w-72 flex-shrink-0 flex-col border-r border-green-100 bg-white text-gray-900 shadow-[12px_0_35px_rgba(22,163,74,0.08)]">
      <div className="relative overflow-hidden border-b border-green-100 px-5 py-6">
        <div className="absolute inset-x-0 top-0 h-1 bg-gradient-primary" />
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary text-white shadow-lg shadow-green-100">
            <ShieldCheck className="h-6 w-6" aria-hidden="true" />
          </div>
          <div className="min-w-0">
            <div className="text-xl font-bold tracking-tight text-gray-950">
              Espace Admin
            </div>
            <div className="mt-1 truncate text-sm font-medium text-gray-600">
              {email}
            </div>
          </div>
        </div>

        <div className="mt-5 inline-flex items-center rounded-full border border-green-100 bg-lightgreen px-3 py-1 text-xs font-bold uppercase tracking-wide text-primary">
          {role || "admin"}
        </div>
      </div>

      <nav className="flex-1 overflow-y-auto px-3 py-5">
        <div className="space-y-1">
          {NAV_LINKS.map((link) => {
            const Icon = link.icon;
            const active = isActive(pathname, link.href);

            return (
              <Link
                key={link.href}
                href={link.href}
                className={[
                  "group relative flex min-h-11 items-center gap-3 rounded-2xl px-3 py-2.5 text-base font-bold transition-all",
                  active
                    ? "bg-primary text-white shadow-lg shadow-green-100"
                    : "text-gray-800 hover:bg-lightgreen hover:text-primary",
                ].join(" ")}
              >
                <span
                  className={[
                    "flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl transition-colors",
                    active
                      ? "bg-white/18 text-white"
                      : "bg-gray-50 text-gray-600 group-hover:bg-white group-hover:text-primary",
                  ].join(" ")}
                >
                  <Icon className="h-4.5 w-4.5" aria-hidden="true" />
                </span>
                <span className="flex-1 truncate">{link.label}</span>
                <ChevronRight
                  className={[
                    "h-4 w-4 transition-transform",
                    active
                      ? "translate-x-0 opacity-100"
                      : "-translate-x-1 opacity-0 group-hover:translate-x-0 group-hover:opacity-70",
                  ].join(" ")}
                  aria-hidden="true"
                />
              </Link>
            );
          })}
        </div>
      </nav>

      <div className="border-t border-green-100 p-4">
        <Link
          href="/"
          className="flex min-h-11 items-center gap-3 rounded-2xl border border-green-100 bg-lightgreen px-3 py-2.5 text-base font-bold text-primary transition hover:border-primary hover:bg-white"
        >
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-white text-primary">
            <Home className="h-4.5 w-4.5" aria-hidden="true" />
          </span>
          Voir le site
        </Link>
      </div>
    </aside>
  );
}
