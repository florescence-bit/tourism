/**
 * @file src/lib/firebaseClient.ts
 * @description Firebase client initialization and authentication/Firestore helpers.
 * This module handles:
 * - Firebase app initialization and configuration
 * - Email/password, Google, and GitHub authentication
 * - Auth state management and listeners
 * - Firestore CRUD operations for profiles and notifications
 */

import { initializeApp, getApps, getApp } from 'firebase/app';
import {
  getAuth,
  signInAnonymously,
  onAuthStateChanged,
  User,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  GoogleAuthProvider,
  GithubAuthProvider,
  signInWithPopup,
  Auth,
} from 'firebase/auth';
import { sendEmailVerification } from 'firebase/auth';
import {
  getFirestore,
  Firestore,
  doc,
  getDoc,
  setDoc,
  collection,
  addDoc,
  getDocs,
  query,
  orderBy,
  DocumentSnapshot,
} from 'firebase/firestore';

import { FIREBASE_AUTH_TIMEOUT_MS } from './constants';

/** Firebase configuration loaded from environment variables */
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || '',
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || '',
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || '',
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || '',
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || '',
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || '',
};

/** Global Firebase initialization flag */
let appInitialized = false;

/** Global Auth instance */
let auth: Auth | null = null;

/** Global Firestore instance */
let db: Firestore | null = null;

/**
 * Initializes the Firebase app with the provided configuration.
 * Safe to call multiple times; will only initialize once.
 * Catches and logs errors without throwing to allow graceful degradation.
 *
 * @throws Logs warnings to console if initialization fails
 */
export function initFirebase(): void {
  try {
    if (!appInitialized) {
      // Initialize Firebase app if not already initialized
      if (!getApps().length) {
        initializeApp(firebaseConfig);
      } else {
        getApp();
      }
      // Get Auth and Firestore instances
      auth = getAuth();
      db = getFirestore();
      appInitialized = true;
    }
  } catch (error) {
    // Log but don't throw; allow app to continue without Firebase if config is incomplete
    console.warn('[Firebase] Initialization error:', error);
  }
}

/**
 * Ensures the user is authenticated (signs in anonymously if necessary).
 * Checks current auth state; if no user, attempts anonymous sign-in.
 * Used on app load to guarantee a user context for database operations.
 *
 * @returns Promise resolving to User object, or null if auth unavailable
 */
export async function ensureAnonAuth(): Promise<User | null> {
  if (!auth) initFirebase();
  if (!auth) {
    console.warn('[Firebase] Auth not available for anonymous sign-in');
    return null;
  }

  return new Promise<User | null>((resolve) => {
    const unsubscribe = onAuthStateChanged(auth!, (user) => {
      unsubscribe();
      if (user) {
        // Already authenticated
        resolve(user);
      } else {
        // Not authenticated; attempt anonymous sign-in
        signInAnonymously(auth!)
          .then(({ user: anonUser }) => {
            console.debug('[Firebase] Anonymous sign-in successful');
            resolve(anonUser);
          })
          .catch((error) => {
            console.error('[Firebase] Anonymous sign-in failed:', error);
            resolve(null);
          });
      }
    });
  });
}

/**
 * Creates a new user account with email and password.
 * Validates that auth is initialized before attempting sign-up.
 *
 * @param email - User's email address
 * @param password - User's password (should be at least 6 characters)
 * @returns Promise resolving to the created User object
 * @throws Firebase auth errors (e.g., auth/email-already-in-use, auth/weak-password)
 */
export async function signUpWithEmail(email: string, password: string): Promise<User> {
  if (!auth) initFirebase();
  if (!auth) throw new Error('[Firebase] Auth not initialized');

  try {
    console.debug('[Firebase] Signing up with email:', email);
    const { user } = await createUserWithEmailAndPassword(auth, email, password);
    return user;
  } catch (error: any) {
    console.error('[Firebase] Sign-up error:', error);
    throw error;
  }
}

