import { adminFirestore } from "@/lib/firebase-admin";
import { AUTHORIZED_ADMIN_EMAILS } from "@/lib/admin-authorized-emails";

/**
 * Check if an email is authorized for admin access (server-side)
 * Checks both static list and Firestore authorized_admins collection
 */
export async function isAuthorizedAdminAsync(email: string | null | undefined): Promise<boolean> {
  if (!email) return false;
  
  const emailLower = email.toLowerCase();
  
  // Check static list first (fast)
  const inStaticList = AUTHORIZED_ADMIN_EMAILS.some(authorizedEmail => 
    emailLower.includes(authorizedEmail.toLowerCase())
  );
  
  if (inStaticList) return true;
  
  // Check Firestore for dynamically added admins
  if (!adminFirestore) {
    // If Firestore not initialized, fall back to static list only
    return false;
  }
  
  try {
    const adminsSnapshot = await adminFirestore
      .collection('authorized_admins')
      .where('email', '==', emailLower)
      .where('status', '==', 'active')
      .limit(1)
      .get();
    
    return !adminsSnapshot.empty;
  } catch (error) {
    console.error('Error checking Firestore authorization:', error);
    // Fall back to static list only on error
    return false;
  }
}

/**
 * Client-side check (synchronous, checks static list only)
 */
export function isAuthorizedAdmin(email: string | null | undefined): boolean {
  if (!email) return false;
  
  return AUTHORIZED_ADMIN_EMAILS.some(authorizedEmail => 
    email.toLowerCase().includes(authorizedEmail.toLowerCase())
  );
}

