# Firebase Authentication Setup Guide

This document explains how to set up Firebase Authentication for the ReadyAimGo platform.

## 🎯 Overview

The application now uses **Firebase Authentication** with Google OAuth for secure user and admin access. This replaces the placeholder authentication system.

### Features
- ✅ Google OAuth sign-in for all users (`/login`)
- ✅ Google OAuth sign-in for admin users (`/admin/login`)
- ✅ Email-based authorization (only whitelisted emails can access admin)
- ✅ Automatic session management
- ✅ Secure logout functionality
- ✅ Protected routes with `AuthGuard` component

---

## 🚀 Quick Start for Femi-Drive

Since you're using **one Firebase project for all ReadyAimGo clients**, here's what you need to do:

### ✅ What's Already Done
- Google sign-in is implemented on `/login` page
- Firebase configuration is set up in `lib/firebase.ts`
- Authentication hook (`useAuth`) is ready to use

### 🔧 What You Need to Do in Firebase Console

1. **Verify Google Authentication is Enabled**
   - Go to Firebase Console → Authentication → Sign-in method
   - Ensure Google provider is enabled (it likely already is for other ReadyAimGo clients)

2. **Add Your Domain to Authorized Domains** (if deploying)
   - Go to Authentication → Settings → Authorized domains
   - Add your femi-drive production domain (e.g., `femi-drive.readyaimgo.com`)
   - `localhost` should already be there for development

3. **Get/Copy Firebase Config** (if not already in `.env.local`)
   - Go to Project Settings → Your apps
   - Copy the Firebase config values
   - Add them to `.env.local` (see "Get Your Firebase Configuration" section below)

4. **Test the Login Flow**
   - Start your dev server: `npm run dev`
   - Navigate to `http://localhost:3000/login`
   - Click "Sign in with Google"
   - You should be redirected to `/dashboard` after successful authentication

### 📝 Environment Variables Needed

Make sure your `.env.local` file has these variables (using your shared Firebase project config):

```bash
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key_here
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789012
NEXT_PUBLIC_FIREBASE_APP_ID=1:123456789012:web:abcdef123456
```

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

### Step 1: Use Your Existing Firebase Project

Since you're using **one Firebase project for all ReadyAimGo clients** (including femi-drive), you should:

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your existing ReadyAimGo project (or create a new one if needed)
3. **Important**: This project will be shared across all ReadyAimGo client applications

### Step 2: Enable Google Authentication

1. In your Firebase project, go to **Authentication** → **Sign-in method**
2. If Google is not already enabled:
   - Click **"Add new provider"** (or click on Google if it's listed)
   - Select **"Google"**
   - Toggle the "Enable" switch to ON
   - Set your project support email (e.g., `finance@readyaimgo.biz`)
   - Click **"Save"**
3. If Google is already enabled (for other ReadyAimGo clients), you're all set!

### Step 3: Configure OAuth Consent Screen (if needed)

If this is a new Google OAuth setup:

1. You may need to configure the OAuth consent screen in [Google Cloud Console](https://console.cloud.google.com/)
2. Go to **APIs & Services** → **OAuth consent screen**
3. Configure the app name, support email, and authorized domains
4. Add your production domain(s) to authorized domains

### Step 4: Add Authorized Domains

1. In Firebase Console, go to **Authentication** → **Settings** → **Authorized domains**
2. Ensure these domains are added:
   - `localhost` (for development - usually added by default)
   - Your production domain(s) (e.g., `femi-drive.readyaimgo.com` or `your-domain.com`)
3. Click "Add domain" for any missing domains
4. **Note**: Since you're using one project for all clients, you may already have domains configured

---

## 🔑 Get Your Firebase Configuration

### Step 1: Get Client Config

1. In Firebase Console, go to **Project Settings** (gear icon)
2. Scroll down to "Your apps"
3. **If you already have a web app registered** (for other ReadyAimGo clients):
   - Click on the existing web app
   - Copy the `firebaseConfig` object values
4. **If you need to register a new web app**:
   - Click the **`</>`** (Web) icon to register a web app
   - Register the app name: "Femi Drive" (or "ReadyAimGo - Femi Drive")
   - Copy the `firebaseConfig` object values
5. **Note**: You can use the same Firebase config for all ReadyAimGo client apps, or register separate apps for better analytics tracking

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

### Step 2: Test Regular User Login

1. Go to `http://localhost:3000/login`
2. Click "Sign in with Google"
3. Complete the OAuth flow
4. You should be redirected to `/dashboard` after successful authentication
5. Any Google account can sign in (no email restrictions for regular users)

### Step 3: Test Admin Login

1. Go to `http://localhost:3000/admin/login`
2. Click "Sign in with Google"
3. Complete the OAuth flow
4. If your email is authorized, you'll be redirected to `/admin/dashboard`
5. If your email is not authorized, you'll see an error message

### Step 4: Test Logout

1. Click the "Logout" button (if available in the dashboard)
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
- `app/login/page.tsx` - Implemented Firebase Auth for regular users
- `app/admin/login/page.tsx` - Implemented Firebase Auth for admin users
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
