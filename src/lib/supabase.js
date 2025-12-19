
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
    console.error('Supabase keys are missing! Please check .env file.')
}

// Mock client to prevent crash when keys are missing
const mockSupabase = {
    auth: {
        getSession: () => Promise.resolve({ data: { session: null }, error: null }),
        onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => { } } } }),
        signUp: () => Promise.resolve({ data: null, error: new Error("Supabase keys missing") }),
        signInWithPassword: () => Promise.resolve({ data: null, error: new Error("Supabase keys missing") }),
        signInWithOAuth: () => Promise.resolve({ data: null, error: new Error("Supabase keys missing") }),
        signOut: () => Promise.resolve({ error: null }),
    }
}

export const supabase = (supabaseUrl && supabaseAnonKey)
    ? createClient(supabaseUrl, supabaseAnonKey)
    : mockSupabase;
