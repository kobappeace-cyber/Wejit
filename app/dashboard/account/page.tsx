"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getSupabase } from "@/lib/supabase";

export default function AccountPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [shopName, setShopName] = useState("");
  const [phone, setPhone] = useState("");
  const [notice, setNotice] = useState("");
  const [busy, setBusy] = useState(false);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    let active = true;
    getSupabase().auth.getSession().then(({ data, error }) => {
      if (!active) return;
      const user = data.session?.user;
      if (error || !user) { router.replace("/login"); return; }
      setEmail(user.email ?? "");
      setShopName(typeof user.user_metadata?.shop_name === "string" ? user.user_metadata.shop_name : "");
      setPhone(typeof user.user_metadata?.phone_local === "string" ? user.user_metadata.phone_local : "");
      setChecking(false);
    });
    return () => { active = false; };
  }, [router]);

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setNotice("");
    if (!/^\d{8}$/.test(phone)) { setNotice("Le numéro doit contenir exactement 8 chiffres."); return; }
    if (!shopName.trim()) { setNotice("Saisissez le nom de votre boutique."); return; }
    setBusy(true);
    try {
      const { error } = await getSupabase().auth.updateUser({
        data: { shop_name: shopName.trim(), phone_local: phone, phone_country: "+229 01" },
      });
      if (error) throw error;
      setNotice("Vos informations ont été enregistrées.");
    } catch (error) {
      setNotice(error instanceof Error ? error.message : "Impossible d’enregistrer les modifications.");
    } finally { setBusy(false); }
  }

  if (checking) return <main className="loading-screen"><div className="loading-mark">W</div><p>Chargement du compte…</p></main>;

  return <div className="dashboard-shell">
    <aside className="sidebar">
      <Link className="brand dash-brand" href="/"><span className="brand-mark">W</span><span>Wejit</span></Link>
      <div className="workspace-label">ESPACE BOUTIQUE</div>
      <Link className="side-item" href="/dashboard"><span>▦</span> Vue d’ensemble</Link>
      <div className="side-item"><span>▤</span> Commandes</div>
      <div className="side-item"><span>□</span> Produits</div>
      <div className="side-item active"><span>◎</span> Compte</div>
      <div className="sidebar-bottom"><div className="avatar">{shopName.slice(0, 1).toUpperCase() || "W"}</div><div className="account-label"><strong>{shopName || "Ma boutique"}</strong><span>{email}</span></div></div>
    </aside>
    <main className="dashboard-main">
      <header className="dashboard-header"><div><p className="dash-kicker">VOTRE ESPACE</p><h1>Compte</h1></div><Link className="account-back" href="/dashboard">← Tableau de bord</Link></header>
      <section className="account-panel">
        <div className="account-panel-heading"><div className="account-large-avatar">{shopName.slice(0, 1).toUpperCase() || "W"}</div><div><h2>Informations de la boutique</h2><p>Modifiez les informations associées à votre compte Wejit.</p></div></div>
        {notice && <div className="notice account-notice" role="status">{notice}</div>}
        <form onSubmit={submit}>
          <div className="field"><label htmlFor="email">Adresse e-mail du compte</label><input id="email" type="email" value={email} readOnly /></div>
          <div className="field"><label htmlFor="shopName">Nom de votre boutique</label><input id="shopName" type="text" maxLength={80} value={shopName} onChange={e => setShopName(e.target.value)} required /></div>
          <div className="field"><label htmlFor="phone">Numéro de téléphone</label><div className="phone-control"><span className="phone-prefix"><span aria-hidden="true">🇧🇯</span><span>+229 01</span></span><input id="phone" type="tel" inputMode="numeric" pattern="[0-9]{8}" minLength={8} maxLength={8} value={phone} onChange={e => setPhone(e.target.value.replace(/\D/g, "").slice(0, 8))} required /></div><p className="field-hint">8 chiffres exactement après l’indicatif.</p></div>
          <button className="primary-button account-save" type="submit" disabled={busy}>{busy ? "Enregistrement…" : "Enregistrer les modifications"}</button>
        </form>
      </section>
    </main>
  </div>;
}
