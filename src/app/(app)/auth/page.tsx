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
   * Validates that signup form fields are consistent.
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
        setMessage(`✓ Account created successfully! Welcome, ${newUser.email || newUser.uid}`);

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
    <div className="p-8 max-w-2xl mx-auto">
      <h1 className="text-4xl font-bold mb-8">Authentication</h1>

      <div className="space-y-6">
        {/* SIGNED-IN CARD: Show when user is authenticated */}
        {user ? (
          <div className="p-6 bg-green-900 bg-opacity-20 rounded-3xl border border-green-700">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm text-green-400 mb-2 font-medium">✓ You are signed in</div>
                <div className="font-mono text-lg font-semibold">
                  {(user && user.email) || user?.uid}
                </div>
                {user?.displayName && (
                  <div className="text-sm text-green-300 mt-1">
                    Name: {user.displayName}
                  </div>
                )}
              </div>
              <div className="flex flex-col items-end gap-3">
                <div className="flex gap-3">
                  <button
                    onClick={handleGenerateDigitalId}
                    disabled={generatingId}
                    className="px-4 py-2 bg-blue-600 text-white rounded-full font-medium hover:bg-blue-700 disabled:opacity-50 transition"
                  >
                    {generatingId ? 'Generating...' : 'Generate Digital ID'}
                  </button>

                  <button
                    onClick={handleSignOut}
                    disabled={loading}
                    className="px-6 py-2 bg-red-600 text-white rounded-full font-medium hover:bg-red-700 disabled:opacity-50 transition"
                  >
                    {loading ? 'Signing out...' : 'Sign Out'}
                  </button>
                </div>

                {qrDataUrl && (
                  <div className="mt-4 w-40 text-right">
                    <img src={qrDataUrl} alt="Digital ID QR" className="w-40 h-40 object-contain rounded-lg border border-gray-700 bg-white p-1" />
                    <div className="text-xs text-gray-400 break-words mt-2">{generatedId}</div>
                  </div>
                )}
              </div>
            </div>
          </div>
        ) : null}

        {/* MODE TOGGLE: Hidden when user is signed in */}
        {!user ? (
          <div className="flex items-center gap-3 border-b border-gray-800 pb-6">
            <button
              onClick={() => {
                setMode('signin');
                setMessage(null);
              }}
              className={`px-6 py-2 rounded-full font-medium transition ${
                mode === 'signin'
                  ? 'bg-white text-black'
                  : 'bg-gray-900 text-gray-300 hover:text-white hover:bg-gray-800'
              }`}
            >
              Sign In
            </button>
            <button
              onClick={() => {
                setMode('signup');
                setMessage(null);
              }}
              className={`px-6 py-2 rounded-full font-medium transition ${
                mode === 'signup'
                  ? 'bg-white text-black'
                  : 'bg-gray-900 text-gray-300 hover:text-white hover:bg-gray-800'
              }`}
            >
              Sign Up
            </button>
          </div>
        ) : null}

        {/* AUTH FORM: Provider buttons and email/password form (hidden when signed in) */}
        {!user ? (
          <div className="bg-gray-950 p-8 rounded-3xl border border-gray-800">
            {/* PROVIDER BUTTONS */}
            <div className="mb-6 flex flex-col gap-3">
              <button
                type="button"
                onClick={() => handleProviderSignIn('google')}
                disabled={loading}
                className="w-full h-12 flex items-center justify-center gap-3 rounded-full bg-white text-black font-semibold hover:bg-gray-100 disabled:opacity-50 transition"
              >
                <GoogleIcon />
                {loading ? 'Please wait...' : 'Continue with Google'}
              </button>
              <button
                type="button"
                onClick={() => handleProviderSignIn('github')}
                disabled={loading}
                className="w-full h-12 flex items-center justify-center gap-3 rounded-full bg-gray-800 text-white border border-gray-700 font-semibold hover:bg-gray-700 disabled:opacity-50 transition"
              >
                <GitHubIcon />
                {loading ? 'Please wait...' : 'Continue with GitHub'}
              </button>
            </div>

            {/* DIVIDER */}
            <div className="relative mb-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-700"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-gray-950 text-gray-500">or</span>
              </div>
            </div>

            {/* EMAIL/PASSWORD FORM */}
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Email Input */}
              <div>
                <label className="block text-sm text-gray-400 mb-2 font-semibold">Email Address</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={loading}
                  className="w-full h-12 px-4 rounded-xl bg-gray-900 text-white border border-gray-700 focus:border-blue-500 focus:outline-none disabled:opacity-50 transition placeholder-gray-600"
                  placeholder="you@example.com"
                  required
                />
              </div>

              {/* Password Input */}
              <div>
                <label className="block text-sm text-gray-400 mb-2 font-semibold">Password</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={loading}
                  className="w-full h-12 px-4 rounded-xl bg-gray-900 text-white border border-gray-700 focus:border-blue-500 focus:outline-none disabled:opacity-50 transition placeholder-gray-600"
                  placeholder="••••••••"
                  required
                  minLength={MIN_PASSWORD_LENGTH}
                />
              </div>

              {/* Confirm Password (Signup Only) */}
              {mode === 'signup' && (
                <div>
                  <label className="block text-sm text-gray-400 mb-2 font-semibold">
                    Confirm Password
                  </label>
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    disabled={loading}
                    className="w-full h-12 px-4 rounded-xl bg-gray-900 text-white border border-gray-700 focus:border-blue-500 focus:outline-none disabled:opacity-50 transition placeholder-gray-600"
                    placeholder="••••••••"
                    required
                    minLength={MIN_PASSWORD_LENGTH}
                  />
                </div>
              )}

              {/* Submit Button */}
              <div className="pt-2">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full h-12 rounded-full bg-white text-black font-semibold hover:bg-gray-100 disabled:opacity-50 transition"
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
                  className={`mt-4 text-sm p-4 rounded-2xl ${
                    message.startsWith('✓')
                      ? 'bg-green-900 bg-opacity-30 text-green-300 border border-green-700'
                      : 'bg-red-900 bg-opacity-30 text-red-300 border border-red-700'
                  }`}
                >
                  {message}
                </div>
              )}
            </form>

            {/* HELP TEXT */}
            {!message && (
              <div className="mt-6 p-4 bg-blue-900 bg-opacity-20 rounded-2xl border border-blue-700 text-sm text-blue-300">
                <p className="font-semibold mb-1">💡 Tip:</p>
                <p>
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
