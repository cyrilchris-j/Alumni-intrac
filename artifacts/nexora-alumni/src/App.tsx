import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { lazy, Suspense } from 'react';
import Entry from './pages/Entry';
import RoleSelection from './pages/RoleSelection';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/auth/ProtectedRoute';

// Lazy load dashboard components for better performance
const StudentDashboard = lazy(() => import('./pages/StudentDashboard'));
const AlumniDashboard = lazy(() => import('./pages/AlumniDashboard'));
const AdminDashboard = lazy(() => import('./pages/AdminDashboard'));

// Loading component
const LoadingScreen = () => (
  <div className="flex-center" style={{ height: '100vh', background: 'var(--bg-page)', fontSize: '1rem' }}>
    <div className="loader"></div>
    <p style={{ marginLeft: '1rem', color: 'var(--text-secondary)' }}>Loading...</p>
  </div>
);

function App() {
  return (
    <AuthProvider>
      <Router basename={import.meta.env.BASE_URL?.replace(/\/$/, '') || '/'}>
        <Routes>
          <Route path="/" element={<Entry />} />
          <Route path="/role-selection" element={<RoleSelection />} />

          <Route path="/student/*" element={
            <ProtectedRoute allowedRoles={['student']}>
              <Suspense fallback={<LoadingScreen />}>
                <StudentDashboard />
              </Suspense>
            </ProtectedRoute>
          } />

          <Route path="/alumni/*" element={
            <ProtectedRoute allowedRoles={['alumni']}>
              <Suspense fallback={<LoadingScreen />}>
                <AlumniDashboard />
              </Suspense>
            </ProtectedRoute>
          } />

          <Route path="/admin/*" element={
            <ProtectedRoute allowedRoles={['admin']}>
              <Suspense fallback={<LoadingScreen />}>
                <AdminDashboard />
              </Suspense>
            </ProtectedRoute>
          } />

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
