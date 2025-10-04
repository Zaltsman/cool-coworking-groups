import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// TypeScript type for our coworking group
export type CoworkingGroup = {
  id: string
  group_name: string
  location: string
  city: string | null
  country: string | null
  description: string
  website_url: string | null
  logo_url: string | null
  tags: string[] | null
  group_status: 'open' | 'full' | 'seeking_lead'
  added_by: string
  is_approved: boolean
  is_posthog_added: boolean
  created_at: string
  approved_at: string | null
  approved_by: string | null
  latitude: number | null
  longitude: number | null
}