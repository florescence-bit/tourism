# Vercel Deployment Guide - RAH Tourism App

## Problem Solved

**Issue**: Auth page was stuck on "Checking authentication..." loading screen on Vercel while working fine locally.

**Root Cause**: Environment variables (`.env.local`) are local-only and NOT pushed to GitHub. When Vercel deployed the app, Firebase environment variables were missing, so Firebase couldn't initialize, and the auth listener never fired.

**Solution**: Configure environment variables in Vercel dashboard.

---

## Step 1: Get Firebase Configuration

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project: **studio-326645804-84fc1**
3. Click **⚙️ Project Settings** (gear icon, top-left)
4. Scroll down to **Your apps** section
5. Find your **Web app** (labeled as `RAH` or similar)
6. Click the config code icon to reveal the config
7. Copy these values:

```javascript
{
  apiKey: "AIzaSyAGof_AMHpJe3fVv2luF6GZCyaZJQvSPAc",
  authDomain: "studio-326645804-84fc1.firebaseapp.com",
  projectId: "studio-326645804-84fc1",
  storageBucket: "studio-326645804-84fc1.firebasestorage.app",
  messagingSenderId: "61464780322",
  appId: "1:61464780322:web:b76ec35a8ee87784d8b47b"
}
```

---

## Step 2: Configure Variables on Vercel

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Select your project: **tourism** (or **RAH**)
3. Click **Settings** → **Environment Variables**
4. Add these environment variables (all with `NEXT_PUBLIC_` prefix so they're available in the browser):

| Variable Name | Value |
|---|---|
| `NEXT_PUBLIC_FIREBASE_API_KEY` | `AIzaSyAGof_AMHpJe3fVv2luF6GZCyaZJQvSPAc` |
| `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN` | `studio-326645804-84fc1.firebaseapp.com` |
| `NEXT_PUBLIC_FIREBASE_PROJECT_ID` | `studio-326645804-84fc1` |
| `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET` | `studio-326645804-84fc1.firebasestorage.app` |
| `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID` | `61464780322` |
| `NEXT_PUBLIC_FIREBASE_APP_ID` | `1:61464780322:web:b76ec35a8ee87784d8b47b` |

5. Click **Save** for each variable (or add all and save once)

---

## Step 3: Optional - Data.gov.in API Key

If you're using crime data features:

| Variable Name | Value |
|---|---|
| `NEXT_PUBLIC_DATAGOV_KEY` | `579b464db66ec23bdd000001104c0a0e33204fa551bda2d85a2669a1` |
| `NEXT_PUBLIC_DATAGOV_RESOURCE_ID` | `5f177a8b-0fdd-4088-b6e6-a35babdac820` |

---

## Step 4: Redeploy on Vercel

After adding environment variables:

1. Go to **Vercel Dashboard** → Your project
2. Click **Deployments**
3. Click the three dots (**⋯**) on the latest deployment
4. Select **Redeploy**
5. Wait for deployment to complete (usually 1-2 minutes)

**Alternative**: Push a new commit to GitHub, and Vercel will automatically deploy it with the new env vars.

```bash
git add .
git commit -m "chore: Update deployment configuration"
git push
```

---

## Step 5: Verify Deployment

1. Visit your Vercel deployment URL (e.g., `https://tourism-production.vercel.app`)
2. You should see the landing page without loading spinners
3. Click **Sign In** or **Sign Up**
4. Auth page should load immediately (no "Checking authentication..." spinner)
5. Try signing in with email or Google/GitHub

---

## Troubleshooting

### Still Seeing "Checking authentication..." Loading Spinner?

**Possible Causes**:

1. **Environment variables not saved on Vercel**
   - Verify they're in **Settings → Environment Variables**
   - Check that the exact variable names are used (case-sensitive)

2. **Deployment didn't pick up new env vars**
   - Trigger a **Redeploy** instead of relying on auto-deploy
   - Wait 30 seconds after saving env vars before redeploying

3. **Firebase configuration is incorrect**
   - Double-check values from Firebase Console → Project Settings
   - Ensure no extra spaces or typos

4. **Check Vercel Build Logs**
   - Go to **Deployments** → Click on failed deployment
   - Click **Build Logs** to see errors
   - Look for Firebase initialization errors

### Firebase Console Check

Verify your Firebase project is working:

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Project: **studio-326645804-84fc1**
3. Go to **Authentication** → Users
4. Create a test user or try signing in with email
5. Verify in Firebase Console that the user appears

### Enable Google/GitHub OAuth (if using those)

For **Google Sign-In**:
1. Firebase Console → **Authentication** → **Sign-in method** → **Google**
2. Enable it
3. Add your Vercel domain to **Authorized domains**:
   - `tourism.vercel.app` (or your custom domain)

For **GitHub Sign-In**:
1. Firebase Console → **Authentication** → **Sign-in method** → **GitHub**
2. Enable it
3. Create OAuth app on GitHub with your Vercel deployment URL

---

## Local Development

For local development, keep using `.env.local` (already set up):

```bash
# .env.local (local-only, not pushed to GitHub)
NEXT_PUBLIC_FIREBASE_API_KEY=...
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=...
# ... etc
```

Run locally:
```bash
npm run dev
# Opens http://localhost:3000
```

---

## Environment Variables Summary

### Why `NEXT_PUBLIC_` Prefix?

Variables prefixed with `NEXT_PUBLIC_` are **publicly available** in the browser (exposed in the frontend code). This is necessary for Firebase because:

- Firebase SDK needs these values in the browser to communicate with Firebase services
- They are safe to expose because Firebase uses additional security rules in the console
- They are NOT secret keys (Firebase API keys are restricted by domain)

### Why `.env.local` is Not Pushed?

- `.env.local` is in `.gitignore` to prevent secrets from being pushed to public repos
- Each deployment environment (local, Vercel, Heroku, etc.) needs its own env vars
- Vercel has a separate, secure env vars system in the dashboard

---

## Quick Reference - Environment Variables

**All variables must be set on Vercel dashboard** under **Settings → Environment Variables**:

```
NEXT_PUBLIC_FIREBASE_API_KEY
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN
NEXT_PUBLIC_FIREBASE_PROJECT_ID
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID
NEXT_PUBLIC_FIREBASE_APP_ID
NEXT_PUBLIC_DATAGOV_KEY (optional)
NEXT_PUBLIC_DATAGOV_RESOURCE_ID (optional)
```

**All of these are publicly visible** - they're configuration, not secrets. Firebase security is enforced through:
- Firebase Authentication rules
- Firestore Security Rules
- API key domain restrictions in Firebase Console

---

## Code Changes Made

### 1. `.env.example` - New Template File
Created to document required environment variables. This is pushed to GitHub so developers know what to configure.

### 2. `src/lib/firebaseClient.ts` - Enhanced Error Handling
- Added `isFirebaseConfigValid()` function to check if config is complete
- Updated `initFirebase()` to return boolean (true if successful, false if config invalid)
- Updated `onAuthChange()` to handle Firebase not being initialized by immediately calling callback with `null`
- If Firebase config is missing, app assumes user is not authenticated instead of loading forever

### 3. `src/app/(app)/layout.tsx` - Added Timeout Safety
- Added 5-second timeout on auth check
- If Firebase doesn't respond in 5 seconds, assume user is not authenticated
- This prevents the loading spinner from hanging forever

**Result**: Even if Firebase env vars are missing, the app will:
- Show the auth page immediately (after 5 seconds timeout)
- Allow users to see the interface
- Show helpful console messages indicating Firebase is not configured
- Console shows: `"[Firebase] Configuration incomplete - missing required environment variables"`

---

## Related Documentation

- **Authentication Flow**: See `AUTHENTICATION_FLOW.md`
- **Code Refactoring Summary**: See `CODE_REFACTORING_SUMMARY.md`
- **Final Status**: See `FINAL_STATUS.md`
- **Auth Redirect Fix**: See `AUTH_REDIRECT_FIX.md`

---

## Contact / Support

For Firebase issues:
- Firebase Console: https://console.firebase.google.com/
- Firebase Documentation: https://firebase.google.com/docs

For Vercel deployment issues:
- Vercel Dashboard: https://vercel.com/dashboard
- Vercel Docs: https://vercel.com/docs
