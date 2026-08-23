import { supabase, isSupabaseConfigured } from '../supabase/client';
import { getConversationId } from '../utils/formatters';
import { isFirebaseConfigured, mockStore } from './mockStorage';

/**
 * Get or create a conversation between two users
 */
export const getOrCreateConversation = async (uid1, uid2, names) => {
  const conversationId = getConversationId(uid1, uid2);

  if (isSupabaseConfigured) {
    try {
      const { data: conv, error } = await supabase
        .from('conversations')
        .select('*')
        .eq('id', conversationId)
        .maybeSingle();

      if (error) throw error;

      if (!conv) {
        const { error: insertError } = await supabase
          .from('conversations')
          .insert({
            id: conversationId,
            participants: [uid1, uid2],
            participantNames: names || {},
            lastMessage: '',
            lastMessageAt: new Date().toISOString(),
          });
        if (insertError) throw insertError;
      }
      return conversationId;
    } catch (e) {
      console.warn('Supabase getOrCreateConversation fallback:', e);
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
  if (isSupabaseConfigured) {
    try {
      // Insert message
      const { error: msgError } = await supabase
        .from('messages')
        .insert({
          conversationId,
          senderId,
          receiverId,
          text,
          read: false,
        });

      if (msgError) throw msgError;

      // Fetch existing unread map to toggle receiver's status
      const { data: conv } = await supabase
        .from('conversations')
        .select('unreadCount')
        .eq('id', conversationId)
        .maybeSingle();

      const nextUnread = { ...(conv?.unreadCount || {}), [receiverId]: true };

      // Update conversation
      const { error: convError } = await supabase
        .from('conversations')
        .update({
          lastMessage: text,
          lastMessageAt: new Date().toISOString(),
          unreadCount: nextUnread,
        })
        .eq('id', conversationId);

      if (convError) throw convError;
      return;
    } catch (e) {
      console.warn('Supabase sendMessage fallback:', e);
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
  if (isSupabaseConfigured) {
    // Initial load
    supabase
      .from('messages')
      .select('*')
      .eq('conversationId', conversationId)
      .order('createdAt', { ascending: true })
      .then(({ data }) => {
        callback(data || []);
      });

    // Realtime channel
    const channel = supabase
      .channel(`public:messages:conversationId=eq.${conversationId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `conversationId=eq.${conversationId}`,
        },
        async () => {
          const { data } = await supabase
            .from('messages')
            .select('*')
            .eq('conversationId', conversationId)
            .order('createdAt', { ascending: true });
          callback(data || []);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
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
  if (isSupabaseConfigured) {
    const fetchConvs = async () => {
      const { data } = await supabase
        .from('conversations')
        .select('*')
        .contains('participants', [uid])
        .order('lastMessageAt', { ascending: false });
      callback(data || []);
    };

    fetchConvs();

    const channel = supabase
      .channel(`public:conversations:participant=eq.${uid}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'conversations',
        },
        async () => {
          await fetchConvs();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
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
  if (isSupabaseConfigured) {
    try {
      const { data: conv } = await supabase
        .from('conversations')
        .select('unreadCount')
        .eq('id', conversationId)
        .maybeSingle();

      const nextUnread = { ...(conv?.unreadCount || {}), [uid]: false };

      await supabase
        .from('conversations')
        .update({ unreadCount: nextUnread })
        .eq('id', conversationId);
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
