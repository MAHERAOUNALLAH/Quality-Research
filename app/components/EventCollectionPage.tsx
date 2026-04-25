"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import { CreditCard, Heart, ShoppingCart, Trash2 } from "lucide-react";

type EventItem = {
  _id: string;
  titre: string;
  description?: string;
  date?: string;
  lieu?: string;
  image?: string;
  prix?: number;
};

type MongoActionItem = {
  _id: string;
  eventId: string;
  event: EventItem;
};

type LocalEvent = {
  id: string;
  titre: string;
  prix?: number;
  image?: string;
  date?: string;
  lieu?: string;
};

type CollectionType = "favorite" | "cart";

const LOCAL_KEYS = {
  favorite: "quality-research-event-favorites",
  cart: "quality-research-event-cart",
};

function formatPrice(prix?: number) {
  if (!prix || prix <= 0) return "Gratuit";
  return new Intl.NumberFormat("fr-TN", {
    style: "currency",
    currency: "TND",
    maximumFractionDigits: 3,
  }).format(prix);
}

function localToEvent(item: LocalEvent): EventItem {
  return {
    _id: item.id,
    titre: item.titre,
    prix: item.prix,
    image: item.image,
    date: item.date,
    lieu: item.lieu,
  };
}

function readLocalItems(type: CollectionType) {
  try {
    const value = window.localStorage.getItem(LOCAL_KEYS[type]);
    const items: LocalEvent[] = value ? JSON.parse(value) : [];
    return items.map(localToEvent);
  } catch {
    return [];
  }
}

function removeLocalItem(type: CollectionType, id: string) {
  const value = window.localStorage.getItem(LOCAL_KEYS[type]);
  const items: LocalEvent[] = value ? JSON.parse(value) : [];
  window.localStorage.setItem(
    LOCAL_KEYS[type],
    JSON.stringify(items.filter((item) => item.id !== id))
  );
}

