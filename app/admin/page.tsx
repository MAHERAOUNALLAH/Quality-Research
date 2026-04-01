"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

type UserItem = {
  _id: string;
  fullName?: string;
  nom?: string;
  prenom?: string;
  email: string;
  role?: string;
  isActive?: boolean;
  createdAt?: string;
  dateInscription?: string;
};

type MessageItem = {
  _id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  status?: string;
  createdAt?: string;
};

export default function AdminPage() {
  const [users, setUsers] = useState<UserItem[]>([]);
  const [messages, setMessages] = useState<MessageItem[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(true);
  const [errorUsers, setErrorUsers] = useState("");
  const [errorMessages, setErrorMessages] = useState("");

  useEffect(() => {
    const loadUsers = async () => {
      try {
        const res = await fetch("/api/admin/users", {
          credentials: "include",
          cache: "no-store",
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.message || "Erreur chargement utilisateurs");
        setUsers(data.users || []);
      } catch (error: any) {
        setErrorUsers(error.message || "Erreur chargement utilisateurs");
      } finally {
        setLoadingUsers(false);
      }
    };

    const loadMessages = async () => {
      try {
        const res = await fetch("/api/contact", {
          credentials: "include",
          cache: "no-store",
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.message || "Erreur chargement messages");
        setMessages(data.messages || []);
      } catch (error: any) {
        setErrorMessages(error.message || "Erreur chargement messages");
      } finally {
        setLoadingMessages(false);
      }
    };

    loadUsers();
    loadMessages();
  }, []);

  return (
    <main className="min-h-screen bg-gray-50 p-6 md:p-10">
      <div className="mx-auto max-w-7xl space-y-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Tableau de bord Admin</h1>
          <p className="mt-2 text-sm text-gray-600">
            Gestion des utilisateurs, messages et contenu du site.
          </p>
        </div>

        {/* Stats */}
        <div className="grid gap-6 md:grid-cols-2">
          <div className="rounded-2xl bg-white p-6 shadow-sm border border-gray-100">
            <p className="text-sm text-gray-500">Utilisateurs</p>
            <p className="mt-2 text-3xl font-bold text-green-600">{users.length}</p>
          </div>
          <div className="rounded-2xl bg-white p-6 shadow-sm border border-gray-100">
            <p className="text-sm text-gray-500">Messages</p>
            <p className="mt-2 text-3xl font-bold text-green-600">{messages.length}</p>
          </div>
        </div>

        {/* Quick-access content cards */}
        <div>
          <h2 className="mb-4 text-lg font-semibold text-gray-900">Gestion du contenu</h2>
          <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6">
            {[
              { label: "Categories", href: "/admin/categories", color: "#8b5cf6" },
              { label: "Events", href: "/admin/events", color: "#0ea5e9" },
              { label: "Articles", href: "/admin/articles", color: "#10b981" },
              { label: "Messages", href: "/admin/messages", color: "#f59e0b" },
              { label: "Calls", href: "/admin/calls", color: "#ef4444" },
              { label: "Reports", href: "/admin/reports", color: "#6366f1" },
            ].map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="rounded-2xl bg-white p-5 shadow-sm border border-gray-100 no-underline block hover:shadow-md transition-shadow"
                style={{ borderTop: `4px solid ${item.color}` }}
              >
                <div className="font-semibold text-gray-800 text-sm">{item.label}</div>
                <div className="text-xs text-gray-400 mt-1">Manage →</div>
              </Link>
            ))}
          </div>
        </div>

        {/* Users table */}
        <section className="rounded-2xl bg-white p-6 shadow-sm border border-gray-100">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-900">Liste des utilisateurs</h2>
          </div>

          {loadingUsers ? (
            <p className="text-sm text-gray-500">Chargement des utilisateurs...</p>
          ) : errorUsers ? (
            <p className="text-sm text-red-600">{errorUsers}</p>
          ) : users.length === 0 ? (
            <p className="text-sm text-gray-500">Aucun utilisateur trouvé.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full border-separate border-spacing-y-2">
                <thead>
                  <tr className="text-left text-sm text-gray-500">
                    <th className="px-4 py-2">Nom</th>
                    <th className="px-4 py-2">Email</th>
                    <th className="px-4 py-2">Rôle</th>
                    <th className="px-4 py-2">Statut</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((user) => {
                    const displayName =
                      user.fullName || `${user.prenom || ""} ${user.nom || ""}`.trim() || "Sans nom";
                    return (
                      <tr key={user._id} className="bg-gray-50 text-sm text-gray-700">
                        <td className="rounded-l-xl px-4 py-3 font-medium">{displayName}</td>
                        <td className="px-4 py-3">{user.email}</td>
                        <td className="px-4 py-3">{user.role || "user"}</td>
                        <td className="rounded-r-xl px-4 py-3">
                          {user.isActive === false ? (
                            <span className="rounded-full bg-red-100 px-3 py-1 text-xs font-medium text-red-700">
                              Désactivé
                            </span>
                          ) : (
                            <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-medium text-green-700">
                              Actif
                            </span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </section>

        {/* Contact messages */}
        <section className="rounded-2xl bg-white p-6 shadow-sm border border-gray-100">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-900">Messages de contact</h2>
          </div>

          {loadingMessages ? (
            <p className="text-sm text-gray-500">Chargement des messages...</p>
          ) : errorMessages ? (
            <p className="text-sm text-red-600">{errorMessages}</p>
          ) : messages.length === 0 ? (
            <p className="text-sm text-gray-500">Aucun message trouvé.</p>
          ) : (
            <div className="space-y-4">
              {messages.map((msg) => (
                <div
                  key={msg._id}
                  className="rounded-2xl border border-gray-100 bg-gray-50 p-5"
                >
                  <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                    <div>
                      <h3 className="font-semibold text-gray-900">{msg.subject}</h3>
                      <p className="text-sm text-gray-600">
                        {msg.name} — {msg.email}
                      </p>
                    </div>
                    <span className="inline-flex w-fit rounded-full bg-blue-100 px-3 py-1 text-xs font-medium text-blue-700">
                      {msg.status || "unread"}
                    </span>
                  </div>
                  <p className="mt-4 whitespace-pre-wrap text-sm text-gray-700">
                    {msg.message}
                  </p>
                  <p className="mt-3 text-xs text-gray-400">
                    {msg.createdAt ? new Date(msg.createdAt).toLocaleString("fr-FR") : ""}
                  </p>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