/**
 * Initiates Google OAuth sign-in flow.
 * Opens a popup for the user to authenticate with their Google account.
 * Requires Google provider to be enabled in Firebase Console.
 *
 * @returns Promise resolving to the authenticated User object
 * @throws Firebase auth errors (e.g., auth/popup-blocked, auth/operation-not-allowed)
 */
export async function signInWithGoogle(): Promise<User> {
  if (!auth) initFirebase();
  if (!auth) throw new Error('[Firebase] Auth not initialized');

  try {
    console.debug('[Firebase] Starting Google sign-in');
    const provider = new GoogleAuthProvider();
    const { user } = await signInWithPopup(auth, provider);
    console.debug('[Firebase] Google sign-in successful');
    return user;
  } catch (error: any) {
    console.error('[Firebase] Google sign-in error:', error);
    throw error;
  }
}

/**
 * Initiates GitHub OAuth sign-in flow.
 * Opens a popup for the user to authenticate with their GitHub account.
 * Requires GitHub provider to be enabled in Firebase Console with OAuth App credentials.
 *
 * @returns Promise resolving to the authenticated User object
 * @throws Firebase auth errors (e.g., auth/popup-blocked, auth/operation-not-allowed)
 */
export async function signInWithGithub(): Promise<User> {
  if (!auth) initFirebase();
  if (!auth) throw new Error('[Firebase] Auth not initialized');

  try {
    console.debug('[Firebase] Starting GitHub sign-in');
    const provider = new GithubAuthProvider();
    const { user } = await signInWithPopup(auth, provider);
    console.debug('[Firebase] GitHub sign-in successful');
    return user;
  } catch (error: any) {
    console.error('[Firebase] GitHub sign-in error:', error);
    throw error;
  }
}

/**
 * Signs in with email and password.
 * Validates that auth is initialized before attempting sign-in.
 *
 * @param email - User's email address
 * @param password - User's password
 * @returns Promise resolving to the authenticated User object
 * @throws Firebase auth errors (e.g., auth/user-not-found, auth/wrong-password)
 */
export async function signInWithEmail(email: string, password: string): Promise<User> {
  if (!auth) initFirebase();
  if (!auth) throw new Error('[Firebase] Auth not initialized');

  try {
    console.debug('[Firebase] Signing in with email:', email);
    const { user } = await signInWithEmailAndPassword(auth, email, password);
    return user;
  } catch (error: any) {
    console.error('[Firebase] Sign-in error:', error);
    throw error;
  }
}

/**
 * Signs out the currently authenticated user.
 * Clears the user session and auth token.
 *
 * @returns Promise resolving to true if sign-out successful, false otherwise
 */
export async function signOut(): Promise<boolean> {
  if (!auth) initFirebase();
  if (!auth) {
    console.warn('[Firebase] Auth not initialized for sign-out');
    return false;
  }

  try {
    console.debug('[Firebase] Signing out');
    await firebaseSignOut(auth);
    return true;
  } catch (error: any) {
    console.error('[Firebase] Sign-out error:', error);
    return false;
  }
}

/**
 * Subscribes to auth state changes and calls the callback whenever auth state changes.
 * Used to reactively update UI when user signs in/out.
 *
 * @param callback - Function to call with the current User or null
 * @returns Unsubscribe function; call to stop listening for changes
 *
 * @example
 * const unsubscribe = onAuthChange((user) => {
 *   if (user) console.log('Signed in:', user.email);
 *   else console.log('Signed out');
 * });
 * // Later:
 * unsubscribe();
 */
export function onAuthChange(callback: (user: User | null) => void): () => void {
  if (!auth) initFirebase();
  if (!auth) {
    console.warn('[Firebase] Auth not initialized for listener');
    return () => {};
  }

  return onAuthStateChanged(auth, callback);
}

/**
 * Sends a verification email to the user's email address.
 * Call this after sign-up to ask the user to verify their email.
 * Note: Requires "Email/Password" provider to be enabled in Firebase Console
 * AND the user's email provider must allow email forwarding.
 *
 * @param user - The User object to send verification email to
 * @returns Promise resolving to true if email sent successfully, false otherwise
 */
