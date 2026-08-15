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
  onSnapshot,
  serverTimestamp,
} from '../firebase/firestore';
import { isFirebaseConfigured, mockStore } from './mockStorage';

/**
 * Create a notification for a user
 */
export const createNotification = async (userId, { type, title, message, relatedId = null }) => {
  if (isFirebaseConfigured) {
    try {
      await addDoc(collection(db, 'notifications'), {
        userId,
        type,
        title,
        message,
        relatedId,
        read: false,
        createdAt: serverTimestamp(),
      });
      return;
    } catch (e) {
      console.warn('Firebase createNotification fallback:', e);
    }
  }

  const notifs = mockStore.getNotifications();
  mockStore.setNotifications([
    {
      id: `notif_${Date.now()}_${Math.random()}`,
      userId,
      type,
      title,
      message,
      relatedId,
      read: false,
      createdAt: new Date().toISOString(),
    },
    ...notifs,
  ]);
};

/**
 * Get notifications for a user
 */
export const getUserNotifications = async (userId) => {
  if (isFirebaseConfigured) {
    try {
      const snap = await getDocs(
        query(collection(db, 'notifications'), where('userId', '==', userId), orderBy('createdAt', 'desc'))
      );
      return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
    } catch (e) {
      // Fallback
    }
  }

  const notifs = mockStore.getNotifications();
  return notifs.filter((n) => n.userId === userId);
};

/**
 * Real-time listener for user notifications
 */
export const listenToNotifications = (userId, callback) => {
  if (isFirebaseConfigured) {
    try {
      const q = query(
        collection(db, 'notifications'),
        where('userId', '==', userId),
        orderBy('createdAt', 'desc')
      );
      return onSnapshot(q, (snap) => {
        const notifications = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
        callback(notifications);
      });
    } catch (e) {
      // Fallback
    }
  }

  const emit = () => {
    const notifs = mockStore.getNotifications().filter((n) => n.userId === userId);
    callback(notifs);
  };

  emit();

  const handleUpdate = () => emit();
  window.addEventListener('alumlink_storage_update', handleUpdate);

  return () => {
    window.removeEventListener('alumlink_storage_update', handleUpdate);
  };
};

/**
 * Mark a notification as read
 */
export const markNotificationRead = async (notificationId) => {
  if (isFirebaseConfigured) {
    try {
      await updateDoc(doc(db, 'notifications', notificationId), { read: true });
      return;
    } catch (e) {
      // Fallback
    }
  }

  const notifs = mockStore.getNotifications();
  mockStore.setNotifications(
    notifs.map((n) => (n.id === notificationId ? { ...n, read: true } : n))
  );
};

/**
 * Mark all notifications as read
 */
export const markAllNotificationsRead = async (userId) => {
  if (isFirebaseConfigured) {
    try {
      const snap = await getDocs(
        query(collection(db, 'notifications'), where('userId', '==', userId), where('read', '==', false))
      );
      await Promise.all(snap.docs.map((d) => updateDoc(doc(db, 'notifications', d.id), { read: true })));
      return;
    } catch (e) {
      // Fallback
    }
  }

  const notifs = mockStore.getNotifications();
  mockStore.setNotifications(
    notifs.map((n) => (n.userId === userId ? { ...n, read: true } : n))
  );
};

/**
 * Broadcast announcement
 */
export const broadcastAnnouncement = async (title, message, targetRole) => {
  const users = isFirebaseConfigured ? await (await getDocs(collection(db, 'users'))).docs.map(d=>({id: d.id, ...d.data()})) : mockStore.getUsers();
  const targets = users.filter((u) => targetRole === 'all' || u.role === targetRole);
  for (const t of targets) {
    await createNotification(t.uid || t.id, {
      type: 'announcement',
      title,
      message,
    });
  }
};
