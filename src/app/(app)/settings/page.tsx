'use client';

import { useEffect, useState } from 'react';
import {
  AlertCircle,
  Bell,
  Lock,
  Eye,
  User,
  Briefcase,
  FileText,
  LogOut,
  Trash2,
  Save,
  Edit2,
  X,
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import {
  onAuthChange,
  getProfile,
  saveProfile,
  signOut,
  deleteUserAccount,
  updateUserPassword,
  updateUserEmail,
  saveUserSettings,
  getUserSettings,
} from '@/lib/firebaseClient';

type Settings = {
  emailNotifications: boolean;
  locationSharing: boolean;
  publicProfile: boolean;
  twoFactorAuth: boolean;
};

type EditingProfile = {
  fullName: string;
  age: number;
  userType: string;
  documentType: string;
  documentNumber: string;
};

export default function SettingsPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState<string | null>(null);
  const [messageType, setMessageType] = useState<'success' | 'error'>('success');

  // Settings state
  const [settings, setSettings] = useState<Settings>({
    emailNotifications: true,
    locationSharing: true,
    publicProfile: false,
    twoFactorAuth: false,
  });
  const [settingsChanged, setSettingsChanged] = useState(false);

  // Edit profile state
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [editingProfile, setEditingProfile] = useState<EditingProfile>({
    fullName: '',
    age: 0,
    userType: '',
    documentType: '',
    documentNumber: '',
  });
  const [isSavingProfile, setIsSavingProfile] = useState(false);

  // Edit password state
  const [isEditingPassword, setIsEditingPassword] = useState(false);
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  // Delete account state
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState('');
  const [isDeletingAccount, setIsDeletingAccount] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthChange(async (u) => {
      setUser(u);
      if (u) {
        try {
          const userProfile = await getProfile(u.uid);
          if (userProfile) {
            setProfile(userProfile);
            setEditingProfile({
              fullName: userProfile.fullName || '',
              age: userProfile.age || 0,
              userType: userProfile.userType || '',
              documentType: userProfile.documentType || '',
              documentNumber: userProfile.documentNumber || '',
            });
          }

          // Load user settings
          const userSettings = await getUserSettings(u.uid);
          if (userSettings) {
            setSettings((prev) => ({
              ...prev,
              ...userSettings,
            }));
          }
        } catch (err) {
          console.error('[Settings] Error loading profile:', err);
        }
      }
      setLoading(false);
    });
    return () => {
      if (unsubscribe && typeof unsubscribe === 'function') unsubscribe();
    };
  }, []);

  // Handle settings toggle
  const handleSettingToggle = (key: keyof Settings) => {
    setSettings((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
    setSettingsChanged(true);
  };

  // Save settings
  const handleSaveSettings = async () => {
    if (!user) return;

    try {
      const success = await saveUserSettings(user.uid, settings);
      if (success) {
        setMessage('✓ Settings saved successfully!');
        setMessageType('success');
        setSettingsChanged(false);
        setTimeout(() => setMessage(null), 3000);
      } else {
        setMessage('Failed to save settings');
        setMessageType('error');
      }
    } catch (err: any) {
      console.error('[Settings] Error saving settings:', err);
      setMessage(`Error: ${err.message}`);
      setMessageType('error');
    }
  };

  // Save profile changes
  const handleSaveProfile = async () => {
    if (!user) return;

    if (!editingProfile.fullName || !editingProfile.age) {
      setMessage('Full Name and Age are required');
      setMessageType('error');
      return;
    }

    setIsSavingProfile(true);

    try {
      const success = await saveProfile(user.uid, editingProfile);
      if (success) {
        setProfile(editingProfile);
        setIsEditingProfile(false);
        setMessage('✓ Profile updated successfully!');
        setMessageType('success');
        setTimeout(() => setMessage(null), 3000);
      } else {
        setMessage('Failed to update profile');
        setMessageType('error');
      }
    } catch (err: any) {
      console.error('[Settings] Error updating profile:', err);
      setMessage(`Error: ${err.message}`);
      setMessageType('error');
    } finally {
      setIsSavingProfile(false);
    }
  };

  // Change password
  const handleChangePassword = async () => {
    if (!passwordData.newPassword || !passwordData.confirmPassword) {
      setMessage('All password fields are required');
      setMessageType('error');
      return;
    }

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setMessage('New passwords do not match');
      setMessageType('error');
      return;
    }

    if (passwordData.newPassword.length < 6) {
      setMessage('Password must be at least 6 characters');
      setMessageType('error');
      return;
    }

    setIsChangingPassword(true);

    try {
      const success = await updateUserPassword(passwordData.newPassword);
      if (success) {
        setMessage('✓ Password changed successfully!');
        setMessageType('success');
        setIsEditingPassword(false);
        setPasswordData({
          currentPassword: '',
          newPassword: '',
          confirmPassword: '',
        });
        setTimeout(() => setMessage(null), 3000);
      } else {
        setMessage('Failed to change password');
        setMessageType('error');
      }
    } catch (err: any) {
      console.error('[Settings] Error changing password:', err);
      setMessage(`Error: ${err.message}`);
      setMessageType('error');
    } finally {
      setIsChangingPassword(false);
    }
  };

  // Delete account
  const handleDeleteAccount = async () => {
    if (deleteConfirmText !== 'DELETE') {
      setMessage('Please type DELETE to confirm');
      setMessageType('error');
      return;
    }

    if (!user) return;

    setIsDeletingAccount(true);

    try {
      // Delete user data from Firestore
      const success = await deleteUserAccount(user.uid);

      if (success) {
        // Sign out user
        await signOut();

        setMessage('Account deleted successfully');
        setMessageType('success');

        // Redirect to home after a short delay
        setTimeout(() => {
          router.push('/');
        }, 2000);
      } else {
        setMessage('Failed to delete account');
        setMessageType('error');
      }
    } catch (err: any) {
      console.error('[Settings] Error deleting account:', err);
      setMessage(`Error: ${err.message}`);
      setMessageType('error');
    } finally {
      setIsDeletingAccount(false);
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut();
      router.push('/');
    } catch (error: any) {
      console.error('[Settings] Sign out error:', error);
      setMessage(`Error: ${error.message}`);
      setMessageType('error');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="animate-pulse space-y-4 w-full max-w-4xl">
          <div className="h-8 bg-surface-secondary rounded w-1/3"></div>
          <div className="space-y-3">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-16 bg-surface-secondary rounded-lg"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="w-full max-w-2xl">
          <div className="mb-8 text-center">
            <h1 className="text-headline text-white mb-2">Settings</h1>
            <p className="text-subtitle text-text-secondary">Manage your account and preferences</p>
          </div>
          <div className="card-base p-8 text-center border border-accent-blue/30 bg-gradient-to-br from-accent-blue/10 to-transparent">
            <AlertCircle className="w-16 h-16 mx-auto mb-4 text-accent-blue" />
            <p className="text-lg font-semibold text-white mb-2">Sign in to manage settings</p>
            <p className="text-sm text-text-secondary">Please sign in to access your settings.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 py-12">
      <div className="w-full max-w-4xl">
        <div className="mb-8 text-center">
          <h1 className="text-headline text-white mb-2">Settings</h1>
          <p className="text-subtitle text-text-secondary">Manage your account and preferences</p>
        </div>

        {message && (
          <div
            className={`mb-6 p-4 rounded-lg flex items-center justify-between border animate-fadeIn ${
              messageType === 'success'
                ? 'bg-accent-green/10 text-accent-green border-accent-green/30'
                : 'bg-accent-red/10 text-accent-red border-accent-red/30'
            }`}
          >
            <div className="flex items-center gap-3">
              {messageType === 'success' ? (
                <span className="text-xl">✓</span>
              ) : (
                <AlertCircle size={20} />
              )}
              {message}
            </div>
            <button
              onClick={() => setMessage(null)}
              className="hover:opacity-70 transition"
            >
              <X size={18} />
            </button>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* LEFT COLUMN - PROFILE SETTINGS */}
          <div className="lg:col-span-2 space-y-6">
            {/* EDIT PROFILE SECTION */}
            <div className="card-base p-6 border border-surface-secondary/50">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                  <User size={20} className="text-accent-blue" />
                  Profile Information
                </h2>
                {!isEditingProfile && (
                  <button
                    onClick={() => setIsEditingProfile(true)}
                    className="flex items-center gap-2 px-4 py-2 bg-accent-blue/20 text-accent-blue rounded-lg hover:bg-accent-blue/30 transition"
                  >
                    <Edit2 size={16} />
                    Edit
                  </button>
                )}
              </div>

              {isEditingProfile ? (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold text-white mb-2">
                      Full Name <span className="text-accent-red">*</span>
                    </label>
                    <input
                      type="text"
                      value={editingProfile.fullName}
                      onChange={(e) =>
                        setEditingProfile({
                          ...editingProfile,
                          fullName: e.target.value,
                        })
                      }
                      className="input-base w-full"
                      placeholder="Your full name"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-white mb-2">
                        Age <span className="text-accent-red">*</span>
                      </label>
                      <input
                        type="number"
                        value={editingProfile.age || ''}
                        onChange={(e) =>
                          setEditingProfile({
                            ...editingProfile,
                            age: parseInt(e.target.value) || 0,
                          })
                        }
                        min="18"
                        max="120"
                        className="input-base w-full"
                        placeholder="Your age"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-white mb-2">
                        User Type
                      </label>
                      <select
                        value={editingProfile.userType || ''}
                        onChange={(e) =>
                          setEditingProfile({
                            ...editingProfile,
                            userType: e.target.value,
                          })
                        }
                        className="input-base w-full"
                      >
                        <option value="">Select type...</option>
                        <option value="Indian">Indian Citizen</option>
                        <option value="Foreigner">Foreigner</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-white mb-2">
                        Document Type
                      </label>
                      <select
                        value={editingProfile.documentType || ''}
                        onChange={(e) =>
                          setEditingProfile({
                            ...editingProfile,
                            documentType: e.target.value,
                          })
                        }
                        className="input-base w-full"
                      >
                        <option value="">Select document...</option>
                        {editingProfile.userType === 'Indian' ? (
                          <option value="Aadhar">Aadhar Card</option>
                        ) : editingProfile.userType === 'Foreigner' ? (
                          <>
                            <option value="Passport">Passport</option>
                            <option value="Visa">Visa</option>
                          </>
                        ) : null}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-white mb-2">
                        Document Number
                      </label>
                      <input
                        type="text"
                        value={editingProfile.documentNumber || ''}
                        onChange={(e) =>
                          setEditingProfile({
                            ...editingProfile,
                            documentNumber: e.target.value,
                          })
                        }
                        className="input-base w-full"
                        placeholder="Your document number"
                      />
                    </div>
                  </div>

                  <div className="pt-4 flex gap-3">
                    <button
                      onClick={handleSaveProfile}
                      disabled={isSavingProfile}
                      className="btn-primary flex-1 flex items-center justify-center gap-2"
                    >
                      <Save size={18} />
                      {isSavingProfile ? 'Saving...' : 'Save Changes'}
                    </button>
                    <button
                      onClick={() => setIsEditingProfile(false)}
                      className="btn-secondary flex-1"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="pb-3 border-b border-surface-secondary/30">
                    <p className="text-xs text-text-secondary mb-1">Full Name</p>
                    <p className="text-white font-semibold">{profile?.fullName || '—'}</p>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-xs text-text-secondary mb-1">Age</p>
                      <p className="text-white font-semibold">{profile?.age || '—'}</p>
                    </div>
                    <div>
                      <p className="text-xs text-text-secondary mb-1">User Type</p>
                      <p className="text-white font-semibold">{profile?.userType || '—'}</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-xs text-text-secondary mb-1">Document Type</p>
                      <p className="text-white font-semibold">{profile?.documentType || '—'}</p>
                    </div>
                    <div>
                      <p className="text-xs text-text-secondary mb-1">Document Number</p>
                      <p className="text-white font-semibold">{profile?.documentNumber || '—'}</p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* CHANGE PASSWORD SECTION */}
            <div className="card-base p-6 border border-surface-secondary/50">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                  <Lock size={20} className="text-accent-purple" />
                  Security
                </h2>
                {!isEditingPassword && (
                  <button
                    onClick={() => setIsEditingPassword(true)}
                    className="flex items-center gap-2 px-4 py-2 bg-accent-purple/20 text-accent-purple rounded-lg hover:bg-accent-purple/30 transition"
                  >
                    <Edit2 size={16} />
                    Change Password
                  </button>
                )}
              </div>

              {isEditingPassword ? (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold text-white mb-2">
                      New Password <span className="text-accent-red">*</span>
                    </label>
                    <input
                      type="password"
                      value={passwordData.newPassword}
                      onChange={(e) =>
                        setPasswordData({
                          ...passwordData,
                          newPassword: e.target.value,
                        })
                      }
                      className="input-base w-full"
                      placeholder="Enter new password"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-white mb-2">
                      Confirm Password <span className="text-accent-red">*</span>
                    </label>
                    <input
                      type="password"
                      value={passwordData.confirmPassword}
                      onChange={(e) =>
                        setPasswordData({
                          ...passwordData,
                          confirmPassword: e.target.value,
                        })
                      }
                      className="input-base w-full"
                      placeholder="Confirm new password"
                    />
                  </div>

                  <p className="text-xs text-text-secondary">
                    Password must be at least 6 characters
                  </p>

                  <div className="pt-4 flex gap-3">
                    <button
                      onClick={handleChangePassword}
                      disabled={isChangingPassword}
                      className="btn-primary flex-1"
                    >
                      {isChangingPassword ? 'Updating...' : 'Update Password'}
                    </button>
                    <button
                      onClick={() => {
                        setIsEditingPassword(false);
                        setPasswordData({
                          currentPassword: '',
                          newPassword: '',
                          confirmPassword: '',
                        });
                      }}
                      className="btn-secondary flex-1"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  <div>
                    <p className="text-sm text-text-secondary mb-2">
                      Keep your account secure by using a strong password
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* PREFERENCES SECTION */}
            <div className="card-base p-6 border border-surface-secondary/50">
              <h2 className="text-lg font-semibold text-white mb-6 flex items-center gap-2">
                <Bell size={20} className="text-accent-green" />
                Preferences
              </h2>

              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-surface-secondary/20 rounded-lg">
                  <div className="flex items-center gap-3">
                    <Bell size={20} className="text-accent-blue" />
                    <div>
                      <h3 className="font-semibold text-white">Email Notifications</h3>
                      <p className="text-sm text-text-secondary">Receive updates via email</p>
                    </div>
                  </div>
                  <button
                    onClick={() => handleSettingToggle('emailNotifications')}
                    className={`px-4 py-2 rounded-lg font-medium transition ${
                      settings.emailNotifications
                        ? 'bg-accent-green/20 text-accent-green'
                        : 'bg-surface-secondary text-text-secondary'
                    }`}
                  >
                    {settings.emailNotifications ? 'On' : 'Off'}
                  </button>
                </div>

                <div className="flex items-center justify-between p-4 bg-surface-secondary/20 rounded-lg">
                  <div className="flex items-center gap-3">
                    <Eye size={20} className="text-accent-purple" />
                    <div>
                      <h3 className="font-semibold text-white">Location Sharing</h3>
                      <p className="text-sm text-text-secondary">Share location with authorities</p>
                    </div>
                  </div>
                  <button
                    onClick={() => handleSettingToggle('locationSharing')}
                    className={`px-4 py-2 rounded-lg font-medium transition ${
                      settings.locationSharing
                        ? 'bg-accent-green/20 text-accent-green'
                        : 'bg-surface-secondary text-text-secondary'
                    }`}
                  >
                    {settings.locationSharing ? 'On' : 'Off'}
                  </button>
                </div>

                <div className="flex items-center justify-between p-4 bg-surface-secondary/20 rounded-lg">
                  <div className="flex items-center gap-3">
                    <Eye size={20} className="text-accent-orange" />
                    <div>
                      <h3 className="font-semibold text-white">Public Profile</h3>
                      <p className="text-sm text-text-secondary">Make your profile visible</p>
                    </div>
                  </div>
                  <button
                    onClick={() => handleSettingToggle('publicProfile')}
                    className={`px-4 py-2 rounded-lg font-medium transition ${
                      settings.publicProfile
                        ? 'bg-accent-green/20 text-accent-green'
                        : 'bg-surface-secondary text-text-secondary'
                    }`}
                  >
                    {settings.publicProfile ? 'On' : 'Off'}
                  </button>
                </div>

                <div className="flex items-center justify-between p-4 bg-surface-secondary/20 rounded-lg">
                  <div className="flex items-center gap-3">
                    <Lock size={20} className="text-accent-red" />
                    <div>
                      <h3 className="font-semibold text-white">Two-Factor Auth</h3>
                      <p className="text-sm text-text-secondary">Extra security for your account</p>
                    </div>
                  </div>
                  <button
                    onClick={() => handleSettingToggle('twoFactorAuth')}
                    className={`px-4 py-2 rounded-lg font-medium transition ${
                      settings.twoFactorAuth
                        ? 'bg-accent-green/20 text-accent-green'
                        : 'bg-surface-secondary text-text-secondary'
                    }`}
                  >
                    {settings.twoFactorAuth ? 'On' : 'Off'}
                  </button>
                </div>
              </div>

              {settingsChanged && (
                <div className="mt-6 flex gap-3">
                  <button
                    onClick={handleSaveSettings}
                    className="btn-primary flex-1 flex items-center justify-center gap-2"
                  >
                    <Save size={18} />
                    Save Preferences
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* RIGHT COLUMN - ACCOUNT ACTIONS */}
          <div className="space-y-4">
            {/* ACCOUNT INFO CARD */}
            <div className="card-base p-6 border border-surface-secondary/50">
              <h3 className="text-lg font-semibold text-white mb-4">Account Info</h3>
              <div className="space-y-4 text-sm">
                <div>
                  <p className="text-text-secondary mb-1">Email</p>
                  <p className="text-white break-all">{user?.email}</p>
                </div>
                <div>
                  <p className="text-text-secondary mb-1">User ID</p>
                  <p className="text-white break-all font-mono text-xs">{user?.uid}</p>
                </div>
                <div>
                  <p className="text-text-secondary mb-1">Account Status</p>
                  <p className="text-accent-green">Active</p>
                </div>
              </div>
            </div>

            {/* ACTIONS CARD */}
            <div className="card-base p-6 border border-surface-secondary/50 space-y-3">
              <button
                onClick={handleSignOut}
                className="w-full btn-secondary flex items-center justify-center gap-2"
              >
                <LogOut size={18} />
                Sign Out
              </button>

              <button
                onClick={() => setShowDeleteConfirm(true)}
                className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-accent-red/20 text-accent-red rounded-lg hover:bg-accent-red/30 transition"
              >
                <Trash2 size={18} />
                Delete Account
              </button>
            </div>

            {/* SECURITY INFO CARD */}
            <div className="card-base p-6 border border-accent-purple/30 bg-gradient-to-br from-accent-purple/10 to-transparent">
              <h3 className="text-sm font-semibold text-accent-purple mb-3 flex items-center gap-2">
                <Lock size={16} />
                Security Tips
              </h3>
              <ul className="text-xs text-text-secondary space-y-2">
                <li>• Use a strong, unique password</li>
                <li>• Enable two-factor authentication</li>
                <li>• Review your settings regularly</li>
                <li>• Never share your password</li>
              </ul>
            </div>
          </div>
        </div>

        {/* DELETE ACCOUNT MODAL */}
        {showDeleteConfirm && (
          <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50">
            <div className="card-base p-8 max-w-md border border-accent-red/30 bg-gradient-to-br from-accent-red/10 to-surface-primary">
              <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <AlertCircle size={20} className="text-accent-red" />
                Delete Account
              </h2>

              <p className="text-text-secondary mb-6">
                This action is permanent and cannot be undone. All your data including profile,
                check-ins, reports, and digital ID will be deleted.
              </p>

              <div className="mb-6">
                <p className="text-sm text-text-secondary mb-2">
                  Type <span className="font-semibold text-white">DELETE</span> to confirm:
                </p>
                <input
                  type="text"
                  value={deleteConfirmText}
                  onChange={(e) => setDeleteConfirmText(e.target.value)}
                  placeholder="Type DELETE"
                  className="input-base w-full"
                />
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setShowDeleteConfirm(false);
                    setDeleteConfirmText('');
                  }}
                  className="btn-secondary flex-1"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeleteAccount}
                  disabled={isDeletingAccount || deleteConfirmText !== 'DELETE'}
                  className="flex-1 px-4 py-2 bg-accent-red/20 text-accent-red rounded-lg hover:bg-accent-red/30 transition disabled:opacity-50 disabled:cursor-not-allowed font-medium"
                >
                  {isDeletingAccount ? 'Deleting...' : 'Delete Account'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
