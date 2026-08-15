import {
  db,
  doc,
  setDoc,
  collection,
  addDoc,
  serverTimestamp,
} from '../firebase/firestore';
import {
  SAMPLE_STUDENTS,
  SAMPLE_ALUMNI,
  SAMPLE_OPPORTUNITIES,
  SAMPLE_EVENTS,
  SAMPLE_ANNOUNCEMENTS,
} from './seedData';

/**
 * Utility to populate Firestore with sample demonstration data.
 * Safe for development/demo initialization.
 */
export const seedFirestoreDatabase = async () => {
  console.log('Starting AlumLink Firestore seeding...');

  try {
    // 1. Seed Students
    for (const s of SAMPLE_STUDENTS) {
      await setDoc(doc(db, 'users', s.id), {
        uid: s.id,
        email: s.email,
        displayName: s.fullName,
        role: 'student',
        accountStatus: 'active',
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });

      await setDoc(doc(db, 'studentProfiles', s.id), {
        ...s,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
    }
    console.log(`Seeded ${SAMPLE_STUDENTS.length} students.`);

    // 2. Seed Alumni
    for (const a of SAMPLE_ALUMNI) {
      await setDoc(doc(db, 'users', a.id), {
        uid: a.id,
        email: a.email,
        displayName: a.fullName,
        role: 'alumni',
        accountStatus: 'active',
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });

      await setDoc(doc(db, 'alumniProfiles', a.id), {
        ...a,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
    }
    console.log(`Seeded ${SAMPLE_ALUMNI.length} alumni.`);

    // 3. Seed Opportunities
    for (const opp of SAMPLE_OPPORTUNITIES) {
      await addDoc(collection(db, 'opportunities'), {
        ...opp,
        postedBy: 'demo_alumni_1',
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
    }
    console.log(`Seeded ${SAMPLE_OPPORTUNITIES.length} opportunities.`);

    // 4. Seed Events
    for (const ev of SAMPLE_EVENTS) {
      await addDoc(collection(db, 'events'), {
        ...ev,
        registrationCount: Math.floor(Math.random() * 30) + 5,
        createdBy: 'admin',
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
    }
    console.log(`Seeded ${SAMPLE_EVENTS.length} events.`);

    // 5. Seed Announcements
    for (const ann of SAMPLE_ANNOUNCEMENTS) {
      await addDoc(collection(db, 'announcements'), {
        ...ann,
        createdBy: 'admin',
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
    }
    console.log(`Seeded ${SAMPLE_ANNOUNCEMENTS.length} announcements.`);

    console.log('Seeding completed successfully!');
    return { success: true };
  } catch (error) {
    console.error('Error seeding database:', error);
    return { success: false, error: error.message };
  }
};
