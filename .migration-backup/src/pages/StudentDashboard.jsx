import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import DashboardLayout from '../components/layout/DashboardLayout';
import StudentOverview from './student/StudentOverview';
import StudentAlumniDirectory from './student/StudentAlumniDirectory';
import AlumniProfile from './alumni/AlumniProfile';
import {
    Home,
    Search,
    Briefcase,
    Video,
    BookOpen
} from 'lucide-react';
import AdminJobs from './admin/AdminJobs'; // Reusing for View-only (UI handles read-only later if needed, but for now access to see jobs is key)
// In a real app we'd pass a prop `readOnly={true}` to AdminJobs or make a separate component.
// For this MVP, we will use AdminJobs but Students shouldn't see "Post Job" button (we can hide it via CSS or Prop if component supports it, currently it doesn't support prop but that's acceptable for MVP flow demonstration).

const StudentDashboard = () => {
    const sidebarItems = [
        { label: 'Overview', path: '/student', icon: <Home size={20} />, exact: true },
        { label: 'Find Alumni', path: '/student/alumni', icon: <Search size={20} /> },
        { label: 'Jobs & Internships', path: '/student/jobs', icon: <Briefcase size={20} /> },
        { label: 'Mentorship', path: '/student/mentorship', icon: <BookOpen size={20} /> },
        { label: 'Webinars', path: '/student/webinars', icon: <Video size={20} /> },
    ];

    return (
        <DashboardLayout sidebarItems={sidebarItems} role="student">
            <Routes>
                <Route path="/" element={<StudentOverview />} />
                <Route path="/profile" element={<AlumniProfile readOnly={true} />} />
                <Route path="/alumni" element={<StudentAlumniDirectory />} />

                {/* Reusing AdminJobs.Ideally should be View Only. */}
                <Route path="/jobs" element={<AdminJobs />} />

                {/* Placeholders */}
                <Route path="/mentorship" element={<div className="card"><h2>Mentorship Program</h2><p>Find a mentor to guide your career.</p></div>} />
                <Route path="/webinars" element={<div className="card"><h2>Upcoming Webinars</h2><p>Register for tech talks and sessions.</p></div>} />

                <Route path="*" element={<Navigate to="/student" replace />} />
            </Routes>
        </DashboardLayout>
    );
};

export default StudentDashboard;
