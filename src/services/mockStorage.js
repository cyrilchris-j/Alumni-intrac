import {
  SAMPLE_STUDENTS,
  SAMPLE_ALUMNI,
  SAMPLE_OPPORTUNITIES,
  SAMPLE_EVENTS,
  SAMPLE_ANNOUNCEMENTS
} from '../utils/seedData';

export const isFirebaseConfigured = Boolean(
  import.meta.env.VITE_FIREBASE_API_KEY &&
  import.meta.env.VITE_FIREBASE_API_KEY !== 'your-api-key-here' &&
  !import.meta.env.VITE_FIREBASE_API_KEY.includes('your-')
);

// Storage keys
const STORAGE_KEYS = {
  CURRENT_USER: 'alumlink_current_user',
  USERS: 'alumlink_users',
  STUDENTS: 'alumlink_students',
  ALUMNI: 'alumlink_alumni',
  CONNECTIONS: 'alumlink_connections',
  MENTORSHIPS: 'alumlink_mentorships',
  OPPORTUNITIES: 'alumlink_opportunities',
  SAVED_OPPORTUNITIES: 'alumlink_saved_opportunities',
  EVENTS: 'alumlink_events',
  EVENT_REGISTRATIONS: 'alumlink_event_registrations',
  ANNOUNCEMENTS: 'alumlink_announcements',
  NOTIFICATIONS: 'alumlink_notifications',
  CONVERSATIONS: 'alumlink_conversations',
  MESSAGES: 'alumlink_messages',
};

const getItem = (key, defaultVal = []) => {
  try {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : defaultVal;
  } catch (e) {
    return defaultVal;
  }
};

const setItem = (key, val) => {
  try {
    localStorage.setItem(key, JSON.stringify(val));
    window.dispatchEvent(new CustomEvent('alumlink_storage_update', { detail: { key } }));
  } catch (e) {
    console.error('Storage error:', e);
  }
};

