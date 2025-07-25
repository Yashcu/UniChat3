import { createClient } from '@supabase/supabase-js'
import { Database } from '@/types/supabase'

let serverEnv: { NEXT_PUBLIC_SUPABASE_URL: string; SUPABASE_SERVICE_ROLE_KEY: string; } | undefined;
if (typeof window === 'undefined') {
  import('@/lib/env.server').then(module => {
    serverEnv = module.env;
  });
}

export const supabase = createClient<Database>(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!, {
    realtime: {
      params: {
        eventsPerSecond: 10,
      },
    },
    auth: {
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: true
    }
  }
);

export const supabaseAdmin = typeof window === 'undefined' && serverEnv
  ? createClient<Database>(
      serverEnv.NEXT_PUBLIC_SUPABASE_URL,
      serverEnv.SUPABASE_SERVICE_ROLE_KEY,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        },
        realtime: {
          params: {
            eventsPerSecond: 10,
          },
        }
      }
    )
  : undefined;

export const createRealtimeChannel = (channelName: string, presenceKey: string) => {
  return supabase.channel(channelName, {
    config: {
      broadcast: { self: true },
      presence: { key: presenceKey },
    },
  });
};
