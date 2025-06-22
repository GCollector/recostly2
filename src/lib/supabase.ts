import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export type Database = {
  public: {
    Tables: {
      profile: {
        Row: {
          id: string
          email: string
          name: string
          tier: 'basic' | 'premium'
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
          tier?: 'basic' | 'premium'
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
          tier?: 'basic' | 'premium'
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