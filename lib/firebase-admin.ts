import admin from 'firebase-admin';
import { readFileSync } from 'fs';
import { join } from 'path';

let isInitialized = false;

// Initialize Firebase Admin (only if not already initialized)
if (!admin.apps.length) {
  // Try to load from service account JSON file first (alternative method)
  const serviceAccountPath = process.env.FIREBASE_ADMIN_SERVICE_ACCOUNT_PATH;
  let serviceAccount: any = null;
  
  if (serviceAccountPath) {
    try {
      const fullPath = join(process.cwd(), serviceAccountPath);
      const serviceAccountFile = readFileSync(fullPath, 'utf8');
      serviceAccount = JSON.parse(serviceAccountFile);
      console.log('📁 Loaded Firebase Admin credentials from service account file');
    } catch (error: any) {
      console.warn('⚠️  Could not load service account file:', error.message);
    }
  }

  // Check if all required environment variables are present
  const projectId = serviceAccount?.project_id || process.env.FIREBASE_ADMIN_PROJECT_ID;
  const privateKey = serviceAccount?.private_key || process.env.FIREBASE_ADMIN_PRIVATE_KEY;
  const clientEmail = serviceAccount?.client_email || process.env.FIREBASE_ADMIN_CLIENT_EMAIL;

  // Debug logging (only in development)
  if (process.env.NODE_ENV === 'development') {
    console.log('🔍 Firebase Admin Init Check:');
    console.log('  - Project ID:', projectId ? `${projectId.substring(0, 10)}...` : 'MISSING');
    console.log('  - Client Email:', clientEmail ? `${clientEmail.substring(0, 20)}...` : 'MISSING');
    console.log('  - Private Key:', privateKey ? `${privateKey.length} chars, starts with: ${privateKey.substring(0, 30)}...` : 'MISSING');
  }

  if (projectId && privateKey && clientEmail) {
    try {
      // Handle private key formatting - it might come with escaped newlines or actual newlines
      let formattedPrivateKey = privateKey;
      
      // If it contains \n as literal characters, replace them with actual newlines
      if (formattedPrivateKey.includes('\\n')) {
        formattedPrivateKey = formattedPrivateKey.replace(/\\n/g, '\n');
      }
      
      // Ensure the private key starts and ends correctly
      if (!formattedPrivateKey.includes('BEGIN PRIVATE KEY')) {
        console.error('⚠️  Private key format issue: Missing BEGIN PRIVATE KEY marker');
      }

      // Use service account object if available, otherwise use individual fields
      if (serviceAccount) {
        admin.initializeApp({
          credential: admin.credential.cert(serviceAccount),
        });
      } else {
        admin.initializeApp({
          credential: admin.credential.cert({
            projectId,
            privateKey: formattedPrivateKey,
            clientEmail,
          }),
        });
      }
      isInitialized = true;
      console.log('✅ Firebase Admin initialized successfully');
    } catch (error: any) {
      console.error('❌ Firebase Admin initialization error:', error.message);
      console.error('Error details:', error);
      
      // More specific error messages
      if (error.message.includes('private_key')) {
        console.error('💡 Private key issue detected. Check:');
        console.error('   1. Is FIREBASE_ADMIN_PRIVATE_KEY set in .env.local?');
        console.error('   2. Is it wrapped in quotes? (e.g., FIREBASE_ADMIN_PRIVATE_KEY="-----BEGIN...")');
        console.error('   3. Are newlines escaped as \\n?');
        console.error('   4. Did you restart the dev server after adding the variable?');
      }
    }
  } else {
    console.warn('⚠️  Firebase Admin not initialized: Missing required environment variables');
    if (!projectId) console.warn('   ❌ FIREBASE_ADMIN_PROJECT_ID is missing');
    if (!privateKey) console.warn('   ❌ FIREBASE_ADMIN_PRIVATE_KEY is missing');
    if (!clientEmail) console.warn('   ❌ FIREBASE_ADMIN_CLIENT_EMAIL is missing');
    console.warn('💡 Make sure these are in .env.local and restart your dev server');
  }
} else {
  isInitialized = true;
}

// Only export admin services if initialization succeeded
export const adminAuth = isInitialized && admin.apps.length > 0 ? admin.auth() : null;
export const adminFirestore = isInitialized && admin.apps.length > 0 ? admin.firestore() : null;
export default admin;
