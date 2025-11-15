# Migration to User-Based Firestore Structure

## Overview

Your application has been upgraded to use a professional user-ownership model for Firestore security. This document explains the changes and what you need to do to complete the migration.

---

## 🔄 What Changed

### Before (Old Structure)
```
/profiles/{uid}
├── email
├── name
└── /notifications, /checkIns, /reports, /digitalIds
```

### After (New Structure)
```
/users/{uid}
├── id (required for security validation)
├── email
├── firstName
├── lastName
└── /emergencyContacts, /digitalIds, /checkIns, /incidentReports
```

---

## ✅ What's Been Updated

### Code Changes (Automatically Done)

✅ **firebaseClient.ts** - Updated all function calls:
- `getProfile(uid)` - Now reads from `/users/{uid}`
- `saveProfile(uid, profile)` - Now writes to `/users/{uid}` with `id` field
- `saveCheckIn(uid, data)` - Now saves to `/users/{uid}/checkIns`
- `listCheckIns(uid)` - Now reads from `/users/{uid}/checkIns`
- `saveReport(uid, data)` - Now saves to `/users/{uid}/incidentReports`
- `listReports(uid)` - Now reads from `/users/{uid}/incidentReports`
- `generateAndSaveDigitalId(uid, name)` - Now saves to `/users/{uid}/digitalIds`
- `saveNotification(uid, payload)` - Now saves to `/users/{uid}/notifications`
- `listNotifications(uid)` - Now reads from `/users/{uid}/notifications`
- `saveSettings(uid, settings)` - Now saves to `/users/{uid}`
- `getSettings(uid)` - Now reads from `/users/{uid}`

✅ **Firestore Security Rules** - Professional user-ownership model with:
- Path-based denormalization (userId encoded in path)
- Strict ownership validation on all operations
- Comprehensive JSDoc comments for each rule
- Helper functions: `isSignedIn()`, `isOwner()`, `isExistingOwner()`

---

## 🚀 Required Actions

### Step 1: Deploy Updated Security Rules

⚠️ **CRITICAL**: Your old profiles will still be in `/profiles/{uid}`. You need to:

1. Go to Firebase Console: https://console.firebase.google.com
2. Select "rah app" project
3. Navigate to **Firestore Database** → **Rules** tab
4. Copy the complete rules from `FIRESTORE_RULES.md`
5. Replace all existing rules
6. Click **Publish**
7. Wait for "Rules updated successfully"

### Step 2: Migrate Existing Data (Manual)

If you have existing users with profiles in `/profiles/{uid}`, you need to migrate them:

**Option A: Manual Migration in Firebase Console**
1. Go to Firestore Database → Data tab
2. View `/profiles` collection
3. For each document:
   - Copy all fields
   - Create new document in `/users` collection with same UID
   - Add `id` field set to the UID
   - Delete old document from `/profiles`

**Option B: Automated Migration Script**

Create a new file `scripts/migrate-profiles.ts`:

```typescript
import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs, doc, setDoc, deleteDoc } from 'firebase/firestore';

const firebaseConfig = {
  // Your Firebase config
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function migrateProfiles() {
  try {
    // Get all old profiles
    const oldProfiles = await getDocs(collection(db, 'profiles'));
    
    console.log(`Found ${oldProfiles.size} profiles to migrate`);
    
    let migrated = 0;
    let failed = 0;
    
    for (const profileDoc of oldProfiles.docs) {
      const uid = profileDoc.id;
      const data = profileDoc.data();
      
      try {
        // Save to new location with id field
        await setDoc(doc(db, 'users', uid), {
          id: uid,
          ...data
        });
        
        // Delete from old location
        await deleteDoc(doc(db, 'profiles', uid));
        
        migrated++;
        console.log(`✅ Migrated ${uid}`);
      } catch (error) {
        failed++;
        console.error(`❌ Failed to migrate ${uid}:`, error);
      }
    }
    
    console.log(`\nMigration complete: ${migrated} successful, ${failed} failed`);
  } catch (error) {
    console.error('Migration error:', error);
  }
}

migrateProfiles();
```

Then run: `npm ts-node scripts/migrate-profiles.ts`

### Step 3: Test the New Structure

1. Go to your app: https://tourism-orcin.vercel.app/profile
2. Sign in with your account
3. Fill in profile form:
   - First Name: (your first name)
   - Last Name: (your last name)
   - Age: (your age)
   - User Type: (select from dropdown)
   - Document: (paste your ID number)
4. Click "Save Profile"
5. Check for success message: "✓ Profile saved successfully!"

### Step 4: Verify Data in Firebase Console

1. Go to Firestore Database → Data tab
2. You should see a `/users` collection
3. Click on your UID document
4. Verify these fields exist:
   - `id`: your UID
   - `firstName`: your first name
   - `lastName`: your last name
   - `email`: your email (from Firebase Auth)
   - `updatedAt`: timestamp
   - Any other profile fields

---

## 📊 Data Validation

