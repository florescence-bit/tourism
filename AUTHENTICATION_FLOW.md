/**
 * @file AUTHENTICATION_FLOW.md
 * @description Complete authentication flow documentation for Bharat Shuraksha app.
 * 
 * This document explains how the app authentication works and how users must
 * sign in or sign up before accessing protected routes.
 */

# Authentication Flow Documentation

## Overview

The Bharat Shuraksha app uses a **required authentication flow** where users must explicitly sign in or sign up before accessing any protected app routes (dashboard, check-in, etc).

**Key principle:** No automatic anonymous sign-in. All access requires user action.

---

## Architecture

### User Flow

1. **User visits home page (`/`):**
   - Public page (no auth required)
   - Shows marketing content and features
   - If unauthenticated: Shows "Sign In / Up" and "Get Started" buttons
   - If authenticated: Shows "Dashboard" and "Go to Dashboard" buttons

2. **User clicks "Sign In / Up" or "Get Started":**
   - Redirected to `/auth` page
   - Auth page is publicly accessible but requires user action

3. **User creates account or signs in:**
   - Email/password sign-up or sign-in
   - OAuth provider sign-in (Google, GitHub)
   - Verification email sent on sign-up (non-blocking)
   - On success: redirected to `/dashboard`

4. **User accesses protected routes:**
   - Any route under `/(app)/*` (e.g., `/dashboard`, `/check-in`, `/analytics`)
   - App layout checks authentication status
   - If user is authenticated: shows layout with sidebar, header, and page content
   - If user is not authenticated: shows loading state, then redirects to `/auth`

5. **User signs out:**
   - Calls `signOut()` function
   - Auth state listener triggers
   - App layout detects no user and redirects to `/auth`

---

## Key Components

### 1. Firebase Authentication (`src/lib/firebaseClient.ts`)

**Functions:**
- `initFirebase()` - Initializes Firebase app (safe to call multiple times)
- `ensureAnonAuth()` - **NO LONGER USED** - Used to create anonymous sessions
- `signUpWithEmail(email, password)` - Creates new account
- `signInWithEmail(email, password)` - Signs in with email/password
- `signInWithGoogle()` - OAuth sign-in with Google
- `signInWithGithub()` - OAuth sign-in with GitHub
- `signOut()` - Signs out current user
- `onAuthChange(callback)` - Subscribes to auth state changes

**Error Handling:**
- All functions throw Firebase auth errors
- Errors are caught in UI components and mapped to friendly messages
- Use `extractFirebaseErrorCode()` and `formatErrorForDisplay()` from `errorMap.ts`

### 2. Auth Page (`src/app/(app)/auth/page.tsx`)

**Features:**
- Sign In / Sign Up mode toggle
- Email/password form with validation
- OAuth provider buttons (Google, GitHub)
- Friendly error messages based on Firebase error codes
- Sends verification email after successful sign-up
- Shows signed-in card when user is authenticated
- Hides form and toggles when user is signed in

**Key Changes (Why No Auto-Signin):**
- ❌ REMOVED: `ensureAnonAuth()` call on mount
- ✅ ADDED: Only subscribe to auth state changes
- ✅ RESULT: User must explicitly sign in or sign up

### 3. App Layout Guard (`src/app/(app)/layout.tsx`)

**Purpose:** Protect all app routes by checking authentication status

**Behavior:**
- On mount: Subscribe to auth state changes
- While loading: Show loading spinner with message "Checking authentication..."
- If user is authenticated: Render sidebar + header + page content
- If user is NOT authenticated: Redirect to `/auth` page
- Prevents unauthenticated access to protected routes

**Code:**
```tsx
useEffect(() => {
  const unsubscribe = onAuthChange((currentUser) => {
    setUser(currentUser);
    setAuthLoading(false);

    // If user signed out, redirect to /auth
    if (!currentUser) {
      router.push('/auth');
    }
  });

  return () => unsubscribe?.();
}, [router]);
```

### 4. Home Page (`src/app/page.tsx`)

