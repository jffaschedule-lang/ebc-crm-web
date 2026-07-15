import { createClient } from '@supabase/supabase-js';

const url = import.meta.env.VITE_SUPABASE_URL as string;
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string;

// Single shared client — the frontend only ever uses the anon key. RLS and
// the backend protect the data (see project constraint #3).
export const supabase = createClient(url, anonKey);
