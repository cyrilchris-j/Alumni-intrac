import { supabase, isSupabaseConfigured } from '../supabase/client';
import { isFirebaseConfigured, mockStore } from './mockStorage';

/**
 * Create an event (admin)
 */
export const createEvent = async (data, createdBy) => {
  if (isSupabaseConfigured) {
    try {
      const { data: insertedData, error } = await supabase
        .from('events')
        .insert({
          ...data,
          createdBy,
          registrationCount: 0,
          updatedAt: new Date().toISOString(),
        })
        .select('id')
        .single();

      if (error) throw error;
      return insertedData.id;
    } catch (e) {
      console.warn('Supabase createEvent fallback:', e);
    }
  }

  const evId = `ev_${Date.now()}`;
  const events = mockStore.getEvents();
  mockStore.setEvents([
    {
      id: evId,
      ...data,
      createdBy,
      registrationCount: 0,
      createdAt: new Date().toISOString(),
    },
    ...events,
  ]);
  return evId;
};

/**
 * Update an event
 */
export const updateEvent = async (eventId, data) => {
  if (isSupabaseConfigured) {
    try {
      const { error } = await supabase
        .from('events')
        .update({
          ...data,
          updatedAt: new Date().toISOString(),
        })
        .eq('id', eventId);
      if (error) throw error;
      return;
    } catch (e) {
      console.warn('Supabase updateEvent fallback:', e);
    }
  }

  const events = mockStore.getEvents();
  mockStore.setEvents(
    events.map((e) => (e.id === eventId ? { ...e, ...data, updatedAt: new Date().toISOString() } : e))
  );
};

/**
 * Delete an event
 */
export const deleteEvent = async (eventId) => {
  if (isSupabaseConfigured) {
    try {
      const { error } = await supabase
        .from('events')
        .delete()
        .eq('id', eventId);
      if (error) throw error;
      return;
    } catch (e) {
      console.warn('Supabase deleteEvent fallback:', e);
    }
  }

  const events = mockStore.getEvents();
  mockStore.setEvents(events.filter((e) => e.id !== eventId));
};

/**
 * Get all events
 */
export const getEvents = async () => {
  if (isSupabaseConfigured) {
    try {
      const { data, error } = await supabase
        .from('events')
        .select('*')
        .order('date', { ascending: true });
      if (error) throw error;
      return data || [];
    } catch (e) {
      console.warn('Supabase getEvents fallback:', e);
    }
  }

  return mockStore.getEvents();
};

/**
 * Get upcoming events
 */
export const getUpcomingEvents = async (lim = 5) => {
  const all = await getEvents();
  return all.slice(0, lim);
};

/**
 * Register for an event
 */
export const registerForEvent = async (eventId, userId, userName) => {
  if (isSupabaseConfigured) {
    try {
      const { error } = await supabase
        .from('eventRegistrations')
        .upsert({
          eventId,
          userId,
          userName,
        });
      if (error) throw error;

      // Increment registration count
      const { data: ev } = await supabase.from('events').select('registrationCount').eq('id', eventId).maybeSingle();
      await supabase
        .from('events')
        .update({ registrationCount: (ev?.registrationCount || 0) + 1 })
        .eq('id', eventId);

      return;
    } catch (e) {
      console.warn('Supabase registerForEvent fallback:', e);
    }
  }

  const regs = mockStore.getEventRegistrations();
  mockStore.setEventRegistrations([
    ...regs,
    { id: `${eventId}_${userId}`, eventId, userId, userName, registeredAt: new Date().toISOString() },
  ]);

  const events = mockStore.getEvents();
  mockStore.setEvents(
    events.map((ev) =>
      ev.id === eventId ? { ...ev, registrationCount: (ev.registrationCount || 0) + 1 } : ev
    )
  );
};

/**
 * Cancel event registration
 */
export const cancelEventRegistration = async (eventId, userId) => {
  if (isSupabaseConfigured) {
    try {
      const { error } = await supabase
        .from('eventRegistrations')
        .delete()
        .eq('eventId', eventId)
        .eq('userId', userId);
      if (error) throw error;

      // Decrement registration count
      const { data: ev } = await supabase.from('events').select('registrationCount').eq('id', eventId).maybeSingle();
      await supabase
        .from('events')
        .update({ registrationCount: Math.max(0, (ev?.registrationCount || 1) - 1) })
        .eq('id', eventId);

      return;
    } catch (e) {
      console.warn('Supabase cancelEventRegistration fallback:', e);
    }
  }

  const regs = mockStore.getEventRegistrations();
  mockStore.setEventRegistrations(
    regs.filter((r) => !(r.eventId === eventId && r.userId === userId))
  );

  const events = mockStore.getEvents();
  mockStore.setEvents(
    events.map((ev) =>
      ev.id === eventId
        ? { ...ev, registrationCount: Math.max(0, (ev.registrationCount || 1) - 1) }
        : ev
    )
  );
};

/**
 * Get events a user is registered for
 */
export const getUserEventRegistrations = async (userId) => {
  if (isSupabaseConfigured) {
    try {
      const { data, error } = await supabase
        .from('eventRegistrations')
        .select('eventId')
        .eq('userId', userId);
      if (error) throw error;
      return data.map((d) => d.eventId);
    } catch (e) {
      console.warn('Supabase getUserEventRegistrations error:', e);
    }
  }

  const regs = mockStore.getEventRegistrations();
  return regs.filter((r) => r.userId === userId).map((r) => r.eventId);
};

/**
 * Get registrations for an event (admin)
 */
export const getEventRegistrations = async (eventId) => {
  if (isSupabaseConfigured) {
    try {
      const { data, error } = await supabase
        .from('eventRegistrations')
        .select('*')
        .eq('eventId', eventId);
      if (error) throw error;
      return data || [];
    } catch (e) {
      console.warn('Supabase getEventRegistrations error:', e);
    }
  }

  const regs = mockStore.getEventRegistrations();
  return regs.filter((r) => r.eventId === eventId);
};
