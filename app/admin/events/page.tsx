"use client";

import {
  useEffect,
  useRef,
  useState,
  type ChangeEvent,
  type FormEvent,
} from "react";

type EventItem = {
  _id: string;
  titre?: string;
  description?: string;
  date?: string;
  lieu?: string;
  prix?: number;
  categoryId?: string | { _id?: string; nom?: string } | null;
  image?: string;
  createdAt?: string;
  registrationCount?: number;
};

type CategoryItem = { _id: string; nom?: string };

type RegisteredUser = {
  _id: string;
  userId: string;
  fullName: string;
  email: string;
  role?: string;
  status?: string;
  createdAt?: string;
};

type EventForm = {
  titre: string;
  description: string;
  date: string;
  lieu: string;
  prix: string;
  categoryId: string;
  image: string;
};

const initialForm: EventForm = {
  titre: "",
  description: "",
  date: "",
  lieu: "",
  prix: "",
  categoryId: "",
  image: "",
};

const INPUT_CLS =
  "w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 transition";

function toDateInputValue(value?: string) {
  if (!value) return "";

  const date = new Date(value);
  if (isNaN(date.getTime())) return "";

  return new Date(date.getTime() - date.getTimezoneOffset() * 60000)
    .toISOString()
    .slice(0, 16);
}

