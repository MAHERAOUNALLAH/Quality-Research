"use client";

import { useEffect, useState } from "react";
import { Check, Loader2, LogIn, UserPlus } from "lucide-react";

type ButtonSurface = "default" | "onPrimary";

async function fetchRegistrationStatus(eventId: string) {
  const res = await fetch(`/api/events/registrations?eventId=${eventId}`, {
    credentials: "include",
    cache: "no-store",
  });

  if (res.status === 401) return null;

  const data = await res.json();
  if (!res.ok || data.ok === false) {
    throw new Error(data.message || "Request failed");
  }

  return data as { registered: boolean };
}

async function registerForEvent(eventId: string) {
  const res = await fetch("/api/events/registrations", {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ eventId }),
  });

  if (res.status === 401) return null;

  const data = await res.json();
  if (!res.ok || data.ok === false) {
    throw new Error(data.message || "Request failed");
  }

  return data as { registered: boolean };
}

async function unregisterFromEvent(eventId: string) {
  const res = await fetch(`/api/events/registrations?eventId=${eventId}`, {
    method: "DELETE",
    credentials: "include",
  });

  if (res.status === 401) return null;

  const data = await res.json();
  if (!res.ok || data.ok === false) {
    throw new Error(data.message || "Request failed");
  }

  return data as { registered: boolean };
}

export default function EventParticipationButton({
  eventId,
  compact = false,
  className = "",
  surface = "default",
}: {
  eventId: string;
  compact?: boolean;
  className?: string;
  surface?: ButtonSurface;
}) {
  const [registered, setRegistered] = useState(false);
  const [authRequired, setAuthRequired] = useState(false);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;

    const timeoutId = window.setTimeout(() => {
      setLoading(true);
      setError("");

      fetchRegistrationStatus(eventId)
        .then((status) => {
          if (cancelled) return;

          if (!status) {
            setAuthRequired(true);
            setRegistered(false);
            return;
          }

          setAuthRequired(false);
          setRegistered(status.registered);
        })
        .catch(() => {
          if (cancelled) return;
          setError("Statut indisponible");
        })
        .finally(() => {
          if (!cancelled) setLoading(false);
        });
    }, 0);

    return () => {
      cancelled = true;
      window.clearTimeout(timeoutId);
    };
  }, [eventId]);

  async function handleClick() {
    if (authRequired) {
      const from =
        typeof window !== "undefined"
          ? window.location.pathname
          : `/news/events/${eventId}`;
      window.location.href = `/login?from=${encodeURIComponent(from)}`;
      return;
    }

    setBusy(true);
    setError("");

    try {
      const status = registered
        ? await unregisterFromEvent(eventId)
        : await registerForEvent(eventId);

      if (!status) {
        setAuthRequired(true);
        return;
      }

      setRegistered(status.registered);
    } catch {
      setError(
        registered ? "Désinscription impossible" : "Participation impossible"
      );
    } finally {
      setBusy(false);
    }
  }

  const baseClass =
    className ||
    (compact
      ? "inline-flex min-h-10 w-full items-center justify-center gap-2 rounded-xl px-3 py-2 text-xs font-bold transition"
      : "inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-bold transition");

  const stateClass = registered
    ? "border border-red-100 bg-red-50 text-red-700 hover:bg-red-100"
    : authRequired
      ? "border border-amber-100 bg-amber-50 text-amber-700 hover:bg-amber-100"
      : surface === "onPrimary"
        ? "bg-white text-primary hover:bg-green-50"
        : "bg-primary text-white hover:bg-primary-dark";

  const Icon = busy || loading ? Loader2 : registered ? Check : authRequired ? LogIn : UserPlus;
  const label = busy || loading
    ? "..."
    : registered
      ? "Se désinscrire"
      : authRequired
        ? "Connexion"
        : "Participer";

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={loading || busy}
      title={error || undefined}
      className={`${baseClass} ${stateClass} disabled:cursor-not-allowed disabled:opacity-80`}
    >
      <Icon
        className={`h-4 w-4 ${busy || loading ? "animate-spin" : ""}`}
        aria-hidden="true"
      />
      {label}
    </button>
  );
}
