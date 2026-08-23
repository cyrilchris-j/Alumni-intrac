import { supabase, isSupabaseConfigured } from '../supabase/client';
import { uploadProfilePhoto } from '../supabase/storage';
import { isFirebaseConfigured, mockStore } from './mockStorage';

/**
 * Create a new user document in public.users after signup
 */
export const createUserDocument = async (uid, { email, role, displayName, photoURL = '' }) => {
  if (isSupabaseConfigured) {
    try {
      const { error } = await supabase.from('users').upsert({
        uid,
        email,
        role,
        displayName,
        photoURL,
        accountStatus: 'active',
        updatedAt: new Date().toISOString(),
      });
      if (error) throw error;
      return;
    } catch (e) {
      console.warn('Supabase createUserDocument fallback:', e);
    }
  }

  const users = mockStore.getUsers();
  const existing = users.filter((u) => u.uid !== uid);
  mockStore.setUsers([
    ...existing,
    {
      uid,
      email,
      role,
      displayName,
      photoURL,
      accountStatus: 'active',
      createdAt: new Date().toISOString(),
    },
  ]);
};

/**
 * Create student profile
 */
export const createStudentProfile = async (uid, profileData) => {
  if (isSupabaseConfigured) {
    try {
      const { error } = await supabase.from('studentProfiles').upsert({
        uid,
        ...profileData,
        updatedAt: new Date().toISOString(),
      });
      if (error) throw error;
      return;
    } catch (e) {
      console.warn('Supabase createStudentProfile fallback:', e);
    }
  }

  const students = mockStore.getStudents();
  mockStore.setStudents([
    ...students.filter((s) => s.uid !== uid),
    { uid, id: uid, ...profileData, createdAt: new Date().toISOString() },
  ]);
};

/**
 * Create alumni profile
 */
export const createAlumniProfile = async (uid, profileData) => {
  if (isSupabaseConfigured) {
    try {
      const { error } = await supabase.from('alumniProfiles').upsert({
        uid,
        ...profileData,
        verificationStatus: 'pending',
        updatedAt: new Date().toISOString(),
      });
      if (error) throw error;
      return;
    } catch (e) {
      console.warn('Supabase createAlumniProfile fallback:', e);
    }
  }

  const alumni = mockStore.getAlumni();
  mockStore.setAlumni([
    ...alumni.filter((a) => a.uid !== uid),
    { uid, id: uid, ...profileData, verificationStatus: 'pending', createdAt: new Date().toISOString() },
  ]);
};

/**
 * Get a user document
 */
export const getUserDocument = async (uid) => {
  if (isSupabaseConfigured) {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('uid', uid)
        .maybeSingle();
      if (error) throw error;
      if (data) return { id: data.uid, ...data };
    } catch (e) {
      console.warn('Supabase getUserDocument fallback:', e);
    }
  }

  const users = mockStore.getUsers();
  return users.find((u) => u.uid === uid || u.id === uid) || null;
};

/**
 * Get student profile
 */
export const getStudentProfile = async (uid) => {
  if (isSupabaseConfigured) {
    try {
      const { data, error } = await supabase
        .from('studentProfiles')
        .select('*')
        .eq('uid', uid)
        .maybeSingle();
      if (error) throw error;
      if (data) return { id: data.uid, ...data };
    } catch (e) {
      console.warn('Supabase getStudentProfile fallback:', e);
    }
  }

  const students = mockStore.getStudents();
  return students.find((s) => s.uid === uid || s.id === uid) || null;
};

/**
 * Get alumni profile
 */
export const getAlumniProfile = async (uid) => {
  if (isSupabaseConfigured) {
    try {
      const { data, error } = await supabase
        .from('alumniProfiles')
        .select('*')
        .eq('uid', uid)
        .maybeSingle();
      if (error) throw error;
      if (data) return { id: data.uid, ...data };
    } catch (e) {
      console.warn('Supabase getAlumniProfile fallback:', e);
    }
  }

  const alumni = mockStore.getAlumni();
  return alumni.find((a) => a.uid === uid || a.id === uid) || null;
};

/**
 * Update student profile
 */
export const updateStudentProfile = async (uid, data) => {
  if (isSupabaseConfigured) {
    try {
      const { error } = await supabase
        .from('studentProfiles')
        .update({
          ...data,
          updatedAt: new Date().toISOString(),
        })
        .eq('uid', uid);
      if (error) throw error;
      return;
    } catch (e) {
      console.warn('Supabase updateStudentProfile fallback:', e);
    }
  }

  const students = mockStore.getStudents();
  mockStore.setStudents(
    students.map((s) => (s.uid === uid || s.id === uid ? { ...s, ...data, updatedAt: new Date().toISOString() } : s))
  );
};

