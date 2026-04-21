"use client";

import { useEffect, useState } from "react";

type MessageItem = {
  _id: string;
  name?: string;
  email?: string;
  subject?: string;
  message?: string;
  createdAt?: string;
};

export default function AdminMessagesPage() {
  const [items, setItems] = useState<MessageItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [expanded, setExpanded] = useState<string | null>(null);

  async function load() {
    setLoading(true); setError("");
    try {
      const res = await fetch("/api/messages", { cache: "no-store" });
      const data = await res.json();
      setItems(Array.isArray(data) ? data : data.items || []);
    } catch { setError("Erreur de chargement."); }
    finally { setLoading(false); }
  }

  useEffect(() => { load(); }, []);

  async function handleDelete(id: string) {
    if (!confirm("Supprimer ce message ?")) return;
    try {
      const res = await fetch(`/api/messages/${id}`, { method: "DELETE" });
      const data = await res.json();
      if (!res.ok || data.ok === false) throw new Error(data.message || "Erreur");
      if (expanded === id) setExpanded(null);
      setSuccess("Message supprimé."); await load();
    } catch (err) { setError(err instanceof Error ? err.message : "Erreur"); }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Messages</h1>
        <p className="text-sm text-gray-500 mt-1">Consultez les messages reçus via le formulaire de contact.</p>
      </div>

      <div className="rounded-2xl border border-gray-200 bg-white p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">Boîte de réception ({items.length})</h2>
          <button onClick={load} disabled={loading}
            className="rounded-xl border border-gray-200 px-4 py-2 text-sm hover:bg-gray-50 disabled:opacity-50 transition">
            {loading ? "…" : "Actualiser"}
          </button>
        </div>

        {error && <p className="mb-4 text-sm text-red-600">{error}</p>}
        {success && <p className="mb-4 text-sm text-green-700">{success}</p>}

        {items.length === 0 && !loading ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <div className="mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-lightgreen text-3xl">✉️</div>
            <p className="text-sm text-gray-500">Aucun message pour le moment.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {items.map((item) => (
              <div key={item._id} className="rounded-xl border border-gray-100 overflow-hidden hover:border-gray-200 transition">
                <div
                  className="flex items-center gap-4 p-4 cursor-pointer hover:bg-gray-50 transition"
                  onClick={() => setExpanded(expanded === item._id ? null : item._id)}
                >
                  <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-lightgreen font-bold text-primary text-sm">
                    {(item.name || "?")[0].toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-gray-900 truncate">{item.subject || "Sans objet"}</p>
                    <p className="text-xs text-gray-500">
                      {item.name || "Inconnu"} — {item.email || ""}
                      {item.createdAt && ` · ${new Date(item.createdAt).toLocaleDateString("fr-FR", { day: "numeric", month: "short", year: "numeric" })}`}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <span className="text-xs text-gray-400">{expanded === item._id ? "▲" : "▼"}</span>
                    <button
                      onClick={(e) => { e.stopPropagation(); handleDelete(item._id); }}
                      className="rounded-lg border border-red-100 px-3 py-1.5 text-xs font-medium text-red-600 hover:bg-red-50 transition">
                      Supprimer
                    </button>
                  </div>
                </div>
                {expanded === item._id && (
                  <div className="border-t border-gray-100 bg-gray-50 px-4 py-4">
                    <div className="flex gap-3 mb-3">
                      {item.email && (
                        <a href={`mailto:${item.email}`}
                          className="rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-xs font-medium text-primary hover:bg-primary hover:text-white transition">
                          ✉️ Répondre
                        </a>
                      )}
                    </div>
                    <p className="whitespace-pre-wrap text-sm leading-relaxed text-gray-700">{item.message || ""}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
