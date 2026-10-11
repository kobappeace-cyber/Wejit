"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getSupabase } from "@/lib/supabase";

export default function DashboardPage() {
  const router = useRouter();
  const [checking, setChecking] = useState(true);
  const [email, setEmail] = useState("");
  const [shopName, setShopName] = useState("Ma boutique");
  const [phone, setPhone] = useState("");
  const [signingOut, setSigningOut] = useState(false);

  useEffect(() => {
    let active = true;
    let subscription: { unsubscribe: () => void } | undefined;
    try {
      const supabase = getSupabase();
      supabase.auth.getSession().then(({ data, error }) => {
        if (!active) return;
        if (error || !data.session) {
          router.replace("/login");
          return;
        }
        setEmail(data.session.user.email ?? "");
        setShopName(typeof data.session.user.user_metadata?.shop_name === "string" ? data.session.user.user_metadata.shop_name : "Ma boutique");
        setPhone(typeof data.session.user.user_metadata?.phone_local === "string" ? data.session.user.user_metadata.phone_local : "");
        setChecking(false);
      });
      const { data } = supabase.auth.onAuthStateChange((_event, session) => {
        if (!active) return;
        if (!session) router.replace("/login");
        else {
          setEmail(session.user.email ?? "");
          setShopName(typeof session.user.user_metadata?.shop_name === "string" ? session.user.user_metadata.shop_name : "Ma boutique");
          setPhone(typeof session.user.user_metadata?.phone_local === "string" ? session.user.user_metadata.phone_local : "");
        }
      });
      subscription = data.subscription;
    } catch {
      router.replace("/login");
    }
    return () => { active = false; subscription?.unsubscribe(); };
  }, [router]);

  async function logout() {
    setSigningOut(true);
    try {
      await getSupabase().auth.signOut();
      router.replace("/login");
    } catch {
      setSigningOut(false);
    }
  }

  if (checking) return <main className="loading-screen"><div className="loading-mark">W</div><p>Ouverture de votre espace…</p></main>;

  return <div className="dashboard-shell">
    <aside className="sidebar">
      <Link className="brand dash-brand" href="/"><span className="brand-mark"><svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 7v10a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7"/><path d="M8 7V5a4 4 0 0 1 8 0v2"/><path d="M9 12h6"/></svg></span><span>Wejit</span></Link>
      <div className="workspace-label">ESPACE BOUTIQUE</div>
      <div className="side-item active"><span>▦</span> Vue d’ensemble</div>
      <div className="side-item"><span>▤</span> Commandes</div>
      <div className="side-item"><span>□</span> Produits</div>
      <Link className="side-item" href="/dashboard/account"><span>◎</span> Compte</Link>
      <div className="sidebar-bottom"><div className="avatar">{shopName.slice(0, 1).toUpperCase() || "W"}</div><div className="account-label"><strong>{shopName}</strong><span>{email || "Compte connecté"}</span></div></div>
    </aside>
    <main className="dashboard-main">
      <header className="dashboard-header"><div><p className="dash-kicker">TABLEAU DE BORD</p><h1>Vue d’ensemble</h1></div><button className="profile-button" aria-label={signingOut ? "Déconnexion en cours" : "Se déconnecter"} onClick={logout} title="Se déconnecter">{signingOut ? "…" : "↗"}</button></header>
      <section className="welcome-row"><div><h2>Bienvenue sur {shopName} 👋</h2><p>Votre espace est prêt.{phone ? ` Téléphone : +229 01 ${phone}` : " Complétez les informations de votre boutique dans Compte."}</p></div><button className="dashboard-cta" onClick={() => window.location.assign("/dashboard/settings")}>Configurer ma boutique <span>→</span></button></section>
      <section className="stats-grid">
        <article className="stat-card"><div className="stat-label">Revenu total</div><div className="stat-value">0 <span>FCFA</span></div><div className="stat-foot"><span className="muted-dot" /> Aucun revenu pour le moment</div></article>
        <article className="stat-card"><div className="stat-label">Commandes</div><div className="stat-value">0</div><div className="stat-foot">Les nouvelles commandes apparaîtront ici</div></article>
        <article className="stat-card"><div className="stat-label">Produits</div><div className="stat-value">0</div><div className="stat-foot">Ajoutez votre premier produit</div></article>
      </section>
      <section className="empty-panel"><div className="empty-art"><div className="empty-art-square"><svg viewBox="0 0 48 48" width="34" height="34" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><path d="M7 18h34l-3 23H10L7 18Z"/><path d="m16 18 8-12 8 12"/><path d="M18 27v6m12-6v6"/></svg></div><span className="spark spark-one">✦</span><span className="spark spark-two">✧</span></div><h2>Votre boutique commence ici</h2><p>Ajoutez vos premiers produits et préparez votre boutique à recevoir ses premières commandes.</p><button className="primary-button empty-cta" onClick={() => window.location.assign("/dashboard/products/new")}>Ajouter un produit <span>→</span></button><div className="empty-foot">Aucun frais pour commencer · Revenus actuels : <strong>0 FCFA</strong></div></section>
    </main>
  </div>;
}