async function uploadFile(file: File, folder: string): Promise<string> {
  const fd = new FormData();
  fd.append("file", file);
  fd.append("folder", folder);

  const res = await fetch("/api/upload", { method: "POST", body: fd });
  const data = await res.json();

  if (!res.ok || !data.ok) {
    throw new Error(data.message || "Upload echoue");
  }

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
  const [openRegistrationsId, setOpenRegistrationsId] = useState<string | null>(
    null
  );
  const [loadingRegistrationsId, setLoadingRegistrationsId] = useState<
    string | null
  >(null);
  const [registrationsByEvent, setRegistrationsByEvent] = useState<
    Record<string, RegisteredUser[]>
  >({});

  const fileRef = useRef<HTMLInputElement>(null);

  async function load() {
    setLoading(true);

    try {
      const [eventsRes, categoriesRes] = await Promise.all([
        fetch("/api/events", { cache: "no-store" }),
        fetch("/api/categories", { cache: "no-store" }),
      ]);

      const eventsData = await eventsRes.json();
      const categoriesData = await categoriesRes.json();

      setItems(Array.isArray(eventsData) ? eventsData : eventsData.items || []);
      setCategories(
        Array.isArray(categoriesData)
          ? categoriesData
          : categoriesData.items || []
      );
    } catch {
      setError("Erreur de chargement.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      void load();
    }, 0);

    return () => window.clearTimeout(timeoutId);
  }, []);

  function reset() {
    setEditingId(null);
    setForm(initialForm);
    setError("");
    setSuccess("");

    if (fileRef.current) {
      fileRef.current.value = "";
    }
  }

  function startEdit(item: EventItem) {
    const catId =
      typeof item.categoryId === "string"
        ? item.categoryId
        : item.categoryId && typeof item.categoryId === "object"
          ? String(item.categoryId._id || "")
          : "";

    setEditingId(item._id);
    setForm({
      titre: item.titre || "",
      description: item.description || "",
      date: toDateInputValue(item.date),
      lieu: item.lieu || "",
      prix: item.prix ? String(item.prix) : "",
      categoryId: catId,
      image: item.image || "",
    });
    setError("");
    setSuccess("");
  }

  function setField<K extends keyof EventForm>(key: K, value: EventForm[K]) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  async function handleFileChange(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setError("");

    try {
      setField("image", await uploadFile(file, "events"));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload echoue");
    } finally {
      setUploading(false);
    }
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();

    if (!form.titre.trim()) {
      setError("Le titre est requis.");
      return;
    }

    setSaving(true);
    setError("");
    setSuccess("");

    try {
      const url = editingId ? `/api/events/${editingId}` : "/api/events";
      const res = await fetch(url, {
        method: editingId ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          titre: form.titre.trim(),
          description: form.description.trim(),
          date: form.date || null,
          lieu: form.lieu.trim(),
          prix: Number(form.prix) || 0,
          categoryId: form.categoryId || null,
          image: form.image,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.ok) throw new Error(data.message || "Erreur");

      setSuccess(editingId ? "Evenement mis a jour." : "Evenement ajoute.");
      reset();
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Supprimer cet evenement ?")) return;

    try {
      const res = await fetch(`/api/events/${id}`, { method: "DELETE" });
      const data = await res.json();

      if (!res.ok || !data.ok) throw new Error(data.message || "Erreur");

      if (editingId === id) reset();
      setSuccess("Evenement supprime.");
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur");
    }
  }

  async function toggleRegistrations(id: string) {
    if (openRegistrationsId === id) {
      setOpenRegistrationsId(null);
      return;
    }

    setOpenRegistrationsId(id);
    setError("");

    if (registrationsByEvent[id]) return;

    setLoadingRegistrationsId(id);

    try {
      const res = await fetch(`/api/events/registrations?admin=1&eventId=${id}`, {
        cache: "no-store",
      });
      const data = await res.json();

      if (!res.ok || !data.ok) throw new Error(data.message || "Erreur");

      const registrations = (data.items || []) as RegisteredUser[];
      setRegistrationsByEvent((current) => ({ ...current, [id]: registrations }));
      setItems((current) =>
        current.map((item) =>
          item._id === id
            ? { ...item, registrationCount: data.count ?? registrations.length }
            : item
        )
      );
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Erreur de chargement des inscrits"
      );
    } finally {
      setLoadingRegistrationsId(null);
    }
  }

  const catLabel = (item: EventItem) =>
    typeof item.categoryId === "object" && item.categoryId?.nom
      ? item.categoryId.nom
      : null;

  const isUpcoming = (date?: string) => (date ? new Date(date) >= new Date() : false);

  const formatRegistrationDate = (value?: string) => {
    if (!value) return "";

    const date = new Date(value);
    if (isNaN(date.getTime())) return "";

    return date.toLocaleString("fr-FR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const registrationStatusLabel = (status?: string) => {
    if (status === "paid") return "Paye";
    if (status === "free") return "Gratuit";
    return "Inscrit";
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Evenements</h1>
        <p className="text-sm text-gray-500 mt-1">
          Gerez les congres, ateliers et webinaires.
        </p>
      </div>

      <div className="rounded-2xl border border-gray-200 bg-white p-6">
        <h2 className="text-lg font-semibold mb-4">
          {editingId ? "Modifier l'evenement" : "Nouvel evenement"}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Titre *
            </label>
            <input
              value={form.titre}
              onChange={(e) => setField("titre", e.target.value)}
              placeholder="Titre de l'evenement"
              className={INPUT_CLS}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <textarea
              value={form.description}
              onChange={(e) => setField("description", e.target.value)}
              rows={4}
              placeholder="Description de l'evenement..."
              className={INPUT_CLS}
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Date &amp; heure
              </label>
              <input
                type="datetime-local"
                value={form.date}
                onChange={(e) => setField("date", e.target.value)}
                className={INPUT_CLS}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Lieu
              </label>
              <input
                value={form.lieu}
                onChange={(e) => setField("lieu", e.target.value)}
                placeholder="Tunis, Hotel XYZ..."
                className={INPUT_CLS}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Prix (TND)
              </label>
              <input
                type="number"
                min="0"
                step="0.001"
                value={form.prix}
                onChange={(e) => setField("prix", e.target.value)}
                placeholder="0 pour gratuit"
                className={INPUT_CLS}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Categorie
              </label>
              <select
                value={form.categoryId}
                onChange={(e) => setField("categoryId", e.target.value)}
                className={INPUT_CLS}
              >
                <option value="">Aucune categorie</option>
                {categories.map((category) => (
                  <option key={category._id} value={category._id}>
                    {category.nom || "Sans nom"}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Image
              </label>
              <div className="flex gap-2 items-center">
                <input
                  type="file"
                  ref={fileRef}
                  accept="image/*"
                  onChange={handleFileChange}
                  className="hidden"
                />
                <button
                  type="button"
                  onClick={() => fileRef.current?.click()}
                  disabled={uploading}
                  className="rounded-xl border border-gray-200 px-4 py-2.5 text-sm font-medium hover:bg-gray-50 disabled:opacity-50 transition flex-shrink-0"
                >
                  {uploading ? "Upload..." : "Choisir"}
                </button>
                <input
                  value={form.image}
                  onChange={(e) => setField("image", e.target.value)}
                  placeholder="/uploads/events/photo.jpg"
                  className={INPUT_CLS}
                />
              </div>

              {form.image && (
                <img
                  src={form.image}
                  alt="preview"
                  className="mt-2 h-20 w-auto rounded-lg object-cover border border-gray-100"
                />
              )}
            </div>
          </div>

          {error && <p className="text-sm text-red-600">{error}</p>}
          {success && <p className="text-sm text-green-700">{success}</p>}

          <div className="flex gap-3">
            <button
              type="submit"
              disabled={saving || uploading}
              className="rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-white disabled:opacity-50 hover:bg-primary/90 transition"
            >
              {saving
                ? "Enregistrement..."
                : editingId
                  ? "Mettre a jour"
                  : "Ajouter"}
            </button>

            {editingId && (
              <button
                type="button"
                onClick={reset}
                className="rounded-xl border border-gray-200 px-5 py-2.5 text-sm font-medium hover:bg-gray-50 transition"
              >
                Annuler
              </button>
            )}
          </div>
        </form>
      </div>

      <div className="rounded-2xl border border-gray-200 bg-white p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">Evenements ({items.length})</h2>
          <button
            onClick={load}
            disabled={loading}
            className="rounded-xl border border-gray-200 px-4 py-2 text-sm hover:bg-gray-50 disabled:opacity-50 transition"
          >
            {loading ? "..." : "Actualiser"}
          </button>
        </div>

        {items.length === 0 && !loading ? (
          <p className="text-sm text-gray-500 py-6 text-center">
            Aucun evenement.
          </p>
        ) : (
          <div className="space-y-3">
            {items.map((item) => {
              const upcoming = isUpcoming(item.date);
              const registrations = registrationsByEvent[item._id] || [];
              const registrationsOpen = openRegistrationsId === item._id;
              const registrationsLoading = loadingRegistrationsId === item._id;
              const registrationCount =
                item.registrationCount ?? registrations.length;

              return (
                <div
                  key={item._id}
                  className="rounded-xl border border-gray-100 transition hover:bg-gray-50"
                >
                  <div className="flex flex-col gap-4 p-4 md:flex-row md:items-center">
                    <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center overflow-hidden rounded-xl bg-lightgreen">
                      {item.image ? (
                        <img
                          src={item.image}
                          alt={item.titre}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <span className="text-sm font-black text-primary">
                          EV
                        </span>
                      )}
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="truncate font-semibold text-gray-900">
                          {item.titre || "Sans titre"}
                        </p>

                        {upcoming && (
                          <span className="rounded-full bg-green-50 px-2 py-0.5 text-xs font-medium text-green-700">
                            A venir
                          </span>
                        )}

                        <span className="rounded-full bg-blue-50 px-2 py-0.5 text-xs font-medium text-blue-700">
                          {registrationCount} inscrit
                          {registrationCount !== 1 ? "s" : ""}
                        </span>
                      </div>

                      <p className="text-xs text-gray-500">
                        {[
                          item.lieu,
                          catLabel(item),
                          item.date
                            ? new Date(item.date).toLocaleDateString("fr-FR")
                            : null,
                          item.prix ? `${item.prix} TND` : "Gratuit",
                        ]
                          .filter(Boolean)
                          .join(" - ")}
                      </p>
                    </div>

                    <div className="flex flex-shrink-0 flex-wrap gap-2">
                      <button
                        onClick={() => toggleRegistrations(item._id)}
                        className="rounded-lg border border-blue-100 px-3 py-1.5 text-xs font-medium text-blue-700 hover:bg-blue-50 transition"
                      >
                        {registrationsOpen
                          ? "Masquer inscrits"
                          : `Inscrits (${registrationCount})`}
                      </button>

                      <button
                        onClick={() => startEdit(item)}
                        className="rounded-lg border border-gray-200 px-3 py-1.5 text-xs font-medium hover:bg-gray-100 transition"
                      >
                        Modifier
                      </button>

                      <button
                        onClick={() => handleDelete(item._id)}
                        className="rounded-lg border border-red-100 px-3 py-1.5 text-xs font-medium text-red-600 hover:bg-red-50 transition"
                      >
                        Supprimer
                      </button>
                    </div>
                  </div>

                  {registrationsOpen && (
                    <div className="border-t border-gray-100 bg-white px-4 py-4">
                      {registrationsLoading ? (
                        <p className="text-sm text-gray-500">
                          Chargement des inscrits...
                        </p>
                      ) : registrations.length === 0 ? (
                        <p className="text-sm text-gray-500">
                          Aucun utilisateur inscrit pour cet evenement.
                        </p>
                      ) : (
                        <div className="overflow-x-auto">
                          <table className="min-w-full text-sm">
                            <thead>
                              <tr className="border-b border-gray-100 text-left text-xs uppercase text-gray-400">
                                <th className="py-2 pr-4 font-semibold">
                                  Utilisateur
                                </th>
                                <th className="py-2 pr-4 font-semibold">
                                  Email
                                </th>
                                <th className="py-2 pr-4 font-semibold">
                                  Statut
                                </th>
                                <th className="py-2 font-semibold">
                                  Inscrit le
                                </th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                              {registrations.map((registration) => (
                                <tr key={registration._id}>
                                  <td className="py-3 pr-4 font-medium text-gray-900">
                                    {registration.fullName || "Utilisateur"}
                                  </td>
                                  <td className="py-3 pr-4 text-gray-600">
                                    {registration.email || "-"}
                                  </td>
                                  <td className="py-3 pr-4">
                                    <span className="rounded-full bg-green-50 px-2 py-0.5 text-xs font-medium text-green-700">
                                      {registrationStatusLabel(
                                        registration.status
                                      )}
                                    </span>
                                  </td>
                                  <td className="py-3 text-gray-500">
                                    {formatRegistrationDate(
                                      registration.createdAt
                                    ) || "-"}
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
