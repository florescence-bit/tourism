/**
 * @fileOverview
 * Core Philosophy: This ruleset enforces a strict user-ownership model for all data. Each user can only access their own data.
 *
 * Data Structure: All data is nested under /users/{userId}, with further subcollections for emergencyContacts, digitalIDs, checkIns, and incidentReports.
 *
 * Key Security Decisions:
 *   - User listing is implicitly disallowed.
 *   - All subcollections inherit ownership from the /users/{userId} path.
 *   - Data validation is relaxed for rapid prototyping, but ownership checks are strictly enforced.
 *
 * Denormalization for Authorization: The data structure inherently utilizes path-based denormalization.  The `userId` is encoded in the path itself, removing the need to duplicate it in documents.
 *
 * Structural Segregation: There is no concept of public versus private data in this model; all user data is considered private.
 */
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {

    /**
     * @description Controls access to user profiles.
     * @path /users/{userId}
     * @allow (create) User with ID 'user123' can create their profile.
     *   - auth.uid: 'user123'
     *   - request.resource.data: { id: 'user123', firstName: 'John', lastName: 'Doe', ... }
     * @deny (create) User with ID 'user123' cannot create profile for 'user456'.
     *   - auth.uid: 'user123'
     *   - request.resource.data: { id: 'user456', firstName: 'John', lastName: 'Doe', ... }
     * @allow (get) User with ID 'user123' can read their profile.
     *   - auth.uid: 'user123'
     * @deny (get) User with ID 'user123' cannot read profile for 'user456'.
     *   - auth.uid: 'user123'
     * @allow (update) User with ID 'user123' can update their profile.
     *   - auth.uid: 'user123'
     *   - request.resource.data: { id: 'user123', firstName: 'Jane' }
     * @deny (update) User with ID 'user123' cannot update profile for 'user456'.
     *   - auth.uid: 'user123'
     *   - request.resource.data: { id: 'user456', firstName: 'Jane' }
     * @allow (delete) User with ID 'user123' can delete their profile.
     *   - auth.uid: 'user123'
     * @deny (delete) User with ID 'user123' cannot delete profile for 'user456'.
     *   - auth.uid: 'user123'
     * @principle Enforces document ownership for all operations.
     */
    match /users/{userId} {
      allow create: if isSignedIn() && request.auth.uid == userId && request.resource.data.id == userId;
      allow get: if isSignedIn() && isOwner(userId);
      allow list: if false;
      allow update: if isSignedIn() && isExistingOwner(userId) && request.resource.data.id == resource.data.id;
      allow delete: if isSignedIn() && isExistingOwner(userId);
    }

    /**
     * @description Controls access to emergency contacts for a user.
     * @path /users/{userId}/emergencyContacts/{contactId}
     * @allow (create) User with ID 'user123' can create an emergency contact.
     *   - auth.uid: 'user123'
     * @deny (create) User with ID 'user123' cannot create an emergency contact for 'user456'.
     *   - auth.uid: 'user123'
     * @allow (get) User with ID 'user123' can read their emergency contact.
     *   - auth.uid: 'user123'
     * @deny (get) User with ID 'user123' cannot read emergency contact for 'user456'.
     *   - auth.uid: 'user123'
     * @allow (update) User with ID 'user123' can update their emergency contact.
     *   - auth.uid: 'user123'
     * @deny (update) User with ID 'user123' cannot update emergency contact for 'user456'.
     *   - auth.uid: 'user123'
     * @allow (delete) User with ID 'user123' can delete their emergency contact.
     *   - auth.uid: 'user123'
     * @deny (delete) User with ID 'user123' cannot delete emergency contact for 'user456'.
     *   - auth.uid: 'user123'
     * @principle Enforces document ownership for all operations.
     */
    match /users/{userId}/emergencyContacts/{contactId} {
      allow create: if isSignedIn() && isOwner(userId);
      allow get: if isSignedIn() && isOwner(userId);
      allow list: if isSignedIn() && isOwner(userId);
      allow update: if isSignedIn() && isExistingOwner(userId);
      allow delete: if isSignedIn() && isExistingOwner(userId);
    }

    /**
     * @description Controls access to digital IDs for a user.
     * @path /users/{userId}/digitalIDs/{digitalId}
     * @allow (create) User with ID 'user123' can create a digital ID.
     *   - auth.uid: 'user123'
     * @deny (create) User with ID 'user123' cannot create a digital ID for 'user456'.
     *   - auth.uid: 'user123'
     * @allow (get) User with ID 'user123' can read their digital ID.
     *   - auth.uid: 'user123'
     * @deny (get) User with ID 'user123' cannot read digital ID for 'user456'.
     *   - auth.uid: 'user123'
     * @allow (update) User with ID 'user123' can update their digital ID.
     *   - auth.uid: 'user123'
     * @deny (update) User with ID 'user123' cannot update digital ID for 'user456'.
     *   - auth.uid: 'user123'
     * @allow (delete) User with ID 'user123' can delete their digital ID.
     *   - auth.uid: 'user123'
     * @deny (delete) User with ID 'user123' cannot delete digital ID for 'user456'.
     *   - auth.uid: 'user123'
     * @principle Enforces document ownership for all operations.
     */
    match /users/{userId}/digitalIDs/{digitalId} {
      allow create: if isSignedIn() && isOwner(userId);
      allow get: if isSignedIn() && isOwner(userId);
      allow list: if isSignedIn() && isOwner(userId);
      allow update: if isSignedIn() && isExistingOwner(userId);
      allow delete: if isSignedIn() && isExistingOwner(userId);
    }

    /**
     * @description Controls access to check-in data for a user.
     * @path /users/{userId}/checkIns/{checkInId}
     * @allow (create) User with ID 'user123' can create a check-in.
     *   - auth.uid: 'user123'
     * @deny (create) User with ID 'user123' cannot create a check-in for 'user456'.
     *   - auth.uid: 'user123'
     * @allow (get) User with ID 'user123' can read their check-in.
     *   - auth.uid: 'user123'
     * @deny (get) User with ID 'user123' cannot read check-in for 'user456'.
     *   - auth.uid: 'user123'
     * @allow (update) User with ID 'user123' can update their check-in.
     *   - auth.uid: 'user123'
     * @deny (update) User with ID 'user123' cannot update check-in for 'user456'.
     *   - auth.uid: 'user123'
     * @allow (delete) User with ID 'user123' can delete their check-in.
     *   - auth.uid: 'user123'
     * @deny (delete) User with ID 'user123' cannot delete check-in for 'user456'.
     *   - auth.uid: 'user123'
     * @principle Enforces document ownership for all operations.
     */
    match /users/{userId}/checkIns/{checkInId} {
      allow create: if isSignedIn() && isOwner(userId);
      allow get: if isSignedIn() && isOwner(userId);
      allow list: if isSignedIn() && isOwner(userId);
      allow update: if isSignedIn() && isExistingOwner(userId);
      allow delete: if isSignedIn() && isExistingOwner(userId);
    }

    /**
     * @description Controls access to incident reports submitted by a user.
     * @path /users/{userId}/incidentReports/{incidentReportId}
     * @allow (create) User with ID 'user123' can create an incident report.
     *   - auth.uid: 'user123'
     * @deny (create) User with ID 'user123' cannot create an incident report for 'user456'.
     *   - auth.uid: 'user123'
     * @allow (get) User with ID 'user123' can read their incident report.
     *   - auth.uid: 'user123'
     * @deny (get) User with ID 'user123' cannot read incident report for 'user456'.
     *   - auth.uid: 'user123'
     * @allow (update) User with ID 'user123' can update their incident report.
     *   - auth.uid: 'user123'
     * @deny (update) User with ID 'user123' cannot update incident report for 'user456'.
     *   - auth.uid: 'user123'
     * @allow (delete) User with ID 'user123' can delete their incident report.
     *   - auth.uid: 'user123'
     * @deny (delete) User with ID 'user123' cannot delete incident report for 'user456'.
     *   - auth.uid: 'user123'
     * @principle Enforces document ownership for all operations.
     */
    match /users/{userId}/incidentReports/{incidentReportId} {
      allow create: if isSignedIn() && isOwner(userId);
      allow get: if isSignedIn() && isOwner(userId);
      allow list: if isSignedIn() && isOwner(userId);
      allow update: if isSignedIn() && isExistingOwner(userId);
      allow delete: if isSignedIn() && isExistingOwner(userId);
    }
  }
}

