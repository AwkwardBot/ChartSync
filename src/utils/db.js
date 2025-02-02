import { createClient } from "@supabase/supabase-js";

let supabaseClient = null;

const getSupabaseClient = () => {
  if (!supabaseClient) {
    supabaseClient = createClient(
      import.meta.env.VITE_SUPABASE_URL,
      import.meta.env.VITE_SUPABASE_ANON_KEY
    );
  }
  return supabaseClient;
};

export default getSupabaseClient;
