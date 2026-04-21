"use client";

import { useEffect, useRef, useState } from "react";

type ProjectItem = {
  _id: string;
  title?: string;
  description?: string;
  excerpt?: string;
  status?: string;
  startDate?: string;
  endDate?: string;
  image?: string;
  members?: string[];
};

type ProjectForm = {
  title: string;
  description: string;
  excerpt: string;
  status: string;
  startDate: string;
  endDate: string;
  image: string;
  members: string;
};

const initialForm: ProjectForm = { title: "", description: "", excerpt: "", status: "active", startDate: "", endDate: "", image: "", members: "" };
const STATUSES = [
  { value: "active",    label: "En cours" },
  { value: "planned",   label: "Planifié" },
  { value: "completed", label: "Terminé" },
  { value: "archived",  label: "Archivé" },
];
const INPUT_CLS = "w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 transition";
const statusDot: Record<string, string> = { active: "bg-green-500", planned: "bg-blue-400", completed: "bg-gray-400", archived: "bg-gray-300" };
const statusLabel: Record<string, string> = { active: "En cours", planned: "Planifié", completed: "Terminé", archived: "Archivé" };

async function uploadFile(file: File, folder: string): Promise<string> {
  const fd = new FormData(); fd.append("file", file); fd.append("folder", folder);
  const res = await fetch("/api/upload", { method: "POST", body: fd });
  const data = await res.json();
  if (!res.ok || !data.ok) throw new Error(data.message || "Upload échoué");
  return data.url as string;
}

