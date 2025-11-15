# Settings Page - Quick Start Guide

## Overview
The Settings page provides comprehensive account management including profile editing, password changes, preferences, and account deletion.

---

## 🎯 Key Features at a Glance

| Feature | Access | Time | Result |
|---------|--------|------|--------|
| **Edit Profile** | Click "Edit" in Profile Info | 2 mins | Profile updated, saved to Firestore |
| **Change Password** | Click "Change Password" | 1 min | Password updated in Firebase Auth |
| **Manage Preferences** | Toggle buttons, click Save | 1 min | Preferences saved to user profile |
| **Delete Account** | Click "Delete Account" | 3 mins | Account and all data permanently deleted |
| **Sign Out** | Click "Sign Out" | 10 secs | Logged out, redirected to home |

---

## 📍 Page Sections

### Left Column (Main Features)

#### 1️⃣ Profile Information
```
Current Data View:
- Full Name: John Doe
- Age: 28
- User Type: Indian Citizen
- Document Type: Aadhar Card
- Document Number: 1234 5678 9012

Actions:
[Edit] ← Click to modify
```

**How to Edit:**
1. Click "Edit" button
2. Change any field you want
3. Click "Save Changes" (or Cancel to discard)
4. See success message

**Required Fields:**
- Full Name (cannot be empty)
- Age (must be 18-120)

---

#### 2️⃣ Security (Change Password)
```
Current View:
- Secure password management
- Strong password recommended

Actions:
[Change Password] ← Click to update
```

**How to Change Password:**
1. Click "Change Password" button
2. Enter new password (minimum 6 characters)
3. Confirm password (must match)
4. Click "Update Password"
5. See success message
6. Sign out and back in to verify

**Password Rules:**
- Minimum 6 characters
- Must match confirmation
- Different from current password (Firebase requirement)

---

#### 3️⃣ Preferences (Toggle Settings)
```
[ On  ] Email Notifications
[ On  ] Location Sharing
[ Off ] Public Profile
[ Off ] Two-Factor Auth
         ↓
    [Save Preferences] ← Appears when you make changes
```

**How to Use:**
1. Toggle any preference on/off
2. Click "Save Preferences" button (appears automatically)
3. See success message
4. Preferences saved to account

**What Each Does:**
- **Email Notifications**: Receive email updates from app
- **Location Sharing**: Allow authorities to access your location
- **Public Profile**: Allow others to see your profile
- **Two-Factor Auth**: Extra security for login (when implemented)

---

### Right Column (Sidebar)

#### 4️⃣ Account Info
```
Email: user@example.com
User ID: abc123def456
Status: Active ✓
```

Shows your account details (read-only).

---

#### 5️⃣ Account Actions
```
[Sign Out] ← Logout from app
[Delete Account] ← Permanent deletion (⚠️ red button)
```

**Sign Out:**
- Logs you out
- Redirects to home page
- Can sign back in anytime

**Delete Account:**
- ⚠️ **WARNING: PERMANENT - Cannot be undone**
- Deletes profile, check-ins, reports, digital IDs
- Opens confirmation modal with safety steps

---

#### 6️⃣ Security Tips
```
💡 Helpful reminders:
  • Use a strong, unique password
  • Enable two-factor authentication
  • Review your settings regularly
  • Never share your password
```

---

## 🚨 Account Deletion Step-by-Step

**This is permanent and cannot be undone!**

### Step 1: Click Delete Account
```
[Delete Account] button (red) → Opens modal
```

### Step 2: Read Warning
```
Modal shows:
"This action is permanent and cannot be undone. 
All your data including profile, check-ins, 
reports, and digital ID will be deleted."
```

### Step 3: Type Confirmation
```
Type "DELETE" in text field:
[Type DELETE]
```

### Step 4: Confirm Delete
```
[Cancel]  [Delete Account] ← Only enabled when "DELETE" typed
```

### Step 5: Account Deleted
```
✓ Success message
Redirect to home page
Account no longer accessible
```

---

## ✅ Common Tasks

### Task: Update My Profile Name
```
1. Click "Edit" in Profile Information
2. Clear Full Name field
3. Type new name
4. Click "Save Changes"
5. See "✓ Profile updated successfully!"
```

### Task: Change My Password
```
1. Click "Change Password" in Security
2. Enter new password (minimum 6 chars)
3. Re-enter same password in Confirm field
4. Click "Update Password"
5. See "✓ Password changed successfully!"
6. Test new password on next login
```

### Task: Turn Off Email Notifications
```
1. Find "Email Notifications" toggle
2. Click button to turn [Off]
3. "Save Preferences" button appears
4. Click "Save Preferences"
5. See "✓ Settings saved successfully!"
```

