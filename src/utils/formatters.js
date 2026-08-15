/**
 * Format a Firebase Timestamp or Date to a readable string
 */
export const formatDate = (timestamp, options = {}) => {
  if (!timestamp) return '';
  const date = timestamp?.toDate ? timestamp.toDate() : new Date(timestamp);
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
  const date = timestamp?.toDate ? timestamp.toDate() : new Date(timestamp);
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
  const date = timestamp?.toDate ? timestamp.toDate() : new Date(timestamp);
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
 * Format Firebase error codes to user-friendly messages
 */
export const formatFirebaseError = (error) => {
  const errorMap = {
    'auth/user-not-found': 'No account found with this email address.',
    'auth/wrong-password': 'Incorrect password. Please try again.',
    'auth/email-already-in-use': 'An account with this email already exists.',
    'auth/weak-password': 'Password must be at least 6 characters.',
    'auth/invalid-email': 'Please enter a valid email address.',
    'auth/too-many-requests': 'Too many attempts. Please try again later.',
    'auth/network-request-failed': 'Network error. Please check your connection.',
    'auth/popup-closed-by-user': 'Sign-in popup was closed. Please try again.',
    'auth/cancelled-popup-request': 'Another sign-in is in progress.',
    'auth/invalid-credential': 'Invalid email or password.',
    'permission-denied': 'You do not have permission to perform this action.',
    'unavailable': 'Service is temporarily unavailable. Please try again.',
  };

  return errorMap[error?.code] || error?.message || 'Something went wrong. Please try again.';
};

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
