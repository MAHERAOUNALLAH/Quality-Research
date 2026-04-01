"use client";

import { useEffect, useState } from "react";

type Partner = {
  _id: string;
  name: string;
  type: string;
  country: string;
  logo: string;
  website: string;
  order: number;
};

const initial = { name: "", type: "", country: "", logo: "", website: "", order: 0 };

const PARTNER_TYPES = ["Université", "Institution", "Organisation internationale", "Académique", "Scientifique", "Réseau", "Technique", "Autre"];

export default function AdminPartnersPage() {
  const [items, setItems] = useState<Partner[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(initial);

  async function load() {
    setLoading(true);
    try {
      const res = await fetch("/api/partners", { cache: "no-store" });
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

  function startEdit(item: Partner) {
    setEditingId(item._id);
    setForm({ name: item.name, type: item.type, country: item.country, logo: item.logo, website: item.website, order: item.order });
    setError(""); setSuccess("");
  }

  function set<K extends keyof typeof initial>(k: K, v: (typeof initial)[K]) {
    setForm((p) => ({ ...p, [k]: v }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name.trim()) { setError("Le nom est requis."); return; }
    setSaving(true); setError(""); setSuccess("");
    try {
      const url = editingId ? `/api/partners/${editingId}` : "/api/partners";
      const res = await fetch(url, { method: editingId ? "PUT" : "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
      const data = await res.json();
      if (!res.ok || !data.ok) throw new Error(data.message || "Erreur");
      setSuccess(editingId ? "Partenaire mis à jour." : "Partenaire ajouté.");
      reset(); await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur");
    } finally { setSaving(false); }
  }

  async function handleDelete(id: string) {
    if (!confirm("Supprimer ce partenaire ?")) return;
    try {
      const res = await fetch(`/api/partners/${id}`, { method: "DELETE" });
      const data = await res.json();
      if (!res.ok || !data.ok) throw new Error(data.message || "Erreur");
      if (editingId === id) reset();
      setSuccess("Partenaire supprimé."); await load();
    } catch (err) { setError(err instanceof Error ? err.message : "Erreur"); }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Partenaires</h1>
        <p className="text-sm text-gray-500 mt-1">Gérez les partenaires affichés sur le site.</p>
      </div>

      <div className="rounded-2xl border border-gray-200 bg-white p-6">
        <h2 className="text-lg font-semibold mb-4">{editingId ? "Modifier le partenaire" : "Nouveau partenaire"}</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nom *</label>
              <input value={form.name} onChange={(e) => set("name", e.target.value)} placeholder="Nom de l'organisation"
                className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary/20" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
              <select value={form.type} onChange={(e) => set("type", e.target.value)}
                className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary/20">
                <option value="">Sélectionner…</option>
                {PARTNER_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Pays</label>
              <input value={form.country} onChange={(e) => set("country", e.target.value)} placeholder="Tunisie"
                className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary/20" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Site web</label>
              <input value={form.website} onChange={(e) => set("website", e.target.value)} placeholder="https://…"
                className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary/20" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">URL Logo</label>
              <input value={form.logo} onChange={(e) => set("logo", e.target.value)} placeholder="/uploads/partners/logo.png"
                className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary/20" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Ordre</label>
              <input type="number" value={form.order} onChange={(e) => set("order", Number(e.target.value))}
                className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary/20" />
            </div>
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
          <h2 className="text-lg font-semibold">Partenaires ({items.length})</h2>
          <button onClick={load} disabled={loading}
            className="rounded-xl border border-gray-200 px-4 py-2 text-sm hover:bg-gray-50 disabled:opacity-50 transition">
            {loading ? "…" : "Actualiser"}
          </button>
        </div>
        {items.length === 0 && !loading ? (
          <p className="text-sm text-gray-500 py-6 text-center">Aucun partenaire.</p>
        ) : (
          <div className="space-y-3">
            {items.map((item) => (
              <div key={item._id} className="flex items-center gap-4 rounded-xl border border-gray-100 p-4 hover:bg-gray-50 transition">
                <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl bg-lightgreen">
                  {item.logo ? (
                    <img src={item.logo} alt={item.name} className="h-8 w-8 object-contain" />
                  ) : (
                    <svg className="h-6 w-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                        d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5" />
                    </svg>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-gray-900 truncate">{item.name}</p>
                  <p className="text-xs text-gray-500">{[item.type, item.country].filter(Boolean).join(" · ")}</p>
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
