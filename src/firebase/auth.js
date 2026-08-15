import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail,
  sendEmailVerification,
  updateProfile,
  GoogleAuthProvider,
  signInWithPopup,
  onAuthStateChanged,
} from 'firebase/auth';
import { auth } from './config';
import { isFirebaseConfigured, mockStore } from '../services/mockStorage';

const googleProvider = new GoogleAuthProvider();

// Sign up with email/password
export const signUpWithEmail = async (email, password, displayName) => {
  if (isFirebaseConfigured) {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      await updateProfile(userCredential.user, { displayName });
      await sendEmailVerification(userCredential.user).catch(() => {});
      return userCredential.user;
    } catch (e) {
      console.warn('Firebase signup failed, falling back to mock auth:', e);
    }
  }

  // Mock sign up
  const mockUser = {
    uid: `user_${Date.now()}`,
    email,
    displayName,
    photoURL: '',
  };
  mockStore.setCurrentUser(mockUser);
  return mockUser;
};

// Sign in with email/password
export const signInWithEmail = async (email, password) => {
  if (isFirebaseConfigured) {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      return userCredential.user;
    } catch (e) {
      console.warn('Firebase signin failed, trying mock store:', e);
    }
  }

  // Mock sign in lookup
  const users = mockStore.getUsers();
  const found = users.find((u) => u.email.toLowerCase() === email.toLowerCase());
  if (found) {
    const mockUser = {
      uid: found.uid,
      email: found.email,
      displayName: found.displayName,
      photoURL: found.photoURL || '',
    };
    mockStore.setCurrentUser(mockUser);
    return mockUser;
  }

  // Default fallback user
  const mockUser = {
    uid: `user_${Date.now()}`,
    email,
    displayName: email.split('@')[0],
    photoURL: '',
  };
  mockStore.setCurrentUser(mockUser);
  return mockUser;
};

// Google sign-in
export const signInWithGoogle = async () => {
  if (isFirebaseConfigured) {
    try {
      const userCredential = await signInWithPopup(auth, googleProvider);
      return userCredential.user;
    } catch (e) {
      console.warn('Google signin failed, falling back to mock:', e);
    }
  }

  const mockUser = {
    uid: 'demo_student_default',
    email: 'student@psgtech.edu',
    displayName: 'Rahul Sharma (Google)',
    photoURL: '',
  };
  mockStore.setCurrentUser(mockUser);
  return mockUser;
};

// Sign out
export const signOutUser = async () => {
  if (isFirebaseConfigured) {
    try {
      await signOut(auth);
    } catch (e) {
      console.warn('Firebase signOut error:', e);
    }
  }
  mockStore.setCurrentUser(null);
  window.dispatchEvent(new CustomEvent('alumlink_auth_change'));
};

// Reset password
export const resetPassword = async (email) => {
  if (isFirebaseConfigured) {
    try {
      await sendPasswordResetEmail(auth, email);
      return;
    } catch (e) {
      console.warn('Firebase resetPassword error:', e);
    }
  }
  // In mock mode, resolve successfully
  return true;
};

// Resend verification email
export const resendVerificationEmail = async () => {
  if (isFirebaseConfigured && auth.currentUser) {
    await sendEmailVerification(auth.currentUser);
  }
};

// Auth state observer
export const onAuthStateChange = (callback) => {
  if (isFirebaseConfigured) {
    return onAuthStateChanged(auth, (user) => {
      if (user) {
        callback(user);
      } else {
        const local = mockStore.getCurrentUser();
        callback(local);
      }
    });
  }

  const handleCustomAuth = () => {
    const user = mockStore.getCurrentUser();
    callback(user);
  };

  window.addEventListener('alumlink_auth_change', handleCustomAuth);
  window.addEventListener('alumlink_storage_update', handleCustomAuth);

  // Initial emit
  handleCustomAuth();

  return () => {
    window.removeEventListener('alumlink_auth_change', handleCustomAuth);
    window.removeEventListener('alumlink_storage_update', handleCustomAuth);
  };
};

export { auth };
