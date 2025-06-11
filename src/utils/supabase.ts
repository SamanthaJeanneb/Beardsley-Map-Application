import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Check if environment variables are properly configured
const isValidUrl = (url: string) => {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
};

const isConfigured = supabaseUrl && 
                    supabaseAnonKey && 
                    supabaseUrl !== 'your_supabase_url_here' && 
                    supabaseAnonKey !== 'your_supabase_anon_key_here' &&
                    isValidUrl(supabaseUrl);

let supabase: any;

if (!isConfigured) {
  console.warn('Supabase is not configured. Please set up your Supabase credentials.');
  
  // Create a mock client that throws helpful errors
  const mockClient = {
    from: () => ({
      select: () => Promise.reject(new Error('Supabase not configured. Please connect to Supabase first.')),
      insert: () => Promise.reject(new Error('Supabase not configured. Please connect to Supabase first.')),
      update: () => Promise.reject(new Error('Supabase not configured. Please connect to Supabase first.')),
      delete: () => Promise.reject(new Error('Supabase not configured. Please connect to Supabase first.')),
      upsert: () => Promise.reject(new Error('Supabase not configured. Please connect to Supabase first.'))
    }),
    auth: {
      signUp: () => Promise.reject(new Error('Supabase not configured. Please connect to Supabase first.')),
      signIn: () => Promise.reject(new Error('Supabase not configured. Please connect to Supabase first.')),
      signOut: () => Promise.reject(new Error('Supabase not configured. Please connect to Supabase first.')),
      getUser: () => Promise.reject(new Error('Supabase not configured. Please connect to Supabase first.')),
      onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } })
    },
    storage: {
      from: () => ({
        upload: () => Promise.reject(new Error('Supabase not configured. Please connect to Supabase first.')),
        download: () => Promise.reject(new Error('Supabase not configured. Please connect to Supabase first.')),
        remove: () => Promise.reject(new Error('Supabase not configured. Please connect to Supabase first.'))
      })
    }
  };
  
  supabase = mockClient;
} else {
  supabase = createClient(supabaseUrl, supabaseAnonKey);
}

export { supabase };

export type Database = {
  public: {
    Tables: {
      projects: {
        Row: {
          id: string;
          title: string;
          address: string;
          city: string;
          latitude: number;
          longitude: number;
          market_sector: string;
          description: string;
          image_urls: string[];
          client: string;
          project_manager: string;
          status: string;
          compensation: number;
          year: number;
          featured: boolean;
          recent: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          title: string;
          address?: string;
          city: string;
          latitude: number;
          longitude: number;
          market_sector?: string;
          description: string;
          image_urls?: string[];
          client: string;
          project_manager?: string;
          status?: string;
          compensation?: number;
          year?: number;
          featured?: boolean;
          recent?: boolean;
        };
        Update: {
          id?: string;
          title?: string;
          address?: string;
          city?: string;
          latitude?: number;
          longitude?: number;
          market_sector?: string;
          description?: string;
          image_urls?: string[];
          client?: string;
          project_manager?: string;
          status?: string;
          compensation?: number;
          year?: number;
          featured?: boolean;
          recent?: boolean;
        };
      };
    };
  };
};