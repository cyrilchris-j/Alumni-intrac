import {
  db,
  collection,
  doc,
  addDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  serverTimestamp,
  setDoc,
} from '../firebase/firestore';
import { isFirebaseConfigured, mockStore } from './mockStorage';

/**
 * Create an opportunity
 */
export const createOpportunity = async (postedBy, postedByName, data) => {
  if (isFirebaseConfigured) {
    try {
      const docRef = await addDoc(collection(db, 'opportunities'), {
        ...data,
        postedBy,
        postedByName,
        skills: Array.isArray(data.skills) ? data.skills : data.skills?.split(',').map((s) => s.trim()).filter(Boolean) || [],
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
      return docRef.id;
    } catch (e) {
      console.warn('Firebase createOpportunity fallback:', e);
    }
  }

  const oppId = `opp_${Date.now()}`;
  const opps = mockStore.getOpportunities();
  mockStore.setOpportunities([
    {
      id: oppId,
      ...data,
      postedBy,
      postedByName,
      skills: Array.isArray(data.skills) ? data.skills : data.skills?.split(',').map((s) => s.trim()).filter(Boolean) || [],
      createdAt: new Date().toISOString(),
    },
    ...opps,
  ]);
  return oppId;
};

/**
 * Update an opportunity
 */
export const updateOpportunity = async (opportunityId, data) => {
  if (isFirebaseConfigured) {
    try {
      await updateDoc(doc(db, 'opportunities', opportunityId), {
        ...data,
        updatedAt: serverTimestamp(),
      });
      return;
    } catch (e) {
      console.warn('Firebase updateOpportunity fallback:', e);
    }
  }

  const opps = mockStore.getOpportunities();
  mockStore.setOpportunities(
    opps.map((o) => (o.id === opportunityId ? { ...o, ...data, updatedAt: new Date().toISOString() } : o))
  );
};

/**
 * Delete an opportunity
 */
export const deleteOpportunity = async (opportunityId) => {
  if (isFirebaseConfigured) {
    try {
      await deleteDoc(doc(db, 'opportunities', opportunityId));
      return;
    } catch (e) {
      console.warn('Firebase deleteOpportunity fallback:', e);
    }
  }

  const opps = mockStore.getOpportunities();
  mockStore.setOpportunities(opps.filter((o) => o.id !== opportunityId));
};

/**
 * Get all opportunities
 */
export const getOpportunities = async (filters = {}) => {
  let results = [];
  if (isFirebaseConfigured) {
    try {
      const snap = await getDocs(query(collection(db, 'opportunities'), orderBy('createdAt', 'desc')));
      results = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
    } catch (e) {
      results = mockStore.getOpportunities();
    }
  } else {
    results = mockStore.getOpportunities();
  }

  if (filters.type) {
    results = results.filter((o) => o.type === filters.type);
  }
  if (filters.workMode) {
    results = results.filter((o) => o.workMode === filters.workMode);
  }
  if (filters.search) {
    const lower = filters.search.toLowerCase();
    results = results.filter(
      (o) =>
        o.title?.toLowerCase().includes(lower) ||
        o.company?.toLowerCase().includes(lower) ||
        o.skills?.some((s) => s.toLowerCase().includes(lower))
    );
  }

  return results;
};

/**
 * Get opportunities posted by a specific alumni
 */
export const getAlumniOpportunities = async (alumniId) => {
  if (isFirebaseConfigured) {
    try {
      const snap = await getDocs(
        query(collection(db, 'opportunities'), where('postedBy', '==', alumniId), orderBy('createdAt', 'desc'))
      );
      return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
    } catch (e) {
      // Fallback
    }
  }

  const opps = mockStore.getOpportunities();
  return opps.filter((o) => o.postedBy === alumniId);
};

/**
 * Save an opportunity for a student
 */
export const saveOpportunity = async (studentId, opportunityId) => {
  if (isFirebaseConfigured) {
    try {
      await setDoc(doc(db, 'savedOpportunities', `${studentId}_${opportunityId}`), {
        studentId,
        opportunityId,
        createdAt: serverTimestamp(),
      });
      return;
    } catch (e) {
      // Fallback
    }
  }

  const saved = mockStore.getSavedOpportunities();
  if (!saved.some((s) => s.studentId === studentId && s.opportunityId === opportunityId)) {
    mockStore.setSavedOpportunities([...saved, { studentId, opportunityId }]);
  }
};

/**
 * Unsave an opportunity
 */
export const unsaveOpportunity = async (studentId, opportunityId) => {
  if (isFirebaseConfigured) {
    try {
      await deleteDoc(doc(db, 'savedOpportunities', `${studentId}_${opportunityId}`));
      return;
    } catch (e) {
      // Fallback
    }
  }

  const saved = mockStore.getSavedOpportunities();
  mockStore.setSavedOpportunities(
    saved.filter((s) => !(s.studentId === studentId && s.opportunityId === opportunityId))
  );
};

/**
 * Get saved opportunities for a student
 */
export const getSavedOpportunities = async (studentId) => {
  if (isFirebaseConfigured) {
    try {
      const snap = await getDocs(
        query(collection(db, 'savedOpportunities'), where('studentId', '==', studentId))
      );
      return snap.docs.map((d) => d.data().opportunityId);
    } catch (e) {
      // Fallback
    }
  }

  const saved = mockStore.getSavedOpportunities();
  return saved.filter((s) => s.studentId === studentId).map((s) => s.opportunityId);
};

/**
 * Apply to an opportunity
 */
export const applyOpportunity = async (studentId, opportunityId, applicationData = {}) => {
  if (isFirebaseConfigured) {
    try {
      await setDoc(doc(db, 'appliedOpportunities', `${studentId}_${opportunityId}`), {
        studentId,
        opportunityId,
        ...applicationData,
        appliedAt: serverTimestamp(),
      });
      return;
    } catch (e) {
      console.warn('Firebase applyOpportunity fallback:', e);
    }
  }

  const applied = mockStore.getAppliedOpportunities();
  if (!applied.some((a) => a.studentId === studentId && a.opportunityId === opportunityId)) {
    mockStore.setAppliedOpportunities([
      ...applied,
      {
        id: `${studentId}_${opportunityId}`,
        studentId,
        opportunityId,
        ...applicationData,
        appliedAt: new Date().toISOString(),
      },
    ]);
  }
};

/**
 * Get all opportunities applied to by a student
 */
export const getAppliedOpportunities = async (studentId) => {
  if (isFirebaseConfigured) {
    try {
      const snap = await getDocs(
        query(collection(db, 'appliedOpportunities'), where('studentId', '==', studentId))
      );
      return snap.docs.map((d) => d.data().opportunityId);
    } catch (e) {
      // Fallback
    }
  }

  const applied = mockStore.getAppliedOpportunities();
  return applied.filter((a) => a.studentId === studentId).map((a) => a.opportunityId);
};

/**
 * Check if student has applied to an opportunity
 */
export const hasAppliedOpportunity = async (studentId, opportunityId) => {
  const list = await getAppliedOpportunities(studentId);
  return list.includes(opportunityId);
};

