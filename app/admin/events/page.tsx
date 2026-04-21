"use client";

import { useEffect, useRef, useState } from "react";

type EventItem = {
  _id: string;
  titre?: string;
  description?: string;
  date?: string;
  lieu?: string;
  categoryId?: string | { _id?: string; nom?: string } | null;
  image?: string;
  createdAt?: string;
};

type CategoryItem = { _id: string; nom?: string };

type EventForm = {
  titre: string;
  description: string;
  date: string;
  lieu: string;
  categoryId: string;
  image: string;
};

const initialForm: EventForm = { titre: "", description: "", date: "", lieu: "", categoryId: "", image: "" };
const INPUT_CLS = "w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 transition";

function toDateInputValue(v?: string) {
  if (!v) return "";
  const d = new Date(v);
  if (isNaN(d.getTime())) return "";
  return new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 16);
}

async function uploadFile(file: File, folder: string): Promise<string> {
  const fd = new FormData();
  fd.append("file", file);
  fd.append("folder", folder);
  const res = await fetch("/api/upload", { method: "POST", body: fd });
  const data = await res.json();
  if (!res.ok || !data.ok) throw new Error(data.message || "Upload échoué");
  return data.url as string;
}

export default function AdminEventsPage() {
  const [items, setItems] = useState<EventItem[]>([]);
  const [categories, setCategories] = useState<CategoryItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<EventForm>(initialForm);
  const fileRef = useRef<HTMLInputElement>(null);

  async function load() {
    setLoading(true);
    try {
      const [er, cr] = await Promise.all([
        fetch("/api/events", { cache: "no-store" }),
        fetch("/api/categories", { cache: "no-store" }),
      ]);
      const ed = await er.json();
      const cd = await cr.json();
      setItems(Array.isArray(ed) ? ed : ed.items || []);
      setCategories(Array.isArray(cd) ? cd : cd.items || []);
    } catch { setError("Erreur de chargement."); }
    finally { setLoading(false); }
  }

  useEffect(() => { load(); }, []);

  function reset() { setEditingId(null); setForm(initialForm); setError(""); setSuccess(""); if (fileRef.current) fileRef.current.value = ""; }

  function startEdit(item: EventItem) {
    const catId = typeof item.categoryId === "string" ? item.categoryId
      : item.categoryId && typeof item.categoryId === "object" ? String(item.categoryId._id || "") : "";
    setEditingId(item._id);
    setForm({ titre: item.titre || "", description: item.description || "", date: toDateInputValue(item.date), lieu: item.lieu || "", categoryId: catId, image: item.image || "" });
    setError(""); setSuccess("");
  }

  function set<K extends keyof EventForm>(k: K, v: EventForm[K]) { setForm((p) => ({ ...p, [k]: v })); }

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true); setError("");
    try { set("image", await uploadFile(file, "events")); }
    catch (err) { setError(err instanceof Error ? err.message : "Upload échoué"); }
    finally { setUploading(false); }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.titre.trim()) { setError("Le titre est requis."); return; }
    setSaving(true); setError(""); setSuccess("");
    try {
      const url = editingId ? `/api/events/${editingId}` : "/api/events";
      const res = await fetch(url, {
        method: editingId ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ titre: form.titre.trim(), description: form.description.trim(), date: form.date || null, lieu: form.lieu.trim(), categoryId: form.categoryId || null, image: form.image }),
      });
      const data = await res.json();
      if (!res.ok || !data.ok) throw new Error(data.message || "Erreur");
      setSuccess(editingId ? "Événement mis à jour." : "Événement ajouté.");
      reset(); await load();
    } catch (err) { setError(err instanceof Error ? err.message : "Erreur"); }
    finally { setSaving(false); }
  }

  async function handleDelete(id: string) {
    if (!confirm("Supprimer cet événement ?")) return;
    try {
      const res = await fetch(`/api/events/${id}`, { method: "DELETE" });
      const data = await res.json();
      if (!res.ok || !data.ok) throw new Error(data.message || "Erreur");
      if (editingId === id) reset();
      setSuccess("Événement supprimé."); await load();
    } catch (err) { setError(err instanceof Error ? err.message : "Erreur"); }
  }

  const catLabel = (item: EventItem) =>
    typeof item.categoryId === "object" && item.categoryId?.nom ? item.categoryId.nom : null;

  const isUpcoming = (d?: string) => d ? new Date(d) >= new Date() : false;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Événements</h1>
        <p className="text-sm text-gray-500 mt-1">Gérez les congrès, ateliers et webinaires.</p>
      </div>

      {/* Form */}
      <div className="rounded-2xl border border-gray-200 bg-white p-6">
        <h2 className="text-lg font-semibold mb-4">{editingId ? "Modifier l'événement" : "Nouvel événement"}</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Titre *</label>
            <input value={form.titre} onChange={(e) => set("titre", e.target.value)} placeholder="Titre de l'événement" className={INPUT_CLS} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <textarea value={form.description} onChange={(e) => set("description", e.target.value)} rows={4}
              placeholder="Description de l'événement…" className={INPUT_CLS} />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Date &amp; heure</label>
              <input type="datetime-local" value={form.date} onChange={(e) => set("date", e.target.value)} className={INPUT_CLS} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Lieu</label>
              <input value={form.lieu} onChange={(e) => set("lieu", e.target.value)} placeholder="Tunis, Hôtel XYZ…" className={INPUT_CLS} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Catégorie</label>
              <select value={form.categoryId} onChange={(e) => set("categoryId", e.target.value)} className={INPUT_CLS}>
                <option value="">Aucune catégorie</option>
                {categories.map((c) => <option key={c._id} value={c._id}>{c.nom || "Sans nom"}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Image</label>
              <div className="flex gap-2 items-center">
                <input type="file" ref={fileRef} accept="image/*" onChange={handleFileChange} className="hidden" />
                <button type="button" onClick={() => fileRef.current?.click()} disabled={uploading}
                  className="rounded-xl border border-gray-200 px-4 py-2.5 text-sm font-medium hover:bg-gray-50 disabled:opacity-50 transition flex-shrink-0">
                  {uploading ? "Upload…" : "📷 Choisir"}
                </button>
                <input value={form.image} onChange={(e) => set("image", e.target.value)} placeholder="/uploads/events/photo.jpg" className={INPUT_CLS} />
              </div>
              {form.image && (
                <img src={form.image} alt="preview" className="mt-2 h-20 w-auto rounded-lg object-cover border border-gray-100" />
              )}
            </div>
          </div>

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
          <h2 className="text-lg font-semibold">Événements ({items.length})</h2>
          <button onClick={load} disabled={loading}
            className="rounded-xl border border-gray-200 px-4 py-2 text-sm hover:bg-gray-50 disabled:opacity-50 transition">
            {loading ? "…" : "Actualiser"}
          </button>
        </div>
        {items.length === 0 && !loading ? (
          <p className="text-sm text-gray-500 py-6 text-center">Aucun événement.</p>
        ) : (
          <div className="space-y-3">
            {items.map((item) => {
              const upcoming = isUpcoming(item.date);
              return (
                <div key={item._id} className="flex items-center gap-4 rounded-xl border border-gray-100 p-4 hover:bg-gray-50 transition">
                  <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl overflow-hidden bg-lightgreen">
                    {item.image
                      ? <img src={item.image} alt={item.titre} className="h-full w-full object-cover" />
                      : <span className="text-2xl">📅</span>}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="font-semibold text-gray-900 truncate">{item.titre || "Sans titre"}</p>
                      {upcoming && <span className="rounded-full bg-green-50 px-2 py-0.5 text-xs font-medium text-green-700">À venir</span>}
                    </div>
                    <p className="text-xs text-gray-500">
                      {[item.lieu, catLabel(item), item.date ? new Date(item.date).toLocaleDateString("fr-FR") : null].filter(Boolean).join(" · ")}
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
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