// Initialize Mock Store if empty
export const initMockStore = () => {
  if (getItem(STORAGE_KEYS.USERS, null) === null) {
    const demoUsers = [
      {
        uid: 'demo_student_default',
        email: 'student@psgtech.edu',
        displayName: 'Rahul Sharma',
        role: 'student',
        accountStatus: 'active',
        createdAt: new Date().toISOString(),
      },
      {
        uid: 'demo_alumni_default',
        email: 'alumni@psgtech.edu',
        displayName: 'Priya Menon',
        role: 'alumni',
        accountStatus: 'active',
        createdAt: new Date().toISOString(),
      },
      {
        uid: 'demo_admin_default',
        email: 'admin@psgtech.edu',
        displayName: 'College Administrator',
        role: 'admin',
        accountStatus: 'active',
        createdAt: new Date().toISOString(),
      },
      ...SAMPLE_STUDENTS.map((s) => ({
        uid: s.id,
        email: s.email,
        displayName: s.fullName,
        role: 'student',
        accountStatus: 'active',
        createdAt: new Date().toISOString(),
      })),
      ...SAMPLE_ALUMNI.map((a) => ({
        uid: a.id,
        email: a.email,
        displayName: a.fullName,
        role: 'alumni',
        accountStatus: 'active',
        createdAt: new Date().toISOString(),
      })),
    ];
    setItem(STORAGE_KEYS.USERS, demoUsers);

    const demoStudents = [
      {
        id: 'demo_student_default',
        uid: 'demo_student_default',
        fullName: 'Rahul Sharma',
        email: 'student@psgtech.edu',
        college: 'PSG College of Technology',
        department: 'Computer Science & Engineering',
        year: '3rd Year',
        section: 'A',
        phone: '+91 98450 12345',
        skills: ['React', 'JavaScript', 'Node.js', 'Python', 'Tailwind CSS'],
        interests: ['Full Stack Development', 'Open Source', 'System Design'],
        bio: 'Aspiring Full Stack Engineer passionate about web technologies and building scalable applications.',
        createdAt: new Date().toISOString(),
      },
      ...SAMPLE_STUDENTS.map((s) => ({ ...s, uid: s.id, createdAt: new Date().toISOString() })),
    ];
    setItem(STORAGE_KEYS.STUDENTS, demoStudents);

    const demoAlumni = [
      {
        id: 'demo_alumni_default',
        uid: 'demo_alumni_default',
        fullName: 'Priya Menon',
        email: 'alumni@psgtech.edu',
        college: 'PSG College of Technology',
        department: 'Computer Science & Engineering',
        graduationYear: '2018',
        company: 'Google',
        jobRole: 'Senior Product Manager',
        location: 'Bangalore, Karnataka',
        skills: ['Product Strategy', 'Roadmapping', 'Agile', 'Cloud Solutions'],
        experience: '6+ years leading core developer and enterprise search products.',
        linkedinUrl: 'https://linkedin.com/in/demo-priya-menon',
        phone: '+91 98111 00001',
        verificationStatus: 'verified',
        bio: 'Leading product initiatives at Google. Happy to mentor students on PM transitions, resume audits, and tech careers.',
        createdAt: new Date().toISOString(),
      },
      ...SAMPLE_ALUMNI.map((a) => ({ ...a, uid: a.id, createdAt: new Date().toISOString() })),
    ];
    setItem(STORAGE_KEYS.ALUMNI, demoAlumni);

    const demoOpps = SAMPLE_OPPORTUNITIES.map((opp, idx) => ({
      id: `demo_opp_${idx + 1}`,
      ...opp,
      postedBy: 'demo_alumni_default',
      createdAt: new Date().toISOString(),
    }));
    setItem(STORAGE_KEYS.OPPORTUNITIES, demoOpps);

    const demoEvents = SAMPLE_EVENTS.map((ev, idx) => ({
      id: `demo_ev_${idx + 1}`,
      ...ev,
      registrationCount: 12 + idx * 8,
      createdBy: 'demo_admin_default',
      createdAt: new Date().toISOString(),
    }));
    setItem(STORAGE_KEYS.EVENTS, demoEvents);

    const demoAnn = SAMPLE_ANNOUNCEMENTS.map((ann, idx) => ({
      id: `demo_ann_${idx + 1}`,
      ...ann,
      createdBy: 'demo_admin_default',
      createdAt: new Date().toISOString(),
    }));
    setItem(STORAGE_KEYS.ANNOUNCEMENTS, demoAnn);

    // Initial connections & notifications
    setItem(STORAGE_KEYS.CONNECTIONS, [
      {
        id: 'demo_conn_1',
        senderId: 'demo_student_default',
        receiverId: 'demo_alumni_1',
        status: 'accepted',
        createdAt: new Date().toISOString(),
      },
      {
        id: 'demo_conn_2',
        senderId: 'demo_student_2',
        receiverId: 'demo_alumni_default',
        status: 'pending',
        createdAt: new Date().toISOString(),
      },
    ]);

    setItem(STORAGE_KEYS.MENTORSHIPS, [
      {
        id: 'demo_ment_1',
        studentId: 'demo_student_default',
        alumniId: 'demo_alumni_1',
        topic: 'Transitioning into Full Stack Engineering',
        preferredArea: 'Technical Skills',
        message: 'Hi Priya, I would love some guidance on structuring my final year portfolio and interview prep.',
        status: 'accepted',
        createdAt: new Date().toISOString(),
      },
      {
        id: 'demo_ment_2',
        studentId: 'demo_student_2',
        alumniId: 'demo_alumni_default',
        topic: 'Machine Learning Project Review',
        preferredArea: 'Career Guidance',
        message: 'Looking for advice on publishing ML research and applying to top product companies.',
        status: 'pending',
        createdAt: new Date().toISOString(),
      },
    ]);

    setItem(STORAGE_KEYS.CONVERSATIONS, [
      {
        id: 'demo_student_default_demo_alumni_default',
        participants: ['demo_student_default', 'demo_alumni_default'],
        lastMessage: 'Hi Priya, looking forward to our mentorship session!',
        lastMessageAt: new Date().toISOString(),
        unreadCount: {},
      },
    ]);

    setItem(STORAGE_KEYS.MESSAGES, [
      {
        id: 'msg_1',
        conversationId: 'demo_student_default_demo_alumni_default',
        senderId: 'demo_student_default',
        receiverId: 'demo_alumni_default',
        text: 'Hello Priya, thank you for connecting with me!',
        createdAt: new Date(Date.now() - 3600000).toISOString(),
        read: true,
      },
      {
        id: 'msg_2',
        conversationId: 'demo_student_default_demo_alumni_default',
        senderId: 'demo_alumni_default',
        receiverId: 'demo_student_default',
        text: 'Hi Rahul! Glad to connect. How can I help you with your career goals?',
        createdAt: new Date(Date.now() - 1800000).toISOString(),
        read: true,
      },
      {
        id: 'msg_3',
        conversationId: 'demo_student_default_demo_alumni_default',
        senderId: 'demo_student_default',
        receiverId: 'demo_alumni_default',
        text: 'Hi Priya, looking forward to our mentorship session!',
        createdAt: new Date().toISOString(),
        read: false,
      },
    ]);

    setItem(STORAGE_KEYS.NOTIFICATIONS, [
      {
        id: 'notif_1',
        userId: 'demo_student_default',
        type: 'connection_accepted',
        title: 'Connection Accepted',
        message: 'Priya Menon accepted your connection request.',
        read: false,
        createdAt: new Date().toISOString(),
      },
      {
        id: 'notif_2',
        userId: 'demo_alumni_default',
        type: 'mentorship_request',
        title: 'New Mentorship Request',
        message: 'Ananya Krishnan has requested you as a mentor.',
        read: false,
        createdAt: new Date().toISOString(),
      },
    ]);
  }
};