**Features:**
- Shows different CTAs based on auth state
- If authenticated: "Dashboard" and "Go to Dashboard" buttons
- If unauthenticated: "Sign In / Up" and "Get Started" buttons
- Checks auth state on mount and updates UI accordingly

---

## Error Handling & User Messaging

### Firebase Error Mapping

Errors from Firebase are mapped to user-friendly messages in `src/lib/errorMap.ts`:

**Examples:**

| Firebase Error Code | User Message | Action Hint |
|---|---|---|
| `auth/operation-not-allowed` | "This sign-in method is not enabled for this project." | "Contact admin or enable the provider in Firebase Console" |
| `auth/user-not-found` | "No account found with this email." | "Please check your email or create a new account" |
| `auth/wrong-password` | "Invalid password." | "Please try again" |
| `auth/email-already-in-use` | "This email is already registered." | "Try signing in instead, or use a different email" |
| `auth/weak-password` | "Password is too weak." | "Use at least 6 characters" |
| `auth/too-many-requests` | "Too many failed attempts. Please try again later." | "Wait a few minutes before trying again" |

**Usage in Components:**

```tsx
import { formatErrorForDisplay, extractFirebaseErrorCode } from '@/lib/errorMap';

try {
  await signInWithEmail(email, password);
} catch (error: any) {
  const userMessage = formatErrorForDisplay(error, 'firebase-auth');
  setMessage(userMessage);
}
```

---

## Firebase Console Configuration

### Required Steps

1. **Enable Email/Password Provider:**
   - Firebase Console → Authentication → Sign-in method
   - Enable "Email/Password"

2. **Enable Google OAuth:**
   - Firebase Console → Authentication → Sign-in method
   - Enable "Google"
   - (Google automatically configured for localhost)

3. **Enable GitHub OAuth:**
   - Firebase Console → Authentication → Sign-in method
   - Enable "GitHub"
   - Create GitHub OAuth App: https://github.com/settings/developers
   - Paste Client ID and Secret into Firebase

4. **Add Authorized Domains:**
   - Firebase Console → Authentication → Settings
   - Add `localhost`
   - Add any other dev/prod domains used

---

## Testing the Auth Flow

### Test Scenario 1: New User Sign-Up

1. Open http://localhost:3001
2. Click "Get Started" or "Sign In / Up"
3. Should redirect to `/auth`
4. Click "Sign Up" tab
5. Enter email and password (min 6 chars)
6. Confirm password
7. Click "Create Account"
8. Should see success message
9. Should be redirected to `/dashboard`
10. Should see sidebar and header (proof of authentication)

### Test Scenario 2: User Sign-In

1. Open http://localhost:3001
2. Click "Sign In / Up"
3. Click "Sign In" tab (default)
4. Enter registered email and password
5. Click "Sign In"
6. Should see success message
7. Should be redirected to `/dashboard`

### Test Scenario 3: Unauthenticated Access to Protected Route

1. Open browser DevTools console
2. In new tab, go directly to http://localhost:3001/dashboard
3. Should show "Checking authentication..." spinner
4. After ~1 second, should redirect to `/auth`
5. Proof: Cannot directly access dashboard without signing in

### Test Scenario 4: Sign Out

1. While on `/dashboard` or any protected route
2. Click header "Sign out" button
3. Should see "Signed out successfully" message
4. Should be redirected to `/`
5. If you then try to access `/dashboard`, should redirect to `/auth`

### Test Scenario 5: OAuth Sign-In (Google)

1. On `/auth` page
2. Click "Continue with Google"
3. Google popup should open
4. Complete Google sign-in
5. Popup should close
6. Should be redirected to `/dashboard`
7. Should see "Signed in with google as [email]"

---

## Important Notes

### Removed Anonymous Auth

❌ **NO LONGER:** App auto-signs users in anonymously on load

**Why?**
- Users should explicitly sign in or sign up
- Each user needs their own identity for:
  - Storing check-in history
  - Saving preferences
  - Receiving personalized alerts
  - Compliance with data privacy

