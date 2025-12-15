/**
 * Authorized Admin Emails
 * 
 * This list controls who has access to the admin dashboard.
 * Additional admins can be added via the invitation system,
 * which stores them in Firestore's 'authorized_admins' collection.
 */
export const AUTHORIZED_ADMIN_EMAILS = [
  'finance@readyaimgo.biz',
  'ezra@readyaimgo.biz',
  'femileasing@gmail.com',
  'ezra@readyaimgo.com'
  // Add more authorized emails as needed
  // Note: New admins can also be added via the Team page invitation system
] as const

/**
 * Check if an email is authorized for admin access (client-side, synchronous)
 * For server-side checks that include Firestore, use isAuthorizedAdminAsync from admin-authorization.ts
 */
export function isAuthorizedAdmin(email: string | null | undefined): boolean {
  if (!email) return false
  
  return AUTHORIZED_ADMIN_EMAILS.some(authorizedEmail => 
    email.toLowerCase().includes(authorizedEmail.toLowerCase())
  )
}

