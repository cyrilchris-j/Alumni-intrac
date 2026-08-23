import { supabase, isSupabaseConfigured } from './client';

/**
 * Helper to split Firebase path style 'bucketName/rest/of/path.jpg' into Supabase parts
 */
const parsePath = (path) => {
  const cleanPath = path.startsWith('/') ? path.slice(1) : path;
  const slashIndex = cleanPath.indexOf('/');
  if (slashIndex === -1) {
    return { bucket: 'uploads', key: cleanPath };
  }
  return {
    bucket: cleanPath.substring(0, slashIndex),
    key: cleanPath.substring(slashIndex + 1),
  };
};

/**
 * Upload a file to Supabase Storage
 * @param {File} file - The file to upload
 * @param {string} path - Storage path (e.g., 'profiles/uid/avatar.jpg')
 * @returns {Promise<string>} Public URL
 */
export const uploadFile = async (file, path) => {
  if (isSupabaseConfigured) {
    const { bucket, key } = parsePath(path);
    try {
      // Upload the file
      const { data, error } = await supabase.storage
        .from(bucket)
        .upload(key, file, {
          cacheControl: '3600',
          upsert: true,
        });

      if (error) {
        // If bucket doesn't exist, log warning but try to upload to a generic 'uploads' bucket
        console.warn(`Could not upload to bucket '${bucket}':`, error.message);
        throw error;
      }

      // Get public URL
      const { data: urlData } = supabase.storage
        .from(bucket)
        .getPublicUrl(key);

      return urlData.publicUrl;
    } catch (e) {
      console.warn('Supabase storage upload error:', e);
      throw e;
    }
  }

  // Mock mode: Return local object URL for preview
  return URL.createObjectURL(file);
};

/**
 * Upload a profile photo
 */
export const uploadProfilePhoto = async (file, uid) => {
  const ext = file.name.split('.').pop();
  const path = `profiles/${uid}/avatar.${ext}`;
  return uploadFile(file, path);
};

/**
 * Upload an event image
 */
export const uploadEventImage = async (file, eventId) => {
  const ext = file.name.split('.').pop();
  const path = `events/${eventId}/cover.${ext}`;
  return uploadFile(file, path);
};

/**
 * Delete a file from storage
 */
export const deleteFile = async (path) => {
  if (isSupabaseConfigured) {
    const { bucket, key } = parsePath(path);
    try {
      const { error } = await supabase.storage.from(bucket).remove([key]);
      if (error) throw error;
    } catch (e) {
      console.warn('Supabase storage delete error:', e);
    }
  }
};
