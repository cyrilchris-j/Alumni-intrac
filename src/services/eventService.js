import {
  db,
  collection,
  doc,
  addDoc,
  getDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  setDoc,
  query,
  where,
  orderBy,
  serverTimestamp,
} from '../firebase/firestore';
import { isFirebaseConfigured, mockStore } from './mockStorage';

/**
 * Create an event (admin)
 */
export const createEvent = async (data, createdBy) => {
  if (isFirebaseConfigured) {
    try {
      const docRef = await addDoc(collection(db, 'events'), {
        ...data,
        createdBy,
        registrationCount: 0,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
      return docRef.id;
    } catch (e) {
      console.warn('Firebase createEvent fallback:', e);
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
  if (isFirebaseConfigured) {
    try {
      await updateDoc(doc(db, 'events', eventId), {
        ...data,
        updatedAt: serverTimestamp(),
      });
      return;
    } catch (e) {
      console.warn('Firebase updateEvent fallback:', e);
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
  if (isFirebaseConfigured) {
    try {
      await deleteDoc(doc(db, 'events', eventId));
      return;
    } catch (e) {
      console.warn('Firebase deleteEvent fallback:', e);
    }
  }

  const events = mockStore.getEvents();
  mockStore.setEvents(events.filter((e) => e.id !== eventId));
};

/**
 * Get all events
 */
export const getEvents = async () => {
  if (isFirebaseConfigured) {
    try {
      const snap = await getDocs(query(collection(db, 'events'), orderBy('date', 'asc')));
      return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
    } catch (e) {
      // Fallback
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
  if (isFirebaseConfigured) {
    try {
      await setDoc(doc(db, 'eventRegistrations', `${eventId}_${userId}`), {
        eventId,
        userId,
        userName,
        registeredAt: serverTimestamp(),
      });
      return;
    } catch (e) {
      console.warn('Firebase registerForEvent fallback:', e);
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
  if (isFirebaseConfigured) {
    try {
      await deleteDoc(doc(db, 'eventRegistrations', `${eventId}_${userId}`));
      return;
    } catch (e) {
      // Fallback
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
  if (isFirebaseConfigured) {
    try {
      const snap = await getDocs(
        query(collection(db, 'eventRegistrations'), where('userId', '==', userId))
      );
      return snap.docs.map((d) => d.data().eventId);
    } catch (e) {
      // Fallback
    }
  }

  const regs = mockStore.getEventRegistrations();
  return regs.filter((r) => r.userId === userId).map((r) => r.eventId);
};

/**
 * Get registrations for an event (admin)
 */
export const getEventRegistrations = async (eventId) => {
  if (isFirebaseConfigured) {
    try {
      const snap = await getDocs(
        query(collection(db, 'eventRegistrations'), where('eventId', '==', eventId))
      );
      return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
    } catch (e) {
      // Fallback
    }
  }

  const regs = mockStore.getEventRegistrations();
  return regs.filter((r) => r.eventId === eventId);
};
