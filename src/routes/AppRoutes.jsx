import { Routes, Route, Navigate } from 'react-router-dom';
import ProtectedRoute from './ProtectedRoute';

// Auth & Core Pages
import LoginPage from '../pages/auth/LoginPage';
import SignupPage from '../pages/auth/SignupPage';
import ForgotPasswordPage from '../pages/auth/ForgotPasswordPage';

// Student Pages
import StudentDashboard from '../pages/student/StudentDashboard';
import AlumniDirectory from '../pages/student/AlumniDirectory';
import AlumniProfile from '../pages/student/AlumniProfile';
import StudentMentorship from '../pages/student/Mentorship';
import StudentConnections from '../pages/student/Connections';
import StudentMessages from '../pages/student/Messages';
import StudentOpportunities from '../pages/student/Opportunities';
import StudentEvents from '../pages/student/Events';
import StudentAnnouncements from '../pages/student/Announcements';
import StudentNotifications from '../pages/student/Notifications';
import StudentProfile from '../pages/student/StudentProfile';
import StudentSettings from '../pages/student/Settings';

// Alumni Pages
import AlumniDashboard from '../pages/alumni/AlumniDashboard';
import AlumniOwnProfile from '../pages/alumni/AlumniOwnProfile';
import AlumniConnections from '../pages/alumni/Connections';
import AlumniMentorship from '../pages/alumni/Mentorship';
import AlumniMessages from '../pages/alumni/Messages';
import AlumniOpportunities from '../pages/alumni/Opportunities';
import AlumniEvents from '../pages/alumni/Events';
import AlumniNotifications from '../pages/alumni/Notifications';
import AlumniSettings from '../pages/alumni/Settings';

// Admin Pages
import AdminDashboard from '../pages/admin/AdminDashboard';
import AdminUsers from '../pages/admin/Users';
import AdminStudents from '../pages/admin/Students';
import AdminAlumni from '../pages/admin/Alumni';
import AdminEvents from '../pages/admin/Events';
import AdminOpportunities from '../pages/admin/Opportunities';
import AdminAnnouncements from '../pages/admin/Announcements';
import AdminAnalytics from '../pages/admin/Analytics';
import AdminNotifications from '../pages/admin/Notifications';
import AdminSettings from '../pages/admin/Settings';

const AppRoutes = () => {
  return (
    <Routes>
      {/* Auth & Default routes */}
      <Route path="/" element={<LoginPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/signup" element={<SignupPage />} />
      <Route path="/forgot-password" element={<ForgotPasswordPage />} />

      {/* Student Protected Routes */}
      <Route
        path="/student/dashboard"
        element={
          <ProtectedRoute requiredRole="student">
            <StudentDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/student/alumni"
        element={
          <ProtectedRoute requiredRole="student">
            <AlumniDirectory />
          </ProtectedRoute>
        }
      />
      <Route
        path="/student/alumni/:alumniId"
        element={
          <ProtectedRoute requiredRole="student">
            <AlumniProfile />
          </ProtectedRoute>
        }
      />
      <Route
        path="/student/mentorship"
        element={
          <ProtectedRoute requiredRole="student">
            <StudentMentorship />
          </ProtectedRoute>
        }
      />
      <Route
        path="/student/connections"
        element={
          <ProtectedRoute requiredRole="student">
            <StudentConnections />
          </ProtectedRoute>
        }
      />
      <Route
        path="/student/messages"
        element={
          <ProtectedRoute requiredRole="student">
            <StudentMessages />
          </ProtectedRoute>
        }
      />
      <Route
        path="/student/opportunities"
        element={
          <ProtectedRoute requiredRole="student">
            <StudentOpportunities />
          </ProtectedRoute>
        }
      />
      <Route
        path="/student/events"
        element={
          <ProtectedRoute requiredRole="student">
            <StudentEvents />
          </ProtectedRoute>
        }
      />
      <Route
        path="/student/announcements"
        element={
          <ProtectedRoute requiredRole="student">
            <StudentAnnouncements />
          </ProtectedRoute>
        }
      />
      <Route
        path="/student/notifications"
        element={
          <ProtectedRoute requiredRole="student">
            <StudentNotifications />
          </ProtectedRoute>
        }
      />
      <Route
        path="/student/profile"
        element={
          <ProtectedRoute requiredRole="student">
            <StudentProfile />
          </ProtectedRoute>
        }
      />
      <Route
        path="/student/settings"
        element={
          <ProtectedRoute requiredRole="student">
            <StudentSettings />
          </ProtectedRoute>
        }
      />

      {/* Alumni Protected Routes */}
      <Route
        path="/alumni/dashboard"
        element={
          <ProtectedRoute requiredRole="alumni">
            <AlumniDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/alumni/profile"
        element={
          <ProtectedRoute requiredRole="alumni">
            <AlumniOwnProfile />
          </ProtectedRoute>
        }
      />
      <Route
        path="/alumni/connections"
        element={
          <ProtectedRoute requiredRole="alumni">
            <AlumniConnections />
          </ProtectedRoute>
        }
      />
      <Route
        path="/alumni/mentorship"
        element={
          <ProtectedRoute requiredRole="alumni">
            <AlumniMentorship />
          </ProtectedRoute>
        }
      />
      <Route
        path="/alumni/messages"
        element={
          <ProtectedRoute requiredRole="alumni">
            <AlumniMessages />
          </ProtectedRoute>
        }
      />
      <Route
        path="/alumni/opportunities"
        element={
          <ProtectedRoute requiredRole="alumni">
            <AlumniOpportunities />
          </ProtectedRoute>
        }
      />
      <Route
        path="/alumni/events"
        element={
          <ProtectedRoute requiredRole="alumni">
            <AlumniEvents />
          </ProtectedRoute>
        }
      />
      <Route
        path="/alumni/notifications"
        element={
          <ProtectedRoute requiredRole="alumni">
            <AlumniNotifications />
          </ProtectedRoute>
        }
      />
      <Route
        path="/alumni/settings"
        element={
          <ProtectedRoute requiredRole="alumni">
            <AlumniSettings />
          </ProtectedRoute>
        }
      />

      {/* Admin Protected Routes */}
      <Route
        path="/admin/dashboard"
        element={
          <ProtectedRoute requiredRole="admin">
            <AdminDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/users"
        element={
          <ProtectedRoute requiredRole="admin">
            <AdminUsers />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/students"
        element={
          <ProtectedRoute requiredRole="admin">
            <AdminStudents />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/alumni"
        element={
          <ProtectedRoute requiredRole="admin">
            <AdminAlumni />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/events"
        element={
          <ProtectedRoute requiredRole="admin">
            <AdminEvents />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/opportunities"
        element={
          <ProtectedRoute requiredRole="admin">
            <AdminOpportunities />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/announcements"
        element={
          <ProtectedRoute requiredRole="admin">
            <AdminAnnouncements />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/analytics"
        element={
          <ProtectedRoute requiredRole="admin">
            <AdminAnalytics />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/settings"
        element={
          <ProtectedRoute requiredRole="admin">
            <AdminSettings />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/notifications"
        element={
          <ProtectedRoute requiredRole="admin">
            <AdminNotifications />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/profile"
        element={<Navigate to="/admin/settings" replace />}
      />

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

export default AppRoutes;
