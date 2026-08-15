import {
  db,
  collection,
  doc,
  addDoc,
  getDoc,
  getDocs,
  updateDoc,
  setDoc,
  query,
  where,
  orderBy,
  onSnapshot,
  serverTimestamp,
} from '../firebase/firestore';
import { getConversationId } from '../utils/formatters';
import { isFirebaseConfigured, mockStore } from './mockStorage';

/**
 * Get or create a conversation between two users
 */
export const getOrCreateConversation = async (uid1, uid2, names) => {
  const conversationId = getConversationId(uid1, uid2);

  if (isFirebaseConfigured) {
    try {
      const convRef = doc(db, 'conversations', conversationId);
      const convDoc = await getDoc(convRef);

      if (!convDoc.exists()) {
        await setDoc(convRef, {
          id: conversationId,
          participants: [uid1, uid2],
          participantNames: names || {},
          lastMessage: '',
          lastMessageAt: serverTimestamp(),
          createdAt: serverTimestamp(),
        });
      }
      return conversationId;
    } catch (e) {
      console.warn('Firebase getOrCreateConversation fallback:', e);
    }
  }

  const convs = mockStore.getConversations();
  const existing = convs.find((c) => c.id === conversationId);
  if (!existing) {
    mockStore.setConversations([
      ...convs,
      {
        id: conversationId,
        participants: [uid1, uid2],
        participantNames: names || {},
        lastMessage: '',
        lastMessageAt: new Date().toISOString(),
        createdAt: new Date().toISOString(),
      },
    ]);
  }

  return conversationId;
};

/**
 * Send a message
 */
export const sendMessage = async (conversationId, senderId, receiverId, text) => {
  if (isFirebaseConfigured) {
    try {
      await addDoc(collection(db, 'messages'), {
        conversationId,
        senderId,
        receiverId,
        text,
        read: false,
        createdAt: serverTimestamp(),
      });

      await updateDoc(doc(db, 'conversations', conversationId), {
        lastMessage: text,
        lastMessageAt: serverTimestamp(),
        [`unreadCount.${receiverId}`]: true,
      });
      return;
    } catch (e) {
      console.warn('Firebase sendMessage fallback:', e);
    }
  }

  const msgs = mockStore.getMessages();
  const newMsg = {
    id: `msg_${Date.now()}`,
    conversationId,
    senderId,
    receiverId,
    text,
    read: false,
    createdAt: new Date().toISOString(),
  };
  mockStore.setMessages([...msgs, newMsg]);

  const convs = mockStore.getConversations();
  mockStore.setConversations(
    convs.map((c) =>
      c.id === conversationId
        ? {
            ...c,
            lastMessage: text,
            lastMessageAt: new Date().toISOString(),
            unreadCount: { ...c.unreadCount, [receiverId]: true },
          }
        : c
    )
  );

  window.dispatchEvent(new CustomEvent('alumlink_message_sent', { detail: { conversationId } }));
};

/**
 * Real-time listener for messages in a conversation
 */
export const listenToMessages = (conversationId, callback) => {
  if (isFirebaseConfigured) {
    try {
      const q = query(
        collection(db, 'messages'),
        where('conversationId', '==', conversationId),
        orderBy('createdAt', 'asc')
      );
      return onSnapshot(q, (snap) => {
        const messages = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
        callback(messages);
      });
    } catch (e) {
      console.warn('Firebase listenToMessages fallback:', e);
    }
  }

  const emitMessages = () => {
    const msgs = mockStore.getMessages().filter((m) => m.conversationId === conversationId);
    callback(msgs);
  };

  emitMessages();

  const handleUpdate = () => emitMessages();
  window.addEventListener('alumlink_message_sent', handleUpdate);
  window.addEventListener('alumlink_storage_update', handleUpdate);

  return () => {
    window.removeEventListener('alumlink_message_sent', handleUpdate);
    window.removeEventListener('alumlink_storage_update', handleUpdate);
  };
};

/**
 * Real-time listener for user conversations
 */
export const listenToConversations = (uid, callback) => {
  if (isFirebaseConfigured) {
    try {
      const q = query(
        collection(db, 'conversations'),
        where('participants', 'array-contains', uid),
        orderBy('lastMessageAt', 'desc')
      );
      return onSnapshot(q, (snap) => {
        const conversations = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
        callback(conversations);
      });
    } catch (e) {
      console.warn('Firebase listenToConversations fallback:', e);
    }
  }

  const emitConvs = () => {
    const convs = mockStore.getConversations().filter((c) => c.participants.includes(uid));
    callback(convs);
  };

  emitConvs();

  const handleUpdate = () => emitConvs();
  window.addEventListener('alumlink_message_sent', handleUpdate);
  window.addEventListener('alumlink_storage_update', handleUpdate);

  return () => {
    window.removeEventListener('alumlink_message_sent', handleUpdate);
    window.removeEventListener('alumlink_storage_update', handleUpdate);
  };
};

/**
 * Mark messages in a conversation as read
 */
export const markConversationAsRead = async (conversationId, uid) => {
  if (isFirebaseConfigured) {
    try {
      await updateDoc(doc(db, 'conversations', conversationId), {
        [`unreadCount.${uid}`]: false,
      });
    } catch (e) {
      // Ignored
    }
  }

  const convs = mockStore.getConversations();
  mockStore.setConversations(
    convs.map((c) =>
      c.id === conversationId
        ? { ...c, unreadCount: { ...c.unreadCount, [uid]: false } }
        : c
    )
  );
};
