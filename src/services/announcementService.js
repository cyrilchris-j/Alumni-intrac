import {
  db,
  collection,
  addDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  doc,
  query,
  orderBy,
  serverTimestamp,
} from '../firebase/firestore';
import { broadcastAnnouncement } from './notificationService';
import { isFirebaseConfigured, mockStore } from './mockStorage';

/**
 * Create an announcement (admin)
 */
export const createAnnouncement = async (data, createdBy) => {
  if (isFirebaseConfigured) {
    try {
      const docRef = await addDoc(collection(db, 'announcements'), {
        ...data,
        createdBy,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
      await broadcastAnnouncement(data.title, data.content, data.targetAudience || 'all');
      return docRef.id;
    } catch (e) {
      console.warn('Firebase createAnnouncement fallback:', e);
    }
  }

  const annId = `ann_${Date.now()}`;
  const anns = mockStore.getAnnouncements();
  mockStore.setAnnouncements([
    {
      id: annId,
      ...data,
      createdBy,
      createdAt: new Date().toISOString(),
    },
    ...anns,
  ]);

  await broadcastAnnouncement(data.title, data.content, data.targetAudience || 'all');
  return annId;
};

/**
 * Get all announcements
 */
export const getAnnouncements = async () => {
  if (isFirebaseConfigured) {
    try {
      const snap = await getDocs(query(collection(db, 'announcements'), orderBy('createdAt', 'desc')));
      return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
    } catch (e) {
      // Fallback
    }
  }

  return mockStore.getAnnouncements();
};

/**
 * Get announcements for a specific audience
 */
export const getAnnouncementsForRole = async (role) => {
  const all = await getAnnouncements();
  return all.filter((a) => a.targetAudience === 'all' || a.targetAudience === role);
};

/**
 * Update an announcement
 */
export const updateAnnouncement = async (id, data) => {
  if (isFirebaseConfigured) {
    try {
      await updateDoc(doc(db, 'announcements', id), {
        ...data,
        updatedAt: serverTimestamp(),
      });
      return;
    } catch (e) {
      // Fallback
    }
  }

  const anns = mockStore.getAnnouncements();
  mockStore.setAnnouncements(
    anns.map((a) => (a.id === id ? { ...a, ...data, updatedAt: new Date().toISOString() } : a))
  );
};

/**
 * Delete an announcement
 */
export const deleteAnnouncement = async (id) => {
  if (isFirebaseConfigured) {
    try {
      await deleteDoc(doc(db, 'announcements', id));
      return;
    } catch (e) {
      // Fallback
    }
  }

  const anns = mockStore.getAnnouncements();
  mockStore.setAnnouncements(anns.filter((a) => a.id !== id));
};
