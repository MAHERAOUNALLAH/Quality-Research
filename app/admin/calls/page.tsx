"use client";

import { useEffect, useState } from "react";

type CallItem = {
  _id: string;
  title?: string;
  description?: string;
  type?: string;
  deadline?: string;
  link?: string;
  isOpen?: boolean;
  createdAt?: string;
};

type CallForm = {
  title: string;
  description: string;
  type: string;
  deadline: string;
  link: string;
  isOpen: boolean;
};

const initialForm: CallForm = { title: "", description: "", type: "candidature", deadline: "", link: "", isOpen: true };
const TYPES = [
  { value: "candidature", label: "Appel à candidatures" },
  { value: "formation",   label: "Appel à formation" },
  { value: "projet",      label: "Appel à projets" },
  { value: "autre",       label: "Autre" },
];
const INPUT_CLS = "w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 transition";

export default function AdminCallsPage() {
  const [items, setItems] = useState<CallItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<CallForm>(initialForm);

  async function load() {
    setLoading(true);
    try {
      const res = await fetch("/api/calls", { cache: "no-store" });
      const data = await res.json();
      setItems(Array.isArray(data) ? data : data.items || []);
    } catch { setError("Erreur de chargement."); }
    finally { setLoading(false); }
  }

  useEffect(() => { load(); }, []);

  function reset() { setEditingId(null); setForm(initialForm); setError(""); setSuccess(""); }

  function startEdit(item: CallItem) {
    setEditingId(item._id);
    setForm({ title: item.title || "", description: item.description || "", type: item.type || "candidature", deadline: item.deadline ? item.deadline.slice(0, 10) : "", link: item.link || "", isOpen: item.isOpen ?? true });
    setError(""); setSuccess("");
  }

  function set<K extends keyof CallForm>(k: K, v: CallForm[K]) { setForm((p) => ({ ...p, [k]: v })); }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.title.trim()) { setError("Le titre est requis."); return; }
    setSaving(true); setError(""); setSuccess("");
    try {
      const url = editingId ? `/api/calls/${editingId}` : "/api/calls";
      const res = await fetch(url, {
        method: editingId ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: form.title.trim(), description: form.description.trim(), type: form.type, deadline: form.deadline || null, link: form.link.trim(), isOpen: form.isOpen }),
      });
      const data = await res.json();
      if (!res.ok || !data.ok) throw new Error(data.message || "Erreur");
      setSuccess(editingId ? "Appel mis à jour." : "Appel ajouté.");
      reset(); await load();
    } catch (err) { setError(err instanceof Error ? err.message : "Erreur"); }
    finally { setSaving(false); }
  }

  async function handleDelete(id: string) {
    if (!confirm("Supprimer cet appel ?")) return;
    try {
      const res = await fetch(`/api/calls/${id}`, { method: "DELETE" });
      const data = await res.json();
      if (!res.ok || !data.ok) throw new Error(data.message || "Erreur");
      if (editingId === id) reset();
      setSuccess("Appel supprimé."); await load();
    } catch (err) { setError(err instanceof Error ? err.message : "Erreur"); }
  }

  const typeLabel = (t?: string) => TYPES.find((x) => x.value === t)?.label ?? t ?? "";

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Appels</h1>
        <p className="text-sm text-gray-500 mt-1">Gérez les appels à candidatures, formations et projets.</p>
      </div>

      <div className="rounded-2xl border border-gray-200 bg-white p-6">
        <h2 className="text-lg font-semibold mb-4">{editingId ? "Modifier l'appel" : "Nouvel appel"}</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Titre *</label>
            <input value={form.title} onChange={(e) => set("title", e.target.value)} placeholder="Titre de l'appel" className={INPUT_CLS} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <textarea value={form.description} onChange={(e) => set("description", e.target.value)} rows={4}
              placeholder="Critères d'éligibilité, modalités, détails…" className={INPUT_CLS} />
          </div>
          <div className="grid gap-4 sm:grid-cols-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
              <select value={form.type} onChange={(e) => set("type", e.target.value)} className={INPUT_CLS}>
                {TYPES.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Date limite</label>
              <input type="date" value={form.deadline} onChange={(e) => set("deadline", e.target.value)} className={INPUT_CLS} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Lien externe (optionnel)</label>
              <input value={form.link} onChange={(e) => set("link", e.target.value)} placeholder="https://…" className={INPUT_CLS} />
            </div>
          </div>
          <div className="flex items-center gap-2">
            <input type="checkbox" id="isopen" checked={form.isOpen} onChange={(e) => set("isOpen", e.target.checked)} className="rounded" />
            <label htmlFor="isopen" className="text-sm text-gray-700">Appel ouvert (visible sur le site)</label>
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
          <h2 className="text-lg font-semibold">Appels ({items.length})</h2>
          <button onClick={load} disabled={loading}
            className="rounded-xl border border-gray-200 px-4 py-2 text-sm hover:bg-gray-50 disabled:opacity-50 transition">
            {loading ? "…" : "Actualiser"}
          </button>
        </div>
        {items.length === 0 && !loading ? (
          <p className="text-sm text-gray-500 py-6 text-center">Aucun appel.</p>
        ) : (
          <div className="space-y-3">
            {items.map((item) => (
              <div key={item._id} className="flex items-center gap-4 rounded-xl border border-gray-100 p-4 hover:bg-gray-50 transition">
                <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl bg-lightgreen text-2xl">📣</div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="font-semibold text-gray-900 truncate">{item.title || "Sans titre"}</p>
                    {item.isOpen === false && <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-500">Fermé</span>}
                  </div>
                  <p className="text-xs text-gray-500">
                    {[typeLabel(item.type), item.deadline ? `Limite : ${new Date(item.deadline).toLocaleDateString("fr-FR")}` : null].filter(Boolean).join(" · ")}
                  </p>
                </div>
                <div className="flex gap-2 flex-shrink-0">
                  <button onClick={() => startEdit(item)}
                    className="rounded-lg border border-gray-200 px-3 py-1.5 text-xs font-medium hover:bg-gray-100 transition">Modifier</button>
                  <button onClick={() => handleDelete(item._id)}
                    className="rounded-lg border border-red-100 px-3 py-1.5 text-xs font-medium text-red-600 hover:bg-red-50 transition">Supprimer</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