/**
 * @function isSignedIn
 * @description Checks if the user is signed in.
 * @returns {boolean} True if the user is signed in, false otherwise.
 */
function isSignedIn() {
  return request.auth != null;
}

/**
 * @function isOwner
 * @description Checks if the user ID matches the authenticated user's ID.
 * @param {string} userId - The user ID to compare against.
 * @returns {boolean} True if the user is the owner, false otherwise.
 */
function isOwner(userId) {
  return isSignedIn() && request.auth.uid == userId;
}

/**
 * @function isExistingOwner
 * @description Checks if the user is the owner and the document exists.
 * @param {string} userId - The user ID to compare against.
 * @returns {boolean} True if the user is the owner and the document exists, false otherwise.
 */
function isExistingOwner(userId) {
    return isOwner(userId) && resource != null;
}

## Implementation Steps

### Step 1: Navigate to Firebase Console
1. Go to: https://console.firebase.google.com
2. Select your project ("rah app")
3. Navigate to **Firestore Database** → **Rules** tab

### Step 2: Deploy the Rules
1. Copy the entire rules code from above
2. Replace all existing rules in the editor
3. Click the **Publish** button
4. Wait for confirmation: "Rules updated successfully"

### Step 3: Update Your Application Code

⚠️ **IMPORTANT**: Your application code needs to be updated to match the new data structure. The rules now use `/users/{userId}` instead of `/profiles/{userId}`.

Update your `firebaseClient.ts` to use the new paths:

