# Firebase Authentication Setup Guide

This document explains how to set up Firebase Authentication for the ReadyAimGo platform.

## 🎯 Overview

The application now uses **Firebase Authentication** with Google OAuth for secure admin access. This replaces the placeholder authentication system.

### Features
- ✅ Google OAuth sign-in
- ✅ Email-based authorization (only whitelisted emails can access admin)
- ✅ Automatic session management
- ✅ Secure logout functionality
- ✅ Protected routes with `AuthGuard` component

---

## 📦 Installation

### Step 1: Install Firebase Packages

Run this command to install the required Firebase packages:

```bash
npm install firebase firebase-admin
```

Or if using pnpm:

```bash
pnpm install firebase firebase-admin
```

---

## 🔧 Firebase Console Setup

### Step 1: Create a Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Add project" or select an existing project
3. Follow the setup wizard to create your project

### Step 2: Enable Authentication

1. In your Firebase project, go to **Authentication** → **Sign-in method**
2. Click **"Add new provider"**
3. Select **"Google"**
4. Toggle the "Enable" switch
5. Set your project support email (e.g., `finance@readyaimgo.biz`)
6. Click **"Save"**

### Step 3: Add Authorized Domains

1. In **Authentication** → **Settings** → **Authorized domains**
2. Add these domains:
   - `localhost` (for development)
   - `your-domain.com` (for production)
   - `your-domain.com` (for production)
3. Click "Add domain"

---

## 🔑 Get Your Firebase Configuration

### Step 1: Get Client Config

1. In Firebase Console, go to **Project Settings** (gear icon)
2. Scroll down to "Your apps"
3. Click the **`</>`** (Web) icon to register a web app
4. Register the app name: "ReadyAimGo Client"
5. Copy the `firebaseConfig` object values

### Step 2: Add to `.env.local`

Create or update your `.env.local` file:

```bash
# Firebase Client Configuration
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key_here
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789012
NEXT_PUBLIC_FIREBASE_APP_ID=1:123456789012:web:abcdef123456

# Firebase Admin Configuration (for server-side operations)
FIREBASE_ADMIN_PROJECT_ID=your-project-id
FIREBASE_ADMIN_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYour private key here\n-----END PRIVATE KEY-----\n"
FIREBASE_ADMIN_CLIENT_EMAIL=firebase-adminsdk-xxxxx@your-project.iam.gserviceaccount.com
```

---

## 🔐 Get Firebase Admin Credentials

### Step 1: Generate Service Account Key

1. In Firebase Console, go to **Project Settings** → **Service accounts**
2. Click **"Generate new private key"**
3. A JSON file will download
4. Open the JSON file and extract these values:
   - `project_id` → `FIREBASE_ADMIN_PROJECT_ID`
   - `private_key` → `FIREBASE_ADMIN_PRIVATE_KEY` (keep the `\n` characters)
   - `client_email` → `FIREBASE_ADMIN_CLIENT_EMAIL`

### Step 2: Format the Private Key

The private key needs to be on a single line with `\n` characters:

```bash
FIREBASE_ADMIN_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQC...\n-----END PRIVATE KEY-----\n"
```

---

## 👥 Configure Authorized Users

### Step 1: Update Authorized Emails

The authorized email list is defined in multiple files. Update these files with your authorized admin emails:

**File: `app/admin/login/page.tsx`**
```typescript
const authorizedEmails = [
  'finance@readyaimgo.biz',
  'ezra@readyaimgo.biz',
  'femileasing@gmail.com',
  // Add more authorized emails here
]
```

**File: `app/admin/dashboard/page.tsx`**
```typescript
<AuthGuard allowedEmails={['finance@readyaimgo.biz', 'ezra@readyaimgo.biz', 'femileasing@gmail.com']}>
```

---

## 🚀 Testing

### Step 1: Start Development Server

```bash
npm run dev
```

### Step 2: Navigate to Admin Login

1. Go to `http://localhost:3000/admin/login`
2. Click "Sign in with Google"
3. Complete the OAuth flow
4. If your email is authorized, you'll be redirected to the dashboard
5. If your email is not authorized, you'll see an error message

### Step 3: Test Logout

1. Click the "Logout" button in the top right
2. You should be redirected back to the login page

---

## 📁 Files Created/Modified

### New Files Created:
- `lib/firebase.ts` - Firebase client configuration
- `lib/firebase-admin.ts` - Firebase Admin SDK configuration
- `hooks/useAuth.ts` - Custom React hook for authentication state
- `lib/auth-guard.tsx` - Protected route wrapper component
- `FIREBASE_SETUP.md` - This setup guide

### Files Modified:
- `package.json` - Added `firebase` and `firebase-admin` dependencies
- `app/admin/login/page.tsx` - Implemented Firebase Auth
- `app/admin/dashboard/page.tsx` - Added AuthGuard and logout
- `env.template` - Added Firebase configuration placeholders

---

## 🔒 Security Notes

1. **Never commit `.env.local`** - This file contains sensitive credentials
2. **Use different projects for dev/staging/prod** - Create separate Firebase projects
3. **Regularly rotate service account keys** - Generate new keys periodically
4. **Monitor auth logs** - Check Firebase Console for suspicious activity
5. **Keep authorized emails list minimal** - Only add trusted admin emails

---

## 🎯 Next Steps

1. ✅ Set up Firebase project
2. ✅ Add environment variables
3. ✅ Test authentication locally
4. ⏳ Deploy to staging environment
5. ⏳ Configure production Firebase project
6. ⏳ Add more authorized users as needed

---

## 🆘 Troubleshooting

### "Firebase: Error (auth/configuration-not-found)"
- **Solution**: Check that all `NEXT_PUBLIC_FIREBASE_*` environment variables are set in `.env.local`

### "Firebase: Error (auth/popup-closed-by-user)"
- **Solution**: This is expected if user closes the OAuth popup. Just retry.

### "Access denied" after successful OAuth
- **Solution**: Add your email to the `authorizedEmails` array in the login page

### "Cannot read properties of undefined"
- **Solution**: Restart your dev server after adding Firebase environment variables

---

## 📚 Additional Resources

- [Firebase Auth Docs](https://firebase.google.com/docs/auth)
- [Firebase Admin SDK](https://firebase.google.com/docs/admin/setup)
- [Next.js Environment Variables](https://nextjs.org/docs/basic-features/environment-variables)
