"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";

// Mise à jour du type pour inclure la photo de profil
type User = {
  _id: string;
  fullName: string;
  email: string;
  role: string;
  profileImage?: string; 
};

export default function NavbarAuth() {
  const router = useRouter();
  const pathname = usePathname();
  const menuRef = useRef<HTMLDivElement>(null);

  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const fetchMe = async () => {
      try {
        const res = await fetch("/api/auth/me", {
          method: "GET",
          credentials: "include",
          cache: "no-store",
        });

        const data = await res.json();

        if (res.ok) setUser(data.user);
        else setUser(null);
      } catch {
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    fetchMe();
  }, [pathname]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        menuRef.current &&
        event.target instanceof Node &&
        !menuRef.current.contains(event.target)
      ) {
        setOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = async () => {
    try {
      const res = await fetch("/api/auth/logout", {
        method: "POST",
        credentials: "include",
      });

      if (!res.ok) return;

      setUser(null);
      setOpen(false);
      router.replace("/");
      router.refresh();
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  if (loading) return null;

  if (user) {
    return (
      <div ref={menuRef} className="relative shrink-0">
        <button
          onClick={() => setOpen((prev) => !prev)}
          className="flex items-center gap-3 rounded-full border border-gray-200 bg-white px-3 py-1.5 text-sm font-medium text-gray-800 shadow-sm transition hover:border-[#15803d] hover:shadow-md"
        >
          {/* AVATAR AVEC PHOTO DE PROFIL */}
          <div className="flex h-9 w-9 items-center justify-center overflow-hidden rounded-full border border-gray-100 bg-[#15803d]">
            {user.profileImage ? (
              <img 
                src={user.profileImage} 
                alt={user.fullName} 
                className="h-full w-full object-cover" 
              />
            ) : (
              <span className="text-sm font-bold text-white">
                {user.fullName?.charAt(0).toUpperCase()}
              </span>
            )}
          </div>

          <span className="hidden lg:block max-w-[140px] truncate font-bold">
            {user.fullName}
          </span>

          <svg
            className={`h-4 w-4 text-gray-400 transition-transform ${open ? "rotate-180" : ""}`}
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fillRule="evenodd"
              d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.51a.75.75 0 01-1.08 0l-4.25-4.51a.75.75 0 01.02-1.06z"
              clipRule="evenodd"
            />
          </svg>
        </button>

        {open && (
          <div className="absolute right-0 z-[9999] mt-3 w-64 overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-2xl animate-in fade-in zoom-in-95 duration-200">
            {/* ENTÊTE DU MENU AVEC PHOTO */}
            <div className="flex items-center gap-3 border-b border-gray-100 px-4 py-4 bg-gray-50/50">
              <div className="h-10 w-10 shrink-0 overflow-hidden rounded-full border border-gray-200 bg-white">
                {user.profileImage ? (
                  <img src={user.profileImage} alt="" className="h-full w-full object-cover" />
                ) : (
                  <div className="flex h-full w-full items-center justify-center bg-green-50 text-[#15803d] font-bold">
                    {user.fullName?.charAt(0).toUpperCase()}
                  </div>
                )}
              </div>
              <div className="overflow-hidden">
                <p className="text-sm font-black text-gray-900 truncate">{user.fullName}</p>
                <p className="truncate text-xs text-gray-500 font-medium">{user.email}</p>
              </div>
            </div>

            <div className="p-2 space-y-1">
              <Link
                href="/profile"
                onClick={() => setOpen(false)}
                className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-bold text-gray-700 transition hover:bg-green-50 hover:text-[#15803d]"
              >
                <svg className="w-5 h-5 opacity-70" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                Mon Profil
              </Link>

              {user.role === "admin" && (
                <Link
                  href="/admin"
                  onClick={() => setOpen(false)}
                  className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-bold text-gray-700 transition hover:bg-green-50 hover:text-[#15803d]"
                >
                  <svg className="w-5 h-5 opacity-70" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                  Tableau de bord Admin
                </Link>
              )}

              <div className="my-1 border-t border-gray-100"></div>

              <button
                onClick={handleLogout}
                className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm font-bold text-red-600 transition hover:bg-red-50"
              >
                <svg className="w-5 h-5 opacity-80" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
                Déconnexion
              </button>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="flex items-center gap-3 shrink-0">
      <Link href="/login" className="btn btn-outline px-6 py-2.5 text-sm font-bold border-gray-200 hover:border-[#15803d] hover:text-[#15803d]">
        Connexion
      </Link>
      <Link href="/register" className="bg-[#15803d] text-white px-6 py-2.5 text-sm font-black rounded-full hover:bg-black transition-all shadow-lg shadow-green-100">
        Inscription
      </Link>
    </div>
  );
}