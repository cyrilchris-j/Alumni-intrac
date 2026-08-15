import { storage } from './config';
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';

export { storage };

/**
 * Upload a file to Firebase Storage
 * @param {File} file - The file to upload
 * @param {string} path - Storage path (e.g., 'profiles/uid/avatar.jpg')
 * @returns {Promise<string>} Download URL
 */
export const uploadFile = async (file, path) => {
  const storageRef = ref(storage, path);
  const snapshot = await uploadBytes(storageRef, file);
  const downloadURL = await getDownloadURL(snapshot.ref);
  return downloadURL;
};

/**
 * Upload a profile photo
 * @param {File} file
 * @param {string} uid - User UID
 * @returns {Promise<string>} Download URL
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
  const storageRef = ref(storage, path);
  await deleteObject(storageRef);
};

export { ref, uploadBytes, getDownloadURL, deleteObject };
