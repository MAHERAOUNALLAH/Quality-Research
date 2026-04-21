"use client";

import { useEffect, useState } from "react";

type CategoryItem = { _id: string; nom?: string; createdAt?: string };

const INPUT_CLS = "w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 transition";

export default function AdminCategoriesPage() {
  const [items, setItems] = useState<CategoryItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [nom, setNom] = useState("");

  async function load() {
    setLoading(true);
    try {
      const res = await fetch("/api/categories", { cache: "no-store" });
      const data = await res.json();
      setItems(Array.isArray(data) ? data : data.items || []);
    } catch { setError("Erreur de chargement."); }
    finally { setLoading(false); }
  }

  useEffect(() => { load(); }, []);

  function reset() { setEditingId(null); setNom(""); setError(""); setSuccess(""); }

  function startEdit(item: CategoryItem) { setEditingId(item._id); setNom(item.nom || ""); setError(""); setSuccess(""); }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!nom.trim()) { setError("Le nom de la catégorie est requis."); return; }
    setSaving(true); setError(""); setSuccess("");
    try {
      const url = editingId ? `/api/categories/${editingId}` : "/api/categories";
      const res = await fetch(url, {
        method: editingId ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nom: nom.trim() }),
      });
      const data = await res.json();
      if (!res.ok || data.ok === false) throw new Error(data.message || "Erreur");
      setSuccess(editingId ? "Catégorie mise à jour." : "Catégorie ajoutée.");
      reset(); await load();
    } catch (err) { setError(err instanceof Error ? err.message : "Erreur"); }
    finally { setSaving(false); }
  }

  async function handleDelete(id: string) {
    if (!confirm("Supprimer cette catégorie ?")) return;
    try {
      const res = await fetch(`/api/categories/${id}`, { method: "DELETE" });
      const data = await res.json();
      if (!res.ok || data.ok === false) throw new Error(data.message || "Erreur");
      if (editingId === id) reset();
      setSuccess("Catégorie supprimée."); await load();
    } catch (err) { setError(err instanceof Error ? err.message : "Erreur"); }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Catégories</h1>
        <p className="text-sm text-gray-500 mt-1">Gérez les catégories d'articles et d'événements.</p>
      </div>

      <div className="rounded-2xl border border-gray-200 bg-white p-6">
        <h2 className="text-lg font-semibold mb-4">{editingId ? "Modifier la catégorie" : "Nouvelle catégorie"}</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nom *</label>
            <input value={nom} onChange={(e) => setNom(e.target.value)} placeholder="Nom de la catégorie" className={INPUT_CLS} />
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
          <h2 className="text-lg font-semibold">Catégories ({items.length})</h2>
          <button onClick={load} disabled={loading}
            className="rounded-xl border border-gray-200 px-4 py-2 text-sm hover:bg-gray-50 disabled:opacity-50 transition">
            {loading ? "…" : "Actualiser"}
          </button>
        </div>
        {items.length === 0 && !loading ? (
          <p className="text-sm text-gray-500 py-6 text-center">Aucune catégorie.</p>
        ) : (
          <div className="space-y-3">
            {items.map((item) => (
              <div key={item._id} className="flex items-center gap-4 rounded-xl border border-gray-100 p-4 hover:bg-gray-50 transition">
                <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-lightgreen text-xl">📂</div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-gray-900">{item.nom || "Sans nom"}</p>
                  {item.createdAt && (
                    <p className="text-xs text-gray-400">{new Date(item.createdAt).toLocaleDateString("fr-FR")}</p>
                  )}
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
