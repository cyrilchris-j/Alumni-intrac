import { supabase, isSupabaseConfigured } from '../supabase/client';
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

  const users = mockStore.getUsers();
  const senderUser = users.find((u) => u.uid === senderId || u.id === senderId);
  const receiverUser = users.find((u) => u.uid === receiverId || u.id === receiverId);
  if (senderUser?.role === 'student' && receiverUser?.role === 'student') {
    throw new Error('Student to student connections are disabled.');
  }

  if (isSupabaseConfigured) {
    try {
      const { data: insertedData, error } = await supabase
        .from('connections')
        .insert({
          senderId,
          receiverId,
          status: CONNECTION_STATUS.PENDING,
          updatedAt: new Date().toISOString(),
        })
        .select('id')
        .single();

      if (error) throw error;

      await createNotification(receiverId, {
        type: NOTIFICATION_TYPES.CONNECTION_REQUEST,
        title: 'New Connection Request',
        message: `${senderName} sent you a connection request.`,
        relatedId: senderId,
      });

      return insertedData.id;
    } catch (e) {
      console.warn('Supabase sendConnectionRequest fallback:', e);
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
  if (isSupabaseConfigured) {
    try {
      // Look up senderId=uid1 AND receiverId=uid2
      const { data: d1, error: e1 } = await supabase
        .from('connections')
        .select('*')
        .eq('senderId', uid1)
        .eq('receiverId', uid2)
        .maybeSingle();

      if (e1) throw e1;
      if (d1) return d1;

      // Look up senderId=uid2 AND receiverId=uid1
      const { data: d2, error: e2 } = await supabase
        .from('connections')
        .select('*')
        .eq('senderId', uid2)
        .eq('receiverId', uid1)
        .maybeSingle();

      if (e2) throw e2;
      if (d2) return d2;

      return null;
    } catch (e) {
      console.warn('Supabase getConnectionStatus fallback:', e);
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
  if (isSupabaseConfigured) {
    try {
      const { error } = await supabase
        .from('connections')
        .update({
          status: CONNECTION_STATUS.ACCEPTED,
          updatedAt: new Date().toISOString(),
        })
        .eq('id', connectionId);

      if (error) throw error;

      await createNotification(senderId, {
        type: NOTIFICATION_TYPES.CONNECTION_ACCEPTED,
        title: 'Connection Accepted',
        message: `${receiverName} accepted your connection request.`,
        relatedId: connectionId,
      });
      return;
    } catch (e) {
      console.warn('Supabase acceptConnection fallback:', e);
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
  if (isSupabaseConfigured) {
    try {
      const { error } = await supabase
        .from('connections')
        .update({
          status: CONNECTION_STATUS.REJECTED,
          updatedAt: new Date().toISOString(),
        })
        .eq('id', connectionId);
      if (error) throw error;
      return;
    } catch (e) {
      console.warn('Supabase rejectConnection fallback:', e);
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
  if (isSupabaseConfigured) {
    try {
      const { data, error } = await supabase
        .from('connections')
        .select('*')
        .eq('status', CONNECTION_STATUS.ACCEPTED)
        .or(`senderId.eq.${uid},receiverId.eq.${uid}`);

      if (error) throw error;
      return data || [];
    } catch (e) {
      console.warn('Supabase getUserConnections fallback:', e);
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
  if (isSupabaseConfigured) {
    try {
      const { data, error } = await supabase
        .from('connections')
        .select('*')
        .eq('receiverId', uid)
        .eq('status', CONNECTION_STATUS.PENDING);
      if (error) throw error;
      return data || [];
    } catch (e) {
      console.warn('Supabase getPendingRequests fallback:', e);
    }
  }

  const conns = mockStore.getConnections();
  return conns.filter((c) => c.receiverId === uid && c.status === CONNECTION_STATUS.PENDING);
};

/**
 * Get pending requests sent by a user
 */
export const getSentRequests = async (uid) => {
  if (isSupabaseConfigured) {
    try {
      const { data, error } = await supabase
        .from('connections')
        .select('*')
        .eq('senderId', uid)
        .eq('status', CONNECTION_STATUS.PENDING);
      if (error) throw error;
      return data || [];
    } catch (e) {
      console.warn('Supabase getSentRequests fallback:', e);
    }
  }

  const conns = mockStore.getConnections();
  return conns.filter((c) => c.senderId === uid && c.status === CONNECTION_STATUS.PENDING);
};
