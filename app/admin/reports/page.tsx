"use client";

import { useEffect, useRef, useState } from "react";

type ReportItem = {
  _id: string;
  title?: string;
  content?: string;
  type?: string;
  year?: number;
  fileUrl?: string;
  createdAt?: string;
};

type ReportForm = {
  title: string;
  content: string;
  type: string;
  year: number;
  fileUrl: string;
};

const initialForm: ReportForm = { title: "", content: "", type: "activite", year: new Date().getFullYear(), fileUrl: "" };
const TYPES = [
  { value: "activite",   label: "Rapport d'activité" },
  { value: "financier",  label: "Rapport financier" },
  { value: "autre",      label: "Autre" },
];
const INPUT_CLS = "w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 transition";
const typeLabel = (t?: string) => TYPES.find((x) => x.value === t)?.label ?? t ?? "";

async function uploadFile(file: File, folder: string): Promise<string> {
  const fd = new FormData(); fd.append("file", file); fd.append("folder", folder);
  const res = await fetch("/api/upload", { method: "POST", body: fd });
  const data = await res.json();
  if (!res.ok || !data.ok) throw new Error(data.message || "Upload échoué");
  return data.url as string;
}

export default function AdminReportsPage() {
  const [items, setItems] = useState<ReportItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<ReportForm>(initialForm);
  const fileRef = useRef<HTMLInputElement>(null);

  async function load() {
    setLoading(true);
    try {
      const res = await fetch("/api/reports", { cache: "no-store" });
      const data = await res.json();
      setItems(Array.isArray(data) ? data : data.items || []);
    } catch { setError("Erreur de chargement."); }
    finally { setLoading(false); }
  }

  useEffect(() => { load(); }, []);

  function reset() {
    setEditingId(null); setForm(initialForm); setError(""); setSuccess("");
    if (fileRef.current) fileRef.current.value = "";
  }

  function startEdit(item: ReportItem) {
    setEditingId(item._id);
    setForm({ title: item.title || "", content: item.content || "", type: item.type || "activite", year: item.year || new Date().getFullYear(), fileUrl: item.fileUrl || "" });
    setError(""); setSuccess("");
  }

  function set<K extends keyof ReportForm>(k: K, v: ReportForm[K]) { setForm((p) => ({ ...p, [k]: v })); }

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]; if (!file) return;
    setUploading(true); setError("");
    try { set("fileUrl", await uploadFile(file, "reports")); }
    catch (err) { setError(err instanceof Error ? err.message : "Upload échoué"); }
    finally { setUploading(false); }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.title.trim()) { setError("Le titre est requis."); return; }
    setSaving(true); setError(""); setSuccess("");
    try {
      const url = editingId ? `/api/reports/${editingId}` : "/api/reports";
      const res = await fetch(url, {
        method: editingId ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: form.title.trim(), content: form.content.trim(), type: form.type, year: form.year, fileUrl: form.fileUrl }),
      });
      const data = await res.json();
      if (!res.ok || !data.ok) throw new Error(data.message || "Erreur");
      setSuccess(editingId ? "Rapport mis à jour." : "Rapport ajouté.");
      reset(); await load();
    } catch (err) { setError(err instanceof Error ? err.message : "Erreur"); }
    finally { setSaving(false); }
  }

  async function handleDelete(id: string) {
    if (!confirm("Supprimer ce rapport ?")) return;
    try {
      const res = await fetch(`/api/reports/${id}`, { method: "DELETE" });
      const data = await res.json();
      if (!res.ok || !data.ok) throw new Error(data.message || "Erreur");
      if (editingId === id) reset();
      setSuccess("Rapport supprimé."); await load();
    } catch (err) { setError(err instanceof Error ? err.message : "Erreur"); }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Rapports</h1>
        <p className="text-sm text-gray-500 mt-1">Gérez les rapports d'activité et financiers.</p>
      </div>

      <div className="rounded-2xl border border-gray-200 bg-white p-6">
        <h2 className="text-lg font-semibold mb-4">{editingId ? "Modifier le rapport" : "Nouveau rapport"}</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Titre *</label>
              <input value={form.title} onChange={(e) => set("title", e.target.value)} placeholder="Rapport d'activité 2024…" className={INPUT_CLS} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
              <select value={form.type} onChange={(e) => set("type", e.target.value)} className={INPUT_CLS}>
                {TYPES.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Année</label>
              <input type="number" value={form.year} onChange={(e) => set("year", Number(e.target.value))}
                min={2000} max={2100} className={INPUT_CLS} />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Contenu / Résumé</label>
              <textarea value={form.content} onChange={(e) => set("content", e.target.value)} rows={3}
                placeholder="Résumé ou contenu du rapport…" className={INPUT_CLS} />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Fichier PDF / Document</label>
              <div className="flex gap-2 items-center">
                <input type="file" ref={fileRef} accept=".pdf,.doc,.docx,image/*" onChange={handleFileChange} className="hidden" />
                <button type="button" onClick={() => fileRef.current?.click()} disabled={uploading}
                  className="rounded-xl border border-gray-200 px-4 py-2.5 text-sm font-medium hover:bg-gray-50 disabled:opacity-50 transition flex-shrink-0">
                  {uploading ? "Upload…" : "📎 Choisir"}
                </button>
                <input value={form.fileUrl} onChange={(e) => set("fileUrl", e.target.value)}
                  placeholder="/uploads/reports/rapport.pdf" className={INPUT_CLS} />
              </div>
              {form.fileUrl && (
                <a href={form.fileUrl} target="_blank" rel="noreferrer"
                  className="mt-1 inline-block text-xs text-primary hover:underline">
                  📎 Voir le fichier
                </a>
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

      <div className="rounded-2xl border border-gray-200 bg-white p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">Rapports ({items.length})</h2>
          <button onClick={load} disabled={loading}
            className="rounded-xl border border-gray-200 px-4 py-2 text-sm hover:bg-gray-50 disabled:opacity-50 transition">
            {loading ? "…" : "Actualiser"}
          </button>
        </div>
        {items.length === 0 && !loading ? (
          <p className="text-sm text-gray-500 py-6 text-center">Aucun rapport.</p>
        ) : (
          <div className="space-y-3">
            {items.map((item) => (
              <div key={item._id} className="flex items-center gap-4 rounded-xl border border-gray-100 p-4 hover:bg-gray-50 transition">
                <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl bg-lightgreen text-2xl">📋</div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-gray-900 truncate">{item.title || "Sans titre"}</p>
                  <p className="text-xs text-gray-500">
                    {[typeLabel(item.type), item.year ? String(item.year) : null].filter(Boolean).join(" · ")}
                  </p>
                </div>
                <div className="flex gap-2 flex-shrink-0">
                  {item.fileUrl && (
                    <a href={item.fileUrl} target="_blank" rel="noreferrer"
                      className="rounded-lg border border-gray-200 px-3 py-1.5 text-xs font-medium hover:bg-gray-100 transition">
                      Voir
                    </a>
                  )}
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
