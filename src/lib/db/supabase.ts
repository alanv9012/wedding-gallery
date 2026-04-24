import "server-only";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { getSupabaseEnv } from "@/lib/config/env";

export type PhotoRow = {
  id: string;
  event_slug: string;
  file_key: string;
  url: string;
  approved: boolean;
  created_at: string;
};

export type SupabaseDatabase = {
  public: {
    Tables: {
      photos: {
        Row: PhotoRow;
        Insert: {
          id?: string;
          event_slug: string;
          file_key: string;
          url: string;
          approved?: boolean;
          created_at?: string;
        };
        Update: Partial<{
          event_slug: string;
          file_key: string;
          url: string;
          approved: boolean;
          created_at: string;
        }>;
      };
    };
  };
};

let cachedSupabaseClient: SupabaseClient<SupabaseDatabase> | null = null;

export function getSupabaseServerClient(): SupabaseClient<SupabaseDatabase> {
  if (cachedSupabaseClient) {
    return cachedSupabaseClient;
  }

  const env = getSupabaseEnv();
  cachedSupabaseClient = createClient<SupabaseDatabase>(env.supabaseUrl, env.supabaseAnonKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });

  return cachedSupabaseClient;
}
