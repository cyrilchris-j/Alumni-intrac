import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import DashboardLayout from '../components/layout/DashboardLayout';
import AdminOverview from './admin/AdminOverview';
import AdminAlumni from './admin/AdminAlumni';
import AdminStudents from './admin/AdminStudents';
import AdminJobs from './admin/AdminJobs';
import AdminEvents from './admin/AdminEvents';
import AdminDonations from './admin/AdminDonations';
import {
    Users,
    GraduationCap,
    Briefcase,
    Calendar,
    DollarSign,
    BarChart2
} from 'lucide-react';

const AdminDashboard = () => {
    const sidebarItems = [
        { label: 'Overview', path: '/admin', icon: <BarChart2 size={20} />, exact: true },
        { label: 'Alumni Directory', path: '/admin/alumni', icon: <GraduationCap size={20} /> },
        { label: 'Students', path: '/admin/students', icon: <Users size={20} /> },
        { label: 'job Portal', path: '/admin/jobs', icon: <Briefcase size={20} /> },
        { label: 'Events & Webinars', path: '/admin/events', icon: <Calendar size={20} /> },
        { label: 'Donations', path: '/admin/donations', icon: <DollarSign size={20} /> },
    ];

    return (
        <DashboardLayout sidebarItems={sidebarItems} role="admin">
            <Routes>
                <Route path="/" element={<AdminOverview />} />

                {/* Placeholders for now */}
                <Route path="/alumni" element={<AdminAlumni />} />
                <Route path="/students" element={<AdminStudents />} />
                <Route path="/jobs" element={<AdminJobs />} />
                <Route path="/events" element={<AdminEvents />} />
                <Route path="/donations" element={<AdminDonations />} />

                <Route path="*" element={<Navigate to="/admin" replace />} />
            </Routes>
        </DashboardLayout>
    );
};

export default AdminDashboard;
