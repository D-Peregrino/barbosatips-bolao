import { isUserAdmin } from "@/lib/admin/supabase-admin";
import { createClient } from "@/lib/supabase/server";

/** Admin editorial autenticado pode ver rascunhos em `/analise/[slug]`. */
export async function podePrevisualizarRascunhoEditorial(): Promise<boolean> {
  try {
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return false;
    return isUserAdmin(supabase, user.id);
  } catch {
    return false;
  }
}