export default function EventCollectionPage({
  type,
}: {
  type: CollectionType;
}) {
  const [items, setItems] = useState<EventItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [authMode, setAuthMode] = useState(true);
  const [payingId, setPayingId] = useState<string | null>(null);

  const total = useMemo(
    () => items.reduce((sum, item) => sum + (Number(item.prix) || 0), 0),
    [items]
  );

  const meta = type === "favorite"
    ? {
        title: "Mes favoris",
        subtitle: "Retrouvez les evenements que vous avez sauvegardes.",
        icon: Heart,
        empty: "Aucun evenement favori pour le moment.",
      }
    : {
        title: "Mon panier",
        subtitle: "Consultez vos inscriptions et procedez au paiement.",
        icon: ShoppingCart,
        empty: "Votre panier est vide.",
      };

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    setMessage("");

    try {
      const res = await fetch(`/api/events/actions?type=${type}`, {
        credentials: "include",
        cache: "no-store",
      });

      if (res.status === 401) {
        setAuthMode(false);
        setItems(readLocalItems(type));
        return;
      }

      const data = await res.json();
      if (!res.ok || data.ok === false) {
        throw new Error(data.message || "Erreur de chargement");
      }

      setAuthMode(true);
      setItems((data.items || []).map((item: MongoActionItem) => item.event));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur de chargement");
      setItems(readLocalItems(type));
      setAuthMode(false);
    } finally {
      setLoading(false);
    }
  }, [type]);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      void load();
    }, 0);

    return () => window.clearTimeout(timeoutId);
  }, [load]);

  async function removeItem(id: string) {
    setError("");
    setMessage("");

    if (!authMode) {
      removeLocalItem(type, id);
      setItems(readLocalItems(type));
      return;
    }

    const res = await fetch("/api/events/actions", {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ eventId: id, type }),
    });

    const data = await res.json();
    if (!res.ok || data.ok === false) {
      setError(data.message || "Action impossible");
      return;
    }

    setItems((current) => current.filter((item) => item._id !== id));
  }

  async function payEvent(id: string) {
    setPayingId(id);
    setError("");
    setMessage("");

    try {
      const res = await fetch("/api/events/payments", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ eventId: id }),
      });

      const data = await res.json();
      if (!res.ok || data.ok === false) {
        throw new Error(data.message || "Paiement impossible");
      }

      setMessage("Paiement valide. L'evenement a ete retire du panier.");
      setItems((current) => current.filter((item) => item._id !== id));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Paiement impossible");
    } finally {
      setPayingId(null);
    }
  }

  const Icon = meta.icon;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="border-b border-gray-100 bg-white">
        <div className="mx-auto max-w-6xl px-6 py-14">
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-lightgreen text-primary">
              <Icon className="h-7 w-7" aria-hidden="true" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{meta.title}</h1>
              <p className="mt-1 text-gray-500">{meta.subtitle}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-6xl px-6 py-10">
        {!authMode && (
          <div className="mb-6 rounded-2xl border border-amber-100 bg-amber-50 p-4 text-sm text-amber-800">
            Connectez-vous pour synchroniser cette liste avec MongoDB.
          </div>
        )}

        {message && (
          <div className="mb-6 rounded-2xl border border-green-100 bg-green-50 p-4 text-sm text-green-700">
            {message}
          </div>
        )}

        {error && (
          <div className="mb-6 rounded-2xl border border-red-100 bg-red-50 p-4 text-sm text-red-700">
            {error}
          </div>
        )}

        {type === "cart" && items.length > 0 && (
          <div className="mb-6 flex flex-col justify-between gap-3 rounded-2xl border border-gray-100 bg-white p-5 shadow-sm sm:flex-row sm:items-center">
            <div>
              <p className="text-sm text-gray-500">Total panier</p>
              <p className="text-2xl font-black text-primary">{formatPrice(total)}</p>
            </div>
            <p className="text-sm text-gray-500">
              Le paiement est enregistre dans MongoDB pour chaque evenement.
            </p>
          </div>
        )}

        {loading ? (
          <p className="py-16 text-center text-sm text-gray-500">Chargement...</p>
        ) : items.length === 0 ? (
          <div className="rounded-2xl border border-gray-100 bg-white p-12 text-center shadow-sm">
            <p className="text-gray-500">{meta.empty}</p>
            <Link href="/news/events" className="mt-5 inline-flex rounded-xl bg-primary px-5 py-2.5 text-sm font-bold text-white hover:bg-primary-dark">
              Voir les evenements
            </Link>
          </div>
        ) : (
          <div className="grid gap-5">
            {items.map((item) => (
              <article key={item._id} className="flex flex-col gap-4 rounded-2xl border border-gray-100 bg-white p-5 shadow-sm md:flex-row md:items-center">
                <Link href={`/news/events/${item._id}`} className="h-28 w-full flex-shrink-0 overflow-hidden rounded-xl bg-lightgreen md:w-40">
                  {item.image ? (
                    <img src={item.image} alt={item.titre} className="h-full w-full object-cover" />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-primary">
                      <Icon className="h-8 w-8" aria-hidden="true" />
                    </div>
                  )}
                </Link>

                <div className="min-w-0 flex-1">
                  <Link href={`/news/events/${item._id}`} className="text-lg font-bold text-gray-900 hover:text-primary">
                    {item.titre}
                  </Link>
                  <p className="mt-1 line-clamp-2 text-sm text-gray-500">{item.description || item.lieu || ""}</p>
                  <div className="mt-3 flex flex-wrap gap-2 text-xs text-gray-500">
                    {item.date && <span>{new Date(item.date).toLocaleDateString("fr-FR")}</span>}
                    {item.lieu && <span>{item.lieu}</span>}
                  </div>
                </div>

                <div className="flex flex-col gap-2 md:w-48">
                  <div className="rounded-xl bg-lightgreen px-4 py-2 text-center text-sm font-black text-primary">
                    {formatPrice(item.prix)}
                  </div>

                  {type === "cart" && authMode && (
                    <button
                      type="button"
                      onClick={() => payEvent(item._id)}
                      disabled={payingId === item._id}
                      className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-4 py-2 text-sm font-bold text-white hover:bg-primary-dark disabled:opacity-60"
                    >
                      <CreditCard className="h-4 w-4" aria-hidden="true" />
                      {payingId === item._id ? "Paiement..." : "Payer"}
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={() => removeItem(item._id)}
                    className="inline-flex items-center justify-center gap-2 rounded-xl border border-gray-200 px-4 py-2 text-sm font-bold text-gray-700 hover:bg-gray-50"
                  >
                    <Trash2 className="h-4 w-4" aria-hidden="true" />
                    Retirer
                  </button>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