/**
 * Update alumni profile
 */
export const updateAlumniProfile = async (uid, data) => {
  if (isSupabaseConfigured) {
    try {
      const { error } = await supabase
        .from('alumniProfiles')
        .update({
          ...data,
          updatedAt: new Date().toISOString(),
        })
        .eq('uid', uid);
      if (error) throw error;
      return;
    } catch (e) {
      console.warn('Supabase updateAlumniProfile fallback:', e);
    }
  }

  const alumni = mockStore.getAlumni();
  mockStore.setAlumni(
    alumni.map((a) => (a.uid === uid || a.id === uid ? { ...a, ...data, updatedAt: new Date().toISOString() } : a))
  );
};

/**
 * Upload and update profile photo
 */
export const updateProfilePhoto = async (file, uid, role) => {
  let photoURL = '';
  if (isSupabaseConfigured) {
    try {
      photoURL = await uploadProfilePhoto(file, uid);
    } catch (e) {
      photoURL = URL.createObjectURL(file);
    }
  } else {
    photoURL = URL.createObjectURL(file);
  }

  if (role === 'student') {
    await updateStudentProfile(uid, { photoURL });
  } else if (role === 'alumni') {
    await updateAlumniProfile(uid, { photoURL });
  }
  return photoURL;
};

/**
 * Get all alumni with optional filters
 */
export const getAlumni = async ({ company, department, graduationYear, location, limit: lim = 20 } = {}) => {
  if (isSupabaseConfigured) {
    try {
      const { data, error } = await supabase
        .from('alumniProfiles')
        .select('*')
        .eq('verificationStatus', 'verified')
        .order('createdAt', { ascending: false })
        .limit(lim);
      if (error) throw error;
      return data || [];
    } catch (e) {
      console.warn('Supabase getAlumni fallback:', e);
    }
  }

  const alumni = mockStore.getAlumni();
  return alumni.slice(0, lim);
};

/**
 * Search alumni by name & filters
 */
export const searchAlumni = async (searchQuery = '', filters = {}) => {
  let results = [];
  if (isSupabaseConfigured) {
    try {
      const { data, error } = await supabase
        .from('alumniProfiles')
        .select('*')
        .order('createdAt', { ascending: false })
        .limit(100);
      if (error) throw error;
      results = data || [];
    } catch (e) {
      results = mockStore.getAlumni();
    }
  } else {
    results = mockStore.getAlumni();
  }

  if (searchQuery) {
    const lower = searchQuery.toLowerCase();
    results = results.filter(
      (a) =>
        a.fullName?.toLowerCase().includes(lower) ||
        a.company?.toLowerCase().includes(lower) ||
        a.jobRole?.toLowerCase().includes(lower) ||
        a.skills?.some((s) => s.toLowerCase().includes(lower))
    );
  }

  if (filters.department) {
    results = results.filter((a) => a.department === filters.department);
  }
  if (filters.graduationYear) {
    results = results.filter((a) => String(a.graduationYear) === String(filters.graduationYear));
  }
  if (filters.company) {
    results = results.filter((a) =>
      a.company?.toLowerCase().includes(filters.company.toLowerCase())
    );
  }
  if (filters.location) {
    results = results.filter((a) =>
      a.location?.toLowerCase().includes(filters.location.toLowerCase())
    );
  }

  return results;
};

/**
 * Search students by name & filters (for peer student discovery & connection)
 */
export const searchStudents = async (searchQuery = '', filters = {}) => {
  let results = [];
  if (isSupabaseConfigured) {
    try {
      const { data, error } = await supabase
        .from('studentProfiles')
        .select('*')
        .order('createdAt', { ascending: false })
        .limit(100);
      if (error) throw error;
      results = data || [];
    } catch (e) {
      results = mockStore.getStudents();
    }
  } else {
    results = mockStore.getStudents();
  }

  if (searchQuery) {
    const lower = searchQuery.toLowerCase();
    results = results.filter(
      (s) =>
        s.fullName?.toLowerCase().includes(lower) ||
        s.registerNo?.toLowerCase().includes(lower) ||
        s.department?.toLowerCase().includes(lower) ||
        s.skills?.some((sk) => sk.toLowerCase().includes(lower)) ||
        s.interests?.some((it) => it.toLowerCase().includes(lower))
    );
  }

  if (filters.department) {
    results = results.filter((s) => s.department === filters.department);
  }
  if (filters.year) {
    results = results.filter((s) => s.year === filters.year);
  }

  return results;
};

