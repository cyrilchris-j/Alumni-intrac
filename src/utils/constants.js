// User Roles
export const ROLES = {
  STUDENT: 'student',
  ALUMNI: 'alumni',
  ADMIN: 'admin',
};

// Connection Statuses
export const CONNECTION_STATUS = {
  PENDING: 'pending',
  ACCEPTED: 'accepted',
  REJECTED: 'rejected',
};

// Mentorship Statuses
export const MENTORSHIP_STATUS = {
  PENDING: 'pending',
  ACCEPTED: 'accepted',
  REJECTED: 'rejected',
  COMPLETED: 'completed',
};

// Alumni Verification
export const ALUMNI_VERIFICATION = {
  PENDING: 'pending',
  VERIFIED: 'verified',
  REJECTED: 'rejected',
};

// User Account Status
export const ACCOUNT_STATUS = {
  ACTIVE: 'active',
  SUSPENDED: 'suspended',
  PENDING: 'pending',
};

// Opportunity Types
export const OPPORTUNITY_TYPES = [
  'Internship',
  'Job Vacancy',
  'Hackathon',
  'Full-time',
  'Part-time',
  'Referral',
  'Freelance',
  'Workshop',
];

// Work Modes
export const WORK_MODES = ['Remote', 'On-site', 'Hybrid'];

// Event Types
export const EVENT_TYPES = [
  'Alumni Meet',
  'Webinar',
  'Workshop',
  'Career Talk',
  'Networking',
  'Reunion',
];

// Notification Types
export const NOTIFICATION_TYPES = {
  CONNECTION_REQUEST: 'connection_request',
  CONNECTION_ACCEPTED: 'connection_accepted',
  MENTORSHIP_REQUEST: 'mentorship_request',
  MENTORSHIP_ACCEPTED: 'mentorship_accepted',
  MENTORSHIP_REJECTED: 'mentorship_rejected',
  NEW_MESSAGE: 'new_message',
  NEW_OPPORTUNITY: 'new_opportunity',
  NEW_EVENT: 'new_event',
  ANNOUNCEMENT: 'announcement',
  PROFILE_VERIFIED: 'profile_verified',
};

// Departments
export const DEPARTMENTS = [
  'Computer Science & Engineering',
  'Information Technology',
  'Electronics & Communication',
  'Electrical Engineering',
  'Mechanical Engineering',
  'Civil Engineering',
  'Chemical Engineering',
  'Biotechnology',
  'Business Administration',
  'Mathematics',
  'Physics',
  'Commerce',
  'Arts & Humanities',
  'Law',
  'Medicine',
  'Other',
];

// Years (for students)
export const STUDENT_YEARS = ['1st Year', '2nd Year', '3rd Year', '4th Year'];

// Graduation Years range
export const currentYear = new Date().getFullYear();
export const GRADUATION_YEARS = Array.from(
  { length: 35 },
  (_, i) => currentYear - i
).map(String);

// Indian states / locations
export const POPULAR_LOCATIONS = [
  'Chennai, Tamil Nadu',
  'Bangalore, Karnataka',
  'Hyderabad, Telangana',
  'Mumbai, Maharashtra',
  'Delhi, NCR',
  'Pune, Maharashtra',
  'Coimbatore, Tamil Nadu',
  'Madurai, Tamil Nadu',
  'Kolkata, West Bengal',
  'Ahmedabad, Gujarat',
  'Kochi, Kerala',
  'Trichy, Tamil Nadu',
  'Remote',
  'Other',
];

// Announcement Categories
export const ANNOUNCEMENT_CATEGORIES = [
  'General',
  'Alumni',
  'Events',
  'Career',
  'Academic',
  'Urgent',
];

// Skills list
export const POPULAR_SKILLS = [
  'JavaScript', 'Python', 'Java', 'React', 'Node.js', 'Angular', 'Vue.js',
  'TypeScript', 'C++', 'C#', 'Go', 'Rust', 'Swift', 'Kotlin',
  'Machine Learning', 'Deep Learning', 'Data Science', 'Data Analysis',
  'SQL', 'MongoDB', 'PostgreSQL', 'MySQL', 'Firebase', 'AWS', 'Azure', 'GCP',
  'Docker', 'Kubernetes', 'DevOps', 'CI/CD', 'Git',
  'UI/UX Design', 'Figma', 'Product Management', 'Agile', 'Scrum',
  'Digital Marketing', 'SEO', 'Content Writing', 'Business Analysis',
  'Finance', 'Accounting', 'Project Management', 'Leadership',
  'Communication', 'Problem Solving',
];

// Mentorship Areas
export const MENTORSHIP_AREAS = [
  'Career Guidance',
  'Technical Skills',
  'Interview Preparation',
  'Resume Review',
  'Industry Insights',
  'Higher Education',
  'Entrepreneurship',
  'Networking',
  'Leadership',
  'Work-Life Balance',
];
