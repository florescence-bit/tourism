/**
 * @file src/lib/errorMap.ts
 * @description Maps Firebase and common error codes to user-friendly messages and actions.
 * This centralizes error handling and makes it easy to update messages without touching component code.
 */

import type { FirebaseErrorInfo } from './types';

/**
 * Maps Firebase authentication error codes to user-friendly messages and hints.
 * @see https://firebase.google.com/docs/auth/admin/errors
 */
const FIREBASE_AUTH_ERROR_MAP: Record<string, Omit<FirebaseErrorInfo, 'message'>> = {
  'auth/operation-not-allowed': {
    code: 'auth/operation-not-allowed',
    userMessage: 'This sign-in method is not enabled for this project.',
    retryable: false,
    actionHint:
      'Contact admin or enable the provider in Firebase Console → Authentication → Sign-in method.',
  },
  'auth/user-not-found': {
    code: 'auth/user-not-found',
    userMessage: 'No account found with this email.',
    retryable: false,
    actionHint: 'Please check your email or create a new account.',
  },
  'auth/wrong-password': {
    code: 'auth/wrong-password',
    userMessage: 'Invalid password.',
    retryable: true,
    actionHint: 'Please try again.',
  },
  'auth/invalid-email': {
    code: 'auth/invalid-email',
    userMessage: 'Invalid email format.',
    retryable: false,
    actionHint: 'Please enter a valid email address.',
  },
  'auth/weak-password': {
    code: 'auth/weak-password',
    userMessage: 'Password is too weak.',
    retryable: false,
    actionHint: 'Use at least 6 characters.',
  },
  'auth/email-already-in-use': {
    code: 'auth/email-already-in-use',
    userMessage: 'This email is already registered.',
    retryable: false,
    actionHint: 'Try signing in instead, or use a different email.',
  },
  'auth/too-many-requests': {
    code: 'auth/too-many-requests',
    userMessage: 'Too many failed attempts. Please try again later.',
    retryable: true,
    actionHint: 'Wait a few minutes before trying again.',
  },
  'auth/popup-blocked': {
    code: 'auth/popup-blocked',
    userMessage: 'Sign-in popup was blocked by your browser.',
    retryable: true,
    actionHint: 'Check your browser popup settings and try again.',
  },
  'auth/popup-closed-by-user': {
    code: 'auth/popup-closed-by-user',
    userMessage: 'Sign-in popup was closed.',
    retryable: true,
    actionHint: 'Try again.',
  },
  'auth/network-request-failed': {
    code: 'auth/network-request-failed',
    userMessage: 'Network error. Please check your connection.',
    retryable: true,
    actionHint: 'Make sure you have internet access and try again.',
  },
  'auth/invalid-api-key': {
    code: 'auth/invalid-api-key',
    userMessage: 'Firebase configuration error.',
    retryable: false,
    actionHint: 'Contact admin to check Firebase setup.',
  },
};

/**
 * Maps data.gov.in API error codes/conditions to user-friendly messages.
 */
const DATAGOV_ERROR_MAP: Record<string, Omit<FirebaseErrorInfo, 'message'>> = {
  'missing-api-key': {
    code: 'missing-api-key',
    userMessage: 'Data provider not configured.',
    retryable: false,
    actionHint: 'Contact admin to enable analytics.',
  },
  'missing-resource-id': {
    code: 'missing-resource-id',
    userMessage: 'Analytics resource not configured.',
    retryable: false,
    actionHint: 'Contact admin to check configuration.',
  },
  'network-error': {
    code: 'network-error',
    userMessage: 'Failed to fetch analytics data.',
    retryable: true,
    actionHint: 'Check your connection and try again.',
  },
  'api-limit-exceeded': {
    code: 'api-limit-exceeded',
    userMessage: 'API rate limit exceeded.',
    retryable: true,
    actionHint: 'Please try again in a few moments.',
  },
};

/**
 * Maps geolocation API error codes to user-friendly messages.
 * @see https://developer.mozilla.org/en-US/docs/Web/API/GeolocationPositionError
 */