### Task: Update Document Information
```
1. Click "Edit" in Profile Information
2. Select User Type (Indian/Foreigner)
3. Document Type updates based on selection
4. Enter Document Number
5. Click "Save Changes"
6. Verify data updated
```

### Task: Log Out
```
1. Scroll to Account Actions (right sidebar)
2. Click "Sign Out" button
3. Redirected to home page
4. Sign back in when ready
```

---

## 🔍 Troubleshooting

### ❌ "Profile updated successfully" not appearing
**Solution:** Check internet connection. Try again after a few seconds.

### ❌ Password change shows error
**Solution:** 
- New password must be at least 6 characters
- Passwords must match in both fields
- New password should be different from old one

### ❌ "Type DELETE" button won't activate
**Solution:** 
- Must type exactly "DELETE" (uppercase, exact spelling)
- Check for extra spaces
- Copy-paste might add hidden characters

### ❌ Delete account spinner keeps spinning
**Solution:** 
- Check internet connection
- Check if you have permission to delete
- Try refreshing page and attempting again

### ❌ Settings not saving when I click Save
**Solution:** 
- Click the actual "Save Preferences" button (it appears when you make changes)
- Just toggling is not enough - must click Save

---

## 💡 Pro Tips

### Password Security
- Use mix of letters, numbers, symbols
- Don't use dictionary words
- Don't share your password
- Change occasionally (every 3-6 months)

### Profile Information
- Keep document information accurate
- Update if you change documents
- Used for verification in reports

### Preferences
- Location Sharing: Keep on for emergency features
- Email Notifications: Turn off to reduce emails
- Public Profile: Off for privacy, on for community features

### Backup Important Info
- Save your User ID somewhere safe
- Keep copy of document numbers
- Note your email address

---

## 🔐 Privacy & Security

**Your data is:**
- ✓ Encrypted in transit (HTTPS)
- ✓ Secure in Firebase Firestore
- ✓ Protected by user authentication
- ✓ Only accessible by you

**Deleting your account:**
- Removes all personal data
- Removes all activity history
- Cannot be recovered
- Takes effect immediately

---

## 📱 Mobile Version

Settings page is fully responsive on mobile:
- Sections stack vertically
- Full-width buttons and inputs
- Account actions in sidebar
- Optimized spacing for small screens

**Same features on all devices:**
- Desktop, Tablet, Mobile
- No feature limitations
- Same security level

---

## 🆘 Need Help?

### For Profile Issues:
- Verify all required fields filled
- Check age is between 18-120
- Ensure document type matches user type

### For Password Issues:
- Verify 6+ character password
- Confirm passwords match exactly
- Check CAPS LOCK is off

### For Preference Issues:
- Click "Save Preferences" button after toggling
- Don't just toggle without saving
- Check success message appears

### For Deletion Issues:
- Type "DELETE" exactly as shown
- Check confirmation field is correct
- Verify internet connection

---

## 📊 Settings Data Structure

```typescript
User Settings:
{
  emailNotifications: boolean,
  locationSharing: boolean,
  publicProfile: boolean,
  twoFactorAuth: boolean,
  updatedAt: timestamp
}

User Profile:
{
  fullName: string,
  age: number,
  userType: "Indian" | "Foreigner",
  documentType: string,
  documentNumber: string,
  email: string (from Auth),
  uid: string (from Auth)
}
```

---

## ✨ Recent Updates

**Latest Features Added:**
- ✅ Profile editing with smart validation
- ✅ Password change with confirmation
- ✅ Preference toggles with persistence
- ✅ Account deletion with safety modal
- ✅ Success/error feedback messages
- ✅ Responsive mobile design
- ✅ Full Firebase integration

**Status:** Production Ready ✅

---

## 📞 Quick Reference

| Action | Time | Reversible? |
|--------|------|-----------|
| Edit Profile | 2 min | ✅ Yes (click Edit again) |
| Change Password | 1 min | ✅ Yes (change again) |
| Update Preferences | 1 min | ✅ Yes (toggle and save again) |
| Sign Out | 10 sec | ✅ Yes (sign back in) |
| Delete Account | 30 sec | ❌ NO - PERMANENT |

---

## 🎓 Learning Path

**New to Settings?**
1. Read this Quick Start (5 minutes)
2. Explore profile section
3. Try toggling a preference
4. Test password change
5. Practice signing out and back in

**Ready for Advanced?**
- Read SETTINGS_PAGE_ENHANCEMENT.md for technical details
- Review Firebase integration
- Explore security implementation

---

**Last Updated:** 2024  
**Status:** ✅ Complete  
**Version:** 1.0
