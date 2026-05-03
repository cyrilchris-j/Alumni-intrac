import React, { useState } from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
    LogOut,
    Search,
    Bell,
    Menu,
    GraduationCap
} from 'lucide-react';
import '../../styles/Dashboard.css';

const DashboardLayout = ({ children, sidebarItems, role }) => {
    const { logout, currentUser } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    const handleLogout = async () => {
        try {
            await logout();
            navigate('/');
        } catch (error) {
            console.error("Failed to log out", error);
        }
    };

    const getPageTitle = () => {
        const currentPath = location.pathname.split('/').pop();
        // Find the item label based on path, defaulting to "Overview" or "Dashboard"
        if (!currentPath || currentPath === role) return "Overview";

        // Simple capitalization for now
        return currentPath.charAt(0).toUpperCase() + currentPath.slice(1);
    };

    return (
        <div className="dashboard-container">
            {/* 1. Left Sidebar */}
            <aside className="sidebar">
                <div className="sidebar-header">
                    <GraduationCap size={28} color="var(--primary)" />
                    <div className="sidebar-brand">
                        NEXORA<span style={{ color: 'var(--text-primary)' }}>ALUMNI</span>
                    </div>
                </div>

                <nav className="sidebar-nav">
                    {sidebarItems.map((item) => (
                        <NavLink
                            key={item.path}
                            to={item.path}
                            className={({ isActive }) =>
                                `nav-item ${isActive ? 'active' : ''}`
                            }
                            end={item.exact}
                        >
                            {item.icon}
                            <span>{item.label}</span>
                        </NavLink>
                    ))}
                </nav>

                <div className="sidebar-footer">
                    <div className="user-profile-mini">
                        <div className="avatar">
                            {currentUser?.email?.charAt(0).toUpperCase() || 'U'}
                        </div>
                        <div className="user-info">
                            <h4>{currentUser?.displayName || 'User'}</h4>
                            <p>{role.charAt(0).toUpperCase() + role.slice(1)}</p>
                        </div>
                    </div>
                    <button onClick={handleLogout} className="btn btn-outline w-full" style={{ justifyContent: 'center', borderColor: '#ef4444', color: '#ef4444' }}>
                        <LogOut size={18} />
                        <span>Sign Out</span>
                    </button>
                </div>
            </aside>

            {/* 2. Main Content Area */}
            <main className="main-content">
                {/* Top Bar */}
                <header className="top-bar">
                    <h2 style={{ fontSize: '1.25rem' }}>{getPageTitle()}</h2>

                    <div className="flex-center" style={{ gap: '1.5rem' }}>
                        <div className="search-container">
                            <Search className="search-icon" size={18} />
                            <input
                                type="text"
                                placeholder="Search..."
                                className="search-input"
                            />
                        </div>

                        <button className="btn-icon" style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)' }}>
                            <Bell size={20} />
                        </button>
                    </div>
                </header>

                {/* Dynamic Page Content */}
                <div className="content-scrollable">
                    {children}
                </div>
            </main>
        </div>
    );
};

export default DashboardLayout;
