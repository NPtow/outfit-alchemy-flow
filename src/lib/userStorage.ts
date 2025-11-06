import { supabase } from "@/integrations/supabase/client";

export const getUserId = async (): Promise<string | null> => {
  const { data: { session } } = await supabase.auth.getSession();
  return session?.user?.id || null;
};
