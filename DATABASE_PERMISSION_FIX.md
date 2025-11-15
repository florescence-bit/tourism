# 🔧 Why Profile Save Is Failing - And How to Fix It

## The Problem

When you try to save profile data, you get this error:

```
Failed to save profile. Check console for details.

[Firebase] saveProfile error: Missing or insufficient permissions. 
permission-denied
```

## Root Cause

Your **Firestore Security Rules are blocking write access** to the database.

The code is correct - the database structure is correct - but the Firebase configuration doesn't allow authenticated users to write data.

### What's Happening:

1. ✅ You fill the profile form
2. ✅ You click "Save Profile"
3. ✅ The code calls `saveProfile(uid, profileData)`
4. ❌ Firebase checks the Security Rules
5. ❌ Rules say "No, you can't write here"
6. ❌ Request denied with "permission-denied" error

## The Solution

You need to update your **Firestore Security Rules** in the Firebase Console.

### This is NOT a code issue - it's a Firebase Console configuration issue

The code is already correct. You just need to tell Firebase to allow authenticated users to save their own profile data.

## How to Fix (5 Steps)

### Step 1: Open Firebase Console
Go to: https://console.firebase.google.com

### Step 2: Select Your Project
Click on "rah app" project

### Step 3: Navigate to Firestore Rules
- Left sidebar → **Firestore Database**
- Click the **Rules** tab
- You'll see the rules editor

### Step 4: Replace the Rules
Delete everything and paste this:

```firestore
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    
    // Allow authenticated users to read/write their own profile
    match /profiles/{userId} {
      allow read, write: if request.auth.uid == userId;
      
      // Allow read/write in all subcollections
      match /{document=**} {
        allow read, write: if request.auth.uid == userId;
      }
    }
    
    // Allow authenticated users to access their check-ins
    match /profiles/{userId}/checkIns/{document=**} {
      allow read, write: if request.auth.uid == userId;
    }
    
    // Allow authenticated users to access their reports
    match /profiles/{userId}/reports/{document=**} {
      allow read, write: if request.auth.uid == userId;
    }
    
    // Allow authenticated users to access their notifications
    match /profiles/{userId}/notifications/{document=**} {
      allow read, write: if request.auth.uid == userId;
    }
    
    // Allow authenticated users to access their digital IDs
    match /profiles/{userId}/digitalIds/{document=**} {
      allow read, write: if request.auth.uid == userId;
    }
    
    // Deny all other access
    match /{document=**} {
      allow read, write: if false;
    }
  }
}
```

### Step 5: Publish
Click the blue **"Publish"** button and wait for confirmation.

---

## What These Rules Do

### ✅ ALLOWS
- Authenticated users to **read** their own profile (`/profiles/{their-uid}`)
- Authenticated users to **write/update** their own profile
- Users to access their own check-ins, reports, notifications, and digital IDs

### ❌ BLOCKS
- Users from accessing **other users' profiles**
- Users from accessing **other users' data**
- Unauthenticated (anonymous) users from accessing **any data**
- Any access to collections not defined in the rules

---

## After You Update the Rules

Once you publish the rules:

1. Go back to your app: https://tourism-orcin.vercel.app/profile
2. Refresh the page
3. Fill in the profile form
4. Click "Save Profile"
5. **Should now see**: ✓ Profile saved successfully!

Open browser console (F12) to see the success logs:

```
[Firebase] Auth state changed: User {uid} authenticated
[Firebase] saveProfile called with uid: {uid}
[Firebase] Setting profile document at /profiles/{uid}
[Firebase] Profile saved successfully
```

---

## Troubleshooting

### "Still getting permission-denied error"
- Wait 30-60 seconds after publishing (rules take time to propagate)
- Refresh your browser (Ctrl+Shift+R to hard refresh)
- Check that you copied the rules correctly

### "Publish button is grayed out"
- Look for red error messages below the rules editor
- Check that all brackets `{}` are matched
- Make sure there are no syntax errors

### "How do I test if rules work?"
- In Firebase Console Rules tab, click **"Test rules"**
- Simulate a write operation to `/profiles/{uid}`
- Should show "Permission denied" error (which is expected at this point)

### "I accidentally deleted something"
- Click **"Revert"** to go back to previous rules
- Or just paste the rules again

---

## Why Are Security Rules Important?

Security rules protect your database:
- **Only authenticated users** can access data
- **Each user can only access their own data** (identified by their uid)
- **No one can modify data without permission**
- **Prevents unauthorized access and data leaks**

Your rules are configured to be secure while allowing the app to function properly.

---

## What Happens Next

Once the rules are updated, your app will:

✅ Save profile data to Firestore
✅ Fetch profile when you load a page
✅ Display profile on all pages (Settings, Check-in, Report, Analytics)
✅ Show success messages
✅ Persist data across sessions

---

## Need More Help?

See **FIRESTORE_RULES.md** for:
- Complete step-by-step guide with screenshots
- Video walkthrough
- Advanced troubleshooting
- Rules simulator instructions

---

**Status**: The code is correct. Just update the Firestore rules and it will work! 🚀

