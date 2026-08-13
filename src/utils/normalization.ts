import { CheckType } from '../types';

export function normalizeTarget(type: CheckType | string, value: string): string {
  if (!value) return '';
  const trimmed = value.trim();

  switch (type) {
    case 'phone': {
      // Remove all characters except digits and leading +
      let digits = trimmed.replace(/[^\d+]/g, '');
      if (digits.startsWith('+')) {
        return '+' + digits.slice(1).replace(/\D/g, '');
      }
      // If 10 digits starting with 6-9, assume Indian mobile number default (+91)
      if (/^[6-9]\d{9}$/.test(digits)) {
        return `+91${digits}`;
      }
      // If 11 digits starting with 0, strip 0 and add +91
      if (/^0[6-9]\d{9}$/.test(digits)) {
        return `+91${digits.slice(1)}`;
      }
      return digits;
    }

    case 'url': {
      let url = trimmed.toLowerCase();
      // Remove protocol
      url = url.replace(/^https?:\/\//i, '');
      // Remove www.
      url = url.replace(/^www\./i, '');
      // Remove trailing slashes
      url = url.replace(/\/+$/, '');
      return url;
    }

    case 'email': {
      return trimmed.toLowerCase().replace(/\s+/g, '');
    }

    case 'upi': {
      return trimmed.toLowerCase().replace(/\s+/g, '');
    }

    case 'social':
    case 'social_media': {
      let handle = trimmed.toLowerCase().replace(/\s+/g, '');
      // Ensure handle format consistency if user provided @ or handle
      if (!handle.startsWith('@') && !handle.includes('/')) {
        handle = `@${handle}`;
      }
      return handle;
    }

    case 'text':
    case 'message':
    case 'screenshot':
    default: {
      return trimmed.toLowerCase().replace(/\s+/g, ' ');
    }
  }
}

export function extractDomainFromUrl(urlValue: string): string {
  const normalized = normalizeTarget('url', urlValue);
  const slashIndex = normalized.indexOf('/');
  return slashIndex !== -1 ? normalized.substring(0, slashIndex) : normalized;
}
