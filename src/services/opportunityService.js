import { supabase, isSupabaseConfigured } from '../supabase/client';
import { mockStore } from './mockStorage';

/**
 * Create an opportunity
 */
export const createOpportunity = async (postedBy, postedByName, data) => {
  if (isSupabaseConfigured) {
    try {
      const skills = Array.isArray(data.skills) ? data.skills : data.skills?.split(',').map((s) => s.trim()).filter(Boolean) || [];
      const { data: insertedData, error } = await supabase
        .from('opportunities')
        .insert({
          ...data,
          postedBy,
          postedByName,
          skills,
          updatedAt: new Date().toISOString(),
        })
        .select('id')
        .single();

      if (error) throw error;
      return insertedData.id;
    } catch (e) {
      console.warn('Supabase createOpportunity fallback:', e);
    }
  }

  const oppId = `opp_${Date.now()}`;
  const opps = mockStore.getOpportunities();
  mockStore.setOpportunities([
    {
      id: oppId,
      ...data,
      postedBy,
      postedByName,
      skills: Array.isArray(data.skills) ? data.skills : data.skills?.split(',').map((s) => s.trim()).filter(Boolean) || [],
      createdAt: new Date().toISOString(),
    },
    ...opps,
  ]);
  return oppId;
};

/**
 * Update an opportunity
 */
export const updateOpportunity = async (opportunityId, data) => {
  if (isSupabaseConfigured) {
    try {
      const { error } = await supabase
        .from('opportunities')
        .update({
          ...data,
          updatedAt: new Date().toISOString(),
        })
        .eq('id', opportunityId);
      if (error) throw error;
      return;
    } catch (e) {
      console.warn('Supabase updateOpportunity fallback:', e);
    }
  }

  const opps = mockStore.getOpportunities();
  mockStore.setOpportunities(
    opps.map((o) => (o.id === opportunityId ? { ...o, ...data, updatedAt: new Date().toISOString() } : o))
  );
};

/**
 * Delete an opportunity
 */
export const deleteOpportunity = async (opportunityId) => {
  if (isSupabaseConfigured) {
    try {
      const { error } = await supabase
        .from('opportunities')
        .delete()
        .eq('id', opportunityId);
      if (error) throw error;
      return;
    } catch (e) {
      console.warn('Supabase deleteOpportunity fallback:', e);
    }
  }

  const opps = mockStore.getOpportunities();
  mockStore.setOpportunities(opps.filter((o) => o.id !== opportunityId));
};

/**
 * Get all opportunities
 */
export const getOpportunities = async (filters = {}) => {
  let results = [];
  if (isSupabaseConfigured) {
    try {
      const { data, error } = await supabase
        .from('opportunities')
        .select('*')
        .order('createdAt', { ascending: false });
      if (error) throw error;
      results = data || [];
    } catch (e) {
      results = mockStore.getOpportunities();
    }
  } else {
    results = mockStore.getOpportunities();
  }

  if (filters.type) {
    results = results.filter((o) => o.type === filters.type);
  }
  if (filters.workMode) {
    results = results.filter((o) => o.workMode === filters.workMode);
  }
  if (filters.search) {
    const lower = filters.search.toLowerCase();
    results = results.filter(
      (o) =>
        o.title?.toLowerCase().includes(lower) ||
        o.company?.toLowerCase().includes(lower) ||
        o.skills?.some((s) => s.toLowerCase().includes(lower))
    );
  }

  return results;
};

/**
 * Get opportunities posted by a specific alumni
 */
export const getAlumniOpportunities = async (alumniId) => {
  if (isSupabaseConfigured) {
    try {
      const { data, error } = await supabase
        .from('opportunities')
        .select('*')
        .eq('postedBy', alumniId)
        .order('createdAt', { ascending: false });
      if (error) throw error;
      return data || [];
    } catch (e) {
      console.warn('Supabase getAlumniOpportunities error:', e);
    }
  }

  const opps = mockStore.getOpportunities();
  return opps.filter((o) => o.postedBy === alumniId);
};

/**
 * Save an opportunity for a student
 */
export const saveOpportunity = async (studentId, opportunityId) => {
  if (isSupabaseConfigured) {
    try {
      const { error } = await supabase
        .from('savedOpportunities')
        .upsert({
          studentId,
          opportunityId,
        });
      if (error) throw error;
      return;
    } catch (e) {
      console.warn('Supabase saveOpportunity error:', e);
    }
  }

  const saved = mockStore.getSavedOpportunities();
  if (!saved.some((s) => s.studentId === studentId && s.opportunityId === opportunityId)) {
    mockStore.setSavedOpportunities([...saved, { studentId, opportunityId }]);
  }
};

/**
 * Unsave an opportunity
 */
export const unsaveOpportunity = async (studentId, opportunityId) => {
  if (isSupabaseConfigured) {
    try {
      const { error } = await supabase
        .from('savedOpportunities')
        .delete()
        .eq('studentId', studentId)
        .eq('opportunityId', opportunityId);
      if (error) throw error;
      return;
    } catch (e) {
      console.warn('Supabase unsaveOpportunity error:', e);
    }
  }

  const saved = mockStore.getSavedOpportunities();
  mockStore.setSavedOpportunities(
    saved.filter((s) => !(s.studentId === studentId && s.opportunityId === opportunityId))
  );
};

/**
 * Get saved opportunities for a student
 */
export const getSavedOpportunities = async (studentId) => {
  if (isSupabaseConfigured) {
    try {
      const { data, error } = await supabase
        .from('savedOpportunities')
        .select('opportunityId')
        .eq('studentId', studentId);
      if (error) throw error;
      return data.map((d) => d.opportunityId);
    } catch (e) {
      console.warn('Supabase getSavedOpportunities error:', e);
    }
  }

  const saved = mockStore.getSavedOpportunities();
  return saved.filter((s) => s.studentId === studentId).map((s) => s.opportunityId);
};

/**
 * Apply to an opportunity
 */
export const applyOpportunity = async (studentId, opportunityId, applicationData = {}) => {
  if (isSupabaseConfigured) {
    try {
      const { error } = await supabase
        .from('appliedOpportunities')
        .upsert({
          studentId,
          opportunityId,
          data: applicationData,
        });
      if (error) throw error;
      return;
    } catch (e) {
      console.warn('Supabase applyOpportunity fallback:', e);
    }
  }

  const applied = mockStore.getAppliedOpportunities();
  if (!applied.some((a) => a.studentId === studentId && a.opportunityId === opportunityId)) {
    mockStore.setAppliedOpportunities([
      ...applied,
      {
        id: `${studentId}_${opportunityId}`,
        studentId,
        opportunityId,
        ...applicationData,
        appliedAt: new Date().toISOString(),
      },
    ]);
  }
};

/**
 * Get all opportunities applied to by a student
 */
export const getAppliedOpportunities = async (studentId) => {
  if (isSupabaseConfigured) {
    try {
      const { data, error } = await supabase
        .from('appliedOpportunities')
        .select('opportunityId')
        .eq('studentId', studentId);
      if (error) throw error;
      return data.map((d) => d.opportunityId);
    } catch (e) {
      console.warn('Supabase getAppliedOpportunities error:', e);
    }
  }

  const applied = mockStore.getAppliedOpportunities();
  return applied.filter((a) => a.studentId === studentId).map((a) => a.opportunityId);
};

/**
 * Check if student has applied to an opportunity
 */
export const hasAppliedOpportunity = async (studentId, opportunityId) => {
  const list = await getAppliedOpportunities(studentId);
  return list.includes(opportunityId);
};
