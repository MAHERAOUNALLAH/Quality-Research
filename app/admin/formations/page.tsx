"use client";

import { useEffect, useState } from "react";

type Formation = {
  _id: string;
  title: string;
  description: string;
  duration: string;
  level: string;
  format: string;
  image: string;
  published: boolean;
};

const initial = { title: "", description: "", duration: "", level: "", format: "", image: "", published: true };
const LEVELS = ["Débutant", "Intermédiaire", "Avancé"];
const FORMATS = ["Présentiel", "En ligne", "Hybride", "Présentiel / En ligne"];

export default function AdminFormationsPage() {
  const [items, setItems] = useState<Formation[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(initial);

  async function load() {
    setLoading(true);
    try {
      // Fetch all (admin needs unpublished too — we use the same endpoint, filtering happens on public page)
      const res = await fetch("/api/formations", { cache: "no-store" });
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

  function startEdit(item: Formation) {
    setEditingId(item._id);
    setForm({ title: item.title, description: item.description, duration: item.duration, level: item.level, format: item.format, image: item.image, published: item.published });
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
      const url = editingId ? `/api/formations/${editingId}` : "/api/formations";
      const res = await fetch(url, { method: editingId ? "PUT" : "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
      const data = await res.json();
      if (!res.ok || !data.ok) throw new Error(data.message || "Erreur");
      setSuccess(editingId ? "Formation mise à jour." : "Formation ajoutée.");
      reset(); await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur");
    } finally { setSaving(false); }
  }

  async function handleDelete(id: string) {
    if (!confirm("Supprimer cette formation ?")) return;
    try {
      const res = await fetch(`/api/formations/${id}`, { method: "DELETE" });
      const data = await res.json();
      if (!res.ok || !data.ok) throw new Error(data.message || "Erreur");
      if (editingId === id) reset();
      setSuccess("Formation supprimée."); await load();
    } catch (err) { setError(err instanceof Error ? err.message : "Erreur"); }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Formations</h1>
        <p className="text-sm text-gray-500 mt-1">Gérez les formations du catalogue.</p>
      </div>

      <div className="rounded-2xl border border-gray-200 bg-white p-6">
        <h2 className="text-lg font-semibold mb-4">{editingId ? "Modifier la formation" : "Nouvelle formation"}</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Titre *</label>
            <input value={form.title} onChange={(e) => set("title", e.target.value)} placeholder="Titre de la formation"
              className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary/20" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <textarea value={form.description} onChange={(e) => set("description", e.target.value)} rows={3}
              placeholder="Description de la formation…"
              className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary/20" />
          </div>
          <div className="grid gap-4 sm:grid-cols-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Durée</label>
              <input value={form.duration} onChange={(e) => set("duration", e.target.value)} placeholder="2 jours"
                className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary/20" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Niveau</label>
              <select value={form.level} onChange={(e) => set("level", e.target.value)}
                className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary/20">
                <option value="">Sélectionner…</option>
                {LEVELS.map((l) => <option key={l} value={l}>{l}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Format</label>
              <select value={form.format} onChange={(e) => set("format", e.target.value)}
                className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary/20">
                <option value="">Sélectionner…</option>
                {FORMATS.map((f) => <option key={f} value={f}>{f}</option>)}
              </select>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">URL Image (optionnel)</label>
            <input value={form.image} onChange={(e) => set("image", e.target.value)} placeholder="/uploads/formations/image.jpg"
              className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary/20" />
          </div>
          <div className="flex items-center gap-2">
            <input type="checkbox" id="fpub" checked={form.published} onChange={(e) => set("published", e.target.checked)} className="rounded" />
            <label htmlFor="fpub" className="text-sm text-gray-700">Publier (visible sur le site)</label>
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
          <h2 className="text-lg font-semibold">Formations ({items.length})</h2>
          <button onClick={load} disabled={loading}
            className="rounded-xl border border-gray-200 px-4 py-2 text-sm hover:bg-gray-50 disabled:opacity-50 transition">
            {loading ? "…" : "Actualiser"}
          </button>
        </div>
        {items.length === 0 && !loading ? (
          <p className="text-sm text-gray-500 py-6 text-center">Aucune formation.</p>
        ) : (
          <div className="space-y-3">
            {items.map((item) => (
              <div key={item._id} className="flex items-center gap-4 rounded-xl border border-gray-100 p-4 hover:bg-gray-50 transition">
                <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl bg-lightgreen text-2xl">🎓</div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="font-semibold text-gray-900 truncate">{item.title}</p>
                    {!item.published && (
                      <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-500">Brouillon</span>
                    )}
                  </div>
                  <p className="text-xs text-gray-500">
                    {[item.level, item.duration, item.format].filter(Boolean).join(" · ")}
                  </p>
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
