"use client";

import { useEffect, useState } from "react";

type EventItem = {
  _id: string;
  titre?: string;
  description?: string;
  date?: string;
  lieu?: string;
  categoryId?: string | { _id?: string; nom?: string } | null;
  createdAt?: string;
  [key: string]: unknown;
};

type CategoryItem = {
  _id: string;
  nom?: string;
};

type EventForm = {
  titre: string;
  description: string;
  date: string;
  lieu: string;
  categoryId: string;
};

const initialForm: EventForm = {
  titre: "",
  description: "",
  date: "",
  lieu: "",
  categoryId: "",
};

function toDateInputValue(value?: string) {
  if (!value) return "";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "";
  const local = new Date(d.getTime() - d.getTimezoneOffset() * 60000);
  return local.toISOString().slice(0, 16);
}

export default function AdminEventsPage() {
  const [items, setItems] = useState<EventItem[]>([]);
  const [categories, setCategories] = useState<CategoryItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<EventForm>(initialForm);

  async function loadItems() {
    setLoading(true);
    setError("");
    try {
      const [eventsRes, categoriesRes] = await Promise.all([
        fetch("/api/events", { cache: "no-store" }),
        fetch("/api/categories", { cache: "no-store" }),
      ]);

      const eventsData = await eventsRes.json();
      const categoriesData = await categoriesRes.json();

      const eventList = Array.isArray(eventsData) ? eventsData : eventsData.items || eventsData.data || [];
      const categoryList = Array.isArray(categoriesData)
        ? categoriesData
        : categoriesData.items || categoriesData.data || [];

      setItems(eventList);
      setCategories(categoryList);
    } catch {
      setError("Failed to load events.");
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

  function startEdit(item: EventItem) {
    const categoryValue =
      typeof item.categoryId === "string"
        ? item.categoryId
        : item.categoryId && typeof item.categoryId === "object"
        ? String(item.categoryId._id || "")
        : "";

    setEditingId(item._id);
    setForm({
      titre: String(item.titre || ""),
      description: String(item.description || ""),
      date: toDateInputValue(item.date),
      lieu: String(item.lieu || ""),
      categoryId: categoryValue,
    });
  }

  function updateField<K extends keyof EventForm>(key: K, value: EventForm[K]) {
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
      const url = editingId ? `/api/events/${editingId}` : "/api/events";
      const method = editingId ? "PUT" : "POST";

      const payload = {
        titre: form.titre.trim(),
        description: form.description.trim(),
        date: form.date || null,
        lieu: form.lieu.trim(),
        categoryId: form.categoryId || null,
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
    const ok = window.confirm("Delete this event?");
    if (!ok) return;

    try {
      const res = await fetch(`/api/events/${id}`, { method: "DELETE" });
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
          <h2 className="text-xl font-semibold">Events</h2>
          <p className="text-sm opacity-70">Create, edit, and delete events.</p>
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
        <h3 className="font-semibold">{editingId ? "Edit event" : "New event"}</h3>

        <input
          value={form.titre}
          onChange={(e) => updateField("titre", e.target.value)}
          placeholder="Title"
          className="w-full rounded border px-3 py-2 text-sm outline-none"
        />

        <textarea
          value={form.description}
          onChange={(e) => updateField("description", e.target.value)}
          placeholder="Description"
          className="min-h-28 w-full rounded border px-3 py-2 text-sm outline-none"
        />

        <div className="grid gap-3 md:grid-cols-2">
          <input
            type="datetime-local"
            value={form.date}
            onChange={(e) => updateField("date", e.target.value)}
            className="w-full rounded border px-3 py-2 text-sm outline-none"
          />

          <input
            value={form.lieu}
            onChange={(e) => updateField("lieu", e.target.value)}
            placeholder="Location"
            className="w-full rounded border px-3 py-2 text-sm outline-none"
          />
        </div>

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
      {items.length === 0 && !loading ? <p className="text-sm opacity-70">No events found.</p> : null}

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
                    {item.lieu || "No location"} — {categoryLabel}
                  </p>
                  <p className="text-xs opacity-60">
                    {item.date ? new Date(item.date).toLocaleString() : item._id}
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
                {String(item.description || "")}
              </p>
            </article>
          );
        })}
      </div>
    </div>
  );
}