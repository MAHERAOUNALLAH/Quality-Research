"use client";

import { useState } from "react";
import "./contact.css";

export default function ContactPage() {
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState("");

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setStatus("loading");
    setErrorMessage("");

    const formData = new FormData(e.currentTarget);
    const data = Object.fromEntries(formData.entries());

    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        body: JSON.stringify(data),
        headers: { "Content-Type": "application/json" },
      });

      if (response.ok) {
        setStatus("success");
      } else {
        const errData = await response.json();
        setErrorMessage(errData.error || "Une erreur est survenue.");
        setStatus("error");
      }
    } catch (err) {
      setErrorMessage("Impossible de se connecter au serveur.");
      setStatus("error");
    }
  };

  return (
    <main className="contact-page">
      {/* Decorative background element matching your CSS */}
      <div className="blob-1"></div>

      <div className="contact-card">
        {status === "success" ? (
          /* --- SUCCESS STATE: This replaces the form after sending --- */
          <div className="contact-header" style={{ padding: "20px 0" }}>
            <div style={{ fontSize: "3rem", marginBottom: "15px" }}>✅</div>
            <h1>Merci !</h1>
            <p style={{ color: "var(--navy)", opacity: 0.8, lineHeight: "1.6" }}>
              Votre message a été transmis avec succès à l'équipe <strong>Quality & Research</strong>. 
              Nous reviendrons vers vous rapidement.
            </p>
            <button 
              onClick={() => setStatus("idle")} 
              className="submit-btn" 
              style={{ width: "100%", marginTop: "20px" }}
            >
              Envoyer un autre message
            </button>
          </div>
        ) : (
          /* --- FORM STATE --- */
          <>
            <div className="contact-header">
              <h1>Contactez-nous</h1>
              <p style={{ color: "#666" }}>Une question ? Notre équipe vous répond.</p>
            </div>

            <form onSubmit={handleSubmit} className="contact-form">
              <input
                type="text"
                name="name"
                placeholder="Nom complet"
                className="input-field"
                required
              />
              <input
                type="email"
                name="email"
                placeholder="Adresse e-mail"
                className="input-field"
                required
              />
              <input
                type="text"
                name="subject"
                placeholder="Sujet"
                className="input-field"
                required
              />
              <textarea
                name="message"
                placeholder="Votre message..."
                className="input-field"
                style={{ minHeight: "120px", resize: "none" }}
                required
              ></textarea>

              {status === "error" && (
                <p className="status-msg error">{errorMessage}</p>
              )}

              <button 
                type="submit" 
                className="submit-btn" 
                disabled={status === "loading"}
              >
                {status === "loading" ? "Envoi en cours..." : "Envoyer le message →"}
              </button>
            </form>
          </>
        )}
      </div>
    </main>
  );
}     


              