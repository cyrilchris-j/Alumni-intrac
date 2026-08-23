import { createContext, useContext, useEffect, useState } from 'react';
import { onAuthStateChange } from '../supabase/auth';
import { supabase, isSupabaseConfigured } from '../supabase/client';
import { mockStore } from '../services/mockStorage';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [userRole, setUserRole] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChange(async (user) => {
      setCurrentUser(user);

      if (user) {
        try {
          if (isSupabaseConfigured) {
            // Fetch user document from Supabase
            const { data: userData, error: userError } = await supabase
              .from('users')
              .select('*')
              .eq('uid', user.uid)
              .maybeSingle();

            if (userData) {
              setUserRole(userData.role);

              let profileData = null;
              if (userData.role === 'student') {
                const { data } = await supabase
                  .from('studentProfiles')
                  .select('*')
                  .eq('uid', user.uid)
                  .maybeSingle();
                profileData = data;
              } else if (userData.role === 'alumni') {
                const { data } = await supabase
                  .from('alumniProfiles')
                  .select('*')
                  .eq('uid', user.uid)
                  .maybeSingle();
                profileData = data;
              } else if (userData.role === 'admin') {
                profileData = userData;
              }

              if (profileData) {
                setUserProfile({ id: user.uid, ...profileData });
                setLoading(false);
                return;
              }
            }
          }

          // Fallback to local mock store
          const users = mockStore.getUsers();
          const foundUser = users.find((u) => u.uid === user.uid || u.email === user.email);
          const role = foundUser?.role || 'student';
          setUserRole(role);

          if (role === 'student') {
            const students = mockStore.getStudents();
            const studentProfile = students.find((s) => s.uid === user.uid || s.email === user.email);
            setUserProfile(studentProfile || {
              id: user.uid,
              uid: user.uid,
              fullName: user.displayName || 'Rahul Sharma',
              email: user.email,
              department: 'Computer Science & Engineering',
              year: '3rd Year',
              college: 'PSG College of Technology',
              skills: ['React', 'JavaScript', 'Python'],
            });
          } else if (role === 'alumni') {
            const alumniList = mockStore.getAlumni();
            const alumniProfile = alumniList.find((a) => a.uid === user.uid || a.email === user.email);
            setUserProfile(alumniProfile || {
              id: user.uid,
              uid: user.uid,
              fullName: user.displayName || 'Priya Menon',
              email: user.email,
              company: 'Google',
              jobRole: 'Senior Product Manager',
              department: 'Computer Science & Engineering',
              graduationYear: '2018',
              college: 'PSG College of Technology',
              verificationStatus: 'verified',
              skills: ['Product Strategy', 'Cloud Solutions'],
            });
          } else {
            setUserProfile({
              id: user.uid,
              uid: user.uid,
              fullName: 'College Administrator',
              email: user.email,
              role: 'admin',
            });
          }
        } catch (error) {
          console.error('Error fetching user profile:', error);
        }
      } else {
        setUserProfile(null);
        setUserRole(null);
      }

      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const refreshProfile = async () => {
    if (!currentUser || !userRole) return;
    try {
      if (isSupabaseConfigured) {
        let profileData = null;
        if (userRole === 'student') {
          const { data } = await supabase
            .from('studentProfiles')
            .select('*')
            .eq('uid', currentUser.uid)
            .maybeSingle();
          profileData = data;
        } else if (userRole === 'alumni') {
          const { data } = await supabase
            .from('alumniProfiles')
            .select('*')
            .eq('uid', currentUser.uid)
            .maybeSingle();
          profileData = data;
        } else {
          const { data } = await supabase
            .from('users')
            .select('*')
            .eq('uid', currentUser.uid)
            .maybeSingle();
          profileData = data;
        }
        if (profileData) {
          setUserProfile({ id: currentUser.uid, ...profileData });
          return;
        }
      }

      // Mock refresh
      if (userRole === 'student') {
        const student = mockStore.getStudents().find((s) => s.uid === currentUser.uid);
        if (student) setUserProfile(student);
      } else if (userRole === 'alumni') {
        const al = mockStore.getAlumni().find((a) => a.uid === currentUser.uid);
        if (al) setUserProfile(al);
      }
    } catch (error) {
      console.error('Error refreshing profile:', error);
    }
  };

  const value = {
    currentUser,
    userProfile,
    userRole,
    loading,
    refreshProfile,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;
