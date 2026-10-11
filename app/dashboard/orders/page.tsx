"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { requireShop, type Shop } from "@/lib/shop-data";

type Order = {
  id: string; reference: string; product_name: string; unit_price: number; quantity: number;
  total_price: number; customer_name: string; customer_mobile_money: string;
  delivery_address: string; intention: "direct" | "discuss"; status: "pending" | "success" | "abandoned";
  created_at: string;
};

const statusLabel: Record<Order["status"], string> = {
  pending: "En attente", success: "Confirmée", abandoned: "Abandonnée",
};

export default function OrdersPage() {
  const router = useRouter();
  const [shop, setShop] = useState<Shop | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [notice, setNotice] = useState("");

  useEffect(() => {
    let active = true;
    async function load() {
      try {
        const { supabase, shop: currentShop } = await requireShop();
        if (!active) return;
        if (!currentShop) { router.replace("/onboarding"); return; }
        setShop(currentShop);
        const { data, error } = await supabase.from("orders")
          .select("id,reference,product_name,unit_price,quantity,total_price,customer_name,customer_mobile_money,delivery_address,intention,status,created_at")
          .eq("shop_id", currentShop.id).order("created_at", { ascending: false });
        if (error) throw error;
        if (active) setOrders((data ?? []) as Order[]);
      } catch (error) {
        if (error instanceof Error && error.message === "SESSION_REQUIRED") router.replace("/login");
        else if (active) setNotice(error instanceof Error ? error.message : "Impossible de charger les commandes.");
      } finally { if (active) setLoading(false); }
    }
    void load();
    return () => { active = false; };
  }, [router]);

  return <div className="dashboard-shell">
    <aside className="sidebar">
      <Link className="brand dash-brand" href="/"><span className="brand-mark">W</span><span>Wejit</span></Link>
      <div className="workspace-label">ESPACE BOUTIQUE</div>
      <Link className="side-item" href="/dashboard">▦ &nbsp; Vue d’ensemble</Link>
      <Link className="side-item active" href="/dashboard/orders">▤ &nbsp; Commandes</Link>
      <Link className="side-item" href="/dashboard/products">□ &nbsp; Produits</Link>
      <Link className="side-item" href="/dashboard/account">◎ &nbsp; Compte</Link>
      <div className="sidebar-bottom"><div className="avatar">{shop?.name?.slice(0,1).toUpperCase() || "W"}</div><div className="account-label"><strong>{shop?.name || "Ma boutique"}</strong><span>Commandes</span></div></div>
    </aside>
    <main className="dashboard-main">
      <header className="dashboard-header"><div><p className="dash-kicker">VENTES</p><h1>Commandes</h1></div><Link className="dashboard-cta" href="/dashboard">Retour au tableau de bord</Link></header>
      <section className="data-panel">
        <div className="panel-heading"><div><h2>Historique des commandes</h2><p className="panel-copy">Les commandes liées à votre boutique apparaîtront ici.</p></div><span className="order-count">{orders.length} total</span></div>
        {notice && <p className="data-notice" role="status">{notice}</p>}
        {loading ? <p className="empty-state">Chargement des commandes…</p> : orders.length === 0 ? <div className="empty-state"><strong>Aucune commande pour le moment</strong><p>Quand un client passera commande dans votre boutique, elle apparaîtra ici.</p></div> : <div className="table-wrap"><table className="data-table"><thead><tr><th>Référence</th><th>Client</th><th>Produit</th><th>Total</th><th>Statut</th><th>Date</th></tr></thead><tbody>{orders.map(order=><tr key={order.id}><td><strong>{order.reference}</strong><small>{order.intention === "direct" ? "Commande directe" : "À discuter"}</small></td><td><strong>{order.customer_name}</strong><small>{order.customer_mobile_money}</small></td><td>{order.product_name}<small>Quantité : {order.quantity}</small></td><td><strong>{order.total_price.toLocaleString("fr-FR")} FCFA</strong></td><td><span className={"status-pill status-" + order.status}>{statusLabel[order.status]}</span></td><td>{new Date(order.created_at).toLocaleDateString("fr-FR")}</td></tr>)}</tbody></table></div>}
      </section>
    </main>
    <style jsx global>{`
      .data-panel{background:#fff;border:1px solid #e9e9e9;border-radius:18px;padding:24px}
      .data-panel h2{font-size:17px;margin:0 0 7px;letter-spacing:-.3px}
      .panel-copy{color:#777;font-size:12px;margin:0 0 20px}
      .panel-heading{display:flex;justify-content:space-between;align-items:center;gap:12px}
      .order-count{background:#f2f0ff;color:#5746d8;border-radius:999px;padding:7px 11px;font-size:11px;font-weight:700;white-space:nowrap}
      .empty-state{padding:32px 12px;color:#777;text-align:center;font-size:13px;background:#fafafa;border-radius:12px}
      .empty-state strong{color:#222;display:block;margin-bottom:6px}.empty-state p{margin:0}
      .data-notice{background:#f0efff;color:#4338ca;padding:11px 13px;border-radius:9px;font-size:12px;line-height:1.5}
      .table-wrap{overflow-x:auto}.data-table{width:100%;border-collapse:collapse;font-size:12px}
      .data-table th{text-align:left;color:#777;font-weight:650;background:#fafafa}
      .data-table th,.data-table td{padding:13px 12px;border-bottom:1px solid #eee;white-space:nowrap}
      .data-table td strong,.data-table td small{display:block}.data-table td small{color:#888;margin-top:4px}
      .status-pill{display:inline-block;border-radius:999px;padding:6px 9px;font-size:10px;font-weight:700}
      .status-pending{background:#fff4d6;color:#8a5a00}.status-success{background:#e7f8ed;color:#187443}.status-abandoned{background:#fce8e8;color:#b42318}
      @media(max-width:650px){.data-panel{padding:18px}.dashboard-header{align-items:flex-start;gap:12px}}
    `}</style>
  </div>;
}
