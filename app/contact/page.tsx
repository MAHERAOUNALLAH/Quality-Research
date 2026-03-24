"use client";
import { useState } from "react";
import "./contact.css";

export default function Contact() {
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<{ type: 'success' | 'error', msg: string } | null>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setStatus(null);

    const formData = new FormData(e.currentTarget);
    const data = {
      name: formData.get("name"),
      email: formData.get("email"),
      subject: formData.get("subject"),
      message: formData.get("message"),
    };

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (res.ok) {
        setStatus({ type: 'success', msg: "Votre message a été envoyé !" });
        (e.target as HTMLFormElement).reset();
      } else {
        throw new Error();
      }
    } catch (err) {
      setStatus({ type: 'error', msg: "Échec de l'envoi. Vérifiez votre connexion." });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="contact-page">
      <div className="blob blob-1"></div>
      <div className="contact-card">
        <div className="contact-header">
          <h1>Contact</h1>
          <p>Nous sommes à votre écoute</p>
        </div>

        <form className="contact-form" onSubmit={handleSubmit}>
          <input className="input-field" name="name" type="text" placeholder="Votre nom" required />
          <input className="input-field" name="email" type="email" placeholder="Votre email" required />
          <input className="input-field" name="subject" type="text" placeholder="Sujet du message" required />
          <textarea className="input-field" name="message" placeholder="Votre message..." rows={4} required></textarea>
          
          <button className="submit-btn" type="submit" disabled={loading}>
            {loading ? "Chargement..." : "Envoyer"}
          </button>

          {status && (
            <p className={`status-msg ${status.type}`}>
              {status.msg}
            </p>
          )}
        </form>
      </div>
    </div>
  );
}
