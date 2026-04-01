"use client";

import { useEffect, useState } from "react";

type ArticleItem = {
  _id: string;
  titre?: string;
  contenu?: string;
  categoryId?: string | { _id?: string; nom?: string } | null;
  authorId?: string;
  createdAt?: string;
  [key: string]: unknown;
};

type CategoryItem = {
  _id: string;
  nom?: string;
};

type ArticleForm = {
  titre: string;
  contenu: string;
  categoryId: string;
  authorId: string;
};

const initialForm: ArticleForm = {
  titre: "",
  contenu: "",
  categoryId: "",
  authorId: "",
};

export default function AdminArticlesPage() {
  const [items, setItems] = useState<ArticleItem[]>([]);
  const [categories, setCategories] = useState<CategoryItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<ArticleForm>(initialForm);

  async function loadItems() {
    setLoading(true);
    setError("");
    try {
      const [articlesRes, categoriesRes] = await Promise.all([
        fetch("/api/articles", { cache: "no-store" }),
        fetch("/api/categories", { cache: "no-store" }),
      ]);

      const articlesData = await articlesRes.json();
      const categoriesData = await categoriesRes.json();

      const articleList = Array.isArray(articlesData) ? articlesData : articlesData.items || articlesData.data || [];
      const categoryList = Array.isArray(categoriesData)
        ? categoriesData
        : categoriesData.items || categoriesData.data || [];

      setItems(articleList);
      setCategories(categoryList);
    } catch {
      setError("Failed to load articles.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadItems();
  }, []);

  function resetForm() {
    setEditingId(null);
    setForm(initialForm);
  }

  function startEdit(item: ArticleItem) {
    const categoryValue =
      typeof item.categoryId === "string"
        ? item.categoryId
        : item.categoryId && typeof item.categoryId === "object"
        ? String(item.categoryId._id || "")
        : "";

    setEditingId(item._id);
    setForm({
      titre: String(item.titre || ""),
      contenu: String(item.contenu || ""),
      categoryId: categoryValue,
      authorId: String(item.authorId || ""),
    });
  }

  function updateField<K extends keyof ArticleForm>(key: K, value: ArticleForm[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (!form.titre.trim()) {
      setError("Title is required.");
      return;
    }

    setSaving(true);

    try {
      const url = editingId ? `/api/articles/${editingId}` : "/api/articles";
      const method = editingId ? "PUT" : "POST";

      const payload = {
        titre: form.titre.trim(),
        contenu: form.contenu.trim(),
        categoryId: form.categoryId || null,
        authorId: form.authorId.trim() || null,
      };

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
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
    const ok = window.confirm("Delete this article?");
    if (!ok) return;

    try {
      const res = await fetch(`/api/articles/${id}`, { method: "DELETE" });
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
          <h2 className="text-xl font-semibold">Articles</h2>
          <p className="text-sm opacity-70">Create, edit, and delete articles.</p>
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
        <h3 className="font-semibold">{editingId ? "Edit article" : "New article"}</h3>

        <input
          value={form.titre}
          onChange={(e) => updateField("titre", e.target.value)}
          placeholder="Title"
          className="w-full rounded border px-3 py-2 text-sm outline-none"
        />

        <textarea
          value={form.contenu}
          onChange={(e) => updateField("contenu", e.target.value)}
          placeholder="Content"
          className="min-h-36 w-full rounded border px-3 py-2 text-sm outline-none"
        />

        <div className="grid gap-3 md:grid-cols-2">
          <select
            value={form.categoryId}
            onChange={(e) => updateField("categoryId", e.target.value)}
            className="w-full rounded border px-3 py-2 text-sm outline-none"
          >
            <option value="">No category</option>
            {categories.map((cat) => (
              <option key={cat._id} value={cat._id}>
                {cat.nom || "Unnamed category"}
              </option>
            ))}
          </select>

          <input
            value={form.authorId}
            onChange={(e) => updateField("authorId", e.target.value)}
            placeholder="Author ID (optional)"
            className="w-full rounded border px-3 py-2 text-sm outline-none"
          />
        </div>

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
      {items.length === 0 && !loading ? <p className="text-sm opacity-70">No articles found.</p> : null}

      <div className="space-y-4">
        {items.map((item) => {
          const categoryLabel =
            typeof item.categoryId === "object" && item.categoryId?.nom
              ? item.categoryId.nom
              : typeof item.categoryId === "string"
              ? item.categoryId
              : "No category";

          return (
            <article key={item._id} className="rounded-xl border p-4">
              <div className="mb-3 flex items-start justify-between gap-3">
                <div>
                  <h3 className="font-semibold">{item.titre || "No title"}</h3>
                  <p className="text-sm opacity-75">
                    {categoryLabel} {item.authorId ? `— Author: ${item.authorId}` : ""}
                  </p>
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

              <p className="whitespace-pre-wrap text-sm leading-6">
                {String(item.contenu || "")}
              </p>
            </article>
          );
        })}
      </div>
    </div>
  );
}