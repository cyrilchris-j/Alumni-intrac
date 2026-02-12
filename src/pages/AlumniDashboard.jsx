import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import DashboardLayout from '../components/layout/DashboardLayout';
import AlumniOverview from './alumni/AlumniOverview';
import AlumniProfile from './alumni/AlumniProfile';
import AlumniConnections from './alumni/AlumniConnections';
// We can reuse AdminJobs for viewing, although for Alumni it should ideally be slightly different (Apply vs Manage).
// For now, let's create a placeholder or reuse if simple. Detailed requirement says "Post job opportunities", so reuse is fine for posting. 
// But viewing applying is "Student" feature? Wait: "Alumni... Post Job". So Alumni needs "My Jobs" or "Post Job".
// Let's use a simple placeholder for Jobs/Mentorship to finish the architecture.
import {
    Home,
    User,
    Users,
    Briefcase,
    HeartHandshake, // For Mentorship
    Star // For Success Stories
} from 'lucide-react';
import AdminJobs from './admin/AdminJobs'; // Reusing for Posting capabilities

const AlumniDashboard = () => {

    const sidebarItems = [
        { label: 'Overview', path: '/alumni', icon: <Home size={20} />, exact: true },
        { label: 'My Profile', path: '/alumni/profile', icon: <User size={20} /> },
        { label: 'Connections', path: '/alumni/connections', icon: <Users size={20} /> },
        { label: 'Jobs & Internships', path: '/alumni/jobs', icon: <Briefcase size={20} /> }, // Can post jobs here
        { label: 'Mentorship', path: '/alumni/mentorship', icon: <HeartHandshake size={20} /> },
        { label: 'Success Stories', path: '/alumni/stories', icon: <Star size={20} /> },
    ];

    return (
        <DashboardLayout sidebarItems={sidebarItems} role="alumni">
            <Routes>
                <Route path="/" element={<AlumniOverview />} />
                <Route path="/profile" element={<AlumniProfile />} />
                <Route path="/connections" element={<AlumniConnections />} />

                {/* Reusing AdminJobs for now as it supports Posting */}
                <Route path="/jobs" element={<AdminJobs />} />

                {/* Placeholders */}
                <Route path="/mentorship" element={<div className="card"><h2>Mentorship & Webinars</h2><p>Host sessions and manage requests.</p></div>} />
                <Route path="/stories" element={<div className="card"><h2>Success Stories</h2><p>Share your journey.</p></div>} />

                <Route path="*" element={<Navigate to="/alumni" replace />} />
            </Routes>
        </DashboardLayout>
    );
};

export default AlumniDashboard;
