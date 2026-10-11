"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getSupabase } from "@/lib/supabase";
import { makeSlug } from "@/lib/shop-data";

export default function OnboardingPage() {
  const router = useRouter();
  const [shopName, setShopName] = useState("");
  const [phone, setPhone] = useState("");
  const [notice, setNotice] = useState("");
  const [busy, setBusy] = useState(false);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    let active = true;
    async function checkSession() {
      try {
        const { data, error } = await getSupabase().auth.getSession();
        if (!active) return;
        if (error || !data.session) {
          router.replace("/login");
          return;
        }
        const { data: existingShop, error: shopError } = await getSupabase().from("shops")
          .select("id").eq("user_id", data.session.user.id).maybeSingle();
        if (!active) return;
        if (shopError) setNotice("Impossible de vérifier la boutique. " + shopError.message);
        if (existingShop) {
          router.replace("/dashboard");
          return;
        }
        const metadata = data.session.user.user_metadata ?? {};
        setShopName(typeof metadata.shop_name === "string" ? metadata.shop_name : "");
        setPhone(typeof metadata.phone_local === "string" ? metadata.phone_local : "");
      } catch {
        if (active) setNotice("Impossible de vérifier la session. Rechargez la page.");
      } finally {
        if (active) setChecking(false);
      }
    }
    void checkSession();
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
      const supabase = getSupabase();
      const { data: updated, error } = await supabase.auth.updateUser({
        data: { shop_name: shopName.trim(), phone_local: phone, phone_country: "+229 01" },
      });
      if (error) throw error;
      if (!updated.user) throw new Error("Impossible de retrouver le compte connecté.");

      const { data: existingShop, error: lookupError } = await supabase
        .from("shops")
        .select("id")
        .eq("user_id", updated.user.id)
        .maybeSingle();
      if (lookupError) throw lookupError;

      const slugBase = makeSlug(shopName);
      const shopPayload = {
        user_id: updated.user.id,
        name: shopName.trim(),
        slug: slugBase + "-" + updated.user.id.slice(0, 6),
        whatsapp_number: "+22901" + phone,
      };
      const save = existingShop
        ? await supabase.from("shops").update({
            name: shopPayload.name,
            whatsapp_number: shopPayload.whatsapp_number,
          }).eq("id", existingShop.id)
        : await supabase.from("shops").insert(shopPayload);
      if (save.error) throw save.error;
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
