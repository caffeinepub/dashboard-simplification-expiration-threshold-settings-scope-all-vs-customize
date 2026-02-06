/**
 * Normalizes unknown error values into user-friendly English messages.
 * Preserves backend error text (e.g., trap messages) when available.
 */
export function normalizeErrorMessage(error: unknown): string {
  // Handle Error objects
  if (error instanceof Error) {
    return error.message;
  }

  // Handle string errors
  if (typeof error === 'string') {
    return error;
  }

  // Handle objects with message property
  if (error && typeof error === 'object' && 'message' in error) {
    const msg = (error as { message: unknown }).message;
    if (typeof msg === 'string') {
      return msg;
    }
  }

  // Handle agent errors (IC-specific)
  if (error && typeof error === 'object' && 'error_description' in error) {
    const desc = (error as { error_description: unknown }).error_description;
    if (typeof desc === 'string') {
      return desc;
    }
  }

  // Fallback for unknown error types
  return 'An unexpected error occurred. Please try again.';
}
