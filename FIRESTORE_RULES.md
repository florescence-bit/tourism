# Firestore Security Rules Setup

## ⚠️ CURRENT ISSUE
Your profile save is failing with error: `permission-denied`

This means your Firestore Security Rules don't allow authenticated users to write data.

---

## ✅ SOLUTION: Update Firestore Rules

### Step 1: Go to Firebase Console
1. Visit: https://console.firebase.google.com
2. Select your "rah app" project
3. Go to **Firestore Database** → **Rules** tab

### Step 2: Replace Rules with This Code

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

### Step 3: Publish Rules
1. Click **Publish** button
2. Confirm the update

### Step 4: Test the App
1. Go back to your app: https://tourism-orcin.vercel.app/profile
2. Fill in profile form
3. Click "Save Profile"
4. Should now see: "✓ Profile saved successfully!"

---

## Explanation of Rules

| Rule | Allows | Requires |
|------|--------|----------|
| `read, write: if request.auth.uid == userId` | User can read/write their own profile | Must be authenticated |
| `match /profiles/{userId}/...` | Access to user's subcollections | User must own the data |
| `allow read, write: if false` | Blocks all other access | Security best practice |

---

## What Gets Saved Now

Once rules are updated, these operations will work:

✅ Save profile to `/profiles/{uid}`
✅ Fetch profile from `/profiles/{uid}`
✅ Save check-ins to `/profiles/{uid}/checkIns`
✅ Save reports to `/profiles/{uid}/reports`
✅ Save notifications to `/profiles/{uid}/notifications`
✅ Save digital IDs to `/profiles/{uid}/digitalIds`

---

## Troubleshooting

### If still getting "permission-denied":
1. Verify you're logged in (check email in top right)
2. Click Publish again and wait 30 seconds
3. Clear browser cache (Ctrl+Shift+Delete)
4. Refresh the app

### If rules won't publish:
1. Check for syntax errors in the rules
2. Make sure all brackets `{}` are matched
3. Try the rules in the **Rules playground**

### How to Test Rules
1. In Firebase Console → Firestore → Rules tab
2. Click **"Test rules"** at the bottom
3. Simulate a read/write operation

---

## Important Notes

⚠️ **Development vs Production**
- These rules are secure for development/testing
- For production, you may want stricter rules
- Current rules: Only authenticated users can access their own data

🔐 **Security**
- Each user can only access `/profiles/{their-uid}`
- No user can access another user's profile
- Anonymous users cannot access any data

---

## After Rules are Updated

Your app will automatically:
1. ✅ Save profile data to Firestore
2. ✅ Fetch profile on every page load
3. ✅ Display profile across all pages
4. ✅ Show "Account Info" on Settings page
5. ✅ Show user name in Check-in, Report, Analytics pages

---

## Need Help?

If rules still don't work:
1. Check browser console (F12) for exact error
2. Verify project ID matches: `326645804-b4fcl`
3. Make sure you're in the correct Firebase project
4. Click "Reset to template" and start over if needed

---

**Next Steps:**
1. Update Firestore Rules (see above)
2. Publish the rules
3. Go to app and test saving profile
4. Open browser console to verify success logs

