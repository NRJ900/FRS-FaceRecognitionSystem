import { createClient } from '@supabase/supabase-js';
import type { Database } from '@/integrations/supabase/types';

export interface SupabaseConfig {
  url: string;
  anonKey: string;
}

const STORAGE_KEY = 'supabase-config';

// Default configuration (your current setup) example
// This should be replaced with your actual Supabase project details
const DEFAULT_CONFIG: SupabaseConfig = {
  url: "https://YOUR_SUPABASE_ID.supabase.co",
  anonKey: "YOUR_ANON_KEY"
};

export const getSupabaseConfig = (): SupabaseConfig | null => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (error) {
    console.error('Error reading Supabase config from storage:', error);
  }
  return null;
};

export const saveSupabaseConfig = (config: SupabaseConfig): void => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(config));
  } catch (error) {
    console.error('Error saving Supabase config to storage:', error);
    throw error;
  }
};

export const hasSupabaseConfig = (): boolean => {
  return getSupabaseConfig() !== null;
};

export const createDynamicSupabaseClient = () => {
  const config = getSupabaseConfig() || DEFAULT_CONFIG;
  
  return createClient<Database>(config.url, config.anonKey, {
    auth: {
      storage: localStorage,
      persistSession: true,
      autoRefreshToken: true,
    }
  });
};

// Create a function to get the current client instance
let clientInstance: ReturnType<typeof createClient<Database>> | null = null;

export const supabase = new Proxy({} as ReturnType<typeof createClient<Database>>, {
  get(target, prop) {
    if (!clientInstance) {
      clientInstance = createDynamicSupabaseClient();
    }
    return clientInstance[prop as keyof typeof clientInstance];
  }
});

// Function to reset the client when configuration changes
export const resetSupabaseClient = () => {
  clientInstance = null;
};