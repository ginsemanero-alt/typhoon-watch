import { createClient } from '@supabase/supabase-js'

const url = import.meta.env.VITE_SUPABASE_URL as string | undefined
const key = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined

export const isSupabaseConfigured = Boolean(url && key)

// A placeholder is used when env vars are missing so the app can still render
// the setup screen instead of crashing on startup.
export const supabase = createClient(url ?? 'http://localhost:54321', key ?? 'placeholder-key')
