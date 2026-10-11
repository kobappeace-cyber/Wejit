"use client";

import Link from "next/link";
import { useState } from "react";

function GoogleMark() {
  return <svg viewBox="0 0 48 48" width="19" height="19" aria-hidden="true"><path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5Z"/><path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.76 7.18l7.73 6C44.42 37.99 46.98 31.83 46.98 24.55Z"/><path fill="#FBBC05" d="M10.53 28.59A14.4 14.4 0 0 1 9.75 24c0-1.59.27-3.13.76-4.59l-7.98-6.19A23.9 23.9 0 0 0 0 24c0 3.87.93 7.52 2.56 10.78l7.97-6.19Z"/><path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.91-5.8l-7.73-6c-2.14 1.44-4.89 2.3-8.18 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48Z"/></svg>;
}

export default function CreateShopPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [notice, setNotice] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setNotice("L’interface est prête. L’inscription sera activée lors du raccordement à Supabase.");
  }

  return <div className="auth-shell">
    <header className="topbar">
      <Link className="brand" href="/" aria-label="Wejit accueil"><span className="brand-mark"><svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 7v10a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7"/><path d="M8 7V5a4 4 0 0 1 8 0v2"/><path d="M9 12h6"/></svg></span><span>Wejit</span></Link>
      <div className="topbar-right"><span>Déjà un compte ?</span><Link className="text-link" href="/login">Se connecter</Link></div>
    </header>

    <main className="auth-main">
      <section className="auth-card" aria-labelledby="page-title">
        <div className="eyebrow"><span className="eyebrow-dot" /> VOTRE ACTIVITÉ, EN UN SEUL ENDROIT</div>
        <div className="auth-heading">
          <h1 id="page-title">Créer ma boutique</h1>
          <p>Un compte, une boutique, et vous êtes prêt à commencer.</p>
        </div>

        <button className="google-button" type="button" onClick={() => setNotice("La connexion Google sera disponible après la configuration OAuth dans Supabase.")}>
          <GoogleMark /> Continuer avec Google
        </button>

        <div className="separator"><span /> <small>OU AVEC VOTRE E-MAIL</small> <span /></div>

        {notice && <div className="notice" role="status">{notice}</div>}

        <form onSubmit={submit}>
          <div className="field">
            <label htmlFor="email">Adresse e-mail</label>
            <input id="email" name="email" type="email" placeholder="vous@exemple.com" autoComplete="email" value={email} onChange={e => setEmail(e.target.value)} required />
          </div>
          <div className="field">
            <label htmlFor="password">Mot de passe</label>
            <div className="password-wrap">
              <input id="password" name="password" type={showPassword ? "text" : "password"} placeholder="Au moins 8 caractères" autoComplete="new-password" minLength={8} value={password} onChange={e => setPassword(e.target.value)} required />
              <button className="reveal" type="button" onClick={() => setShowPassword(v => !v)} aria-label={showPassword ? "Masquer le mot de passe" : "Afficher le mot de passe"}>{showPassword ? "Masquer" : "Afficher"}</button>
            </div>
            <p className="field-hint">Utilisez au moins 8 caractères.</p>
          </div>
          <button className="primary-button" type="submit">Créer mon compte <span aria-hidden="true">→</span></button>
        </form>
        <p className="legal">En continuant, vous acceptez nos conditions d’utilisation et notre politique de confidentialité.</p>
        <div className="auth-bottom">Vous avez déjà un compte ? <Link className="text-link" href="/login">Se connecter</Link></div>
      </section>
      <div className="trust-line"><span className="trust-icon">✓</span> Simple à démarrer. Gratuit pour commencer.</div>
    </main>

    <footer className="page-footer"><span>© 2026 Wejit</span><span>Votre boutique, partout avec vous.</span></footer>
  </div>;
}
