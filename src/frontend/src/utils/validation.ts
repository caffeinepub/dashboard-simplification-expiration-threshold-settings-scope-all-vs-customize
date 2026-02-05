export function validateEmail(email: string): string | null {
  if (!email || !email.trim()) {
    return 'Email is required';
  }

  const trimmed = email.trim();

  if (!trimmed.includes('@')) {
    return 'Email must contain @ symbol';
  }

  const parts = trimmed.split('@');
  if (parts.length !== 2) {
    return 'Email format is invalid';
  }

  const [localPart, domain] = parts;

  if (!localPart || !domain) {
    return 'Email format is invalid';
  }

  if (!domain.includes('.')) {
    return 'Email must include a valid domain (e.g., company.com)';
  }

  return null;
}

export function validateEmailAgainstDomain(email: string, allowedDomain: string): string | null {
  const basicError = validateEmail(email);
  if (basicError) return basicError;

  const trimmed = email.trim();
  if (!trimmed.endsWith(`@${allowedDomain}`)) {
    return `Email must end with @${allowedDomain}`;
  }

  return null;
}

export function validateAgileCode(code: string): string | null {
  if (!code || !code.trim()) {
    return null; // Optional field
  }

  const trimmed = code.trim();
  const pattern = /^S\d{6}$/;

  if (!pattern.test(trimmed)) {
    return 'AGILE code must be in format Sxxxxxx (S followed by exactly 6 digits)';
  }

  return null;
}

export function validateSemanticVersion(version: string): string | null {
  if (!version || !version.trim()) {
    return 'Version is required';
  }

  const trimmed = version.trim();

  if (!/^[\d.]+$/.test(trimmed)) {
    return 'Version must contain only numbers and dots (e.g., 1.0, 2.3.5)';
  }

  return null;
}

export function validateUrl(url: string): string | null {
  if (!url || !url.trim()) {
    return null; // Optional field
  }

  const trimmed = url.trim();

  try {
    new URL(trimmed);
    return null;
  } catch {
    return 'Please enter a valid URL (e.g., https://example.com)';
  }
}