**What Changed:**
- Removed `ensureAnonAuth()` call from auth page
- Removed `ensureAnonAuth()` from useLiveLocation
- App now requires explicit authentication for all protected routes

### Client-Side Only Authentication

⚠️ **Current Limitation:**
- Auth tokens are stored in Firebase client SDK (in-memory + localStorage)
- Not stored in secure HTTP-only cookies
- App layout checks Firebase client SDK auth state, not server-side validation

**For Production Deployment:**
- Implement server-side auth token validation
- Store tokens in secure HTTP-only cookies
- Use Next.js API routes to verify tokens
- Add rate limiting and security headers

---

## File Structure

```
src/
├── app/
│   ├── page.tsx                    // Home (public, auth-aware)
│   ├── layout.tsx                  // Root layout
│   └── (app)/
│       ├── layout.tsx              // App layout (auth guard)
│       ├── auth/
│       │   └── page.tsx            // Auth page (public)
│       ├── dashboard/
│       │   └── page.tsx            // Dashboard (protected)
│       └── ...other routes...      // All protected
├── lib/
│   ├── firebaseClient.ts           // Firebase auth functions
│   ├── errorMap.ts                 // Error code → user message mapping
│   ├── types.ts                    // TypeScript types (AuthState, User, etc)
│   ├── constants.ts                // App constants
│   └── useLiveLocation.tsx         // Geolocation hook (client-only)
├── components/
│   ├── layout/
│   │   ├── header.tsx              // Header with sign-out
│   │   └── sidebar.tsx             // Navigation sidebar
│   └── map/
│       └── SimpleMap.tsx           // Map component
└── middleware.ts                   // Next.js middleware (placeholder)
```

---

## Environment Variables

**Required in `.env.local`:**

```env
# Firebase Web App Config
NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
NEXT_PUBLIC_FIREBASE_PROJECT_ID=
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
NEXT_PUBLIC_FIREBASE_APP_ID=

# Geoapify (Maps & Reverse Geocoding)
NEXT_PUBLIC_GEOAPIFY_KEY=

# data.gov.in (Analytics)
NEXT_PUBLIC_DATAGOV_KEY=
NEXT_PUBLIC_DATAGOV_RESOURCE_ID=
```

---

## Next Steps & Future Improvements

- [ ] Implement server-side auth token validation with Next.js API routes
- [ ] Store auth tokens in secure HTTP-only cookies
- [ ] Add refresh token rotation
- [ ] Implement password reset flow
- [ ] Add email verification enforcement (prevent unverified users from using app features)
- [ ] Add user profile page with settings
- [ ] Add "Remember me" functionality (30-day persistent login)
- [ ] Implement 2FA (Two-Factor Authentication)
- [ ] Add session timeout after inactivity (15+ minutes)
- [ ] Implement audit logging for auth events (sign-in, sign-out, failed attempts)

---

## Support & Troubleshooting

**Issue: User is auto-signed in as anonymous user**
- Solution: Clear browser localStorage and reload
- This should not happen with current code (anonymous auth removed)

**Issue: "Firebase: Error (auth/operation-not-allowed)"**
- Solution: Enable sign-in method in Firebase Console → Authentication → Sign-in method
- Choose the method (Email/Password, Google, GitHub) and enable it

**Issue: Google/GitHub sign-in redirects are blocked**
- Solution: Add `localhost` and `localhost:3001` to Firebase → Authentication → Settings → Authorized domains

**Issue: Can't sign up with email/password but can with Google**
- Solution: Email/Password provider not enabled in Firebase Console

**Issue: Users always redirected to /auth even when signed in**
- Solution: Check browser localStorage; Firebase auth state might not be persisting
- Clear cache and reload
- Check `.env.local` for correct Firebase config

---

## References

- [Firebase Authentication Documentation](https://firebase.google.com/docs/auth)
- [Firebase Error Codes](https://firebase.google.com/docs/auth/admin/errors)
- [Next.js Authentication Best Practices](https://nextjs.org/docs/authentication)
- [OAuth 2.0 Flow](https://tools.ietf.org/html/rfc6749)
