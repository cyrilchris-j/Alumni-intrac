import {
  db,
  collection,
  doc,
  addDoc,
  getDocs,
  updateDoc,
  query,
  where,
  orderBy,
  serverTimestamp,
} from '../firebase/firestore';
import { MENTORSHIP_STATUS, NOTIFICATION_TYPES } from '../utils/constants';
import { createNotification } from './notificationService';
import { isFirebaseConfigured, mockStore } from './mockStorage';

/**
 * Send a mentorship request
 */
export const sendMentorshipRequest = async (studentId, alumniId, { topic, message, preferredArea, availability }, studentName) => {
  if (isFirebaseConfigured) {
    try {
      const existing = await getDocs(
        query(
          collection(db, 'mentorshipRequests'),
          where('studentId', '==', studentId),
          where('alumniId', '==', alumniId),
          where('status', '==', MENTORSHIP_STATUS.PENDING)
        )
      );

      if (!existing.empty) {
        throw new Error('You already have a pending mentorship request with this alumni.');
      }

      const docRef = await addDoc(collection(db, 'mentorshipRequests'), {
        studentId,
        alumniId,
        topic,
        message,
        preferredArea,
        availability: availability || '',
        status: MENTORSHIP_STATUS.PENDING,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });

      await createNotification(alumniId, {
        type: NOTIFICATION_TYPES.MENTORSHIP_REQUEST,
        title: 'New Mentorship Request',
        message: `${studentName} has requested you as a mentor. Topic: ${topic}`,
        relatedId: docRef.id,
      });

      return docRef.id;
    } catch (e) {
      if (e.message?.includes('already have')) throw e;
      console.warn('Firebase sendMentorshipRequest fallback:', e);
    }
  }

  const ments = mockStore.getMentorships();
  const already = ments.find(
    (m) => m.studentId === studentId && m.alumniId === alumniId && m.status === MENTORSHIP_STATUS.PENDING
  );
  if (already) {
    throw new Error('You already have a pending mentorship request with this alumni.');
  }

  const reqId = `ment_${Date.now()}`;
  mockStore.setMentorships([
    ...ments,
    {
      id: reqId,
      studentId,
      alumniId,
      topic,
      message,
      preferredArea,
      availability: availability || '',
      status: MENTORSHIP_STATUS.PENDING,
      createdAt: new Date().toISOString(),
    },
  ]);

  await createNotification(alumniId, {
    type: NOTIFICATION_TYPES.MENTORSHIP_REQUEST,
    title: 'New Mentorship Request',
    message: `${studentName} has requested you as a mentor. Topic: ${topic}`,
    relatedId: reqId,
  });

  return reqId;
};

/**
 * Accept a mentorship request
 */
export const acceptMentorshipRequest = async (requestId, alumniName, studentId) => {
  if (isFirebaseConfigured) {
    try {
      await updateDoc(doc(db, 'mentorshipRequests', requestId), {
        status: MENTORSHIP_STATUS.ACCEPTED,
        updatedAt: serverTimestamp(),
      });
      await createNotification(studentId, {
        type: NOTIFICATION_TYPES.MENTORSHIP_ACCEPTED,
        title: 'Mentorship Request Accepted!',
        message: `${alumniName} accepted your mentorship request.`,
        relatedId: requestId,
      });
      return;
    } catch (e) {
      console.warn('Firebase acceptMentorshipRequest fallback:', e);
    }
  }

  const ments = mockStore.getMentorships();
  mockStore.setMentorships(
    ments.map((m) => (m.id === requestId ? { ...m, status: MENTORSHIP_STATUS.ACCEPTED } : m))
  );

  await createNotification(studentId, {
    type: NOTIFICATION_TYPES.MENTORSHIP_ACCEPTED,
    title: 'Mentorship Request Accepted!',
    message: `${alumniName} accepted your mentorship request.`,
    relatedId: requestId,
  });
};

/**
 * Reject a mentorship request
 */
export const rejectMentorshipRequest = async (requestId, alumniName, studentId) => {
  if (isFirebaseConfigured) {
    try {
      await updateDoc(doc(db, 'mentorshipRequests', requestId), {
        status: MENTORSHIP_STATUS.REJECTED,
        updatedAt: serverTimestamp(),
      });
      await createNotification(studentId, {
        type: NOTIFICATION_TYPES.MENTORSHIP_REJECTED,
        title: 'Mentorship Request Update',
        message: `${alumniName} is currently unable to take on new mentees.`,
        relatedId: requestId,
      });
      return;
    } catch (e) {
      console.warn('Firebase rejectMentorshipRequest fallback:', e);
    }
  }

  const ments = mockStore.getMentorships();
  mockStore.setMentorships(
    ments.map((m) => (m.id === requestId ? { ...m, status: MENTORSHIP_STATUS.REJECTED } : m))
  );

  await createNotification(studentId, {
    type: NOTIFICATION_TYPES.MENTORSHIP_REJECTED,
    title: 'Mentorship Request Update',
    message: `${alumniName} is currently unable to take on new mentees.`,
    relatedId: requestId,
  });
};

/**
 * Complete a mentorship
 */
export const completeMentorship = async (requestId) => {
  if (isFirebaseConfigured) {
    try {
      await updateDoc(doc(db, 'mentorshipRequests', requestId), {
        status: MENTORSHIP_STATUS.COMPLETED,
        updatedAt: serverTimestamp(),
      });
      return;
    } catch (e) {
      console.warn('Firebase completeMentorship fallback:', e);
    }
  }

  const ments = mockStore.getMentorships();
  mockStore.setMentorships(
    ments.map((m) => (m.id === requestId ? { ...m, status: MENTORSHIP_STATUS.COMPLETED } : m))
  );
};

/**
 * Get mentorship requests for a student
 */
export const getStudentMentorshipRequests = async (studentId) => {
  if (isFirebaseConfigured) {
    try {
      const snap = await getDocs(
        query(collection(db, 'mentorshipRequests'), where('studentId', '==', studentId), orderBy('createdAt', 'desc'))
      );
      return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
    } catch (e) {
      // Fallback
    }
  }

  const ments = mockStore.getMentorships();
  return ments.filter((m) => m.studentId === studentId);
};

/**
 * Get mentorship requests for an alumni
 */
export const getAlumniMentorshipRequests = async (alumniId) => {
  if (isFirebaseConfigured) {
    try {
      const snap = await getDocs(
        query(collection(db, 'mentorshipRequests'), where('alumniId', '==', alumniId), orderBy('createdAt', 'desc'))
      );
      return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
    } catch (e) {
      // Fallback
    }
  }

  const ments = mockStore.getMentorships();
  return ments.filter((m) => m.alumniId === alumniId);
};
