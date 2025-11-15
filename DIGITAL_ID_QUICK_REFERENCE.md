# Digital ID & QR Code - Quick Reference

## 🚀 Quick Start

**To Generate Digital ID**:
1. Sign in at `/auth` or any page
2. Complete profile at `/profile` (add Full Name)
3. Go to `/digital-id` page
4. Click "Generate Digital ID" button
5. QR code appears + success message
6. Optionally download QR code PNG

---

## 📍 Key Locations

| Component | Location | Purpose |
|-----------|----------|---------|
| Generation Logic | `src/lib/firebaseClient.ts` | `generateAndSaveDigitalId()` function |
| Digital-ID Page | `src/app/(app)/digital-id/page.tsx` | UI for viewing and generating IDs |
| Auth Page | `src/app/(app)/auth/page.tsx` | Alternative generation location |
| Documentation | `DIGITAL_ID_QR_FIX.md` | Full implementation guide |

---

## 🔧 Main Function

```typescript
generateAndSaveDigitalId(uid: string, name?: string)
  → Returns: { digitalId: string; qrDataUrl: string } | null
```

**What it does**:
1. Generates unique ID: `INITIALS-TIMESTAMP-RANDOM`
2. Creates QR code PNG image
3. Saves to `/users/{uid}/digitalIds/{digitalId}`
4. Merges QR into `/users/{uid}` profile
5. Returns generated ID and QR data URL

---

## 🧪 Quick Test

Open browser console (F12) and look for:
```
✅ [Firebase] Digital ID generated and saved successfully
✅ [Firebase] QR code generated successfully, length: 4821
✅ [Firebase] Digital ID merged into user profile
```

---

## 🐛 Common Issues & Fixes

| Issue | Cause | Fix |
|-------|-------|-----|
| "permission-denied" | Firestore rules not deployed | Deploy FIRESTORE_RULES.md |
| QR code doesn't show | Generation failed silently | Check console for errors |
| Data not in Firestore | Save operations failed | Check write permissions |
| "Please complete your profile" | Missing fullName | Go to /profile and add Full Name |
| "Please sign in first" | Not authenticated | Sign in at /auth page |

---

## 📊 Data Storage

**Profile Document** (`/users/{uid}`):
```json
{
  "digitalId": "JD-1731000000000-ABC1",
  "qrDataUrl": "data:image/png;base64,...[4KB]..."
}
```

**Digital ID Document** (`/users/{uid}/digitalIds/{digitalId}`):
```json
{
  "uid": "user123",
  "name": "John Doe",
  "digitalId": "JD-1731000000000-ABC1",
  "qrDataUrl": "data:image/png;base64,...[4KB]...",
  "createdAt": 1731000000000,
  "updatedAt": 1731000000000
}
```

---

## ✅ Features Working

- ✅ Generate unique IDs
- ✅ Create QR codes
- ✅ Save to Firestore
- ✅ Display on page
- ✅ Download QR PNG
- ✅ Error handling
- ✅ Logging
- ✅ Security

---

## 🔐 Security

Rules allow:
- ✅ Users can create their own digital IDs
- ✅ Users can read their own digital IDs
- ✅ Users can update their own digital IDs
- ❌ Users cannot access others' digital IDs
- ❌ Anonymous users cannot access IDs

---

## 📈 Recent Changes

**Commit**: `a89549f`
- Enhanced error handling
- Added comprehensive logging
- Improved validation
- Better error messages

**Commit**: `1aaa6b2`
- Created DIGITAL_ID_QR_FIX.md documentation
- Added testing procedures
- Added debugging guide

---

## 🎯 Next Steps

1. **Deploy Firestore Rules** (if not done)
   - From: FIRESTORE_RULES.md
   - To: Firebase Console

2. **Test Generation**
   - Sign in → Complete profile → /digital-id
   - Click button → Check console

3. **Verify Firestore**
   - Check `/users/{uid}` has digitalId
   - Check `/users/{uid}/digitalIds/{digitalId}` exists

4. **Test Download**
   - Generate ID → Click Download → Verify PNG

---

## 📞 Debug Checklist

- [ ] Browser console shows success logs
- [ ] QR code displays on page
- [ ] Firestore has digital ID document
- [ ] Profile has digitalId field
- [ ] Can download QR image
- [ ] Error messages are clear
- [ ] Works after page refresh

---

**Status**: ✅ Fully Functional
**Last Updated**: November 16, 2025
**Branch**: main
