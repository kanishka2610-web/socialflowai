import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env?.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env?.VITE_SUPABASE_ANON_KEY || '';

export const isSupabaseConfigured = supabaseUrl && supabaseAnonKey;

export const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey)
  : {
      // Mock client that logs warning but doesn't crash the app
      auth: {
        signUp: async (credentials) => ({ data: { user: { id: 'mock-user-id', email: credentials.email } }, error: null }),
        signInWithPassword: async (credentials) => ({ data: { user: { id: 'mock-user-id', email: credentials.email } }, error: null }),
        signOut: async () => ({ error: null }),
        getSession: async () => ({ data: { session: null }, error: null }),
        onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } }),
      },
      from: (table) => ({
        select: () => ({
          order: () => ({
            eq: () => Promise.resolve({ data: [], error: null }),
            limit: () => Promise.resolve({ data: [], error: null }),
          }),
          eq: () => Promise.resolve({ data: [], error: null }),
        }),
        insert: (data) => Promise.resolve({ data, error: null }),
        update: (data) => ({ eq: () => Promise.resolve({ data, error: null }) }),
        delete: () => ({ eq: () => Promise.resolve({ error: null }) }),
      }),
      storage: {
        from: (bucket) => ({
          upload: async (path, file) => ({ data: { path, url: URL.createObjectURL(file) }, error: null }),
          getPublicUrl: (path) => ({ data: { publicUrl: path } }),
        })
      }
    };
