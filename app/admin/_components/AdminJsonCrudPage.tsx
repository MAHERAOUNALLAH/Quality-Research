"use client";

import { useEffect, useMemo, useState } from "react";

type GenericItem = {
  _id?: string;
  title?: string;
  name?: string;
  nom?: string;
  [key: string]: unknown;
};

function safePretty(obj: unknown) {
  return JSON.stringify(obj, null, 2);
}

function titleOf(item: GenericItem) {
  return item.title || item.name || item.nom || "Untitled item";
}

export default function AdminJsonCrudPage({
  resource,
  title,
  starter,
}: {
  resource: "projects" | "calls" | "reports";
  title: string;
  starter: Record<string, unknown>;
}) {
  const [items, setItems] = useState<GenericItem[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [jsonText, setJsonText] = useState(safePretty(starter));
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const endpoint = useMemo(() => `/api/${resource}`, [resource]);

  async function loadItems() {
    setLoading(true);
    setError("");
    try {
      const res = await fetch(endpoint, { cache: "no-store" });
      const data = await res.json();
      const list = Array.isArray(data) ? data : data.items || data.data || [];
      setItems(list);
    } catch {
      setError("Failed to load data.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadItems();
  }, [endpoint]);

  function resetForm() {
    setSelectedId(null);
    setJsonText(safePretty(starter));
    setMessage("");
    setError("");
  }

  function startEdit(item: GenericItem) {
    const { _id, ...rest } = item;
    setSelectedId(_id || null);
    setJsonText(safePretty(rest));
    setMessage("");
    setError("");
  }

  async function handleSave() {
    setLoading(true);
    setError("");
    setMessage("");

    try {
      const payload = JSON.parse(jsonText);
      const isEdit = Boolean(selectedId);
      const url = isEdit ? `${endpoint}/${selectedId}` : endpoint;
      const method = isEdit ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok || data.ok === false) {
        throw new Error(data.message || `Request failed (${res.status})`);
      }

      setMessage(isEdit ? "Item updated." : "Item created.");
      resetForm();
      await loadItems();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Invalid JSON or request failed.");
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(id?: string) {
    if (!id) return;
    const ok = window.confirm("Delete this item?");
    if (!ok) return;

    setLoading(true);
    setError("");
    setMessage("");
    try {
      const res = await fetch(`${endpoint}/${id}`, { method: "DELETE" });
      const data = await res.json();
      if (!res.ok || data.ok === false) {
        throw new Error(data.message || `Delete failed (${res.status})`);
      }
      if (selectedId === id) resetForm();
      setMessage("Item deleted.");
      await loadItems();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Delete failed.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[1.05fr_1fr]">
      <section className="rounded-2xl border p-5">
        <div className="mb-4 flex items-center justify-between gap-3">
          <div>
            <h2 className="text-xl font-semibold">{title}</h2>
            <p className="text-sm opacity-70">
              Use JSON so this page still works even if your collection fields are slightly different.
            </p>
          </div>
          <button
            onClick={resetForm}
            className="rounded border px-3 py-2 text-sm hover:bg-black/5"
            type="button"
          >
            New item
          </button>
        </div>

        <label className="mb-2 block text-sm font-medium">
          {selectedId ? "Edit JSON" : "Create JSON"}
        </label>
        <textarea
          value={jsonText}
          onChange={(e) => setJsonText(e.target.value)}
          className="min-h-[380px] w-full rounded-xl border p-4 font-mono text-sm"
          spellCheck={false}
        />

        <div className="mt-4 flex items-center gap-3">
          <button
            onClick={handleSave}
            disabled={loading}
            className="rounded bg-black px-4 py-2 text-sm text-white disabled:opacity-50"
            type="button"
          >
            {selectedId ? "Update" : "Create"}
          </button>
          {message ? <span className="text-sm text-green-700">{message}</span> : null}
          {error ? <span className="text-sm text-red-700">{error}</span> : null}
        </div>
      </section>

      <section className="rounded-2xl border p-5">
        <div className="mb-4 flex items-center justify-between gap-3">
          <h2 className="text-xl font-semibold">Existing items</h2>
          <button
            onClick={loadItems}
            disabled={loading}
            className="rounded border px-3 py-2 text-sm hover:bg-black/5 disabled:opacity-50"
            type="button"
          >
            Refresh
          </button>
        </div>

        <div className="space-y-3">
          {items.length === 0 && !loading ? (
            <p className="text-sm opacity-70">No items found yet.</p>
          ) : null}

          {items.map((item) => (
            <article key={item._id} className="rounded-xl border p-4">
              <div className="mb-2 flex items-start justify-between gap-3">
                <div>
                  <h3 className="font-semibold">{titleOf(item)}</h3>
                  <p className="text-xs opacity-60">{item._id}</p>
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

              <pre className="overflow-x-auto rounded-lg bg-black/5 p-3 text-xs whitespace-pre-wrap">
                {safePretty(item)}
              </pre>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}
