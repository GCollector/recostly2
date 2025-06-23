import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

// Check if we have real Supabase credentials
const hasValidCredentials = () => {
  return supabaseUrl && 
         supabaseAnonKey && 
         supabaseUrl.includes('supabase.co') && 
         supabaseAnonKey.length > 50 && // Real Supabase keys are much longer
         !supabaseUrl.includes('placeholder')
}

// Provide fallback values for development/demo purposes
const defaultUrl = 'https://placeholder.supabase.co'
const defaultKey = 'placeholder-key'

if (!hasValidCredentials()) {
  console.warn('Supabase environment variables not properly configured. Some features may be limited.')
}

// Create Supabase client with optimized configuration for better reliability and network handling
export const supabase = createClient(
  supabaseUrl || defaultUrl, 
  supabaseAnonKey || defaultKey, 
  {
    auth: {
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: true,
      flowType: 'pkce'
    },
    global: {
      headers: {
        'X-Client-Info': 'canadian-mortgage-calculator'
      }
    },
    db: {
      schema: 'public'
    },
    // Optimized settings for better network handling
    realtime: {
      params: {
        eventsPerSecond: 10
      }
    }
  }
)

// Export the configuration check
export const isSupabaseConfigured = hasValidCredentials

export type Database = {
  public: {
    Tables: {
      profile: {
        Row: {
          id: string
          email: string
          name: string
          tier: 'free' | 'basic' | 'premium'
          stripe_customer_id: string | null
          stripe_subscription_id: string | null
          subscription_status: string | null
          marketing_image: string | null
          marketing_copy: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          name: string
          tier?: 'free' | 'basic' | 'premium'
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          subscription_status?: string | null
          marketing_image?: string | null
          marketing_copy?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          name?: string
          tier?: 'free' | 'basic' | 'premium'
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          subscription_status?: string | null
          marketing_image?: string | null
          marketing_copy?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      mortgage_calculation: {
        Row: {
          id: string
          user_id: string | null
          home_price: number
          down_payment: number
          interest_rate: number
          amortization_years: number
          payment_frequency: 'monthly' | 'bi-weekly'
          province: 'ontario' | 'bc'
          city: 'toronto' | 'vancouver'
          is_first_time_buyer: boolean
          monthly_payment: number
          total_interest: number
          notes: Record<string, string>
          comments: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id?: string | null
          home_price: number
          down_payment: number
          interest_rate: number
          amortization_years: number
          payment_frequency: 'monthly' | 'bi-weekly'
          province: 'ontario' | 'bc'
          city: 'toronto' | 'vancouver'
          is_first_time_buyer?: boolean
          monthly_payment: number
          total_interest: number
          notes?: Record<string, string>
          comments?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string | null
          home_price?: number
          down_payment?: number
          interest_rate?: number
          amortization_years?: number
          payment_frequency?: 'monthly' | 'bi-weekly'
          province?: 'ontario' | 'bc'
          city?: 'toronto' | 'vancouver'
          is_first_time_buyer?: boolean
          monthly_payment?: number
          total_interest?: number
          notes?: Record<string, string>
          comments?: string | null
          created_at?: string
          updated_at?: string
        }
      }
    }
  }
}