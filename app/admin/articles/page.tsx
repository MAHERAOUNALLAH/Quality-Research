"use client";

import { useEffect, useRef, useState } from "react";

type ArticleItem = {
  _id: string;
  titre?: string;
  contenu?: string;
  categoryId?: string | { _id?: string; nom?: string } | null;
  image?: string;
  createdAt?: string;
};

type CategoryItem = { _id: string; nom?: string };

type ArticleForm = {
  titre: string;
  contenu: string;
  categoryId: string;
  image: string;
};

const initialForm: ArticleForm = { titre: "", contenu: "", categoryId: "", image: "" };
const INPUT_CLS = "w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 transition";

async function uploadFile(file: File, folder: string): Promise<string> {
  const fd = new FormData();
  fd.append("file", file);
  fd.append("folder", folder);
  const res = await fetch("/api/upload", { method: "POST", body: fd });
  const data = await res.json();
  if (!res.ok || !data.ok) throw new Error(data.message || "Upload échoué");
  return data.url as string;
}

export default function AdminArticlesPage() {
  const [items, setItems] = useState<ArticleItem[]>([]);
  const [categories, setCategories] = useState<CategoryItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<ArticleForm>(initialForm);
  const fileRef = useRef<HTMLInputElement>(null);

  async function load() {
    setLoading(true);
    try {
      const [ar, cr] = await Promise.all([
        fetch("/api/articles", { cache: "no-store" }),
        fetch("/api/categories", { cache: "no-store" }),
      ]);
      const ad = await ar.json();
      const cd = await cr.json();
      setItems(Array.isArray(ad) ? ad : ad.items || []);
      setCategories(Array.isArray(cd) ? cd : cd.items || []);
    } catch { setError("Erreur de chargement."); }
    finally { setLoading(false); }
  }

  useEffect(() => { load(); }, []);

  function reset() { setEditingId(null); setForm(initialForm); setError(""); setSuccess(""); if (fileRef.current) fileRef.current.value = ""; }

  function startEdit(item: ArticleItem) {
    const catId = typeof item.categoryId === "string" ? item.categoryId
      : item.categoryId && typeof item.categoryId === "object" ? String(item.categoryId._id || "") : "";
    setEditingId(item._id);
    setForm({ titre: item.titre || "", contenu: item.contenu || "", categoryId: catId, image: item.image || "" });
    setError(""); setSuccess("");
  }

  function set<K extends keyof ArticleForm>(k: K, v: ArticleForm[K]) { setForm((p) => ({ ...p, [k]: v })); }

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true); setError("");
    try {
      const url = await uploadFile(file, "articles");
      set("image", url);
    } catch (err) { setError(err instanceof Error ? err.message : "Upload échoué"); }
    finally { setUploading(false); }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.titre.trim()) { setError("Le titre est requis."); return; }
    setSaving(true); setError(""); setSuccess("");
    try {
      const url = editingId ? `/api/articles/${editingId}` : "/api/articles";
      const res = await fetch(url, {
        method: editingId ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ titre: form.titre.trim(), contenu: form.contenu.trim(), categoryId: form.categoryId || null, image: form.image }),
      });
      const data = await res.json();
      if (!res.ok || !data.ok) throw new Error(data.message || "Erreur");
      setSuccess(editingId ? "Article mis à jour." : "Article ajouté.");
      reset(); await load();
    } catch (err) { setError(err instanceof Error ? err.message : "Erreur"); }
    finally { setSaving(false); }
  }

  async function handleDelete(id: string) {
    if (!confirm("Supprimer cet article ?")) return;
    try {
      const res = await fetch(`/api/articles/${id}`, { method: "DELETE" });
      const data = await res.json();
      if (!res.ok || !data.ok) throw new Error(data.message || "Erreur");
      if (editingId === id) reset();
      setSuccess("Article supprimé."); await load();
    } catch (err) { setError(err instanceof Error ? err.message : "Erreur"); }
  }

  const catLabel = (item: ArticleItem) =>
    typeof item.categoryId === "object" && item.categoryId?.nom ? item.categoryId.nom
    : null;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Articles</h1>
        <p className="text-sm text-gray-500 mt-1">Gérez les articles scientifiques et publications.</p>
      </div>

      {/* Form */}
      <div className="rounded-2xl border border-gray-200 bg-white p-6">
        <h2 className="text-lg font-semibold mb-4">{editingId ? "Modifier l'article" : "Nouvel article"}</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Titre *</label>
            <input value={form.titre} onChange={(e) => set("titre", e.target.value)} placeholder="Titre de l'article" className={INPUT_CLS} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Contenu</label>
            <textarea value={form.contenu} onChange={(e) => set("contenu", e.target.value)} rows={5}
              placeholder="Contenu de l'article…" className={INPUT_CLS} />
          </div>
            <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Catégorie</label>
              <select value={form.categoryId} onChange={(e) => set("categoryId", e.target.value)} className={INPUT_CLS}>
                <option value="">Aucune catégorie</option>
                {categories.map((c) => <option key={c._id} value={c._id}>{c.nom || "Sans nom"}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Image de couverture</label>
              <div className="flex gap-2 items-center">
                <input type="file" ref={fileRef} accept="image/*" onChange={handleFileChange} className="hidden" />
                <button type="button" onClick={() => fileRef.current?.click()} disabled={uploading}
                  className="rounded-xl border border-gray-200 px-4 py-2.5 text-sm font-medium hover:bg-gray-50 disabled:opacity-50 transition flex-shrink-0">
                  {uploading ? "⏳ Upload…" : "📷 Choisir"}
                </button>
                <input value={form.image} onChange={(e) => set("image", e.target.value)} placeholder="/uploads/articles/photo.jpg" className={INPUT_CLS} />
              </div>
            </div>
          </div>

          {/* Live image preview */}
          {form.image && (
            <div className="rounded-xl border border-gray-100 bg-gray-50 p-4">
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Aperçu de l'image</p>
              <div className="relative overflow-hidden rounded-lg border border-gray-200 bg-white" style={{ maxHeight: "220px" }}>
                <img
                  src={form.image}
                  alt="Aperçu"
                  className="w-full object-cover"
                  style={{ maxHeight: "220px" }}
                  onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
                />
                <button
                  type="button"
                  onClick={() => { set("image", ""); if (fileRef.current) fileRef.current.value = ""; }}
                  className="absolute top-2 right-2 flex h-7 w-7 items-center justify-center rounded-full bg-black/60 text-white text-xs hover:bg-red-600 transition"
                  title="Supprimer l'image"
                >
                  ✕
                </button>
              </div>
              <p className="mt-2 text-xs text-gray-400 truncate">{form.image}</p>
            </div>
          )}

          {error && <p className="text-sm text-red-600">{error}</p>}
          {success && <p className="text-sm text-green-700">{success}</p>}

          <div className="flex gap-3">
            <button type="submit" disabled={saving || uploading}
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

      {/* List */}
      <div className="rounded-2xl border border-gray-200 bg-white p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">Articles ({items.length})</h2>
          <button onClick={load} disabled={loading}
            className="rounded-xl border border-gray-200 px-4 py-2 text-sm hover:bg-gray-50 disabled:opacity-50 transition">
            {loading ? "…" : "Actualiser"}
          </button>
        </div>
        {items.length === 0 && !loading ? (
          <p className="text-sm text-gray-500 py-6 text-center">Aucun article.</p>
        ) : (
          <div className="space-y-3">
            {items.map((item) => (
              <div key={item._id} className="flex items-center gap-4 rounded-xl border border-gray-100 p-4 hover:bg-gray-50 transition">
                <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl overflow-hidden bg-lightgreen">
                  {item.image
                    ? <img src={item.image} alt={item.titre} className="h-full w-full object-cover" />
                    : <span className="text-2xl">📰</span>}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-gray-900 truncate">{item.titre || "Sans titre"}</p>
                  <p className="text-xs text-gray-500">
                    {[catLabel(item), item.createdAt ? new Date(item.createdAt).toLocaleDateString("fr-FR") : null].filter(Boolean).join(" · ")}
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
