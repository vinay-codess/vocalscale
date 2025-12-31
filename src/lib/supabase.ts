import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

const isValidUrl = (url: string | undefined) => {
  try {
    return url && new URL(url).protocol.startsWith('http');
  } catch {
    return false;
  }
};

const isConfigValid = isValidUrl(supabaseUrl) && supabaseKey;

if (!isConfigValid) {
  console.warn('Missing or invalid Supabase environment variables. Please check your .env file.');
}

// Export null if config is invalid to prevent crash, but type it as any to avoid strict null checks everywhere for now
// (We will handle the null check in the usage sites or via a helper)
export const supabase = isConfigValid 
  ? createClient(supabaseUrl!, supabaseKey!) 
  : null; 
