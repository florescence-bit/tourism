/**
 * @file src/app/(app)/auth/page.tsx
 * @description Authentication page for sign-in, sign-up, and provider authentication.
 * Displayed with the full app layout (sidebar, header).
 * Features:
 * - Email/password sign-in and sign-up with validation
 * - Google and GitHub OAuth provider buttons
 * - Confirmation password field for sign-up
 * - Friendly error messages mapped from Firebase error codes
 * - Hides form and shows signed-in state when user is authenticated
 * - Sends verification email after successful sign-up
 */

'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  signInWithEmail,
  signUpWithEmail,
  signOut,
  onAuthChange,
  sendVerificationEmail,
  signInWithGoogle,
  signInWithGithub,
  generateAndSaveDigitalId,
  saveProfile,
} from '@/lib/firebaseClient';
import { formatErrorForDisplay, extractFirebaseErrorCode } from '@/lib/errorMap';
import { MIN_PASSWORD_LENGTH, EMAIL_REGEX } from '@/lib/constants';

/**
 * Google Icon SVG component
 */
function GoogleIcon() {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
        fill="currentColor"
      />
      <path
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
        fill="currentColor"
      />
      <path
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
        fill="currentColor"
      />
      <path
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
        fill="currentColor"
      />
    </svg>
  );
}

/**
 * GitHub Icon SVG component
 */
function GitHubIcon() {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="currentColor"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
    </svg>
  );
}