```typescript
// OLD: /profiles/{uid}
// NEW: /users/{uid}

export async function saveProfile(uid: string, profile: any) {
  const docRef = doc(db, 'users', uid); // Changed from 'profiles'
  await setDoc(docRef, { id: uid, ...profile }, { merge: true });
}

export async function getProfile(uid: string) {
  const docRef = doc(db, 'users', uid); // Changed from 'profiles'
  const docSnap = await getDoc(docRef);
  return docSnap.exists() ? docSnap.data() : null;
}
```

### Step 4: Test the Application
1. Refresh your app
2. Navigate to the profile page
3. Fill in and submit the form
4. Check browser console for success: `Profile saved successfully!`

---

## Data Structure Overview

```
/users/{userId}
├── id: string
├── firstName: string
├── lastName: string
├── email: string (from Firebase Auth)
├── updatedAt: timestamp
└── /emergencyContacts/{contactId}
    ├── name: string
    ├── phone: string
    └── relationship: string

└── /digitalIDs/{digitalId}
    ├── type: string
    ├── number: string
    └── expiryDate: string

└── /checkIns/{checkInId}
    ├── location: string
    ├── timestamp: timestamp
    └── duration: number

└── /incidentReports/{reportId}
    ├── title: string
    ├── description: string
    ├── severity: string
    └── timestamp: timestamp
```

---

## Security Model Explained

### Core Principles

1. **User Ownership**: Each user can only access data under their own `/users/{userId}` path
2. **No Cross-User Access**: Authenticated users cannot read/write to other users' data
3. **No Anonymous Access**: All operations require authentication
4. **Subcollection Inheritance**: All subcollections inherit the ownership model from the parent user document

### Access Control Matrix

| Operation | Path | Authenticated User | Other User | Anonymous |
|-----------|------|-------------------|-----------|-----------|
| Create profile | `/users/{uid}` | ✅ (own) | ❌ | ❌ |
| Read profile | `/users/{uid}` | ✅ (own) | ❌ | ❌ |
| Update profile | `/users/{uid}` | ✅ (own) | ❌ | ❌ |
| Delete profile | `/users/{uid}` | ✅ (own) | ❌ | ❌ |
| List users | `/users` | ❌ | ❌ | ❌ |
| Create emergency contact | `/users/{uid}/emergencyContacts` | ✅ (own) | ❌ | ❌ |
| Create check-in | `/users/{uid}/checkIns` | ✅ (own) | ❌ | ❌ |
| Create report | `/users/{uid}/incidentReports` | ✅ (own) | ❌ | ❌ |

---

## Validation Features

### Profile Creation
- Ensures `request.resource.data.id == userId` (prevents ID spoofing)
- Requires user authentication

### Profile Updates
- Preserves the original user ID (`request.resource.data.id == resource.data.id`)
- Requires document to exist and user to own it

### Subcollection Access
- Users can create/read/update/delete their own emergency contacts
- Users can create/read/update/delete their own digital IDs
- Users can create/read/update/delete their own check-ins
- Users can create/read/update/delete their own incident reports

---

## Testing Your Rules

### Option 1: Firebase Console Rules Playground
1. In Firebase Console → Firestore → Rules tab
2. Click **"Test rules"** at the bottom
3. Configure test parameters:
   - **Request Method**: `create`, `read`, `update`, `delete`
   - **Document Path**: `/users/user123`
   - **Authentication Token**: Paste a valid Firebase ID token
4. Click **"Run"** to test

### Option 2: Application Testing
1. Create an account in your app
2. Fill profile form and click "Save"
3. Open browser DevTools (F12)
4. Check Console for logs:
   - Success: `[Firebase] Profile saved successfully`
   - Error: `[Firebase] saveProfile error: ...`

---

## Troubleshooting

### "Permission Denied" Error
1. Verify you're logged in (email displayed in UI)
2. Check that `auth.uid` matches the path `userId`
3. Wait 30-60 seconds after publishing rules
4. Clear browser cache and refresh

### Rules Won't Publish
1. Check syntax in the editor (red error messages)
2. Ensure all `{}` brackets are balanced
3. Verify indentation is correct
4. Use the **"Validate"** button before publishing

### Data Not Persisting
1. Check browser console for errors
2. Verify Firestore database is created and accessible
3. Confirm rules were published successfully
4. Check that document path matches the rules

---

## Security Best Practices

✅ **Implemented**
- Strong user ownership model
- No cross-user access
- No anonymous access
- Path-based denormalization (userId in path, not document)
- Fail-secure default (deny all, allow specific)

⚠️ **Recommendations**
- Regularly audit Firestore security rules
- Monitor access patterns in Firebase Console
- Implement rate limiting for sensitive operations
- Add document validation for critical fields
- Consider implementing audit logging

---

## Next Steps

1. ✅ Deploy the security rules (Firebase Console)
2. ✅ Update application code to use `/users/{userId}` paths
3. ✅ Test profile creation and updates
4. ✅ Verify data persists across sessions
5. ✅ Monitor Firestore usage in Firebase Console

