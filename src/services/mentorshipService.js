import { supabase, isSupabaseConfigured } from '../supabase/client';
import { MENTORSHIP_STATUS, NOTIFICATION_TYPES } from '../utils/constants';
import { createNotification } from './notificationService';
import { isFirebaseConfigured, mockStore } from './mockStorage';

/**
 * Send a mentorship request
 */
export const sendMentorshipRequest = async (studentId, alumniId, { topic, message, preferredArea, availability }, studentName) => {
  if (isSupabaseConfigured) {
    try {
      const { data: existing, error: existingError } = await supabase
        .from('mentorshipRequests')
        .select('id')
        .eq('studentId', studentId)
        .eq('alumniId', alumniId)
        .eq('status', MENTORSHIP_STATUS.PENDING);

      if (existingError) throw existingError;

      if (existing && existing.length > 0) {
        throw new Error('You already have a pending mentorship request with this alumni.');
      }

      const { data: insertedData, error } = await supabase
        .from('mentorshipRequests')
        .insert({
          studentId,
          alumniId,
          topic,
          message,
          preferredArea,
          availability: availability || '',
          status: MENTORSHIP_STATUS.PENDING,
          updatedAt: new Date().toISOString(),
        })
        .select('id')
        .single();

      if (error) throw error;

      await createNotification(alumniId, {
        type: NOTIFICATION_TYPES.MENTORSHIP_REQUEST,
        title: 'New Mentorship Request',
        message: `${studentName} has requested you as a mentor. Topic: ${topic}`,
        relatedId: insertedData.id,
      });

      return insertedData.id;
    } catch (e) {
      if (e.message?.includes('already have')) throw e;
      console.warn('Supabase sendMentorshipRequest fallback:', e);
    }
  }

  const ments = mockStore.getMentorships();
  const already = ments.find(
    (m) => m.studentId === studentId && m.alumniId === alumniId && m.status === MENTORSHIP_STATUS.PENDING
  );
  if (already) {
    throw new Error('You already have a pending mentorship request with this alumni.');
  }

  const reqId = `ment_${Date.now()}`;
  mockStore.setMentorships([
    ...ments,
    {
      id: reqId,
      studentId,
      alumniId,
      topic,
      message,
      preferredArea,
      availability: availability || '',
      status: MENTORSHIP_STATUS.PENDING,
      createdAt: new Date().toISOString(),
    },
  ]);

  await createNotification(alumniId, {
    type: NOTIFICATION_TYPES.MENTORSHIP_REQUEST,
    title: 'New Mentorship Request',
    message: `${studentName} has requested you as a mentor. Topic: ${topic}`,
    relatedId: reqId,
  });

  return reqId;
};

/**
 * Accept a mentorship request
 */
export const acceptMentorshipRequest = async (requestId, alumniName, studentId) => {
  if (isSupabaseConfigured) {
    try {
      const { error } = await supabase
        .from('mentorshipRequests')
        .update({
          status: MENTORSHIP_STATUS.ACCEPTED,
          updatedAt: new Date().toISOString(),
        })
        .eq('id', requestId);

      if (error) throw error;

      await createNotification(studentId, {
        type: NOTIFICATION_TYPES.MENTORSHIP_ACCEPTED,
        title: 'Mentorship Request Accepted!',
        message: `${alumniName} accepted your mentorship request.`,
        relatedId: requestId,
      });
      return;
    } catch (e) {
      console.warn('Supabase acceptMentorshipRequest fallback:', e);
    }
  }

  const ments = mockStore.getMentorships();
  mockStore.setMentorships(
    ments.map((m) => (m.id === requestId ? { ...m, status: MENTORSHIP_STATUS.ACCEPTED } : m))
  );

  await createNotification(studentId, {
    type: NOTIFICATION_TYPES.MENTORSHIP_ACCEPTED,
    title: 'Mentorship Request Accepted!',
    message: `${alumniName} accepted your mentorship request.`,
    relatedId: requestId,
  });
};

/**
 * Reject a mentorship request
 */
export const rejectMentorshipRequest = async (requestId, alumniName, studentId) => {
  if (isSupabaseConfigured) {
    try {
      const { error } = await supabase
        .from('mentorshipRequests')
        .update({
          status: MENTORSHIP_STATUS.REJECTED,
          updatedAt: new Date().toISOString(),
        })
        .eq('id', requestId);

      if (error) throw error;

      await createNotification(studentId, {
        type: NOTIFICATION_TYPES.MENTORSHIP_REJECTED,
        title: 'Mentorship Request Update',
        message: `${alumniName} is currently unable to take on new mentees.`,
        relatedId: requestId,
      });
      return;
    } catch (e) {
      console.warn('Supabase rejectMentorshipRequest fallback:', e);
    }
  }

  const ments = mockStore.getMentorships();
  mockStore.setMentorships(
    ments.map((m) => (m.id === requestId ? { ...m, status: MENTORSHIP_STATUS.REJECTED } : m))
  );

  await createNotification(studentId, {
    type: NOTIFICATION_TYPES.MENTORSHIP_REJECTED,
    title: 'Mentorship Request Update',
    message: `${alumniName} is currently unable to take on new mentees.`,
    relatedId: requestId,
  });
};

/**
 * Complete a mentorship
 */
export const completeMentorship = async (requestId) => {
  if (isSupabaseConfigured) {
    try {
      const { error } = await supabase
        .from('mentorshipRequests')
        .update({
          status: MENTORSHIP_STATUS.COMPLETED,
          updatedAt: new Date().toISOString(),
        })
        .eq('id', requestId);
      if (error) throw error;
      return;
    } catch (e) {
      console.warn('Supabase completeMentorship fallback:', e);
    }
  }

  const ments = mockStore.getMentorships();
  mockStore.setMentorships(
    ments.map((m) => (m.id === requestId ? { ...m, status: MENTORSHIP_STATUS.COMPLETED } : m))
  );
};

/**
 * Get mentorship requests for a student
 */
export const getStudentMentorshipRequests = async (studentId) => {
  if (isSupabaseConfigured) {
    try {
      const { data, error } = await supabase
        .from('mentorshipRequests')
        .select('*')
        .eq('studentId', studentId)
        .order('createdAt', { ascending: false });
      if (error) throw error;
      return data || [];
    } catch (e) {
      console.warn('Supabase getStudentMentorshipRequests error:', e);
    }
  }

  const ments = mockStore.getMentorships();
  return ments.filter((m) => m.studentId === studentId);
};

/**
 * Get mentorship requests for an alumni
 */
export const getAlumniMentorshipRequests = async (alumniId) => {
  if (isSupabaseConfigured) {
    try {
      const { data, error } = await supabase
        .from('mentorshipRequests')
        .select('*')
        .eq('alumniId', alumniId)
        .order('createdAt', { ascending: false });
      if (error) throw error;
      return data || [];
    } catch (e) {
      console.warn('Supabase getAlumniMentorshipRequests error:', e);
    }
  }

  const ments = mockStore.getMentorships();
  return ments.filter((m) => m.alumniId === alumniId);
};
