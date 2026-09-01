import { supabase, isSupabaseConfigured } from '../supabase/client';
import { mockStore } from './mockStorage';

/**
 * Create a notification for a user
 */
export const createNotification = async (userId, { type, title, message, relatedId = null }) => {
  if (isSupabaseConfigured) {
    try {
      const { error } = await supabase
        .from('notifications')
        .insert({
          userId,
          type,
          title,
          message,
          relatedId: relatedId ? String(relatedId) : null,
          read: false,
        });
      if (error) throw error;
      return;
    } catch (e) {
      console.warn('Supabase createNotification fallback:', e);
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
  if (isSupabaseConfigured) {
    try {
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('userId', userId)
        .order('createdAt', { ascending: false });
      if (error) throw error;
      return data || [];
    } catch (e) {
      console.warn('Supabase getUserNotifications error:', e);
    }
  }

  const notifs = mockStore.getNotifications();
  return notifs.filter((n) => n.userId === userId);
};

/**
 * Real-time listener for user notifications
 */
export const listenToNotifications = (userId, callback) => {
  if (isSupabaseConfigured) {
    // Initial fetch
    getUserNotifications(userId).then((notifs) => {
      callback(notifs);
    });

    const channel = supabase
      .channel(`public:notifications:userId=eq.${userId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'notifications',
          filter: `userId=eq.${userId}`,
        },
        async (payload) => {
          const fresh = await getUserNotifications(userId);
          callback(fresh);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
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
  if (isSupabaseConfigured) {
    try {
      const { error } = await supabase
        .from('notifications')
        .update({ read: true })
        .eq('id', notificationId);
      if (error) throw error;
      return;
    } catch (e) {
      console.warn('Supabase markNotificationRead error:', e);
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
  if (isSupabaseConfigured) {
    try {
      const { error } = await supabase
        .from('notifications')
        .update({ read: true })
        .eq('userId', userId)
        .eq('read', false);
      if (error) throw error;
      return;
    } catch (e) {
      console.warn('Supabase markAllNotificationsRead error:', e);
    }
  }

  const notifs = mockStore.getNotifications();
  mockStore.setNotifications(
    notifs.map((n) => (n.userId === userId ? { ...n, read: true } : n))
  );
};

/**
 * Delete a notification
 */
export const deleteNotification = async (notificationId) => {
  if (isSupabaseConfigured) {
    try {
      const { error } = await supabase
        .from('notifications')
        .delete()
        .eq('id', notificationId);
      if (error) throw error;
      return;
    } catch (e) {
      console.warn('Supabase deleteNotification error:', e);
    }
  }

  const notifs = mockStore.getNotifications();
  mockStore.setNotifications(notifs.filter((n) => n.id !== notificationId));
};


/**
 * Broadcast announcement
 */
export const broadcastAnnouncement = async (title, message, targetRole) => {
  const users = isSupabaseConfigured
    ? await (async () => {
        const { data } = await supabase.from('users').select('*');
        return data || [];
      })()
    : mockStore.getUsers();

  const targets = users.filter((u) => targetRole === 'all' || u.role === targetRole);
  for (const t of targets) {
    await createNotification(t.uid || t.id, {
      type: 'announcement',
      title,
      message,
    });
  }
};
