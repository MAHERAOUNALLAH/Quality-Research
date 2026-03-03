"use client";
import React, { useState } from "react";
import "./login.css";

const Login: React.FC = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => setLoading(false), 2000);
  };

  return (
    <div className="login-page">
     

      
      {/* Login Card */}
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
              {loading ? (
                <span className="spinner" />
              ) : (
                "Se connecter →"
              )}
            </button>
          </form>

          

          <p className="login-register">
            Pas encore membre ?{" "}
            <a href="/register">Créer un compte</a>
          </p>
        </div>
      </main>
    </div>
  );
};

export default Login;