/**
 * Intelligent recommendation for Alumni based on Student's skills and interests
 */
export const getRecommendedAlumni = async (userSkills = [], userInterests = [], lim = 6) => {
  const allAlumni = await searchAlumni('', {});
  const userSkillSet = new Set((userSkills || []).map((s) => s.toLowerCase().trim()));
  const userInterestSet = new Set((userInterests || []).map((i) => i.toLowerCase().trim()));

  const scored = allAlumni.map((alumni) => {
    const alumniSkills = alumni.skills || [];
    const matchedSkills = alumniSkills.filter((s) => userSkillSet.has(s.toLowerCase().trim()));

    // Also match interests with jobRole, company, bio, skills
    let interestMatches = 0;
    const alumniText = `${alumni.jobRole || ''} ${alumni.company || ''} ${alumni.bio || ''}`.toLowerCase();
    userInterestSet.forEach((interest) => {
      if (interest && alumniText.includes(interest)) {
        interestMatches += 1;
      }
    });

    const score = matchedSkills.length * 3 + interestMatches * 2;
    // Calculate a realistic match percentage (65% to 98%)
    const baseMatch = 65;
    const bonus = Math.min(33, (matchedSkills.length * 10) + (interestMatches * 8));
    const matchPercentage = userSkills.length === 0 && userInterests.length === 0
      ? 80 + Math.floor(Math.random() * 15)
      : Math.min(99, baseMatch + bonus);

    return {
      ...alumni,
      matchScore: score,
      matchPercentage,
      matchedSkills,
      matchedInterestsCount: interestMatches,
    };
  });

  // Sort by match score descending
  scored.sort((a, b) => b.matchScore - a.matchScore);
  return scored.slice(0, lim);
};

/**
 * Intelligent recommendation for Fellow Students based on overlapping skills & interests
 */
export const getRecommendedStudents = async (currentUid, userSkills = [], userInterests = [], lim = 6) => {
  const allStudents = await getAllStudents();
  const others = allStudents.filter((s) => s.id !== currentUid && s.uid !== currentUid);
  const userSkillSet = new Set((userSkills || []).map((s) => s.toLowerCase().trim()));
  const userInterestSet = new Set((userInterests || []).map((i) => i.toLowerCase().trim()));

  const scored = others.map((student) => {
    const studentSkills = student.skills || [];
    const studentInterests = student.interests || [];

    const matchedSkills = studentSkills.filter((s) => userSkillSet.has(s.toLowerCase().trim()));
    const matchedInterests = studentInterests.filter((i) => userInterestSet.has(i.toLowerCase().trim()));

    const score = matchedSkills.length * 3 + matchedInterests.length * 3;
    const baseMatch = 70;
    const bonus = Math.min(28, (matchedSkills.length * 8) + (matchedInterests.length * 8));
    const matchPercentage = userSkills.length === 0 && userInterests.length === 0
      ? 82 + Math.floor(Math.random() * 14)
      : Math.min(99, baseMatch + bonus);

    return {
      ...student,
      matchScore: score,
      matchPercentage,
      matchedSkills,
      matchedInterests,
    };
  });

  scored.sort((a, b) => b.matchScore - a.matchScore);
  return scored.slice(0, lim);
};

/**
 * Get all students (admin)
 */
export const getAllStudents = async () => {
  if (isSupabaseConfigured) {
    try {
      const { data, error } = await supabase
        .from('studentProfiles')
        .select('*')
        .order('createdAt', { ascending: false });
      if (error) throw error;
      return data || [];
    } catch (e) {
      console.warn('Supabase getAllStudents fallback:', e);
    }
  }

  return mockStore.getStudents();
};

/**
 * Get all alumni (admin)
 */
export const getAllAlumni = async () => {
  if (isSupabaseConfigured) {
    try {
      const { data, error } = await supabase
        .from('alumniProfiles')
        .select('*')
        .order('createdAt', { ascending: false });
      if (error) throw error;
      return data || [];
    } catch (e) {
      console.warn('Supabase getAllAlumni fallback:', e);
    }
  }

  return mockStore.getAlumni();
};

/**
 * Verify/reject alumni (admin)
 */
