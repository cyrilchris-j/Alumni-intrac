import {
  db,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
  collection,
  query,
  where,
  orderBy,
  limit,
  serverTimestamp,
} from '../firebase/firestore';
import { uploadProfilePhoto } from '../firebase/storage';
import { isFirebaseConfigured, mockStore } from './mockStorage';

/**
 * Create a new user document in Firestore after signup
 */
export const createUserDocument = async (uid, { email, role, displayName, photoURL = '' }) => {
  if (isFirebaseConfigured) {
    try {
      await setDoc(doc(db, 'users', uid), {
        uid,
        email,
        role,
        displayName,
        photoURL,
        accountStatus: 'active',
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
      return;
    } catch (e) {
      console.warn('Firebase createUserDocument fallback:', e);
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
  if (isFirebaseConfigured) {
    try {
      await setDoc(doc(db, 'studentProfiles', uid), {
        uid,
        ...profileData,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
      return;
    } catch (e) {
      console.warn('Firebase createStudentProfile fallback:', e);
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
  if (isFirebaseConfigured) {
    try {
      await setDoc(doc(db, 'alumniProfiles', uid), {
        uid,
        ...profileData,
        verificationStatus: 'pending',
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
      return;
    } catch (e) {
      console.warn('Firebase createAlumniProfile fallback:', e);
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
  if (isFirebaseConfigured) {
    try {
      const docSnap = await getDoc(doc(db, 'users', uid));
      if (docSnap.exists()) return { id: docSnap.id, ...docSnap.data() };
    } catch (e) {
      console.warn('Firebase getUserDocument fallback:', e);
    }
  }

  const users = mockStore.getUsers();
  return users.find((u) => u.uid === uid || u.id === uid) || null;
};

/**
 * Get student profile
 */
export const getStudentProfile = async (uid) => {
  if (isFirebaseConfigured) {
    try {
      const docSnap = await getDoc(doc(db, 'studentProfiles', uid));
      if (docSnap.exists()) return { id: docSnap.id, ...docSnap.data() };
    } catch (e) {
      console.warn('Firebase getStudentProfile fallback:', e);
    }
  }

  const students = mockStore.getStudents();
  return students.find((s) => s.uid === uid || s.id === uid) || null;
};

/**
 * Get alumni profile
 */
export const getAlumniProfile = async (uid) => {
  if (isFirebaseConfigured) {
    try {
      const docSnap = await getDoc(doc(db, 'alumniProfiles', uid));
      if (docSnap.exists()) return { id: docSnap.id, ...docSnap.data() };
    } catch (e) {
      console.warn('Firebase getAlumniProfile fallback:', e);
    }
  }

  const alumni = mockStore.getAlumni();
  return alumni.find((a) => a.uid === uid || a.id === uid) || null;
};

/**
 * Update student profile
 */
export const updateStudentProfile = async (uid, data) => {
  if (isFirebaseConfigured) {
    try {
      await updateDoc(doc(db, 'studentProfiles', uid), {
        ...data,
        updatedAt: serverTimestamp(),
      });
      return;
    } catch (e) {
      console.warn('Firebase updateStudentProfile fallback:', e);
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
  if (isFirebaseConfigured) {
    try {
      await updateDoc(doc(db, 'alumniProfiles', uid), {
        ...data,
        updatedAt: serverTimestamp(),
      });
      return;
    } catch (e) {
      console.warn('Firebase updateAlumniProfile fallback:', e);
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
  if (isFirebaseConfigured) {
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
  if (isFirebaseConfigured) {
    try {
      let q = query(
        collection(db, 'alumniProfiles'),
        where('verificationStatus', '==', 'verified'),
        orderBy('createdAt', 'desc'),
        limit(lim)
      );
      const snap = await getDocs(q);
      return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
    } catch (e) {
      console.warn('Firebase getAlumni fallback:', e);
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
  if (isFirebaseConfigured) {
    try {
      const q = query(collection(db, 'alumniProfiles'), orderBy('createdAt', 'desc'), limit(100));
      const snap = await getDocs(q);
      results = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
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
  if (isFirebaseConfigured) {
    try {
      const q = query(collection(db, 'studentProfiles'), orderBy('createdAt', 'desc'), limit(100));
      const snap = await getDocs(q);
      results = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
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
  if (isFirebaseConfigured) {
    try {
      const snap = await getDocs(query(collection(db, 'studentProfiles'), orderBy('createdAt', 'desc')));
      return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
    } catch (e) {
      console.warn('Firebase getAllStudents fallback:', e);
    }
  }

  return mockStore.getStudents();
};

/**
 * Get all alumni (admin)
 */
export const getAllAlumni = async () => {
  if (isFirebaseConfigured) {
    try {
      const snap = await getDocs(query(collection(db, 'alumniProfiles'), orderBy('createdAt', 'desc')));
      return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
    } catch (e) {
      console.warn('Firebase getAllAlumni fallback:', e);
    }
  }

  return mockStore.getAlumni();
};

/**
 * Verify/reject alumni (admin)
 */
export const updateAlumniVerification = async (uid, status) => {
  if (isFirebaseConfigured) {
    try {
      await updateDoc(doc(db, 'alumniProfiles', uid), {
        verificationStatus: status,
        updatedAt: serverTimestamp(),
      });
      return;
    } catch (e) {
      console.warn('Firebase updateAlumniVerification fallback:', e);
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
  if (isFirebaseConfigured) {
    try {
      await updateDoc(doc(db, 'users', uid), {
        accountStatus: status,
        updatedAt: serverTimestamp(),
      });
      return;
    } catch (e) {
      console.warn('Firebase updateUserAccountStatus fallback:', e);
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
  if (isFirebaseConfigured) {
    try {
      const snap = await getDocs(query(collection(db, 'users'), orderBy('createdAt', 'desc')));
      return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
    } catch (e) {
      console.warn('Firebase getAllUsers fallback:', e);
    }
  }

  return mockStore.getUsers();
};

/**
 * Delete a user account and associated profiles (admin)
 */
export const deleteUserAccount = async (uid) => {
  if (!uid) return;
  if (isFirebaseConfigured) {
    try {
      await deleteDoc(doc(db, 'users', uid));
      try { await deleteDoc(doc(db, 'studentProfiles', uid)); } catch (e) {}
      try { await deleteDoc(doc(db, 'alumniProfiles', uid)); } catch (e) {}
      return;
    } catch (e) {
      console.warn('Firebase deleteUserAccount fallback:', e);
    }
  }

  const users = mockStore.getUsers();
  mockStore.setUsers(users.filter((u) => u.uid !== uid && u.id !== uid));
  const students = mockStore.getStudents();
  mockStore.setStudents(students.filter((s) => s.uid !== uid && s.id !== uid));
  const alumni = mockStore.getAlumni();
  mockStore.setAlumni(alumni.filter((a) => a.uid !== uid && a.id !== uid));
};


