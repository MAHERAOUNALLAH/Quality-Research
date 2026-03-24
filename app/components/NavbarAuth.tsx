"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";

type User = {
  _id: string;
  fullName: string;
  email: string;
  role: string;
};

export default function NavbarAuth() {
  const router = useRouter();
  const pathname = usePathname();

  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

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
  }, [pathname]); // important

  const handleLogout = async () => {
    try {
      const res = await fetch("/api/auth/logout", {
        method: "POST",
        credentials: "include",
      });

      if (!res.ok) return;

      setUser(null); // mise à jour immédiate visuelle
      router.replace("/");
      router.refresh();
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  if (loading) return null;

  if (user) {
    return (
      <div className="flex items-center gap-3">
        <span>Bonjour, {user.fullName}</span>
        <button
          onClick={handleLogout}
          className="btn btn-outline px-5 py-2 text-sm"
        >
          Déconnexion
        </button>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-3">
      <Link href="/login" className="btn btn-outline px-5 py-2 text-sm">
        Connexion
      </Link>
      <Link href="/register" className="btn btn-primary px-5 py-2 text-sm">
        Inscription
      </Link>
    </div>
  );
}