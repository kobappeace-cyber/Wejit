"use client";

import Link from "next/link";
import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { requireShop, type Shop } from "@/lib/shop-data";

type Product = { id: string; name: string; price: number; stock: number; description: string | null; created_at: string };

export default function ProductsPage() {
  const router = useRouter();
  const [shop, setShop] = useState<Shop | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [notice, setNotice] = useState("");
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [stock, setStock] = useState("0");
  const [description, setDescription] = useState("");

  async function load() {
    try {
      const { supabase, shop: currentShop } = await requireShop();
      if (!currentShop) { router.replace("/onboarding"); return; }
      setShop(currentShop);
      const { data, error } = await supabase.from("products")
        .select("id,name,price,stock,description,created_at")
        .eq("shop_id", currentShop.id).order("created_at", { ascending: false });
      if (error) throw error;
      setProducts((data ?? []) as Product[]);
    } catch (error) {
      if (error instanceof Error && error.message === "SESSION_REQUIRED") router.replace("/login");
      else setNotice(error instanceof Error ? error.message : "Impossible de charger les produits.");
    } finally { setLoading(false); }
  }

  useEffect(() => { void load(); }, []);

  async function addProduct(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!shop || !name.trim()) return;
    const parsedPrice = Number(price);
    const parsedStock = Number(stock);
    if (!Number.isSafeInteger(parsedPrice) || parsedPrice < 0 || !Number.isSafeInteger(parsedStock) || parsedStock < 0) {
      setNotice("Le prix et le stock doivent être des nombres entiers positifs.");
      return;
    }
    setSaving(true); setNotice("");
    try {
      const { supabase } = await requireShop();
      const { error } = await supabase.from("products").insert({
        shop_id: shop.id, name: name.trim(), price: parsedPrice, stock: parsedStock,
        description: description.trim() || null,
      });
      if (error) throw error;
      setName(""); setPrice(""); setStock("0"); setDescription("");
      await load();
      setNotice("Produit ajouté.");
    } catch (error) {
      setNotice(error instanceof Error ? error.message : "Impossible d’ajouter le produit.");
    } finally { setSaving(false); }
  }

  async function deleteProduct(id: string) {
    if (!window.confirm("Supprimer ce produit ?")) return;
    setNotice("");
    try {
      const { supabase } = await requireShop();
      const { error } = await supabase.from("products").delete().eq("id", id);
      if (error) throw error;
      setProducts(items => items.filter(item => item.id !== id));
      setNotice("Produit supprimé.");
    } catch (error) { setNotice(error instanceof Error ? error.message : "Suppression impossible."); }
  }

  return <div className="dashboard-shell">
    <aside className="sidebar">
      <Link className="brand dash-brand" href="/"><span className="brand-mark">W</span><span>Wejit</span></Link>
      <div className="workspace-label">ESPACE BOUTIQUE</div>
      <Link className="side-item" href="/dashboard">▦ &nbsp; Vue d’ensemble</Link>
      <Link className="side-item" href="/dashboard/orders">▤ &nbsp; Commandes</Link>
      <Link className="side-item active" href="/dashboard/products">□ &nbsp; Produits</Link>
      <Link className="side-item" href="/dashboard/account">◎ &nbsp; Compte</Link>
      <div className="sidebar-bottom"><div className="avatar">{shop?.name?.slice(0,1).toUpperCase() || "W"}</div><div className="account-label"><strong>{shop?.name || "Ma boutique"}</strong><span>Catalogue</span></div></div>
    </aside>
    <main className="dashboard-main">
      <header className="dashboard-header"><div><p className="dash-kicker">CATALOGUE</p><h1>Produits</h1></div><Link className="dashboard-cta" href="/dashboard">Retour au tableau de bord</Link></header>
      <section className="data-panel">
        <h2>Ajouter un produit</h2>
        <p className="panel-copy">Les produits ajoutés ici sont enregistrés dans votre boutique.</p>
        {notice && <p className="data-notice" role="status">{notice}</p>}
        <form className="product-form" onSubmit={addProduct}>
          <label>Nom du produit<input value={name} onChange={e=>setName(e.target.value)} maxLength={120} required placeholder="Ex. Sac à dos"/></label>
          <div className="form-pair">
            <label>Prix (FCFA)<input type="number" min="0" step="1" value={price} onChange={e=>setPrice(e.target.value)} required placeholder="5000"/></label>
            <label>Stock disponible<input type="number" min="0" step="1" value={stock} onChange={e=>setStock(e.target.value)} required/></label>
          </div>
          <label>Description (facultatif)<textarea value={description} onChange={e=>setDescription(e.target.value)} rows={3} maxLength={1000} placeholder="Décrivez le produit…"/></label>
          <button className="primary-button" type="submit" disabled={saving || !shop}>{saving ? "Enregistrement…" : "Ajouter le produit →"}</button>
        </form>
      </section>
      <section className="data-panel">
        <div className="panel-heading"><div><h2>Votre catalogue</h2><p className="panel-copy">{products.length} produit(s)</p></div></div>
        {loading ? <p className="empty-state">Chargement des produits…</p> : products.length === 0 ? <p className="empty-state">Aucun produit pour le moment. Ajoutez votre premier produit ci-dessus.</p> : <div className="table-wrap"><table className="data-table"><thead><tr><th>Produit</th><th>Prix</th><th>Stock</th><th>Action</th></tr></thead><tbody>{products.map(p=><tr key={p.id}><td><strong>{p.name}</strong>{p.description && <small>{p.description}</small>}</td><td>{p.price.toLocaleString("fr-FR")} FCFA</td><td>{p.stock}</td><td><button className="delete-button" onClick={()=>void deleteProduct(p.id)}>Supprimer</button></td></tr>)}</tbody></table></div>}
      </section>
    </main>
    <style jsx global>{`
      .data-panel{background:#fff;border:1px solid #e9e9e9;border-radius:18px;padding:24px;margin-bottom:20px}
      .data-panel h2{font-size:17px;margin:0 0 7px;letter-spacing:-.3px}
      .panel-copy{color:#777;font-size:12px;margin:0 0 20px}
      .product-form{display:grid;gap:16px;max-width:620px}
      .product-form label{display:grid;gap:8px;font-size:12px;font-weight:700}
      .product-form input,.product-form textarea{width:100%;border:1px solid #e2e2e2;border-radius:10px;background:#fafafa;padding:12px;color:#171717;font:inherit;font-size:13px;outline:none}
      .product-form input:focus,.product-form textarea:focus{border-color:#635bff;box-shadow:0 0 0 3px #635bff18}
      .form-pair{display:grid;grid-template-columns:1fr 1fr;gap:14px}
      .data-notice{background:#f0efff;color:#4338ca;padding:11px 13px;border-radius:9px;font-size:12px;line-height:1.5}
      .panel-heading{display:flex;justify-content:space-between;align-items:center}
      .empty-state{padding:25px 12px;color:#777;text-align:center;font-size:13px;background:#fafafa;border-radius:12px}
      .table-wrap{overflow-x:auto}.data-table{width:100%;border-collapse:collapse;font-size:12px}
      .data-table th{text-align:left;color:#777;font-weight:650;background:#fafafa}
      .data-table th,.data-table td{padding:13px 12px;border-bottom:1px solid #eee;white-space:nowrap}
      .data-table td strong,.data-table td small{display:block}.data-table td small{white-space:normal;color:#888;margin-top:4px;max-width:240px}
      .delete-button{border:1px solid #f1caca;background:#fff7f7;color:#b42318;border-radius:8px;padding:7px 10px;font-size:11px;font-weight:700}
      @media(max-width:650px){.data-panel{padding:18px}.form-pair{grid-template-columns:1fr}.dashboard-header{align-items:flex-start;gap:12px}}
    `}</style>
  </div>;
}
