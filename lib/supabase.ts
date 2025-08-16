import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Admin role checking
export async function checkAdminRole(userId: string) {
  const { data, error } = await supabase
    .from('user_roles')
    .select('role')
    .eq('user_id', userId)
    .single()
  
  if (error) return false
  return data?.role === 'admin' || data?.role === 'super_admin'
}

// User management utilities
export async function getUserProfile(userId: string) {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single()
  
  if (error) throw error
  return data
}

export async function updateUserRole(userId: string, role: 'user' | 'admin' | 'super_admin') {
  const { data, error } = await supabase
    .from('user_roles')
    .upsert({ user_id: userId, role })
    .select()
  
  if (error) throw error
  return data
}

export async function getAllUsers() {
  const { data, error } = await supabase
    .from('profiles')
    .select(`
      *,
      user_roles(role)
    `)
    .order('created_at', { ascending: false })
  
  if (error) throw error
  return data
} 