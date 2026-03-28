"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import "./login.css"; // Chargement de ton CSS professionnel

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      if (res.ok) {
        window.location.href = "/";
      } else {
        const data = await res.json();
        setError(data.message || "Identifiants invalides");
      }
    } catch (err) {
      setError("Une erreur de connexion est survenue.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="login-page">
      {/* Arrière-plan animé (Blobs) */}
      <div className="blob blob-1"></div>
      <div className="blob blob-2"></div>

      <main className="login-main">
        <div className="login-card">
          <header className="login-card-header">
            <div className="login-badge">
              <span>🛡️</span> Portail Sécurisé
            </div>
            <h1 className="login-title">
              Connexion <span className="green">Q&R</span>
            </h1>
            <p className="login-subtitle">
              Accédez à vos projets de recherche et collaborez avec l'écosystème de santé.
            </p>
          </header>

          <form className="login-form" onSubmit={handleSubmit}>
            {error && (
              <div style={{ color: "red", fontSize: "0.8rem", textAlign: "center", background: "#fff5f5", padding: "10px", borderRadius: "8px" }}>
                {error}
              </div>
            )}

            <div className="form-group">
              <label htmlFor="email">Adresse Email</label>
              <input
                id="email"
                type="email"
                placeholder="nom@exemple.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="password">
                Mot de passe
                <a href="#" className="forgot-link">Oublié ?</a>
              </label>
              <div className="password-wrapper">
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <button 
                  type="button" 
                  className="toggle-password"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? "👁️‍🗨️" : "👁️"}
                </button>
              </div>
            </div>

            <div className="form-row">
              <label className="checkbox-label">
                <input type="checkbox" />
                <span className="checkbox-custom"></span>
                Rester connecté
              </label>
            </div>

            <button 
              type="submit" 
              className={`btn-login ${isLoading ? 'loading' : ''}`}
              disabled={isLoading}
            >
              {isLoading ? <div className="spinner"></div> : "Se connecter"}
            </button>
          </form>

          <div className="login-divider">OU</div>

          {/* Section Stats de ton CSS */}
          <div className="login-stats">
            <div className="stat">
              <strong>15+</strong>
              <span>Projets</span>
            </div>
            <div className="stat-divider"></div>
            <div className="stat">
              <strong>500+</strong>
              <span>Membres</span>
            </div>
            <div className="stat-divider"></div>
            <div className="stat">
              <strong>100%</strong>
              <span>Qualité</span>
            </div>
          </div>

          <p className="login-register">
            Pas encore de compte ? <Link href="/register">S'inscrire gratuitement</Link>
          </p>
        </div>
      </main>
    </div>
  );
}