import { supabase, isSupabaseConfigured } from './client';
import { mockStore } from '../services/mockStorage';

// Sign up with email/password
export const signUpWithEmail = async (email, password, displayName, role = 'student') => {
  if (isSupabaseConfigured) {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            displayName,
            role,
          },
        },
      });

      if (error) throw error;
      if (data.user) {
        return {
          uid: data.user.id,
          email: data.user.email,
          displayName,
          photoURL: '',
        };
      }
    } catch (e) {
      console.error('Supabase signup failed, falling back to mock auth:', e);
      throw e;
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
  if (isSupabaseConfigured) {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;
      if (data.user) {
        return {
          uid: data.user.id,
          email: data.user.email,
          displayName: data.user.user_metadata?.displayName || email.split('@')[0],
          photoURL: data.user.user_metadata?.photoURL || '',
        };
      }
    } catch (e) {
      console.warn('Supabase signin failed, trying mock store:', e);
      throw e;
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
  if (isSupabaseConfigured) {
    try {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
      });
      if (error) throw error;
      return data;
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
  if (isSupabaseConfigured) {
    try {
      await supabase.auth.signOut();
    } catch (e) {
      console.warn('Supabase signOut error:', e);
    }
  }
  mockStore.setCurrentUser(null);
  window.dispatchEvent(new CustomEvent('alumlink_auth_change'));
};

// Reset password
export const resetPassword = async (email) => {
  if (isSupabaseConfigured) {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });
      if (error) throw error;
      return true;
    } catch (e) {
      console.warn('Supabase resetPassword error:', e);
      throw e;
    }
  }
  return true;
};

// Resend verification email (no-op or supported via signup response)
export const resendVerificationEmail = async () => {
  // In Supabase email verification is sent automatically upon signUp.
  console.log('Verification email managed by Supabase Auth policies');
};

// Auth state observer
export const onAuthStateChange = (callback) => {
  if (isSupabaseConfigured) {
    // Initial fetch of current session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        callback({
          uid: session.user.id,
          email: session.user.email,
          displayName: session.user.user_metadata?.displayName || session.user.email.split('@')[0],
          photoURL: session.user.user_metadata?.photoURL || '',
        });
      } else {
        const local = mockStore.getCurrentUser();
        callback(local);
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (session?.user) {
        callback({
          uid: session.user.id,
          email: session.user.email,
          displayName: session.user.user_metadata?.displayName || session.user.email.split('@')[0],
          photoURL: session.user.user_metadata?.photoURL || '',
        });
      } else {
        const local = mockStore.getCurrentUser();
        callback(local);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
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
