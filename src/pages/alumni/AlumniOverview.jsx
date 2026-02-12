import React from 'react';
import { Briefcase, User, Users, Calendar, ArrowRight } from 'lucide-react';

const AlumniOverview = () => {
    return (
        <div className="animate-fade-in">
            <div className="page-header">
                <div>
                    <h2>Welcome Back, Cyril!</h2>
                    <p>Here's what's happening in your network.</p>
                </div>
                <button className="btn btn-primary">Update Profile</button>
            </div>

            <div className="stats-grid">
                <div className="stat-card">
                    <div className="stat-info">
                        <h3>154</h3>
                        <p>Profile Views</p>
                    </div>
                    <div className="stat-icon bg-blue-100">
                        <User size={24} color="var(--primary)" />
                    </div>
                </div>

                <div className="stat-card">
                    <div className="stat-info">
                        <h3>12</h3>
                        <p>New Connections</p>
                    </div>
                    <div className="stat-icon green">
                        <Users size={24} />
                    </div>
                </div>

                <div className="stat-card">
                    <div className="stat-info">
                        <h3>3</h3>
                        <p>Upcoming Events</p>
                    </div>
                    <div className="stat-icon orange">
                        <Calendar size={24} />
                    </div>
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '2rem' }}>
                <div className="card">
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
                        <h3 style={{ fontSize: '1.2rem' }}>Recent Job Postings</h3>
                        <span style={{ color: 'var(--primary)', cursor: 'pointer', fontSize: '0.9rem' }}>View All</span>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        {[
                            { title: 'Senior Product Designer', company: 'Spotify', loc: 'Remote', type: 'Full-time' },
                            { title: 'Software Engineer II', company: 'Airbnb', loc: 'San Francisco', type: 'Full-time' },
                            { title: 'Data Scientist', company: 'Netflix', loc: 'Los Gatos', type: 'Full-time' }
                        ].map((job, i) => (
                            <div key={i} style={{ border: '1px solid var(--border-color)', padding: '1rem', borderRadius: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <div>
                                    <h4 style={{ fontSize: '1rem', marginBottom: '0.25rem' }}>{job.title}</h4>
                                    <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>{job.company} • {job.loc}</p>
                                </div>
                                <button className="btn btn-outline" style={{ padding: '0.4rem 0.8rem', fontSize: '0.85rem' }}>Apply</button>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="card" style={{ height: 'fit-content' }}>
                    <h3 style={{ fontSize: '1.1rem', marginBottom: '1rem' }}>Mentorship Requests</h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        {[
                            { name: 'James Doe', year: '3rd Year', dept: 'CS' },
                            { name: 'Anita Roy', year: '4th Year', dept: 'EC' }
                        ].map((req, i) => (
                            <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                                    <div className="avatar" style={{ width: 32, height: 32, fontSize: '0.8rem' }}>{req.name.charAt(0)}</div>
                                    <div>
                                        <div style={{ fontSize: '0.9rem', fontWeight: 600 }}>{req.name}</div>
                                        <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{req.year}, {req.dept}</div>
                                    </div>
                                </div>
                                <button style={{ border: 'none', background: 'none', color: 'var(--primary)', cursor: 'pointer' }}><ArrowRight size={18} /></button>
                            </div>
                        ))}
                        {/* Empty State or View All could go here */}
                        <button className="btn btn-secondary w-full" style={{ marginTop: '0.5rem' }}>Manage Mentorship</button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AlumniOverview;
