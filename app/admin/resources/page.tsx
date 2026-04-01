"use client";

import { useEffect, useState } from "react";

type Resource = {
  _id: string;
  title: string;
  category: string;
  type: string;
  fileUrl: string;
  externalUrl: string;
  size: string;
  published: boolean;
};

const initial = { title: "", category: "", type: "pdf", fileUrl: "", externalUrl: "", size: "", published: true };
const TYPES = ["pdf", "docx", "link", "video", "autre"];
const CATEGORIES = ["Recherche", "Outils", "Qualité", "Formation", "Autre"];

export default function AdminResourcesPage() {
  const [items, setItems] = useState<Resource[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(initial);

  async function load() {
    setLoading(true);
    try {
      // Admin fetches all (including unpublished) — reuse same endpoint, published filter is on frontend
      const res = await fetch("/api/resources", { cache: "no-store" });
      const data = await res.json();
      setItems(Array.isArray(data) ? data : data.items || []);
    } catch {
      setError("Erreur de chargement.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, []);

  function reset() { setEditingId(null); setForm(initial); setError(""); setSuccess(""); }

  function startEdit(item: Resource) {
    setEditingId(item._id);
    setForm({ title: item.title, category: item.category, type: item.type, fileUrl: item.fileUrl, externalUrl: item.externalUrl, size: item.size, published: item.published });
    setError(""); setSuccess("");
  }

  function set<K extends keyof typeof initial>(k: K, v: (typeof initial)[K]) {
    setForm((p) => ({ ...p, [k]: v }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.title.trim()) { setError("Le titre est requis."); return; }
    setSaving(true); setError(""); setSuccess("");
    try {
      const url = editingId ? `/api/resources/${editingId}` : "/api/resources";
      const res = await fetch(url, { method: editingId ? "PUT" : "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
      const data = await res.json();
      if (!res.ok || !data.ok) throw new Error(data.message || "Erreur");
      setSuccess(editingId ? "Ressource mise à jour." : "Ressource ajoutée.");
      reset(); await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur");
    } finally { setSaving(false); }
  }

  async function handleDelete(id: string) {
    if (!confirm("Supprimer cette ressource ?")) return;
    try {
      const res = await fetch(`/api/resources/${id}`, { method: "DELETE" });
      const data = await res.json();
      if (!res.ok || !data.ok) throw new Error(data.message || "Erreur");
      if (editingId === id) reset();
      setSuccess("Ressource supprimée."); await load();
    } catch (err) { setError(err instanceof Error ? err.message : "Erreur"); }
  }

  const typeEmoji: Record<string, string> = { pdf: "📄", docx: "📝", link: "🔗", video: "🎬", autre: "📁" };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Ressources</h1>
        <p className="text-sm text-gray-500 mt-1">Gérez les ressources du centre de téléchargement.</p>
      </div>

      <div className="rounded-2xl border border-gray-200 bg-white p-6">
        <h2 className="text-lg font-semibold mb-4">{editingId ? "Modifier la ressource" : "Nouvelle ressource"}</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Titre *</label>
              <input value={form.title} onChange={(e) => set("title", e.target.value)} placeholder="Guide de méthodologie…"
                className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary/20" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Catégorie</label>
              <select value={form.category} onChange={(e) => set("category", e.target.value)}
                className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary/20">
                <option value="">Sélectionner…</option>
                {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
              <select value={form.type} onChange={(e) => set("type", e.target.value)}
                className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary/20">
                {TYPES.map((t) => <option key={t} value={t}>{t.toUpperCase()}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {form.type === "link" ? "URL externe" : "Chemin du fichier"}
              </label>
              {form.type === "link" ? (
                <input value={form.externalUrl} onChange={(e) => set("externalUrl", e.target.value)} placeholder="https://…"
                  className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary/20" />
              ) : (
                <input value={form.fileUrl} onChange={(e) => set("fileUrl", e.target.value)} placeholder="/uploads/resources/fichier.pdf"
                  className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary/20" />
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Taille (optionnel)</label>
              <input value={form.size} onChange={(e) => set("size", e.target.value)} placeholder="2.4 MB"
                className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary/20" />
            </div>
          </div>
          <div className="flex items-center gap-2">
            <input type="checkbox" id="pub" checked={form.published} onChange={(e) => set("published", e.target.checked)} className="rounded" />
            <label htmlFor="pub" className="text-sm text-gray-700">Publier (visible sur le site)</label>
          </div>

          {error && <p className="text-sm text-red-600">{error}</p>}
          {success && <p className="text-sm text-green-700">{success}</p>}

          <div className="flex gap-3">
            <button type="submit" disabled={saving}
              className="rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-white disabled:opacity-50 hover:bg-primary/90 transition">
              {saving ? "Enregistrement…" : editingId ? "Mettre à jour" : "Ajouter"}
            </button>
            {editingId && (
              <button type="button" onClick={reset}
                className="rounded-xl border border-gray-200 px-5 py-2.5 text-sm font-medium hover:bg-gray-50 transition">
                Annuler
              </button>
            )}
          </div>
        </form>
      </div>

      <div className="rounded-2xl border border-gray-200 bg-white p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">Ressources ({items.length})</h2>
          <button onClick={load} disabled={loading}
            className="rounded-xl border border-gray-200 px-4 py-2 text-sm hover:bg-gray-50 disabled:opacity-50 transition">
            {loading ? "…" : "Actualiser"}
          </button>
        </div>
        {items.length === 0 && !loading ? (
          <p className="text-sm text-gray-500 py-6 text-center">Aucune ressource.</p>
        ) : (
          <div className="space-y-3">
            {items.map((item) => (
              <div key={item._id} className="flex items-center gap-4 rounded-xl border border-gray-100 p-4 hover:bg-gray-50 transition">
                <div className="text-2xl flex-shrink-0">{typeEmoji[item.type] || "📁"}</div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="font-semibold text-gray-900 truncate">{item.title}</p>
                    {!item.published && (
                      <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-500">Brouillon</span>
                    )}
                  </div>
                  <p className="text-xs text-gray-500">{[item.category, item.type.toUpperCase(), item.size].filter(Boolean).join(" · ")}</p>
                </div>
                <div className="flex gap-2 flex-shrink-0">
                  <button onClick={() => startEdit(item)}
                    className="rounded-lg border border-gray-200 px-3 py-1.5 text-xs font-medium hover:bg-gray-100 transition">
                    Modifier
                  </button>
                  <button onClick={() => handleDelete(item._id)}
                    className="rounded-lg border border-red-100 px-3 py-1.5 text-xs font-medium text-red-600 hover:bg-red-50 transition">
                    Supprimer
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
