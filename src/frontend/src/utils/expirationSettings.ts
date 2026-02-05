import type { UserProfile, ExpirationThresholdMode } from '../backend';

/**
 * Frontend utility for managing expiration threshold settings.
 * Reads from user profile (backend) with localStorage fallback for legacy support.
 */

const STORAGE_KEY = 'expiringSoonThreshold';
const DEFAULT_THRESHOLD = 30;

export function getExpiringSoonThreshold(): number {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const parsed = parseInt(stored, 10);
      if (!isNaN(parsed) && parsed > 0) {
        return parsed;
      }
    }
  } catch (error) {
    console.error('Failed to read expiring-soon threshold:', error);
  }
  return DEFAULT_THRESHOLD;
}

export function setExpiringSoonThreshold(days: number): void {
  try {
    if (days > 0) {
      localStorage.setItem(STORAGE_KEY, days.toString());
    }
  } catch (error) {
    console.error('Failed to save expiring-soon threshold:', error);
  }
}

/**
 * Get the effective threshold for a specific bench based on user preferences.
 * Returns the global threshold or bench-specific override if in customize mode.
 */
export function getEffectiveThreshold(
  profile: UserProfile | null,
  benchId: string
): number {
  if (!profile) {
    return DEFAULT_THRESHOLD;
  }

  const globalThreshold = Number(profile.thresholdAllBenches);

  if (profile.expirationThresholdMode === 'allBenches') {
    return globalThreshold;
  }

  // In customize mode, check for bench-specific override
  const customThreshold = profile.thresholdCustomizedBenches.find(
    ([id]) => id === benchId
  );

  return customThreshold ? Number(customThreshold[1]) : globalThreshold;
}

/**
 * Compute expiration status based on dates and threshold.
 * Returns 'ok', 'expiringSoon', or 'expired'.
 */
export function computeExpirationStatus(
  expirationDate: string,
  threshold: number
): 'ok' | 'expiringSoon' | 'expired' {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const expDate = new Date(expirationDate);
    expDate.setHours(0, 0, 0, 0);

    if (expDate < today) {
      return 'expired';
    }

    const daysUntilExpiration = Math.ceil(
      (expDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
    );

    if (daysUntilExpiration <= threshold) {
      return 'expiringSoon';
    }

    return 'ok';
  } catch (error) {
    console.error('Failed to compute expiration status:', error);
    return 'ok';
  }
}