export default function AdminProjectsPage() {
  const [items, setItems] = useState<ProjectItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<ProjectForm>(initialForm);
  const fileRef = useRef<HTMLInputElement>(null);

  async function load() {
    setLoading(true);
    try {
      const res = await fetch("/api/projects", { cache: "no-store" });
      const data = await res.json();
      setItems(Array.isArray(data) ? data : data.items || []);
    } catch { setError("Erreur de chargement."); }
    finally { setLoading(false); }
  }

  useEffect(() => { load(); }, []);

  function reset() { setEditingId(null); setForm(initialForm); setError(""); setSuccess(""); if (fileRef.current) fileRef.current.value = ""; }

  function startEdit(item: ProjectItem) {
    setEditingId(item._id);
    setForm({
      title: item.title || "", description: item.description || "", excerpt: item.excerpt || "",
      status: item.status || "active",
      startDate: item.startDate ? item.startDate.slice(0, 10) : "",
      endDate: item.endDate ? item.endDate.slice(0, 10) : "",
      image: item.image || "",
      members: (item.members || []).join(", "),
    });
    setError(""); setSuccess("");
  }

  function set<K extends keyof ProjectForm>(k: K, v: ProjectForm[K]) { setForm((p) => ({ ...p, [k]: v })); }

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]; if (!file) return;
    setUploading(true); setError("");
    try { set("image", await uploadFile(file, "projects")); }
    catch (err) { setError(err instanceof Error ? err.message : "Upload échoué"); }
    finally { setUploading(false); }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.title.trim()) { setError("Le titre est requis."); return; }
    setSaving(true); setError(""); setSuccess("");
    try {
      const url = editingId ? `/api/projects/${editingId}` : "/api/projects";
      const members = form.members.split(",").map((s) => s.trim()).filter(Boolean);
      const res = await fetch(url, {
        method: editingId ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: form.title.trim(), description: form.description.trim(), excerpt: form.excerpt.trim(), status: form.status, startDate: form.startDate || null, endDate: form.endDate || null, image: form.image, members }),
      });
      const data = await res.json();
      if (!res.ok || !data.ok) throw new Error(data.message || "Erreur");
      setSuccess(editingId ? "Projet mis à jour." : "Projet ajouté.");
      reset(); await load();
    } catch (err) { setError(err instanceof Error ? err.message : "Erreur"); }
    finally { setSaving(false); }
  }

  async function handleDelete(id: string) {
    if (!confirm("Supprimer ce projet ?")) return;
    try {
      const res = await fetch(`/api/projects/${id}`, { method: "DELETE" });
      const data = await res.json();
      if (!res.ok || !data.ok) throw new Error(data.message || "Erreur");
      if (editingId === id) reset();
      setSuccess("Projet supprimé."); await load();
    } catch (err) { setError(err instanceof Error ? err.message : "Erreur"); }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Projets</h1>
        <p className="text-sm text-gray-500 mt-1">Gérez les projets de recherche et collaborations.</p>
      </div>

      <div className="rounded-2xl border border-gray-200 bg-white p-6">
        <h2 className="text-lg font-semibold mb-4">{editingId ? "Modifier le projet" : "Nouveau projet"}</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Titre *</label>
              <input value={form.title} onChange={(e) => set("title", e.target.value)} placeholder="Titre du projet" className={INPUT_CLS} />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Résumé court</label>
              <input value={form.excerpt} onChange={(e) => set("excerpt", e.target.value)} placeholder="Courte description affichée sur les cartes…" className={INPUT_CLS} />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Description complète</label>
              <textarea value={form.description} onChange={(e) => set("description", e.target.value)} rows={4} placeholder="Description détaillée…" className={INPUT_CLS} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Statut</label>
              <select value={form.status} onChange={(e) => set("status", e.target.value)} className={INPUT_CLS}>
                {STATUSES.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Membres (séparés par virgule)</label>
              <input value={form.members} onChange={(e) => set("members", e.target.value)} placeholder="Dr. Dupont, Dr. Martin" className={INPUT_CLS} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Date de début</label>
              <input type="date" value={form.startDate} onChange={(e) => set("startDate", e.target.value)} className={INPUT_CLS} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Date de fin (optionnel)</label>
              <input type="date" value={form.endDate} onChange={(e) => set("endDate", e.target.value)} className={INPUT_CLS} />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Image</label>
              <div className="flex gap-2 items-center">
                <input type="file" ref={fileRef} accept="image/*" onChange={handleFileChange} className="hidden" />
                <button type="button" onClick={() => fileRef.current?.click()} disabled={uploading}
                  className="rounded-xl border border-gray-200 px-4 py-2.5 text-sm font-medium hover:bg-gray-50 disabled:opacity-50 transition flex-shrink-0">
                  {uploading ? "Upload…" : "📷 Choisir"}
                </button>
                <input value={form.image} onChange={(e) => set("image", e.target.value)} placeholder="/uploads/projects/image.jpg" className={INPUT_CLS} />
              </div>
              {form.image && <img src={form.image} alt="preview" className="mt-2 h-20 w-auto rounded-lg object-cover border border-gray-100" />}
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

      <div className="rounded-2xl border border-gray-200 bg-white p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">Projets ({items.length})</h2>
          <button onClick={load} disabled={loading}
            className="rounded-xl border border-gray-200 px-4 py-2 text-sm hover:bg-gray-50 disabled:opacity-50 transition">
            {loading ? "…" : "Actualiser"}
          </button>
        </div>
        {items.length === 0 && !loading ? (
          <p className="text-sm text-gray-500 py-6 text-center">Aucun projet.</p>
        ) : (
          <div className="space-y-3">
            {items.map((item) => (
              <div key={item._id} className="flex items-center gap-4 rounded-xl border border-gray-100 p-4 hover:bg-gray-50 transition">
                <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl overflow-hidden bg-lightgreen">
                  {item.image ? <img src={item.image} alt={item.title} className="h-full w-full object-cover" /> : <span className="text-2xl">🔬</span>}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="font-semibold text-gray-900 truncate">{item.title || "Sans titre"}</p>
                    {item.status && (
                      <span className="flex items-center gap-1 text-xs text-gray-500">
                        <span className={`h-1.5 w-1.5 rounded-full ${statusDot[item.status] || "bg-gray-400"}`} />
                        {statusLabel[item.status] || item.status}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-gray-500 truncate">{item.excerpt || item.description || ""}</p>
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
