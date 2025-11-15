# Quick Reference - Database Architecture Upgrade

## 🔄 Path Changes at a Glance

| Function | Old Path | New Path |
|----------|----------|----------|
| `getProfile(uid)` | `/profiles/{uid}` | `/users/{uid}` |
| `saveProfile(uid, profile)` | `/profiles/{uid}` | `/users/{uid}` (+ `id` field) |
| `saveCheckIn(uid, data)` | `/profiles/{uid}/checkIns` | `/users/{uid}/checkIns` |
| `listCheckIns(uid)` | `/profiles/{uid}/checkIns` | `/users/{uid}/checkIns` |
| `saveReport(uid, data)` | `/profiles/{uid}/reports` | `/users/{uid}/incidentReports` |
| `listReports(uid)` | `/profiles/{uid}/reports` | `/users/{uid}/incidentReports` |
| `generateAndSaveDigitalId(uid)` | `/profiles/{uid}/digitalIds` | `/users/{uid}/digitalIds` |
| `saveNotification(uid, payload)` | `/profiles/{uid}/notifications` | `/users/{uid}/notifications` |
| `listNotifications(uid)` | `/profiles/{uid}/notifications` | `/users/{uid}/notifications` |
| `saveSettings(uid, settings)` | `/profiles/{uid}` | `/users/{uid}` |
| `getSettings(uid)` | `/profiles/{uid}` | `/users/{uid}` |

---

## 📋 Deployment Checklist

### Pre-Deployment
- [ ] Read `FIRESTORE_RULES.md`
- [ ] Understand data structure changes
- [ ] Backup existing Firestore data
- [ ] Note any custom code using old paths

### Deployment (5 min)
- [ ] Go to Firebase Console
- [ ] Navigate to Firestore → Rules tab
- [ ] Copy rules from `FIRESTORE_RULES.md`
- [ ] Replace existing rules
- [ ] Click Publish
- [ ] Wait for confirmation message

### Data Migration (Optional - 10-20 min)
- [ ] Decide: Manual or script migration
- [ ] Migrate data from `/profiles` to `/users`
- [ ] Verify all data transferred
- [ ] Keep old `/profiles` as backup

### Testing (5 min)
- [ ] Sign in to app
- [ ] Go to Profile page
- [ ] Save profile form
- [ ] Check for success message
- [ ] Verify data in Firestore console
- [ ] Test all features

### Post-Deployment
- [ ] Monitor Firestore for errors
- [ ] Check browser console for warnings
- [ ] Verify all pages display correctly
- [ ] Cleanup old `/profiles` collection

---

## 🔐 Security Rules Quick Reference

### The Three Helper Functions

```firestore
// Check if user is authenticated
function isSignedIn() {
  return request.auth != null;
}

// Check if user owns the data
function isOwner(userId) {
  return isSignedIn() && request.auth.uid == userId;
}

// Check if user owns the data AND document exists
function isExistingOwner(userId) {
  return isOwner(userId) && resource != null;
}
```

### The Core Rule Pattern

```firestore
match /users/{userId} {
  // Create: Must be signed in, own the data, and set id field correctly
  allow create: if isSignedIn() && request.auth.uid == userId && 
                   request.resource.data.id == userId;
  
  // Read: Must be signed in and own the data
  allow get: if isSignedIn() && isOwner(userId);
  
  // List: Always blocked (no user enumeration)
  allow list: if false;
  
  // Update: Must be signed in, own the data, document must exist, id unchanged
  allow update: if isSignedIn() && isExistingOwner(userId) && 
                   request.resource.data.id == resource.data.id;
  
  // Delete: Must be signed in, own the data, document must exist
  allow delete: if isSignedIn() && isExistingOwner(userId);
}
```

---

## 📊 Document Structure

### User Profile Document
```typescript
interface UserProfile {
  id: string;                    // UID - REQUIRED for security
  email: string;                 // From Firebase Auth
  firstName?: string;
  lastName?: string;
  age?: number;
  userType?: string;             // 'tourist' | 'local'
  document?: string;             // ID document number
  updatedAt: number;             // Timestamp - REQUIRED
  digitalId?: string;
  qrDataUrl?: string;
  settings?: {
    notificationsEnabled?: boolean;
    shareLocation?: boolean;
    // ... other settings
  };
}
```

### Emergency Contact Document
```typescript
interface EmergencyContact {
  name: string;
  phone: string;
  relationship: string;
}
// Location: /users/{userId}/emergencyContacts/{contactId}
```

### Check-In Document
```typescript
interface CheckIn {
  location: string;
  latitude: number;
  longitude: number;
  accuracy?: number;
  place?: string;
  createdAt: number;
  updatedAt: number;
}
// Location: /users/{userId}/checkIns/{checkInId}
```

### Incident Report Document
```typescript
interface IncidentReport {
  incidentType: string;
  description: string;
  location: string;
  status: 'submitted' | 'reviewed' | 'resolved';
  createdAt: number;
  updatedAt: number;
}
// Location: /users/{userId}/incidentReports/{reportId}
```

### Digital ID Document
```typescript
interface DigitalId {
  uid: string;
  name: string;
  digitalId: string;              // Human-readable ID
  qrDataUrl: string;              // QR code image
  createdAt: number;
}
// Location: /users/{userId}/digitalIds/{digitalId}
```

