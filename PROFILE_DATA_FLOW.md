# Profile Data Flow Documentation

## Overview
This document explains how user profile data (name, age, user type, document details) is saved to Firebase Firestore and fetched across the application.

## Architecture

### Database Structure
```
Firestore Database
├── profiles/ (collection)
    └── {uid}/ (document - one per user)
        ├── fullName: string
        ├── email: string
        ├── age: number
        ├── userType: string (Indian | Foreigner)
        ├── documentType: string (Aadhar | Passport | Visa)
        ├── documentNumber: string
        ├── updatedAt: timestamp
        ├── digitalId: string
        ├── qrDataUrl: string
        └── (other fields as needed)
```

## Data Flow

### 1. Profile Save Flow (When User Clicks "Save Profile")

```
User Profile Page (/profile)
    ↓
User fills form: fullName, age, userType, documentType, documentNumber
    ↓
User clicks "Save Profile" button
    ↓
handleSave() function triggered
    ↓
Validation checks:
  - User must be authenticated (checked via user?.uid)
  - Full name required (non-empty)
  - Age required (non-zero)
    ↓
Create profileToSave object:
  {
    fullName: string,
    email: user.email,  // From Firebase Auth
    age: number,
    userType: string,
    documentType: string,
    documentNumber: string,
    updatedAt: Date.now()
  }
    ↓
Call: saveProfile(user.uid, profileToSave)
    ↓
Firebase Client (/lib/firebaseClient.ts):
  1. Initialize Firebase if needed: initFirebase()
  2. Get Firestore reference: db = getFirestore()
  3. Create document reference: ref = doc(db, 'profiles', uid)
  4. Save with merge: await setDoc(ref, profile, { merge: true })
     - merge: true preserves existing fields not in update
    ↓
Success: return true → Show success message "✓ Profile saved successfully!"
Failure: return false → Show error message with details
```

### 2. Profile Fetch Flow (When Page Loads)

```
Any Page Using Profile Data (/profile, /settings, /check-in, /report, /analytics)
    ↓
Component mounts (useEffect hook)
    ↓
Register auth state listener: onAuthChange(async (u) => { ... })
    ↓
When user authenticates:
  - Firebase Auth fires onAuthStateChanged event
  - User object (u) is passed to callback
    ↓
Inside callback:
  1. setUser(u) - Store auth user
  2. Check if authenticated: if (u)
  3. Call: getProfile(u.uid)
    ↓
Firebase Client (/lib/firebaseClient.ts):
  1. Initialize Firebase if needed: initFirebase()
  2. Get Firestore reference: db = getFirestore()
  3. Create document reference: ref = doc(db, 'profiles', uid)
  4. Fetch document: snap = await getDoc(ref)
  5. Return: snap.exists() ? snap.data() : null
    ↓
Handle result in component:
  - If profile exists: Update component state with fetched data
  - If profile doesn't exist: Initialize with empty form or auth email
  - If error: Log error, show fallback UI
    ↓
Display in UI:
  - Profile page: Show form fields pre-filled with saved data
  - Settings page: Show profile card with user details
  - Check-in page: Show "Checking in as: [Name]" badge
  - Report page: Show "Report filed by: [Name]" badge
  - Analytics page: Show "Analytics for: [Name]" badge
```

## Code Implementation

### Profile Page (src/app/(app)/profile/page.tsx)

#### Initial Load
```typescript
useEffect(() => {
  const unsubscribe = onAuthChange(async (u) => {
    setUser(u);
    if (u) {
      try {
        // Fetch existing profile from Firestore
        const userProfile = await getProfile(u.uid);
        if (userProfile) {
          setProfile({
            fullName: userProfile.fullName || '',
            email: u.email || userProfile.email || '', // Prioritize auth email
            age: userProfile.age || 0,
            userType: userProfile.userType || '',
            documentType: userProfile.documentType || '',
            documentNumber: userProfile.documentNumber || '',
          });
        } else {
          // No profile exists yet, initialize with auth email
          setProfile({
            fullName: '',
            email: u.email || '',
            age: 0,
            userType: '',
            documentType: '',
            documentNumber: '',
          });
        }
      } catch (err) {
        console.error('[Profile] Error loading profile:', err);
        // Fallback to auth email
        setProfile(prev => ({ ...prev, email: u.email || '' }));
      } finally {
        setLoading(false);
      }
    } else {
      setLoading(false);
    }
  });
  return () => {
    if (unsubscribe && typeof unsubscribe === 'function') unsubscribe();
  };
}, []);
```

#### Save Profile
```typescript
const handleSave = async () => {
  // Validation
  if (!user) {
    setMessage('Please sign in to save profile');
    return;
  }

  if (!profile.fullName || !profile.age) {
    setMessage('Please fill in all required fields');
    return;
  }

  setSaving(true);
  setMessage(null);

  try {
    // Include email from auth user
    const profileToSave = {
      ...profile,
      email: user.email || profile.email,
      updatedAt: Date.now(),
    };
    
    console.log('[Profile] Saving profile with data:', profileToSave);
    console.log('[Profile] User UID:', user.uid);
    
    const success = await saveProfile(user.uid, profileToSave);
    console.log('[Profile] Save result:', success);
    
    if (success) {
      setMessage('✓ Profile saved successfully!');
      setProfile(profileToSave);
      setTimeout(() => setMessage(null), 3000);
    } else {
      setMessage('Failed to save profile. Check console for details.');
    }
  } catch (error: any) {
    console.error('[Profile] Error:', error);
    setMessage(`Error: ${error.message}`);
  } finally {
    setSaving(false);
  }
};
```

### Firebase Client (src/lib/firebaseClient.ts)