export async function sendVerificationEmail(user: User): Promise<boolean> {
  if (!user) throw new Error('[Firebase] No user provided for verification email');

  try {
    console.debug('[Firebase] Sending verification email to:', user.email);
    await sendEmailVerification(user);
    return true;
  } catch (error: any) {
    console.error('[Firebase] Verification email send error:', error);
    return false;
  }
}

/**
 * Retrieves the user profile document from Firestore.
 * Profiles are stored at /profiles/{uid}.
 *
 * @param uid - The user's UID
 * @returns Promise resolving to profile data object, or null if not found or error occurs
 */
export async function getProfile(uid: string): Promise<Record<string, any> | null> {
  if (!db) initFirebase();
  if (!db) {
    console.warn('[Firebase] Firestore not available for getProfile');
    return null;
  }

  try {
    const ref = doc(db, 'profiles', uid);
    const snap: DocumentSnapshot = await getDoc(ref);
    return snap.exists() ? snap.data() : null;
  } catch (error: any) {
    console.error('[Firebase] getProfile error:', error);
    return null;
  }
}

/**
 * Saves or updates a user profile document in Firestore.
 * Uses merge: true to preserve existing fields not in the update payload.
 * Profiles are stored at /profiles/{uid}.
 *
 * @param uid - The user's UID
 * @param profile - Object containing profile fields to save/update
 * @returns Promise resolving to true if successful, false otherwise
 */
export async function saveProfile(uid: string, profile: Record<string, any>): Promise<boolean> {
  if (!db) initFirebase();
  if (!db) {
    console.warn('[Firebase] Firestore not available for saveProfile');
    return false;
  }

  try {
    const ref = doc(db, 'profiles', uid);
    await setDoc(ref, profile, { merge: true });
    return true;
  } catch (error: any) {
    console.error('[Firebase] saveProfile error:', error);
    return false;
  }
}

/**
 * Retrieves the user's notifications from Firestore.
 * Notifications are stored at /profiles/{uid}/notifications and ordered by recency (newest first).
 *
 * @param uid - The user's UID
 * @returns Promise resolving to array of notification documents, or empty array on error
 */
export async function listNotifications(uid: string): Promise<Array<Record<string, any>>> {
  if (!db) initFirebase();
  if (!db) {
    console.warn('[Firebase] Firestore not available for listNotifications');
    return [];
  }

  try {
    const col = collection(db, 'profiles', uid, 'notifications');
    const q = query(col, orderBy('createdAt', 'desc'));
    const snaps = await getDocs(q);
    return snaps.docs.map((d) => ({ id: d.id, ...d.data() }));
  } catch (error: any) {
    console.error('[Firebase] listNotifications error:', error);
    return [];
  }
}

/**
 * Saves a new notification to the user's notifications collection in Firestore.
 * Automatically adds a createdAt timestamp.
 * Notifications are stored at /profiles/{uid}/notifications.
 *
 * @param uid - The user's UID
 * @param payload - Object containing notification data (title, message, etc.)
 * @returns Promise resolving to true if successful, false otherwise
 */
export async function saveNotification(uid: string, payload: Record<string, any>): Promise<boolean> {
  if (!db) initFirebase();
  if (!db) {
    console.warn('[Firebase] Firestore not available for saveNotification');
    return false;
  }

  try {
    const col = collection(db, 'profiles', uid, 'notifications');
    await addDoc(col, { ...payload, createdAt: Date.now() });
    return true;
  } catch (error: any) {
    console.error('[Firebase] saveNotification error:', error);
    return false;
  }
}

// ============================================================================
// DEFAULT EXPORT
// ============================================================================

/**
 * Default export provides convenient access to main firebase functions.
 * Can be imported as: `import firebase from '@/lib/firebaseClient'`
 */
export default {
  initFirebase,
  ensureAnonAuth,
  getProfile,
  saveProfile,
  listNotifications,
  saveNotification,
};
