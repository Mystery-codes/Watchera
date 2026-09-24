import { createClient } from "@/lib/supabase/server";
import { isAdmin } from "@/lib/admin";

export async function requireAdmin(): Promise<{ email: string; id: string } | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user || !isAdmin(user.email)) {
    return null;
  }
  return { email: user.email ?? "", id: user.id };
}
