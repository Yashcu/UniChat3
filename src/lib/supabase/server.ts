import { env } from "@/lib/env.server";
import { createClient } from "@supabase/supabase-js";

export const createAdminClient = () => {
  return createClient(
    env.NEXT_PUBLIC_SUPABASE_URL,
    env.SUPABASE_SERVICE_ROLE_KEY
  );
};
