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
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
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
    <aside className="sticky top-0 flex h-screen w-72 flex-shrink-0 flex-col border-r border-emerald-100 bg-white text-slate-800 shadow-[12px_0_35px_rgba(15,118,72,0.08)]">
      <div className="relative overflow-hidden border-b border-emerald-100 px-5 py-6">
        <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-emerald-500 via-green-400 to-teal-500" />
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-600 text-white shadow-lg shadow-emerald-200">
            <ShieldCheck className="h-6 w-6" aria-hidden="true" />
          </div>
          <div className="min-w-0">
            <div className="text-lg font-bold tracking-tight text-slate-950">
              Admin Panel
            </div>
            <div className="mt-0.5 truncate text-xs font-medium text-slate-500">
              {email}
            </div>
          </div>
        </div>

        <div className="mt-5 inline-flex items-center rounded-full border border-emerald-100 bg-emerald-50 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-emerald-700">
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
                  "group relative flex min-h-11 items-center gap-3 rounded-2xl px-3 py-2.5 text-sm font-semibold transition-all",
                  active
                    ? "bg-emerald-600 text-white shadow-lg shadow-emerald-100"
                    : "text-slate-600 hover:bg-emerald-50 hover:text-emerald-700",
                ].join(" ")}
              >
                <span
                  className={[
                    "flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl transition-colors",
                    active
                      ? "bg-white/18 text-white"
                      : "bg-slate-50 text-slate-500 group-hover:bg-white group-hover:text-emerald-700",
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

      <div className="border-t border-emerald-100 p-4">
        <Link
          href="/"
          className="flex min-h-11 items-center gap-3 rounded-2xl border border-emerald-100 bg-emerald-50 px-3 py-2.5 text-sm font-semibold text-emerald-700 transition hover:border-emerald-200 hover:bg-emerald-100"
        >
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-white text-emerald-700">
            <Home className="h-4.5 w-4.5" aria-hidden="true" />
          </span>
          Voir le site
        </Link>
      </div>
    </aside>
  );
}
