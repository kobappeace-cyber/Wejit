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
  const [revenue, setRevenue] = useState(0);
  const [orderCount, setOrderCount] = useState(0);
  const [productCount, setProductCount] = useState(0);
  const [signingOut, setSigningOut] = useState(false);
  const [loadError, setLoadError] = useState("");

  useEffect(() => {
    let active = true;
    let subscription: { unsubscribe: () => void } | undefined;

    async function loadDashboard(userId: string, userEmail: string, metadata: Record<string, unknown>) {
      const supabase = getSupabase();
      setEmail(userEmail);
      setShopName(typeof metadata.shop_name === "string" ? metadata.shop_name : "Ma boutique");
      setPhone(typeof metadata.phone_local === "string" ? metadata.phone_local : "");
      try {
        const { data: shop, error: shopError } = await supabase.from("shops")
          .select("id,name,whatsapp_number").eq("user_id", userId).maybeSingle();
        if (shopError) throw shopError;
        if (!active) return;
        if (shop) {
          setShopName(shop.name);
          setPhone(typeof shop.whatsapp_number === "string" ? shop.whatsapp_number.replace(/^\+22901/, "") : "");
          const [products, orders, successfulOrders] = await Promise.all([
            supabase.from("products").select("id", { count: "exact", head: true }).eq("shop_id", shop.id),
            supabase.from("orders").select("id", { count: "exact", head: true }).eq("shop_id", shop.id),
            supabase.from("orders").select("total_price").eq("shop_id", shop.id).eq("status", "success"),
          ]);
          if (products.error) throw products.error;
          if (orders.error) throw orders.error;
          if (successfulOrders.error) throw successfulOrders.error;
          if (!active) return;
          setProductCount(products.count ?? 0);
          setOrderCount(orders.count ?? 0);
          setRevenue((successfulOrders.data ?? []).reduce((sum, order) => sum + Number(order.total_price || 0), 0));
        } else {
          setProductCount(0); setOrderCount(0); setRevenue(0);
        }
        setLoadError("");
      } catch (error) {
        if (active) setLoadError(error instanceof Error ? error.message : "Les statistiques n’ont pas pu être chargées.");
      } finally {
        if (active) setChecking(false);
      }
    }

    try {
      const supabase = getSupabase();
      supabase.auth.getSession().then(({ data, error }) => {
        if (!active) return;
        if (error || !data.session) { router.replace("/login"); return; }
        void loadDashboard(data.session.user.id, data.session.user.email ?? "", data.session.user.user_metadata ?? {});
      }).catch(() => { if (active) router.replace("/login"); });
      const { data } = supabase.auth.onAuthStateChange((_event, session) => {
        if (!active) return;
        if (!session) router.replace("/login");
        else void loadDashboard(session.user.id, session.user.email ?? "", session.user.user_metadata ?? {});
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
      <Link className="side-item active" href="/dashboard"><span>▦</span> Vue d’ensemble</Link>
      <Link className="side-item" href="/dashboard/orders"><span>▤</span> Commandes</Link>
      <Link className="side-item" href="/dashboard/products"><span>□</span> Produits</Link>
      <Link className="side-item" href="/dashboard/account"><span>◎</span> Compte</Link>
      <div className="sidebar-bottom"><div className="avatar">{shopName.slice(0, 1).toUpperCase() || "W"}</div><div className="account-label"><strong>{shopName}</strong><span>{email || "Compte connecté"}</span></div></div>
    </aside>
    <main className="dashboard-main">
      <header className="dashboard-header"><div><p className="dash-kicker">TABLEAU DE BORD</p><h1>Vue d’ensemble</h1></div><button className="profile-button" aria-label={signingOut ? "Déconnexion en cours" : "Se déconnecter"} onClick={logout} title="Se déconnecter">{signingOut ? "…" : "↗"}</button></header>
      <section className="welcome-row"><div><h2>Bienvenue sur {shopName} 👋</h2><p>Votre espace est prêt.{phone ? ` Téléphone : +229 01 ${phone}` : " Complétez les informations de votre boutique dans Compte."}</p></div><Link className="dashboard-cta" href="/dashboard/account">Configurer ma boutique <span>→</span></Link></section>
      {loadError && <div className="notice" role="status">{loadError}</div>}
      <section className="stats-grid">
        <article className="stat-card"><div className="stat-label">Revenu des commandes confirmées</div><div className="stat-value">{revenue.toLocaleString("fr-FR")} <span>FCFA</span></div><div className="stat-foot"><span className="muted-dot" /> Calculé depuis vos commandes confirmées</div></article>
        <article className="stat-card"><div className="stat-label">Commandes</div><div className="stat-value">{orderCount}</div><div className="stat-foot">Toutes les commandes de votre boutique</div><Link className="text-link" href="/dashboard/orders">Voir les commandes →</Link></article>
        <article className="stat-card"><div className="stat-label">Produits</div><div className="stat-value">{productCount}</div><div className="stat-foot">Produits enregistrés dans le catalogue</div><Link className="text-link" href="/dashboard/products">Gérer les produits →</Link></article>
      </section>
      {productCount === 0 ? <section className="empty-panel"><div className="empty-art"><div className="empty-art-square"><svg viewBox="0 0 48 48" width="34" height="34" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><path d="M7 18h34l-3 23H10L7 18Z"/><path d="m16 18 8-12 8 12"/><path d="M18 27v6m12-6v6"/></svg></div><span className="spark spark-one">✦</span><span className="spark spark-two">✧</span></div><h2>Votre boutique commence ici</h2><p>Ajoutez vos premiers produits et préparez votre boutique à recevoir ses premières commandes.</p><Link className="primary-button empty-cta" href="/dashboard/products">Ajouter un produit <span>→</span></Link><div className="empty-foot">Pas encore de produit · Revenus confirmés : <strong>{revenue.toLocaleString("fr-FR")} FCFA</strong></div></section> : <section className="empty-panel"><h2>Votre boutique est configurée</h2><p>Votre tableau de bord se met à jour à partir des produits et commandes enregistrés.</p><Link className="primary-button empty-cta" href="/dashboard/products">Gérer mes produits <span>→</span></Link></section>}
    </main>
  </div>;
}