### Required Fields in `/users/{uid}`

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `id` | string | ✅ | User's UID (for security validation) |
| `email` | string | ✅ | User's email from Firebase Auth |
| `firstName` | string | ❌ | User's first name |
| `lastName` | string | ❌ | User's last name |
| `age` | number | ❌ | User's age |
| `userType` | string | ❌ | Type: 'tourist' or 'local' |
| `document` | string | ❌ | ID document number |
| `updatedAt` | number | ✅ | Timestamp of last update |

### Subcollections (Auto-created on first use)

- `/users/{uid}/emergencyContacts/{contactId}` - Emergency contacts
- `/users/{uid}/digitalIds/{digitalId}` - Generated digital IDs with QR codes
- `/users/{uid}/checkIns/{checkInId}` - Location check-ins
- `/users/{uid}/incidentReports/{reportId}` - Incident reports
- `/users/{uid}/notifications/{notificationId}` - User notifications

---

## 🔒 Security Model

### Access Control

| Operation | User's Own Data | Other User's Data | Anonymous |
|-----------|-----------------|-------------------|-----------|
| Create | ✅ | ❌ | ❌ |
| Read | ✅ | ❌ | ❌ |
| Update | ✅ | ❌ | ❌ |
| Delete | ✅ | ❌ | ❌ |
| List Users | ❌ | ❌ | ❌ |

### Validation Rules

1. **User ID Matching**: Path UID must match `request.auth.uid`
2. **ID Field Preservation**: Profile `id` field cannot be changed
3. **Document Existence**: Updates require document to already exist
4. **Ownership Check**: All operations validate user ownership

---

## ⚠️ Breaking Changes

If you have custom code that directly references Firestore paths:

### Old Paths (No Longer Supported)
```typescript
doc(db, 'profiles', uid)
collection(db, 'profiles', uid, 'notifications')
collection(db, 'profiles', uid, 'reports')
// ... etc
```

### New Paths (Use These)
```typescript
doc(db, 'users', uid)
collection(db, 'users', uid, 'notifications')
collection(db, 'users', uid, 'incidentReports')
// ... etc
```

---

## 🧪 Testing Checklist

After completing the migration:

- [ ] Firestore rules published successfully
- [ ] Old profiles migrated to `/users/{uid}` (if applicable)
- [ ] Can sign in to application
- [ ] Profile form saves successfully
- [ ] Profile data persists after refresh
- [ ] Email displays correctly on Settings page
- [ ] Name displays on Check-in page
- [ ] Name displays on Report page
- [ ] Name displays on Analytics page
- [ ] Can generate digital ID
- [ ] Can create check-ins
- [ ] Can submit incident reports
- [ ] No "permission-denied" errors in browser console

---

## 🐛 Troubleshooting

### "Permission Denied" Still Appearing

1. Verify rules were published (check "Rules updated successfully" message)
2. Wait 30-60 seconds for rules to propagate
3. Clear browser cache: `Ctrl+Shift+Delete`
4. Refresh the app
5. Open DevTools (F12) → Console tab
6. Try saving profile again
7. Look for error details in console

### Data Not Saving

1. Check browser console for exact error message
2. Verify you're logged in (email displays in top right)
3. Verify `/users/{uid}` path exists in Firestore
4. Verify `id` field is present in document
5. Check that your Firebase auth token is valid

### Subcollections Not Working

1. Ensure you're trying to create items under `/users/{youruid}`
2. Verify rules allow access to `request.auth.uid`
3. Check that parent `/users/{uid}` document exists first
4. Wait 30-60 seconds after publishing rules

---

## 📚 Documentation References

| Document | Purpose |
|----------|---------|
| `FIRESTORE_RULES.md` | Complete security rules with Firebase steps |
| `PROFILE_DATA_FLOW.md` | Data flow diagrams (old structure - for reference) |
| `DATABASE_PERMISSION_FIX.md` | Problem explanation and 5-step fix |

---

## 🔄 Git Commits

Latest commits in your repository:

1. `99c0b01` - docs: update firestore rules with professional user-ownership model
2. `0b41bd7` - refactor: update firestore paths from /profiles to /users

---

## ✨ Benefits of New Structure

✅ **Better Security**
- User ownership validated at database level
- Path-based denormalization prevents ID spoofing
- Fail-secure defaults (deny all, allow specific)

✅ **Clearer Data Model**
- `/users/{uid}` explicitly shows ownership
- Subcollection names match data types (incidentReports not reports)
- id field prevents accidental identity changes

✅ **Scalability**
- Professional security rules support growth
- No cross-user access vulnerabilities
- Ready for production deployment

✅ **Maintainability**
- Comprehensive JSDoc comments
- Helper functions (isSignedIn, isOwner, isExistingOwner)
- Clear separation of concerns

---

## Next Steps

1. **Immediate** (5 min):
   - Read this document
   - Understand the changes

2. **Short-term** (15 min):
   - Deploy Firestore rules in Firebase Console
   - Migrate existing data (if applicable)
   - Test profile saving

3. **Follow-up** (ongoing):
   - Monitor Firestore for errors
   - Watch browser console for warnings
   - Clean up `/profiles` collection when ready

---

## Questions?

If you encounter issues:
1. Check `FIRESTORE_RULES.md` for rule explanations
2. Review browser console (F12) for error details
3. Verify Firebase project configuration
4. Check that all code changes were committed

**All code changes are in GitHub repository: `tourism`**
