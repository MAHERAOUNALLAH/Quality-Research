"use client";

import { useEffect, useState } from "react";

type MessageItem = {
  _id: string;
  name?: string;
  email?: string;
  subject?: string;
  message?: string;
  createdAt?: string;
  [key: string]: unknown;
};

export default function AdminMessagesPage() {
  const [items, setItems] = useState<MessageItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function loadItems() {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/messages", { cache: "no-store" });
      const data = await res.json();
      const list = Array.isArray(data) ? data : data.items || data.data || [];
      setItems(list);
    } catch {
      setError("Failed to load messages.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadItems();
  }, []);

  async function handleDelete(id: string) {
    const ok = window.confirm("Delete this message?");
    if (!ok) return;

    try {
      const res = await fetch(`/api/messages/${id}`, { method: "DELETE" });
      const data = await res.json();
      if (!res.ok || data.ok === false) {
        throw new Error(data.message || "Delete failed");
      }
      await loadItems();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Delete failed.");
    }
  }

  return (
    <div className="rounded-2xl border p-5">
      <div className="mb-5 flex items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-semibold">Messages</h2>
          <p className="text-sm opacity-70">Sprint 3 asks for list + delete for contact inbox.</p>
        </div>
        <button
          onClick={loadItems}
          className="rounded border px-3 py-2 text-sm hover:bg-black/5"
          type="button"
        >
          Refresh
        </button>
      </div>

      {error ? <p className="mb-4 text-sm text-red-700">{error}</p> : null}
      {items.length === 0 && !loading ? <p className="text-sm opacity-70">No messages found.</p> : null}

      <div className="space-y-4">
        {items.map((item) => (
          <article key={item._id} className="rounded-xl border p-4">
            <div className="mb-3 flex items-start justify-between gap-3">
              <div>
                <h3 className="font-semibold">{item.subject || "No subject"}</h3>
                <p className="text-sm opacity-75">{item.name || "Unknown"} — {item.email || "No email"}</p>
                <p className="text-xs opacity-60">{item.createdAt ? new Date(item.createdAt).toLocaleString() : item._id}</p>
              </div>
              <button
                onClick={() => handleDelete(item._id)}
                className="rounded border px-3 py-1.5 text-sm hover:bg-black/5"
                type="button"
              >
                Delete
              </button>
            </div>

            <p className="whitespace-pre-wrap text-sm leading-6">{String(item.message || "")}</p>
          </article>
        ))}
      </div>
    </div>
  );
}
