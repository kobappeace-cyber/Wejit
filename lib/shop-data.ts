import { getSupabase } from "@/lib/supabase";

export type Shop = {
  id: string;
  user_id: string;
  name: string;
  slug: string;
  whatsapp_number: string;
  created_at: string;
};

export async function requireShop() {
  const supabase = getSupabase();
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) throw new Error("SESSION_REQUIRED");

  const { data, error } = await supabase
    .from("shops")
    .select("id,user_id,name,slug,whatsapp_number,created_at")
    .eq("user_id", user.id)
    .maybeSingle();

  if (error) throw error;
  return { supabase, user, shop: data as Shop | null };
}

export function makeSlug(value: string) {
  const base = value.normalize("NFD").replace(/[\u0300-\u036f]/g, "")
    .toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
  return base || "ma-boutique";
}