### Notification Document
```typescript
interface Notification {
  title: string;
  message: string;
  [key: string]: any;
  createdAt: number;
}
// Location: /users/{userId}/notifications/{notificationId}
```

---

## 🔍 Access Control Matrix

| Path | User's Own | Other User | Anonymous | Reason |
|------|-----------|-----------|-----------|--------|
| `/users/{uid}` | ✅ CRUD | ❌ | ❌ | Ownership validation |
| `/users/{uid}/emergencyContacts/*` | ✅ CRUD | ❌ | ❌ | Ownership inheritance |
| `/users/{uid}/digitalIds/*` | ✅ CRUD | ❌ | ❌ | Ownership inheritance |
| `/users/{uid}/checkIns/*` | ✅ CRUD | ❌ | ❌ | Ownership inheritance |
| `/users/{uid}/incidentReports/*` | ✅ CRUD | ❌ | ❌ | Ownership inheritance |
| `/users` | ❌ | ❌ | ❌ | No enumeration |
| `/*` (fallback) | ❌ | ❌ | ❌ | Deny by default |

---

## 🧪 Testing Rules

### Firebase Console Test Method

1. Open Firebase Console → Firestore → Rules tab
2. Click **"Test rules"** button
3. Configure test parameters:

**Example 1: User reads own profile**
```
Request Method: read
Document Path: /users/user123
Authentication Token: [valid token for user123]
Expected Result: ✅ ALLOW
```

**Example 2: User tries to read other's profile**
```
Request Method: read
Document Path: /users/user456
Authentication Token: [valid token for user123]
Expected Result: ❌ DENY
```

**Example 3: Anonymous tries to read**
```
Request Method: read
Document Path: /users/user123
Authentication Token: [empty]
Expected Result: ❌ DENY
```

---

## 🛠️ Common Development Tasks

### Adding a New Subcollection

1. **Update Firestore Rules**:
```firestore
match /users/{userId}/myNewCollection/{documentId} {
  allow create: if isSignedIn() && isOwner(userId);
  allow get: if isSignedIn() && isOwner(userId);
  allow list: if isSignedIn() && isOwner(userId);
  allow update: if isSignedIn() && isExistingOwner(userId);
  allow delete: if isSignedIn() && isExistingOwner(userId);
}
```

2. **Add Function in firebaseClient.ts**:
```typescript
export async function saveMyItem(uid: string, data: any): Promise<boolean> {
  if (!db) initFirebase();
  if (!db) return false;
  try {
    const col = collection(db, 'users', uid, 'myNewCollection');
    await addDoc(col, { ...data, createdAt: Date.now() });
    return true;
  } catch (error) {
    console.error('[Firebase] saveMyItem error:', error);
    return false;
  }
}
```

3. **Use in Components**:
```typescript
const success = await saveMyItem(user.uid, myData);
```

---

## 📈 Performance Considerations

### Indexes to Consider

For queries across user subcollections:

```firestore
// If querying by status in incidentReports
Firestore will auto-suggest composite index:
Collection: users/{userId}/incidentReports
Fields: status (ASC), createdAt (DESC)
```

### Cost Optimization

- **Read**: Queries read entire document (optimize field sizes)
- **Write**: Each field update counts as one write operation
- **Subcollections**: Separate documents (more writes but better organization)

---

## 🆘 Troubleshooting Quick Links

| Issue | Solution | Time |
|-------|----------|------|
| "permission-denied" | Check rules published + wait 30-60s | 5 min |
| Data not saving | Check browser console for errors | 5 min |
| Data in old location | Run migration script | 10 min |
| Subcollection not working | Verify parent doc exists first | 5 min |
| Rules won't publish | Check syntax in editor | 5 min |
| Data structure wrong | Compare with docs section | 10 min |

---

## 📞 Documentation Map

```
├─ FIRESTORE_RULES.md
│  ├─ Complete rules code
│  ├─ Firebase Console steps
│  └─ Rule explanations
│
├─ MIGRATION_TO_USER_BASED_STRUCTURE.md
│  ├─ Before/after structure
│  ├─ Data migration guide
│  └─ Testing checklist
│
├─ DATABASE_ARCHITECTURE_UPGRADE_SUMMARY.md
│  ├─ Overview of changes
│  ├─ Security benefits
│  └─ Timeline
│
└─ QUICK_REFERENCE.md (this file)
   ├─ Path changes
   ├─ Deployment checklist
   └─ Quick lookups
```

---

## 🎯 Key Takeaways

1. **Structure Change**: `/profiles/{uid}` → `/users/{uid}`
2. **Required Field**: Always include `id: uid` in saveProfile()
3. **Subcollections**: Changed names (reports → incidentReports)
4. **Security**: Strict ownership validation at database level
5. **Testing**: 5 minutes after deploying rules
6. **Migration**: Optional for existing data

---

## ✅ Status Overview

| Component | Status |
|-----------|--------|
| Rules Design | ✅ Complete |
| Application Code | ✅ Updated |
| Documentation | ✅ Complete |
| Git Commits | ✅ Pushed |
| Ready to Deploy | ✅ Yes |

**Next Action**: Deploy rules in Firebase Console (5 minutes)