export default function AuthPage() {
  // =========================================================================
  // STATE
  // =========================================================================

  /** 'signin' or 'signup' mode toggle */
  const [mode, setMode] = useState<'signin' | 'signup'>('signin');

  /** User's email input */
  const [email, setEmail] = useState('');

  /** User's password input */
  const [password, setPassword] = useState('');

  /** Password confirmation (signup only) */
  const [confirmPassword, setConfirmPassword] = useState('');

  /** Full name (signup only) */
  const [fullName, setFullName] = useState('');

  /** Age (signup only) */
  const [age, setAge] = useState('');

  /** User type: 'indian' or 'foreigner' (signup only) */
  const [userType, setUserType] = useState<'indian' | 'foreigner' | ''>('');

  /** Document type: 'aadhar', 'visa', or 'passport' (signup only) */
  const [documentType, setDocumentType] = useState<'aadhar' | 'visa' | 'passport' | ''>('');

  /** Document number / ID (signup only) */
  const [documentNumber, setDocumentNumber] = useState('');

  /** True while request is in flight */
  const [loading, setLoading] = useState(false);

  /** Error or success message to display */
  const [message, setMessage] = useState<string | null>(null);

  /** Current authenticated Firebase User or null */
  const [user, setUser] = useState<any>(null);

  /** Generated digital ID (if created) */
  const [generatedId, setGeneratedId] = useState<string | null>(null);
  /** QR code data URL representing the digital ID */
  const [qrDataUrl, setQrDataUrl] = useState<string | null>(null);
  /** True while the digital ID is being generated */
  const [generatingId, setGeneratingId] = useState(false);

  const router = useRouter();

  // =========================================================================
  // INITIALIZATION
  // =========================================================================

  /**
   * Subscribe to auth state changes on component mount.
   * Do NOT automatically sign in anonymously — require explicit user action.
   */
  useEffect(() => {
    const unsubscribe = onAuthChange((u) => {
      setUser(u);
      setMessage(null); // Clear messages on auth state change
    });

    return () => {
      if (unsubscribe && typeof unsubscribe === 'function') {
        unsubscribe();
      }
    };
  }, []);

  // =========================================================================
  // VALIDATION HELPERS
  // =========================================================================

  /**
   * Validates email format using regex.
   * @returns true if email is valid, false otherwise
   */
  const isValidEmail = (): boolean => EMAIL_REGEX.test(email);

  /**
   * Validates password meets minimum length requirement.
   * @returns true if password is valid, false otherwise
   */
  const isValidPassword = (): boolean => password.length >= MIN_PASSWORD_LENGTH;

  /**
   * Validates that signup form fields are consistent and complete.
   * @returns true if form is valid, false otherwise
   */
  const isValidSignupForm = (): boolean => {
    if (!isValidEmail()) {
      setMessage('Please enter a valid email address.');
      return false;
    }
    if (!isValidPassword()) {
      setMessage(`Password must be at least ${MIN_PASSWORD_LENGTH} characters long.`);
      return false;
    }
    if (password !== confirmPassword) {
      setMessage('Passwords do not match.');
      return false;
    }
    if (!fullName.trim()) {
      setMessage('Please enter your full name.');
      return false;
    }
    if (!age || isNaN(parseInt(age)) || parseInt(age) < 18) {
      setMessage('Please enter a valid age (18 or older).');
      return false;
    }
    if (!userType) {
      setMessage('Please select whether you are an Indian citizen or foreigner.');
      return false;
    }
    if (!documentType) {
      setMessage('Please select a document type for verification.');
      return false;
    }
    if (!documentNumber.trim()) {
      setMessage('Please enter your document number.');
      return false;
    }
    return true;
  };

  // =========================================================================
  // FORM SUBMISSION
  // =========================================================================

  /**
   * Handles email/password sign-in or sign-up form submission.
   */
  async function handleSubmit(e: React.FormEvent): Promise<void> {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    try {
      // Validate email format
      if (!isValidEmail()) {
        throw new Error('Please enter a valid email address.');
      }

      if (mode === 'signup') {
        // Validate signup form
        if (!isValidSignupForm()) {
          setLoading(false);
          return;
        }

        // Attempt sign-up
        console.debug('[Auth] Signing up with email:', email);
        const newUser = await signUpWithEmail(email, password);
        
        // Save profile with additional details to Firestore
        const profileData = {
          email,
          fullName,
          age: parseInt(age),
          userType,
          documentType,
          documentNumber,
          displayName: fullName,
          createdAt: Date.now(),
        };
        await saveProfile(newUser.uid, profileData);
        
        setMessage(`✓ Account created successfully! Welcome, ${fullName}`);

        // Send verification email (non-blocking)
        try {
          const sent = await sendVerificationEmail(newUser);
          if (sent) {
            setMessage(
              (m) =>
                (m ? m + ' — ' : '') +
                'Verification email sent. Please check your inbox.'
            );
          }
        } catch (verifyError) {
          console.warn('[Auth] Verification email failed (non-fatal):', verifyError);
          // Continue even if email failed
        }

        // Clear form
        setEmail('');
        setPassword('');
        setConfirmPassword('');
        setFullName('');
        setAge('');
        setUserType('');
        setDocumentType('');
        setDocumentNumber('');
      } else {
        // Sign-in mode
        if (!isValidPassword()) {
          throw new Error(`Password must be at least ${MIN_PASSWORD_LENGTH} characters long.`);
        }

        console.debug('[Auth] Signing in with email:', email);
        const signedInUser = await signInWithEmail(email, password);
        setMessage(`✓ Signed in as ${signedInUser.email || signedInUser.uid}`);

        // Clear sensitive fields
        setPassword('');
        setConfirmPassword('');
      }

      // Navigate to dashboard after successful auth
      setTimeout(() => {
        router.push('/dashboard');
      }, 500);
    } catch (error: any) {
      // Map Firebase errors to user-friendly messages
      const errorCode = extractFirebaseErrorCode(error);
      const userMessage = formatErrorForDisplay(error, 'firebase-auth');
      console.error('[Auth] Form submission error:', error);
      setMessage(userMessage);
    } finally {
      setLoading(false);
    }
  }

  // =========================================================================
  // PROVIDER SIGN-IN
  // =========================================================================

  /**
   * Handles OAuth provider sign-in (Google or GitHub).
   */
  async function handleProviderSignIn(provider: 'google' | 'github'): Promise<void> {
    setLoading(true);
    setMessage(null);

    try {
      console.debug('[Auth] Starting', provider, 'sign-in');

      let signedInUser: any = null;
      if (provider === 'google') {
        signedInUser = await signInWithGoogle();
      } else if (provider === 'github') {
        signedInUser = await signInWithGithub();
      }

      if (signedInUser) {
        setMessage(`✓ Signed in with ${provider} as ${signedInUser.email || signedInUser.uid}`);
        // Navigate to dashboard
        setTimeout(() => {
          router.push('/dashboard');
        }, 500);
      }
    } catch (error: any) {
      // Map Firebase errors to user-friendly messages
      const userMessage = formatErrorForDisplay(error, 'firebase-auth');
      console.error('[Auth]', provider, 'sign-in error:', error);
      setMessage(userMessage);
    } finally {
      setLoading(false);
    }
  }

  // =========================================================================
  // SIGN OUT
  // =========================================================================

  /**
   * Handles user sign-out and redirects to home page.
   */
  async function handleSignOut(): Promise<void> {
    setLoading(true);
    try {
      console.debug('[Auth] Signing out');
      await signOut();
      setMessage('✓ Signed out successfully');
      setUser(null);
      // Redirect to home
      setTimeout(() => {
        router.push('/');
      }, 500);
    } catch (error: any) {
      console.error('[Auth] Sign-out error:', error);
      setMessage('Sign-out failed. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  // =========================================================================
  // RENDER HELPERS
  // =========================================================================

  /**
   * Generate a digital ID for the signed-in user, create a QR code and save to Firestore
   */
  async function handleGenerateDigitalId(): Promise<void> {
    if (!user) {
      setMessage('Please sign in before generating a Digital ID.');
      return;
    }

    setGeneratingId(true);
    setMessage(null);

    try {
      const displayName = user.displayName || user.email || user.uid;
      const result = await generateAndSaveDigitalId(user.uid, displayName);
      if (result) {
        setGeneratedId(result.digitalId);
        setQrDataUrl(result.qrDataUrl);
        setMessage('Digital ID generated and saved successfully.');
      } else {
        setMessage('Failed to generate Digital ID.');
      }
    } catch (error: any) {
      console.error('[Auth] generate digital id error:', error);
      setMessage('An error occurred while generating the Digital ID.');
    } finally {
      setGeneratingId(false);
    }
  }

  // =========================================================================
  // RENDER
  // =========================================================================

  return (
    <div className="p-8 md:p-12 max-w-3xl mx-auto">
      <div className="mb-12 animate-fade-in">
        <h1 className="text-headline mb-2">Authentication</h1>
        <p className="text-subtitle text-text-secondary">Sign in or create your RAH account</p>
      </div>

      <div className="space-y-8">
        {/* SIGNED-IN CARD: Show when user is authenticated */}
        {user ? (
          <div className="card-elevated bg-gradient-to-br from-accent-green/10 to-accent-green/5 border-accent-green/30 animate-slide-up">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-8">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-2 h-2 rounded-full bg-accent-green animate-pulse"></div>
                  <span className="text-sm font-semibold text-accent-green">Signed In</span>
                </div>
                <div className="font-mono text-lg font-semibold text-text-primary mb-3">
                  {(user && user.email) || user?.uid}
                </div>
                {user?.displayName && (
                  <div className="text-sm text-text-secondary">
                    Name: <span className="text-text-primary font-medium">{user.displayName}</span>
                  </div>
                )}
              </div>
              <div className="flex flex-col gap-3 w-full md:w-auto">
                <button
                  onClick={handleGenerateDigitalId}
                  disabled={generatingId}
                  className="btn-primary"
                >
                  {generatingId ? 'Generating...' : 'Generate Digital ID'}
                </button>

                <button
                  onClick={handleSignOut}
                  disabled={loading}
                  className="btn-danger"
                >
                  {loading ? 'Signing out...' : 'Sign Out'}
                </button>
              </div>
            </div>

            {qrDataUrl && (
              <div className="mt-8 pt-8 border-t border-surface-tertiary">
                <p className="text-sm font-semibold text-text-primary mb-4">Your Digital ID</p>
                <div className="flex flex-col sm:flex-row gap-6 items-start">
                  <div className="bg-white p-4 rounded-xl">
                    <img src={qrDataUrl} alt="Digital ID QR" className="w-40 h-40 object-contain" />
                  </div>
                  <div className="flex-1">
                    <p className="text-xs text-text-tertiary font-mono break-all bg-surface-secondary p-4 rounded-lg border border-surface-tertiary">
                      {generatedId}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        ) : null}

        {/* MODE TOGGLE: Hidden when user is signed in */}
        {!user ? (
          <div className="flex items-center gap-2 border-b border-surface-tertiary pb-6 animate-fade-in">
            <button
              onClick={() => {
                setMode('signin');
                setMessage(null);
              }}
              className={`px-6 py-2.5 rounded-lg font-semibold transition-all duration-200 ${
                mode === 'signin'
                  ? 'btn-primary'
                  : 'btn-secondary'
              }`}
            >
              Sign In
            </button>
            <button
              onClick={() => {
                setMode('signup');
                setMessage(null);
              }}
              className={`px-6 py-2.5 rounded-lg font-semibold transition-all duration-200 ${
                mode === 'signup'
                  ? 'btn-primary'
                  : 'btn-secondary'
              }`}
            >
              Sign Up
            </button>
          </div>
        ) : null}

        {/* AUTH FORM: Provider buttons and email/password form (hidden when signed in) */}
        {!user ? (
          <div className="card-elevated animate-slide-up">
            {/* PROVIDER BUTTONS */}
            <div className="mb-8 flex flex-col gap-3">
              <button
                type="button"
                onClick={() => handleProviderSignIn('google')}
                disabled={loading}
                className="w-full h-12 flex items-center justify-center gap-3 rounded-lg bg-white text-black font-semibold hover:bg-gray-50 active:scale-95 disabled:opacity-50 transition-all duration-200 shadow-md hover:shadow-lg"
              >
                <GoogleIcon />
                {loading ? 'Please wait...' : 'Continue with Google'}
              </button>
              <button
                type="button"
                onClick={() => handleProviderSignIn('github')}
                disabled={loading}
                className="w-full h-12 flex items-center justify-center gap-3 rounded-lg bg-surface-secondary text-text-primary border border-surface-tertiary font-semibold hover:bg-surface-tertiary active:scale-95 disabled:opacity-50 transition-all duration-200"
              >
                <GitHubIcon />
                {loading ? 'Please wait...' : 'Continue with GitHub'}
              </button>
            </div>

            {/* DIVIDER */}
            <div className="relative mb-8">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-surface-tertiary"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-3 bg-surface-secondary text-text-tertiary font-medium">or continue with email</span>
              </div>
            </div>

            {/* EMAIL/PASSWORD FORM */}
            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Email Input */}
              <div>
                <label className="label-base">Email Address</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={loading}
                  className="input-base"
                  placeholder="you@example.com"
                  required
                />
              </div>

              {/* Password Input */}
              <div>
                <label className="label-base">Password</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={loading}
                  className="input-base"
                  placeholder="••••••••"
                  required
                  minLength={MIN_PASSWORD_LENGTH}
                />
              </div>

              {/* Confirm Password (Signup Only) */}
              {mode === 'signup' && (
                <div>
                  <label className="label-base">Confirm Password</label>
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    disabled={loading}
                    className="input-base"
                    placeholder="••••••••"
                    required
                    minLength={MIN_PASSWORD_LENGTH}
                  />
                </div>
              )}

              {/* Full Name (Signup Only) */}
              {mode === 'signup' && (
                <div>
                  <label className="label-base">Full Name</label>
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    disabled={loading}
                    className="input-base"
                    placeholder="John Doe"
                    required
                  />
                </div>
              )}

              {/* Age (Signup Only) */}
              {mode === 'signup' && (
                <div>
                  <label className="label-base">Age</label>
                  <input
                    type="number"
                    value={age}
                    onChange={(e) => setAge(e.target.value)}
                    disabled={loading}
                    className="input-base"
                    placeholder="25"
                    min="18"
                    required
                  />
                </div>
              )}

              {/* User Type (Signup Only) */}
              {mode === 'signup' && (
                <div>
                  <label className="label-base">Are you an Indian citizen?</label>
                  <div className="flex gap-3">
                    <button
                      type="button"
                      onClick={() => setUserType('indian')}
                      disabled={loading}
                      className={`flex-1 h-10 rounded-lg font-medium transition-all duration-200 ${
                        userType === 'indian'
                          ? 'btn-primary'
                          : 'btn-secondary'
                      }`}
                    >
                      Yes (Indian)
                    </button>
                    <button
                      type="button"
                      onClick={() => setUserType('foreigner')}
                      disabled={loading}
                      className={`flex-1 h-10 rounded-lg font-medium transition-all duration-200 ${
                        userType === 'foreigner'
                          ? 'btn-primary'
                          : 'btn-secondary'
                      }`}
                    >
                      No (Foreigner)
                    </button>
                  </div>
                </div>
              )}

              {/* Document Type (Signup Only) */}
              {mode === 'signup' && userType && (
                <div>
                  <label className="label-base">
                    {userType === 'indian' ? 'Document Type' : 'Visa / Passport'}
                  </label>
                  <select
                    value={documentType}
                    onChange={(e) => setDocumentType(e.target.value as 'aadhar' | 'visa' | 'passport')}
                    disabled={loading}
                    className="input-base"
                    required
                  >
                    <option value="">Select a document...</option>
                    {userType === 'indian' ? (
                      <option value="aadhar">Aadhar Card</option>
                    ) : (
                      <>
                        <option value="passport">Passport</option>
                        <option value="visa">Visa</option>
                      </>
                    )}
                  </select>
                </div>
              )}

              {/* Document Number (Signup Only) */}
              {mode === 'signup' && documentType && (
                <div>
                  <label className="label-base">
                    {documentType === 'aadhar'
                      ? 'Aadhar Number'
                      : documentType === 'passport'
                        ? 'Passport Number'
                        : 'Visa Number'}
                  </label>
                  <input
                    type="text"
                    value={documentNumber}
                    onChange={(e) => setDocumentNumber(e.target.value)}
                    disabled={loading}
                    className="input-base"
                    placeholder={
                      documentType === 'aadhar'
                        ? 'XXXX XXXX XXXX'
                        : 'A1234567'
                    }
                    required
                  />
                </div>
              )}

              {/* Submit Button */}
              <div className="pt-2">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full btn-primary"
                >
                  {loading
                    ? 'Please wait...'
                    : mode === 'signin'
                      ? 'Sign In'
                      : 'Create Account'}
                </button>
              </div>

              {/* Message Display (Error or Success) */}
              {message && (
                <div
                  className={`mt-4 text-sm p-4 rounded-lg border transition-all duration-200 ${
                    message.startsWith('✓')
                      ? 'alert-success'
                      : 'alert-danger'
                  }`}
                >
                  {message}
                </div>
              )}
            </form>

            {/* HELP TEXT */}
            {!message && (
              <div className="mt-8 p-4 alert-info rounded-lg">
                <p className="font-semibold mb-1">💡 Tip:</p>
                <p className="text-sm">
                  {mode === 'signin'
                    ? 'Don\'t have an account? Click "Sign Up" to create one.'
                    : 'Already have an account? Click "Sign In" to log in.'}
                </p>
              </div>
            )}
          </div>
        ) : null}
      </div>
    </div>
  );
}
