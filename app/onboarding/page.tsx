"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getSupabase } from "@/lib/supabase";

export default function OnboardingPage() {
  const router = useRouter();
  const [shopName, setShopName] = useState("");
  const [phone, setPhone] = useState("");
  const [notice, setNotice] = useState("");
  const [busy, setBusy] = useState(false);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    let active = true;
    getSupabase().auth.getSession().then(({ data, error }) => {
      if (!active) return;
      if (error || !data.session) {
        router.replace("/login");
        return;
      }
      const metadata = data.session.user.user_metadata ?? {};
      setShopName(typeof metadata.shop_name === "string" ? metadata.shop_name : "");
      setPhone(typeof metadata.phone_local === "string" ? metadata.phone_local : "");
      setChecking(false);
    });
    return () => { active = false; };
  }, [router]);

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setNotice("");
    if (!/^\d{8}$/.test(phone)) {
      setNotice("Le numéro doit contenir exactement 8 chiffres.");
      return;
    }
    if (!shopName.trim()) {
      setNotice("Saisissez le nom de votre boutique.");
      return;
    }
    setBusy(true);
    try {
      const { error } = await getSupabase().auth.updateUser({
        data: { shop_name: shopName.trim(), phone_local: phone, phone_country: "+229 01" },
      });
      if (error) throw error;
      router.replace("/dashboard");
    } catch (error) {
      setNotice(error instanceof Error ? error.message : "Impossible d’enregistrer les informations.");
    } finally {
      setBusy(false);
    }
  }

  if (checking) return <main className="loading-screen"><div className="loading-mark">W</div><p>Préparation de votre boutique…</p></main>;

  return <div className="auth-shell">
    <header className="topbar">
      <Link className="brand" href="/" aria-label="Wejit accueil"><span className="brand-mark">W</span><span>Wejit</span></Link>
      <div className="topbar-right">Étape 2 sur 2</div>
    </header>
    <main className="auth-main">
      <section className="auth-card" aria-labelledby="page-title">
        <div className="eyebrow"><span className="eyebrow-dot" /> DERNIÈRE ÉTAPE</div>
        <div className="auth-heading">
          <h1 id="page-title">Parlons de votre boutique</h1>
          <p>Ces informations seront enregistrées dans votre compte. Vous pourrez les modifier plus tard.</p>
        </div>
        {notice && <div className="notice" role="alert">{notice}</div>}
        <form onSubmit={submit}>
          <div className="field">
            <label htmlFor="shopName">Nom de votre boutique</label>
            <input id="shopName" name="shopName" type="text" placeholder="Ex. Boutique de Peace" autoComplete="organization" maxLength={80} value={shopName} onChange={e => setShopName(e.target.value)} required />
          </div>
          <div className="field">
            <label htmlFor="phone">Numéro de téléphone béninois</label>
            <div className="phone-control">
              <span className="phone-prefix" aria-label="Indicatif du Bénin"><span aria-hidden="true">🇧🇯</span><span>+229 01</span></span>
              <input id="phone" name="phone" type="tel" inputMode="numeric" autoComplete="tel-national" placeholder="XXXXXXXX" pattern="[0-9]{8}" minLength={8} maxLength={8} value={phone} onChange={e => setPhone(e.target.value.replace(/\D/g, "").slice(0, 8))} title="Entrez exactement 8 chiffres." required />
            </div>
            <p className="field-hint">8 chiffres exactement, sans espaces. L’indicatif +229 01 est déjà inclus.</p>
          </div>
          <button className="primary-button" type="submit" disabled={busy}>{busy ? "Enregistrement…" : "Enregistrer et continuer"} <span aria-hidden="true">→</span></button>
        </form>
        <p className="legal">Vous pourrez modifier ces informations depuis l’onglet Compte.</p>
      </section>
    </main>
    <footer className="page-footer"><span>© 2026 Wejit</span><span>Votre boutique, partout avec vous.</span></footer>
  </div>;
}
