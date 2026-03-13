import { supabase } from "@/integrations/supabase/client";

export const ensureSupabaseSession = async () => {
  const { data: authData } = await supabase.auth.getUser();
  if (authData.user) return authData.user;
  const { data, error } = await supabase.auth.signInAnonymously();
  if (error) throw error;
  return data.user;
};