// Initialize right away
initMockStore();

// Export mock data accessor helpers
export const mockStore = {
  getUsers: () => getItem(STORAGE_KEYS.USERS),
  setUsers: (val) => setItem(STORAGE_KEYS.USERS, val),

  getStudents: () => getItem(STORAGE_KEYS.STUDENTS),
  setStudents: (val) => setItem(STORAGE_KEYS.STUDENTS, val),

  getAlumni: () => getItem(STORAGE_KEYS.ALUMNI),
  setAlumni: (val) => setItem(STORAGE_KEYS.ALUMNI, val),

  getConnections: () => getItem(STORAGE_KEYS.CONNECTIONS),
  setConnections: (val) => setItem(STORAGE_KEYS.CONNECTIONS, val),

  getMentorships: () => getItem(STORAGE_KEYS.MENTORSHIPS),
  setMentorships: (val) => setItem(STORAGE_KEYS.MENTORSHIPS, val),

  getOpportunities: () => getItem(STORAGE_KEYS.OPPORTUNITIES),
  setOpportunities: (val) => setItem(STORAGE_KEYS.OPPORTUNITIES, val),

  getSavedOpportunities: () => getItem(STORAGE_KEYS.SAVED_OPPORTUNITIES),
  setSavedOpportunities: (val) => setItem(STORAGE_KEYS.SAVED_OPPORTUNITIES, val),

  getEvents: () => getItem(STORAGE_KEYS.EVENTS),
  setEvents: (val) => setItem(STORAGE_KEYS.EVENTS, val),

  getEventRegistrations: () => getItem(STORAGE_KEYS.EVENT_REGISTRATIONS),
  setEventRegistrations: (val) => setItem(STORAGE_KEYS.EVENT_REGISTRATIONS, val),

  getAnnouncements: () => getItem(STORAGE_KEYS.ANNOUNCEMENTS),
  setAnnouncements: (val) => setItem(STORAGE_KEYS.ANNOUNCEMENTS, val),

  getNotifications: () => getItem(STORAGE_KEYS.NOTIFICATIONS),
  setNotifications: (val) => setItem(STORAGE_KEYS.NOTIFICATIONS, val),

  getConversations: () => getItem(STORAGE_KEYS.CONVERSATIONS),
  setConversations: (val) => setItem(STORAGE_KEYS.CONVERSATIONS, val),

  getMessages: () => getItem(STORAGE_KEYS.MESSAGES),
  setMessages: (val) => setItem(STORAGE_KEYS.MESSAGES, val),

  getCurrentUser: () => getItem(STORAGE_KEYS.CURRENT_USER, null),
  setCurrentUser: (u) => setItem(STORAGE_KEYS.CURRENT_USER, u),
};
