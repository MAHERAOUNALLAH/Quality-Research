"use client";

import { useEffect, useState } from "react";

type CategoryItem = {
  _id: string;
  nom?: string;
  createdAt?: string;
  updatedAt?: string;
  [key: string]: unknown;
};

export default function AdminCategoriesPage() {
  const [items, setItems] = useState<CategoryItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [nom, setNom] = useState("");

  async function loadItems() {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/categories", { cache: "no-store" });
      const data = await res.json();
      const list = Array.isArray(data) ? data : data.items || data.data || [];
      setItems(list);
    } catch {
      setError("Failed to load categories.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadItems();
  }, []);

  function resetForm() {
    setEditingId(null);
    setNom("");
  }

  function startEdit(item: CategoryItem) {
    setEditingId(item._id);
    setNom(String(item.nom || ""));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (!nom.trim()) {
      setError("Category name is required.");
      return;
    }

    setSaving(true);

    try {
      const url = editingId ? `/api/categories/${editingId}` : "/api/categories";
      const method = editingId ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nom: nom.trim() }),
      });

      const data = await res.json();

      if (!res.ok || data.ok === false) {
        throw new Error(data.message || "Save failed");
      }

      resetForm();
      await loadItems();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Save failed.");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: string) {
    const ok = window.confirm("Delete this category?");
    if (!ok) return;

    try {
      const res = await fetch(`/api/categories/${id}`, { method: "DELETE" });
      const data = await res.json();

      if (!res.ok || data.ok === false) {
        throw new Error(data.message || "Delete failed");
      }

      if (editingId === id) resetForm();
      await loadItems();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Delete failed.");
    }
  }

  return (
    <div className="rounded-2xl border p-5">
      <div className="mb-5 flex items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-semibold">Categories</h2>
          <p className="text-sm opacity-70">Create, edit, and delete categories.</p>
        </div>
        <button
          onClick={loadItems}
          className="rounded border px-3 py-2 text-sm hover:bg-black/5"
          type="button"
        >
          Refresh
        </button>
      </div>

      <form onSubmit={handleSubmit} className="mb-6 space-y-3 rounded-xl border p-4">
        <h3 className="font-semibold">{editingId ? "Edit category" : "New category"}</h3>

        <input
          value={nom}
          onChange={(e) => setNom(e.target.value)}
          placeholder="Category name"
          className="w-full rounded border px-3 py-2 text-sm outline-none"
        />

        <div className="flex gap-2">
          <button
            type="submit"
            disabled={saving}
            className="rounded border px-3 py-2 text-sm hover:bg-black/5 disabled:opacity-50"
          >
            {saving ? "Saving..." : editingId ? "Update" : "Create"}
          </button>

          {editingId ? (
            <button
              type="button"
              onClick={resetForm}
              className="rounded border px-3 py-2 text-sm hover:bg-black/5"
            >
              Cancel
            </button>
          ) : null}
        </div>
      </form>

      {error ? <p className="mb-4 text-sm text-red-700">{error}</p> : null}
      {items.length === 0 && !loading ? <p className="text-sm opacity-70">No categories found.</p> : null}

      <div className="space-y-4">
        {items.map((item) => (
          <article key={item._id} className="rounded-xl border p-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h3 className="font-semibold">{item.nom || "No name"}</h3>
                <p className="text-xs opacity-60">
                  {item.createdAt ? new Date(item.createdAt).toLocaleString() : item._id}
                </p>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => startEdit(item)}
                  className="rounded border px-3 py-1.5 text-sm hover:bg-black/5"
                  type="button"
                >
                  Edit
                </button>

                <button
                  onClick={() => handleDelete(item._id)}
                  className="rounded border px-3 py-1.5 text-sm hover:bg-black/5"
                  type="button"
                >
                  Delete
                </button>
              </div>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}