const GEOLOCATION_ERROR_MAP: Record<string, Omit<FirebaseErrorInfo, 'message'>> = {
  '1': {
    code: 'permission-denied',
    userMessage: 'Location permission denied.',
    retryable: false,
    actionHint:
      'Allow location access in your browser settings and refresh the page.',
  },
  '2': {
    code: 'position-unavailable',
    userMessage: 'Location not available.',
    retryable: true,
    actionHint: 'Try again or move to a location with GPS signal.',
  },
  '3': {
    code: 'timeout',
    userMessage: 'Location request timed out.',
    retryable: true,
    actionHint: 'Check your GPS and try again.',
  },
};

/**
 * Maps Firebase Firestore error codes to user-friendly messages.
 */
const FIRESTORE_ERROR_MAP: Record<string, Omit<FirebaseErrorInfo, 'message'>> = {
  'permission-denied': {
    code: 'permission-denied',
    userMessage: 'You do not have permission to access this data.',
    retryable: false,
    actionHint: 'Contact admin if you believe this is an error.',
  },
  'not-found': {
    code: 'not-found',
    userMessage: 'Data not found.',
    retryable: false,
    actionHint: 'The item you are looking for does not exist.',
  },
  'already-exists': {
    code: 'already-exists',
    userMessage: 'This item already exists.',
    retryable: false,
    actionHint: 'Try using a different name or ID.',
  },
  'failed-precondition': {
    code: 'failed-precondition',
    userMessage: 'Operation could not be completed.',
    retryable: true,
    actionHint: 'Try again in a moment.',
  },
  'unauthenticated': {
    code: 'unauthenticated',
    userMessage: 'You must be signed in to perform this action.',
    retryable: false,
    actionHint: 'Please sign in and try again.',
  },
};

/**
 * Retrieves a user-friendly error message for a given error code.
 * @param errorCode - The error code to look up
 * @param originalMessage - The original error message from the API
 * @param type - The error type/source (firebase-auth, firestore, datagov, geolocation)
 * @returns Formatted error information with user-friendly message
 */
export function getErrorMessage(
  errorCode: string,
  originalMessage: string = '',
  type: 'firebase-auth' | 'firestore' | 'datagov' | 'geolocation' = 'firebase-auth'
): FirebaseErrorInfo {
  let errorMap: Record<string, Omit<FirebaseErrorInfo, 'message'>> = {};

  switch (type) {
    case 'firebase-auth':
      errorMap = FIREBASE_AUTH_ERROR_MAP;
      break;
    case 'firestore':
      errorMap = FIRESTORE_ERROR_MAP;
      break;
    case 'datagov':
      errorMap = DATAGOV_ERROR_MAP;
      break;
    case 'geolocation':
      errorMap = GEOLOCATION_ERROR_MAP;
      break;
  }

  const mapped = errorMap[errorCode];
  if (!mapped) {
    // Fallback for unmapped errors
    return {
      code: errorCode,
      message: originalMessage || 'An unexpected error occurred.',
      userMessage: originalMessage || 'An unexpected error occurred. Please try again.',
      retryable: true,
    };
  }

  return {
    ...mapped,
    message: originalMessage,
  };
}

/**
 * Extracts Firebase error code from a Firebase error object.
 * Firebase SDK can return errors in different formats; this normalizes them.
 * @param error - The error object from Firebase
 * @returns The error code string, or null if not found
 */
export function extractFirebaseErrorCode(error: any): string | null {
  if (!error) return null;
  // Firebase AuthError has error.code property
  if (error.code) return error.code;
  // Sometimes error.message contains the code prefix
  if (typeof error.message === 'string' && error.message.includes('(')) {
    const match = error.message.match(/\((.*?)\)/);
    if (match && match[1]) return match[1];
  }
  return null;
}

/**
 * Formats an error into a displayable message with optional action hint.
 * @param error - The error object or code
 * @param type - The error source type
 * @returns Formatted message string suitable for user display
 */
export function formatErrorForDisplay(
  error: any,
  type: 'firebase-auth' | 'firestore' | 'datagov' | 'geolocation' = 'firebase-auth'
): string {
  const code = typeof error === 'string' ? error : extractFirebaseErrorCode(error);
  if (!code) {
    return typeof error === 'string' ? error : error?.message || 'An error occurred.';
  }

  const errorInfo = getErrorMessage(code, error?.message, type);
  if (errorInfo.actionHint) {
    return `${errorInfo.userMessage} ${errorInfo.actionHint}`;
  }
  return errorInfo.userMessage;
}
