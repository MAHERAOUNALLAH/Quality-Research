"use client";

import { useState } from "react";
import { HandCoins } from "lucide-react";

export default function DonationPage() {
  const [amount, setAmount] = useState("50");
  const [donorName, setDonorName] = useState("");
  const [donorEmail, setDonorEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setMessage("");
    setError("");

    try {
      const res = await fetch("/api/donations", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount: Number(amount),
          donorName,
          donorEmail,
        }),
      });

      const data = await res.json();
      if (!res.ok || data.ok === false) {
        throw new Error(data.message || "Don impossible");
      }

      setMessage("Merci pour votre don. Il a ete enregistre dans MongoDB.");
      setAmount("50");
      setDonorName("");
      setDonorEmail("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Don impossible");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="border-b border-gray-100 bg-white">
        <div className="mx-auto max-w-5xl px-6 py-14">
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-lightgreen text-primary">
              <HandCoins className="h-7 w-7" aria-hidden="true" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Donation</h1>
              <p className="mt-1 text-gray-500">
                Soutenez les activites de Quality &amp; Research.
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto grid max-w-5xl gap-8 px-6 py-10 md:grid-cols-[1fr_360px]">
        <section className="rounded-2xl border border-gray-100 bg-white p-8 shadow-sm">
          <h2 className="text-2xl font-bold text-gray-900">Contribuer</h2>
          <p className="mt-3 text-gray-600">
            Votre don aide a financer les formations, evenements scientifiques et projets de recherche collaborative.
          </p>

          <div className="mt-8 grid gap-4 sm:grid-cols-3">
            {["20", "50", "100"].map((value) => (
              <button
                key={value}
                type="button"
                onClick={() => setAmount(value)}
                className={`rounded-2xl border px-5 py-4 text-lg font-black transition ${
                  amount === value
                    ? "border-primary bg-lightgreen text-primary"
                    : "border-gray-200 text-gray-700 hover:border-primary hover:text-primary"
                }`}
              >
                {value} TND
              </button>
            ))}
          </div>
        </section>

        <form onSubmit={handleSubmit} className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-bold text-gray-900">Paiement du don</h2>

          <div className="mt-5 space-y-4">
            <div>
              <label className="mb-1 block text-sm font-semibold text-gray-700">Montant (TND)</label>
              <input
                type="number"
                min="1"
                step="0.001"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary/20"
                required
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-semibold text-gray-700">Nom</label>
              <input
                value={donorName}
                onChange={(e) => setDonorName(e.target.value)}
                className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary/20"
                placeholder="Votre nom"
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-semibold text-gray-700">Email</label>
              <input
                type="email"
                value={donorEmail}
                onChange={(e) => setDonorEmail(e.target.value)}
                className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary/20"
                placeholder="email@domaine.com"
              />
            </div>

            {message && <p className="text-sm text-green-700">{message}</p>}
            {error && <p className="text-sm text-red-600">{error}</p>}

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-xl bg-primary px-5 py-3 text-sm font-bold text-white hover:bg-primary-dark disabled:opacity-60"
            >
              {loading ? "Traitement..." : "Faire un don"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
