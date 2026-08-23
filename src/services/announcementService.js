import { supabase, isSupabaseConfigured } from '../supabase/client';
import { broadcastAnnouncement } from './notificationService';
import { isFirebaseConfigured, mockStore } from './mockStorage';

/**
 * Create an announcement (admin)
 */
export const createAnnouncement = async (data, createdBy) => {
  if (isSupabaseConfigured) {
    try {
      const { data: insertedData, error } = await supabase
        .from('announcements')
        .insert({
          ...data,
          createdBy,
          updatedAt: new Date().toISOString(),
        })
        .select('id')
        .single();

      if (error) throw error;

      await broadcastAnnouncement(data.title, data.content, data.targetAudience || 'all');
      return insertedData.id;
    } catch (e) {
      console.warn('Supabase createAnnouncement fallback:', e);
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
  if (isSupabaseConfigured) {
    try {
      const { data, error } = await supabase
        .from('announcements')
        .select('*')
        .order('createdAt', { ascending: false });
      if (error) throw error;
      return data || [];
    } catch (e) {
      console.warn('Supabase getAnnouncements fallback:', e);
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
  if (isSupabaseConfigured) {
    try {
      const { error } = await supabase
        .from('announcements')
        .update({
          ...data,
          updatedAt: new Date().toISOString(),
        })
        .eq('id', id);
      if (error) throw error;
      return;
    } catch (e) {
      console.warn('Supabase updateAnnouncement fallback:', e);
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
  if (isSupabaseConfigured) {
    try {
      const { error } = await supabase
        .from('announcements')
        .delete()
        .eq('id', id);
      if (error) throw error;
      return;
    } catch (e) {
      console.warn('Supabase deleteAnnouncement fallback:', e);
    }
  }

  const anns = mockStore.getAnnouncements();
  mockStore.setAnnouncements(anns.filter((a) => a.id !== id));
};
