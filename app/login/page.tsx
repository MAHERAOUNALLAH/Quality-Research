"use client";

import React, { Suspense, useEffect, useState } from "react";
import "./login.css";
import { useSearchParams } from "next/navigation";

const LoginContent: React.FC = () => {
  const searchParams = useSearchParams();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  useEffect(() => {
    const registered = searchParams.get("registered");
    const emailFromQuery = searchParams.get("email");

    if (emailFromQuery) {
      setEmail(emailFromQuery);
    }

    if (registered === "1") {
      setSuccessMessage("Inscription réussie. Vous pouvez maintenant vous connecter.");
    }
  }, [searchParams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMessage(null);
    setLoading(true);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: email.trim().toLowerCase(),
          password,
        }),
      });

      const data = await res.json();
      console.log("LOGIN RESPONSE:", JSON.stringify(data, null, 2));

      if (!res.ok) {
        setError(data?.message || "Email ou mot de passe incorrect.");
        return;
      }

      window.location.href = "/";
    } catch (error) {
      console.error("LOGIN FETCH ERROR:", error);
      setError("Erreur réseau. Réessayez.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <main className="login-main">
        <div className="login-card">
          <div className="login-card-header">
            <div className="login-badge">● Excellence en Santé</div>
            <h1 className="login-title">
              Bon retour <span className="green">parmi nous</span>
            </h1>
            <p className="login-subtitle">
              Connectez-vous pour accéder à votre espace membre et rejoindre
              notre communauté de professionnels de santé.
            </p>
          </div>

          {successMessage && (
            <p style={{ color: "green", marginBottom: "12px" }}>
              {successMessage}
            </p>
          )}

          {error && (
            <p style={{ color: "red", marginBottom: "12px" }}>
              {error}
            </p>
          )}

          <form className="login-form" onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="email">Adresse e-mail</label>
              <input
                id="email"
                type="email"
                placeholder="exemple@domaine.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="password">
                Mot de passe
                <a href="/forgot-password" className="forgot-link">
                  Mot de passe oublié ?
                </a>
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
                  aria-label="Afficher le mot de passe"
                >
                  {showPassword ? "🙈" : "👁"}
                </button>
              </div>
            </div>

            <div className="form-row">
              <label className="checkbox-label">
                <input type="checkbox" />
                <span className="checkbox-custom" />
                Se souvenir de moi
              </label>
            </div>

            <button
              type="submit"
              className={`btn-login ${loading ? "loading" : ""}`}
              disabled={loading}
            >
              {loading ? <span className="spinner" /> : "Se connecter →"}
            </button>
          </form>

          <p className="login-register">
            Pas encore membre ? <a href="/register">Créer un compte</a>
          </p>
        </div>
      </main>
    </div>
  );
};

const Login: React.FC = () => {
  return (
    <Suspense fallback={null}>
      <LoginContent />
    </Suspense>
  );
};

export default Login;
