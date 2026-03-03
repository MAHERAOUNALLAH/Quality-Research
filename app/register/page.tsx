"use client";
import React, { useState } from "react";
import "./register.css";

const Register: React.FC = () => {
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    profession: "",
    password: "",
    confirmPassword: "",
    agreeTerms: false,
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]:
        type === "checkbox" ? (e.target as HTMLInputElement).checked : value,
    }));
  };

  const handleNext = (e: React.FormEvent) => {
    e.preventDefault();
    setStep(2);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => setLoading(false), 2000);
  };

  return (
    <div className="register-page">
      
      {/* Main */}
      <main className="register-main">
        <div className="register-card">
          {/* Header */}
          <div className="register-card-header">
            <div className="register-badge">● Excellence en Santé</div>
            <h1 className="register-title">
              Rejoignez la <span className="green">Communauté</span>
            </h1>
            <p className="register-subtitle">
              Créez votre compte et accédez à un réseau de plus de 25
              professionnels de santé engagés pour l'excellence.
            </p>
          </div>

          {/* Step Indicator */}
          <div className="step-indicator">
            <div className={`step-item ${step >= 1 ? "active" : ""} ${step > 1 ? "done" : ""}`}>
              <div className="step-circle">{step > 1 ? "✓" : "1"}</div>
              <span>Informations</span>
            </div>
            <div className="step-line" />
            <div className={`step-item ${step >= 2 ? "active" : ""}`}>
              <div className="step-circle">2</div>
              <span>Sécurité</span>
            </div>
          </div>

          {/* Step 1 */}
          {step === 1 && (
            <form className="register-form" onSubmit={handleNext}>
              <div className="form-row-double">
                <div className="form-group">
                  <label htmlFor="firstName">Prénom</label>
                  <input
                    id="firstName"
                    name="firstName"
                    type="text"
                    placeholder="Jean"
                    value={form.firstName}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="lastName">Nom</label>
                  <input
                    id="lastName"
                    name="lastName"
                    type="text"
                    placeholder="Dupont"
                    value={form.lastName}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="email">Adresse e-mail</label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="exemple@domaine.com"
                  value={form.email}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="profession">Profession</label>
                <div className="select-wrapper">
                  <select
                    id="profession"
                    name="profession"
                    value={form.profession}
                    onChange={handleChange}
                    required
                  >
                    <option value="" disabled>
                      Sélectionnez votre profession
                    </option>
                    <option value="medecin">Médecin</option>
                    <option value="pharmacien">Pharmacien</option>
                    <option value="infirmier">Infirmier / Infirmière</option>
                    <option value="chercheur">Chercheur en Santé</option>
                    <option value="gestionnaire">Gestionnaire Hospitalier</option>
                    <option value="etudiant">Étudiant en Santé</option>
                    <option value="autre">Autre</option>
                  </select>
                  <span className="select-arrow">▾</span>
                </div>
              </div>

              <button type="submit" className="btn-register">
                Continuer →
              </button>
            </form>
          )}

          {/* Step 2 */}
          {step === 2 && (
            <form className="register-form" onSubmit={handleSubmit}>
              <div className="form-group">
                <label htmlFor="password">Mot de passe</label>
                <div className="password-wrapper">
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Minimum 8 caractères"
                    value={form.password}
                    onChange={handleChange}
                    required
                    minLength={8}
                  />
                  <button
                    type="button"
                    className="toggle-password"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? "🙈" : "👁"}
                  </button>
                </div>
                <PasswordStrength password={form.password} />
              </div>

              <div className="form-group">
                <label htmlFor="confirmPassword">
                  Confirmer le mot de passe
                </label>
                <div className="password-wrapper">
                  <input
                    id="confirmPassword"
                    name="confirmPassword"
                    type={showConfirm ? "text" : "password"}
                    placeholder="Répétez votre mot de passe"
                    value={form.confirmPassword}
                    onChange={handleChange}
                    required
                  />
                  <button
                    type="button"
                    className="toggle-password"
                    onClick={() => setShowConfirm(!showConfirm)}
                  >
                    {showConfirm ? "🙈" : "👁"}
                  </button>
                </div>
                {form.confirmPassword && form.password !== form.confirmPassword && (
                  <span className="field-error">
                    Les mots de passe ne correspondent pas.
                  </span>
                )}
              </div>

              <label className="checkbox-label">
                <input
                  type="checkbox"
                  name="agreeTerms"
                  checked={form.agreeTerms}
                  onChange={handleChange}
                  required
                />
                <span className="checkbox-custom" />
                J'accepte les{" "}
                <a href="/conditions" className="terms-link">
                  conditions d'utilisation
                </a>{" "}
                et la{" "}
                <a href="/confidentialite" className="terms-link">
                  politique de confidentialité
                </a>
              </label>

              <div className="btn-group">
                <button
                  type="button"
                  className="btn-back"
                  onClick={() => setStep(1)}
                >
                  ← Retour
                </button>
                <button
                  type="submit"
                  className={`btn-register ${loading ? "loading" : ""}`}
                  disabled={
                    loading ||
                    !form.agreeTerms ||
                    form.password !== form.confirmPassword
                  }
                >
                  {loading ? <span className="spinner" /> : "Créer mon compte"}
                </button>
              </div>
            </form>
          )}

          <p className="register-login">
            Déjà membre ?{" "}
            <a href="/login">Se connecter</a>
          </p>
        </div>
      </main>
    </div>
  );
};

/* Password strength indicator */
const PasswordStrength: React.FC<{ password: string }> = ({ password }) => {
  const getStrength = () => {
    if (!password) return 0;
    let score = 0;
    if (password.length >= 8) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/[0-9]/.test(password)) score++;
    if (/[^A-Za-z0-9]/.test(password)) score++;
    return score;
  };

  const strength = getStrength();
  const labels = ["", "Faible", "Moyen", "Fort", "Très fort"];
  const colors = ["", "#e53e3e", "#dd6b20", "#1a9e5c", "#0e7a43"];

  if (!password) return null;

  return (
    <div className="password-strength">
      <div className="strength-bars">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="strength-bar"
            style={{
              background: i <= strength ? colors[strength] : "#e2e8f0",
            }}
          />
        ))}
      </div>
      <span className="strength-label" style={{ color: colors[strength] }}>
        {labels[strength]}
      </span>
    </div>
  );
};

export default Register;