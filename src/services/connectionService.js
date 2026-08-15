import {
  db,
  collection,
  doc,
  addDoc,
  getDocs,
  updateDoc,
  query,
  where,
  serverTimestamp,
} from '../firebase/firestore';
import { CONNECTION_STATUS, NOTIFICATION_TYPES } from '../utils/constants';
import { createNotification } from './notificationService';
import { isFirebaseConfigured, mockStore } from './mockStorage';

/**
 * Send a connection request
 */
export const sendConnectionRequest = async (senderId, receiverId, senderName) => {
  const existing = await getConnectionStatus(senderId, receiverId);
  if (existing) {
    throw new Error('A connection request already exists between these users.');
  }

  if (isFirebaseConfigured) {
    try {
      const docRef = await addDoc(collection(db, 'connections'), {
        senderId,
        receiverId,
        status: CONNECTION_STATUS.PENDING,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });

      await createNotification(receiverId, {
        type: NOTIFICATION_TYPES.CONNECTION_REQUEST,
        title: 'New Connection Request',
        message: `${senderName} sent you a connection request.`,
        relatedId: senderId,
      });

      return docRef.id;
    } catch (e) {
      console.warn('Firebase sendConnectionRequest fallback:', e);
    }
  }

  const connId = `conn_${Date.now()}`;
  const conns = mockStore.getConnections();
  mockStore.setConnections([
    ...conns,
    {
      id: connId,
      senderId,
      receiverId,
      status: CONNECTION_STATUS.PENDING,
      createdAt: new Date().toISOString(),
    },
  ]);

  await createNotification(receiverId, {
    type: NOTIFICATION_TYPES.CONNECTION_REQUEST,
    title: 'New Connection Request',
    message: `${senderName} sent you a connection request.`,
    relatedId: senderId,
  });

  return connId;
};

/**
 * Get connection status between two users
 */
export const getConnectionStatus = async (uid1, uid2) => {
  if (isFirebaseConfigured) {
    try {
      const q1 = query(collection(db, 'connections'), where('senderId', '==', uid1), where('receiverId', '==', uid2));
      const q2 = query(collection(db, 'connections'), where('senderId', '==', uid2), where('receiverId', '==', uid1));
      const [snap1, snap2] = await Promise.all([getDocs(q1), getDocs(q2)]);
      if (!snap1.empty) return { id: snap1.docs[0].id, ...snap1.docs[0].data() };
      if (!snap2.empty) return { id: snap2.docs[0].id, ...snap2.docs[0].data() };
      return null;
    } catch (e) {
      // Fallback below
    }
  }

  const conns = mockStore.getConnections();
  return conns.find(
    (c) => (c.senderId === uid1 && c.receiverId === uid2) || (c.senderId === uid2 && c.receiverId === uid1)
  ) || null;
};

/**
 * Accept a connection request
 */
export const acceptConnection = async (connectionId, receiverName, senderId) => {
  if (isFirebaseConfigured) {
    try {
      await updateDoc(doc(db, 'connections', connectionId), {
        status: CONNECTION_STATUS.ACCEPTED,
        updatedAt: serverTimestamp(),
      });
      await createNotification(senderId, {
        type: NOTIFICATION_TYPES.CONNECTION_ACCEPTED,
        title: 'Connection Accepted',
        message: `${receiverName} accepted your connection request.`,
        relatedId: connectionId,
      });
      return;
    } catch (e) {
      console.warn('Firebase acceptConnection fallback:', e);
    }
  }

  const conns = mockStore.getConnections();
  mockStore.setConnections(
    conns.map((c) => (c.id === connectionId ? { ...c, status: CONNECTION_STATUS.ACCEPTED } : c))
  );

  await createNotification(senderId, {
    type: NOTIFICATION_TYPES.CONNECTION_ACCEPTED,
    title: 'Connection Accepted',
    message: `${receiverName} accepted your connection request.`,
    relatedId: connectionId,
  });
};

/**
 * Reject a connection request
 */
export const rejectConnection = async (connectionId) => {
  if (isFirebaseConfigured) {
    try {
      await updateDoc(doc(db, 'connections', connectionId), {
        status: CONNECTION_STATUS.REJECTED,
        updatedAt: serverTimestamp(),
      });
      return;
    } catch (e) {
      console.warn('Firebase rejectConnection fallback:', e);
    }
  }

  const conns = mockStore.getConnections();
  mockStore.setConnections(
    conns.map((c) => (c.id === connectionId ? { ...c, status: CONNECTION_STATUS.REJECTED } : c))
  );
};

/**
 * Get all connections for a user (accepted only)
 */
export const getUserConnections = async (uid) => {
  if (isFirebaseConfigured) {
    try {
      const [snap1, snap2] = await Promise.all([
        getDocs(query(collection(db, 'connections'), where('senderId', '==', uid), where('status', '==', CONNECTION_STATUS.ACCEPTED))),
        getDocs(query(collection(db, 'connections'), where('receiverId', '==', uid), where('status', '==', CONNECTION_STATUS.ACCEPTED))),
      ]);
      return [
        ...snap1.docs.map((d) => ({ id: d.id, ...d.data() })),
        ...snap2.docs.map((d) => ({ id: d.id, ...d.data() })),
      ];
    } catch (e) {
      // Fallback
    }
  }

  const conns = mockStore.getConnections();
  return conns.filter(
    (c) => (c.senderId === uid || c.receiverId === uid) && c.status === CONNECTION_STATUS.ACCEPTED
  );
};

/**
 * Get pending requests received by a user
 */
export const getPendingRequests = async (uid) => {
  if (isFirebaseConfigured) {
    try {
      const snap = await getDocs(
        query(collection(db, 'connections'), where('receiverId', '==', uid), where('status', '==', CONNECTION_STATUS.PENDING))
      );
      return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
    } catch (e) {
      // Fallback
    }
  }

  const conns = mockStore.getConnections();
  return conns.filter((c) => c.receiverId === uid && c.status === CONNECTION_STATUS.PENDING);
};

/**
 * Get pending requests sent by a user
 */
export const getSentRequests = async (uid) => {
  if (isFirebaseConfigured) {
    try {
      const snap = await getDocs(
        query(collection(db, 'connections'), where('senderId', '==', uid), where('status', '==', CONNECTION_STATUS.PENDING))
      );
      return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
    } catch (e) {
      // Fallback
    }
  }

  const conns = mockStore.getConnections();
  return conns.filter((c) => c.senderId === uid && c.status === CONNECTION_STATUS.PENDING);
};