export const updateAlumniVerification = async (uid, status) => {
  if (isSupabaseConfigured) {
    try {
      const { error } = await supabase
        .from('alumniProfiles')
        .update({
          verificationStatus: status,
          updatedAt: new Date().toISOString(),
        })
        .eq('uid', uid);
      if (error) throw error;
      return;
    } catch (e) {
      console.warn('Supabase updateAlumniVerification fallback:', e);
    }
  }

  const alumni = mockStore.getAlumni();
  mockStore.setAlumni(
    alumni.map((a) => (a.uid === uid || a.id === uid ? { ...a, verificationStatus: status } : a))
  );
};

/**
 * Suspend/activate user (admin)
 */
export const updateUserAccountStatus = async (uid, status) => {
  if (isSupabaseConfigured) {
    try {
      const { error } = await supabase
        .from('users')
        .update({
          accountStatus: status,
          updatedAt: new Date().toISOString(),
        })
        .eq('uid', uid);
      if (error) throw error;
      return;
    } catch (e) {
      console.warn('Supabase updateUserAccountStatus fallback:', e);
    }
  }

  const users = mockStore.getUsers();
  mockStore.setUsers(
    users.map((u) => (u.uid === uid || u.id === uid ? { ...u, accountStatus: status } : u))
  );
};

/**
 * Get all users (admin)
 */
export const getAllUsers = async () => {
  if (isSupabaseConfigured) {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .order('createdAt', { ascending: false });
      if (error) throw error;
      return data || [];
    } catch (e) {
      console.warn('Supabase getAllUsers fallback:', e);
    }
  }

  return mockStore.getUsers();
};

/**
 * Delete a user account and associated profiles (admin)
 */
export const deleteUserAccount = async (uid) => {
  if (!uid) return;
  if (isSupabaseConfigured) {
    try {
      const { error } = await supabase.from('users').delete().eq('uid', uid);
      if (error) throw error;
      return;
    } catch (e) {
      console.warn('Supabase deleteUserAccount fallback:', e);
    }
  }

  const users = mockStore.getUsers();
  mockStore.setUsers(users.filter((u) => u.uid !== uid && u.id !== uid));
  const students = mockStore.getStudents();
  mockStore.setStudents(students.filter((s) => s.uid !== uid && s.id !== uid));
  const alumni = mockStore.getAlumni();
  mockStore.setAlumni(alumni.filter((a) => a.uid !== uid && a.id !== uid));
};

/**
 * Admin: Manually add a new Student user and profile
 */
export const adminAddStudent = async (studentData) => {
  const uid = `student_${Date.now()}`;
  const {
    email,
    fullName,
    registerNo = '',
    department = 'Computer Science and Engineering',
    year = '1st Year',
    section = 'A',
    phone = '',
    skills = [],
    interests = [],
  } = studentData;

  await createUserDocument(uid, {
    email,
    role: 'student',
    displayName: fullName,
    photoURL: '',
  });

  const parsedSkills = Array.isArray(skills)
    ? skills
    : (skills || '').split(',').map((s) => s.trim()).filter(Boolean);
  const parsedInterests = Array.isArray(interests)
    ? interests
    : (interests || '').split(',').map((i) => i.trim()).filter(Boolean);

  await createStudentProfile(uid, {
    fullName,
    registerNo,
    email,
    college: 'PSG College of Technology',
    department,
    year,
    section,
    phone,
    skills: parsedSkills,
    interests: parsedInterests,
    photoURL: '',
  });

  return { uid, email };
};

/**
 * Admin: Manually add a new Alumni user and profile
 */
export const adminAddAlumni = async (alumniData) => {
  const uid = `alumni_${Date.now()}`;
  const {
    email,
    fullName,
    department = 'Computer Science and Engineering',
    graduationYear = '2024',
    company = '',
    jobRole = '',
    location = '',
    phone = '',
    skills = [],
    experience = '',
    verificationStatus = 'verified',
  } = alumniData;

  await createUserDocument(uid, {
    email,
    role: 'alumni',
    displayName: fullName,
    photoURL: '',
  });

  const parsedSkills = Array.isArray(skills)
    ? skills
    : (skills || '').split(',').map((s) => s.trim()).filter(Boolean);

  await createAlumniProfile(uid, {
    fullName,
    email,
    college: 'PSG College of Technology',
    department,
    graduationYear,
    company,
    jobRole,
    location,
    phone,
    skills: parsedSkills,
    experience,
    photoURL: '',
    verificationStatus,
  });

  return { uid, email };
};
