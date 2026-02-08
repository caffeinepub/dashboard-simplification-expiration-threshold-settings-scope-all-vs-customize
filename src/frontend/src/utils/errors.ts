/**
 * Normalizes unknown error values into user-friendly messages.
 * Translates backend trap messages and IC agent errors into actionable UI text.
 */
export function normalizeErrorMessage(error: unknown): string {
  let rawMessage = '';

  // Extract the raw message from various error types
  if (error instanceof Error) {
    rawMessage = error.message;
  } else if (typeof error === 'string') {
    rawMessage = error;
  } else if (error && typeof error === 'object') {
    // Handle objects with message property
    if ('message' in error) {
      const msg = (error as { message: unknown }).message;
      if (typeof msg === 'string') {
        rawMessage = msg;
      }
    }
    // Handle IC agent errors
    if ('error_description' in error) {
      const desc = (error as { error_description: unknown }).error_description;
      if (typeof desc === 'string') {
        rawMessage = desc;
      }
    }
  }

  // Normalize common backend trap messages into user-friendly text
  if (rawMessage.includes('User does not exist')) {
    return 'Your profile is being set up. Please complete your profile information and save.';
  }

  if (rawMessage.includes('Unauthorized')) {
    return 'You do not have permission to perform this action. Please sign in or contact an administrator.';
  }

  if (rawMessage.includes('Test bench does not exist') || rawMessage.includes('Bench does not exist')) {
    return 'The requested test bench could not be found. It may have been removed.';
  }

  if (rawMessage.includes('Document does not exist')) {
    return 'The requested document could not be found. It may have been removed.';
  }

  if (rawMessage.includes('Invalid email domain')) {
    return rawMessage; // Keep the specific domain message
  }

  if (rawMessage.includes('already exists')) {
    return 'This item already exists. Please use a different identifier.';
  }

  if (rawMessage.includes('Actor not available')) {
    return 'Connection to the backend is not ready. Please wait a moment and try again.';
  }

  // Return the raw message if it's meaningful, otherwise provide a generic fallback
  if (rawMessage && rawMessage.length > 0 && rawMessage.length < 200) {
    return rawMessage;
  }

  // Fallback for unknown error types
  return 'An unexpected error occurred. Please try again.';
}
