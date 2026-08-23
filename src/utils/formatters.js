/**
 * Format an ISO timestamp or Date to a readable string
 */
export const formatDate = (timestamp, options = {}) => {
  if (!timestamp) return '';
  const date = timestamp instanceof Date ? timestamp : new Date(timestamp);
  if (isNaN(date.getTime())) return '';
  return date.toLocaleDateString('en-IN', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    ...options,
  });
};

/**
 * Format a timestamp to time string
 */
export const formatTime = (timestamp) => {
  if (!timestamp) return '';
  const date = timestamp instanceof Date ? timestamp : new Date(timestamp);
  if (isNaN(date.getTime())) return '';
  return date.toLocaleTimeString('en-IN', {
    hour: '2-digit',
    minute: '2-digit',
  });
};

/**
 * Get relative time (e.g., "2 hours ago")
 */
export const timeAgo = (timestamp) => {
  if (!timestamp) return '';
  const date = timestamp instanceof Date ? timestamp : new Date(timestamp);
  if (isNaN(date.getTime())) return '';
  const now = new Date();
  const diff = now - date;

  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);
  const weeks = Math.floor(days / 7);
  const months = Math.floor(days / 30);

  if (seconds < 60) return 'just now';
  if (minutes < 60) return `${minutes}m ago`;
  if (hours < 24) return `${hours}h ago`;
  if (days < 7) return `${days}d ago`;
  if (weeks < 4) return `${weeks}w ago`;
  if (months < 12) return `${months}mo ago`;
  return formatDate(timestamp);
};

/**
 * Get initials from a name
 */
export const getInitials = (name) => {
  if (!name) return '?';
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
};

/**
 * Truncate text to a max length
 */
export const truncate = (text, maxLength = 100) => {
  if (!text) return '';
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength).trim() + '...';
};

/**
 * Format Supabase & Auth error codes and messages to user-friendly messages
 */
export const formatAuthError = (error) => {
  if (!error) return 'Something went wrong. Please try again.';
  const msg = error.message || error.error_description || (typeof error === 'string' ? error : '');
  const code = error.code || error.status;

  if (msg.includes('Invalid login credentials') || msg.includes('invalid_credentials')) {
    return 'Invalid email or password. Please try again.';
  }
  if (msg.includes('User already registered') || msg.includes('email_exists') || code === '23505') {
    return 'An account with this email already exists.';
  }
  if (msg.includes('Password should be at least') || msg.includes('weak-password')) {
    return 'Password must be at least 6 characters.';
  }
  if (msg.includes('Email not confirmed')) {
    return 'Please confirm your email address before signing in.';
  }
  if (msg.includes('rate limit') || msg.includes('too many requests') || code === 429) {
    return 'Too many attempts. Please try again later.';
  }
  if (msg.includes('invalid email') || msg.includes('unable to validate email address')) {
    return 'Please enter a valid email address.';
  }
  if (msg.includes('network') || msg.includes('Failed to fetch')) {
    return 'Network error. Please check your connection.';
  }
  if (code === '42501' || msg.includes('row-level security') || msg.includes('permission denied')) {
    return 'You do not have permission to perform this action.';
  }

  return msg || 'Something went wrong. Please try again.';
};

// Backward compatibility alias
export const formatFirebaseError = formatAuthError;

/**
 * Debounce function
 */
export const debounce = (func, delay = 300) => {
  let timer;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => func(...args), delay);
  };
};

/**
 * Generate a unique conversation ID from two user IDs
 */
export const getConversationId = (uid1, uid2) => {
  return [uid1, uid2].sort().join('_');
};

/**
 * Check if deadline has passed
 */
export const isDeadlinePassed = (deadline) => {
  if (!deadline) return false;
  const date = deadline?.toDate ? deadline.toDate() : new Date(deadline);
  return date < new Date();
};

/**
 * Format currency (Indian)
 */
export const formatSalary = (amount) => {
  if (!amount) return '';
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount);
};

/**
 * Parse skills from a comma-separated string
 */
export const parseSkills = (skillsInput) => {
  if (!skillsInput) return [];
  if (Array.isArray(skillsInput)) return skillsInput;
  return skillsInput
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);
};

/**
 * Capitalize first letter
 */
export const capitalize = (str) => {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1);
};