#### Get Profile
```typescript
export async function getProfile(uid: string): Promise<Record<string, any> | null> {
  console.log('[Firebase] getProfile called with uid:', uid);
  
  if (!db) {
    console.log('[Firebase] db is null, initializing Firebase');
    initFirebase();
  }
  
  if (!db) {
    console.warn('[Firebase] Firestore not available for getProfile - initialization failed');
    return null;
  }

  try {
    console.log('[Firebase] Getting profile document from /profiles/' + uid);
    const ref = doc(db, 'profiles', uid);
    const snap: DocumentSnapshot = await getDoc(ref);
    const data = snap.exists() ? snap.data() : null;
    console.log('[Firebase] getProfile result:', data ? 'found' : 'not found', data);
    return data;
  } catch (error: any) {
    console.error('[Firebase] getProfile error:', error.message, error.code);
    return null;
  }
}
```

#### Save Profile
```typescript
export async function saveProfile(uid: string, profile: Record<string, any>): Promise<boolean> {
  console.log('[Firebase] saveProfile called with uid:', uid);
  
  if (!db) {
    console.log('[Firebase] db is null, initializing Firebase');
    initFirebase();
  }
  
  if (!db) {
    console.warn('[Firebase] Firestore not available for saveProfile - initialization failed');
    return false;
  }

  try {
    console.log('[Firebase] Setting profile document at /profiles/' + uid, profile);
    const ref = doc(db, 'profiles', uid);
    await setDoc(ref, profile, { merge: true });
    console.log('[Firebase] Profile saved successfully');
    return true;
  } catch (error: any) {
    console.error('[Firebase] saveProfile error:', error.message, error.code);
    return false;
  }
}
```

## Debugging Tips

### Check Browser Console
1. Open Developer Tools (F12 or Right-click → Inspect)
2. Go to Console tab
3. Look for logs starting with `[Firebase]` and `[Profile]`

### Expected Log Sequence When Saving

```
1. [Firebase] Auth state changed: User {uid} authenticated
2. [Firebase] getProfile called with uid: {uid}
3. [Firebase] Getting profile document from /profiles/{uid}
4. [Firebase] getProfile result: found {data}
5. [Profile] User clicked Save
6. [Profile] Saving profile with data: {profileToSave}
7. [Profile] User UID: {uid}
8. [Firebase] saveProfile called with uid: {uid}
9. [Firebase] Setting profile document at /profiles/{uid} {profile}
10. [Firebase] Profile saved successfully
11. [Profile] Save result: true
```

### Troubleshooting

#### Issue: "Firestore not available for saveProfile - initialization failed"
**Cause**: Firebase environment variables not set correctly
**Solution**: 
- Check `.env.local` has all required variables:
  - `NEXT_PUBLIC_FIREBASE_API_KEY`
  - `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN`
  - `NEXT_PUBLIC_FIREBASE_PROJECT_ID`
  - `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET`
  - `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID`
  - `NEXT_PUBLIC_FIREBASE_APP_ID`

#### Issue: "Profile saved successfully!" but data not appearing on other pages
**Cause**: Profile data not being fetched on other pages
**Solution**:
- Check that the page calls `getProfile(u.uid)` in useEffect
- Verify that profile state is being set with fetched data
- Check browser console for fetch errors

#### Issue: "Failed to save profile" message
**Cause**: Various potential causes
**Solution**:
- Check console for detailed error message
- Verify user is authenticated (check `user?.uid`)
- Verify all required fields are filled
- Check Firebase Firestore rules allow write access
- Check Firebase has no quota limits

#### Issue: Form shows empty even after saving
**Cause**: Profile not being fetched after save
**Solution**:
- After successful save, the component should update local state
- Check that `setProfile(profileToSave)` is called after successful save
- Verify Firebase Firestore read rules are correct

## Testing Steps

### Manual Testing
1. Sign up/Sign in to create user account
2. Go to Profile page (/profile)
3. Fill in all fields:
   - Full Name
   - Age
   - User Type
   - Document Type
   - Document Number
4. Click "Save Profile"
5. Verify "✓ Profile saved successfully!" message appears
6. Refresh page
7. Verify profile data reappears in form
8. Go to Settings page (/settings)
9. Verify "Account Info" section shows the saved profile data
10. Go to Check-in page (/check-in)
11. Verify "Checking in as: [Name]" badge appears
12. Go to Report page (/report)
13. Verify "Report filed by: [Name]" badge appears
14. Go to Analytics page (/analytics)
15. Verify "Analytics for: [Name]" badge appears

### Console Testing
Open browser console (F12) and look for:
- All Firebase logs showing successful initialization
- Auth state change logs when user logs in
- Profile fetch logs returning correct data
- Profile save logs completing successfully

## Files Modified

- `src/app/(app)/profile/page.tsx` - Profile save/fetch logic with logging
- `src/lib/firebaseClient.ts` - Firebase client functions with detailed logging
- `src/app/(app)/settings/page.tsx` - Fetch and display profile data
- `src/app/(app)/check-in/page.tsx` - Fetch and display profile name
- `src/app/(app)/report/page.tsx` - Fetch and display profile name
- `src/app/(app)/analytics/page.tsx` - Fetch and display profile name

## Summary

The profile data flow is now:
1. ✅ User authenticates via Firebase Auth
2. ✅ Auth state change triggers profile fetch from Firestore
3. ✅ Profile form pre-fills with fetched data
4. ✅ User can edit and save profile
5. ✅ Save validates, includes email from auth, and persists to Firestore
6. ✅ Other pages fetch and display profile data in headers/sections
7. ✅ Comprehensive logging helps troubleshoot any issues

All operations log detailed information to browser console for debugging.
