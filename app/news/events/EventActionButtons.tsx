"use client";

import { useEffect, useState } from "react";
import { Check, Heart, ShoppingCart } from "lucide-react";

export type EventActionItem = {
  id: string;
  titre: string;
  prix?: number;
  image?: string;
  date?: string;
  lieu?: string;
};

type StoredEvent = EventActionItem & {
  addedAt: string;
};

const FAVORITES_KEY = "quality-research-event-favorites";
const CART_KEY = "quality-research-event-cart";

function readItems(key: string): StoredEvent[] {
  if (typeof window === "undefined") return [];

  try {
    const value = window.localStorage.getItem(key);
    return value ? JSON.parse(value) : [];
  } catch {
    return [];
  }
}

function writeItems(key: string, items: StoredEvent[]) {
  window.localStorage.setItem(key, JSON.stringify(items));
}

function hasItem(key: string, id: string) {
  return readItems(key).some((item) => item.id === id);
}

function toggleItem(key: string, item: EventActionItem) {
  const items = readItems(key);
  const exists = items.some((stored) => stored.id === item.id);

  if (exists) {
    writeItems(key, items.filter((stored) => stored.id !== item.id));
    return false;
  }

  writeItems(key, [...items, { ...item, addedAt: new Date().toISOString() }]);
  return true;
}

async function fetchMongoStatus(eventId: string) {
  const res = await fetch(`/api/events/actions?eventId=${eventId}`, {
    credentials: "include",
    cache: "no-store",
  });

  if (res.status === 401) return null;

  const data = await res.json();
  if (!res.ok || data.ok === false) {
    throw new Error(data.message || "Request failed");
  }

  return data as { favorite: boolean; inCart: boolean };
}

async function toggleMongoItem(eventId: string, type: "favorite" | "cart") {
  const res = await fetch("/api/events/actions", {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ eventId, type }),
  });

  if (res.status === 401) return null;

  const data = await res.json();
  if (!res.ok || data.ok === false) {
    throw new Error(data.message || "Request failed");
  }

  return data as { favorite: boolean; inCart: boolean };
}

export default function EventActionButtons({
  item,
  compact = false,
}: {
  item: EventActionItem;
  compact?: boolean;
}) {
  const [favorite, setFavorite] = useState(false);
  const [inCart, setInCart] = useState(false);
  const [usesMongo, setUsesMongo] = useState(false);
  const [busy, setBusy] = useState<"favorite" | "cart" | null>(null);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      fetchMongoStatus(item.id)
        .then((status) => {
          if (status) {
            setUsesMongo(true);
            setFavorite(status.favorite);
            setInCart(status.inCart);
            return;
          }

          setUsesMongo(false);
          setFavorite(hasItem(FAVORITES_KEY, item.id));
          setInCart(hasItem(CART_KEY, item.id));
        })
        .catch(() => {
          setUsesMongo(false);
          setFavorite(hasItem(FAVORITES_KEY, item.id));
          setInCart(hasItem(CART_KEY, item.id));
        });
    }, 0);

    return () => window.clearTimeout(timeoutId);
  }, [item.id]);

  async function handleToggle(type: "favorite" | "cart") {
    setBusy(type);

    try {
      const status = await toggleMongoItem(item.id, type);

      if (status) {
        setUsesMongo(true);
        setFavorite(status.favorite);
        setInCart(status.inCart);
        return;
      }

      setUsesMongo(false);
      if (type === "favorite") {
        setFavorite(toggleItem(FAVORITES_KEY, item));
      } else {
        setInCart(toggleItem(CART_KEY, item));
      }
    } catch {
      if (!usesMongo) {
        if (type === "favorite") {
          setFavorite(toggleItem(FAVORITES_KEY, item));
        } else {
          setInCart(toggleItem(CART_KEY, item));
        }
      }
    } finally {
      setBusy(null);
    }
  }

  const buttonBase = compact
    ? "inline-flex min-h-10 flex-1 items-center justify-center gap-2 rounded-xl px-3 py-2 text-xs font-bold transition"
    : "inline-flex min-h-11 flex-1 items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-bold transition";

  return (
    <div className="flex w-full gap-2">
      <button
        type="button"
        onClick={() => handleToggle("favorite")}
        disabled={busy === "favorite"}
        className={`${buttonBase} ${
          favorite
            ? "border border-red-100 bg-red-50 text-red-600"
            : "border border-gray-200 bg-white text-gray-700 hover:border-red-100 hover:bg-red-50 hover:text-red-600"
        }`}
      >
        {favorite ? (
          <Check className="h-4 w-4" aria-hidden="true" />
        ) : (
          <Heart className="h-4 w-4" aria-hidden="true" />
        )}
        {favorite ? "Favori" : "Favoris"}
      </button>

      <button
        type="button"
        onClick={() => handleToggle("cart")}
        disabled={busy === "cart"}
        className={`${buttonBase} ${
          inCart
            ? "bg-primary text-white"
            : "bg-lightgreen text-primary hover:bg-primary hover:text-white"
        }`}
      >
        {inCart ? (
          <Check className="h-4 w-4" aria-hidden="true" />
        ) : (
          <ShoppingCart className="h-4 w-4" aria-hidden="true" />
        )}
        {inCart ? "Au panier" : "Panier"}
      </button>
    </div>
  );
}
