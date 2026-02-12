import React from 'react';
import { useNavigate } from 'react-router-dom';
import { BookOpen, Users, Calendar, ArrowRight, Briefcase } from 'lucide-react';

const StudentOverview = () => {
    const navigate = useNavigate();
    return (
        <div className="animate-fade-in">
            <div className="page-header">
                <div>
                    <h2>Welcome, Student!</h2>
                    <p>Explore opportunities, connect with alumni, and shape your future.</p>
                </div>
            </div>

            <div className="stats-grid">
                <div className="stat-card">
                    <div className="stat-info">
                        <h3>1,200+</h3>
                        <p>Alumni Connected</p>
                    </div>
                    <div className="stat-icon bg-blue-100">
                        <Users size={24} color="var(--primary)" />
                    </div>
                </div>

                <div className="stat-card">
                    <div className="stat-info">
                        <h3>45</h3>
                        <p>Active Mentors</p>
                    </div>
                    <div className="stat-icon green">
                        <BookOpen size={24} />
                    </div>
                </div>

                <div className="stat-card">
                    <div className="stat-info">
                        <h3>8</h3>
                        <p>Upcoming Webinars</p>
                    </div>
                    <div className="stat-icon orange">
                        <Calendar size={24} />
                    </div>
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '2rem' }}>
                <div className="card">
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem', alignItems: 'center' }}>
                        <h3 style={{ fontSize: '1.2rem' }}>Recommended Alumni Mentors</h3>
                        <span style={{ color: 'var(--primary)', cursor: 'pointer', fontSize: '0.9rem' }}>Find More</span>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        {[
                        { name: 'Cyril Chris', role: 'Senior Software Engineer', company: 'Google', batch: '2023', dept: 'Computer Science' },
                            { name: 'Mark Zuckerberg', role: 'CEO', company: 'Meta', batch: '2004', dept: 'CS' } // Fun placeholder
                        ].map((mentor, i) => (
                            <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem', border: '1px solid var(--border-color)', borderRadius: '8px' }}>
                                <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                                    <div className="avatar" style={{ width: 48, height: 48, fontSize: '1.1rem', background: '#f3f4f6' }}>{mentor.name.charAt(0)}</div>
                                    <div>
                                        <h4 style={{ fontSize: '1rem', fontWeight: 600 }}>{mentor.name}</h4>
                                        <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>{mentor.role} at {mentor.company}</p>
                                        <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Class of {mentor.batch} • {mentor.dept}</p>
                                    </div>
                                </div>
                                <button className="btn btn-outline btn-sm" onClick={mentor.name === 'Cyril Chris' ? () => navigate('/student/profile') : undefined}>Profile</button>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="card" style={{ height: 'fit-content' }}>
                    <h3 style={{ fontSize: '1.1rem', marginBottom: '1rem' }}>Latest Internships</h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                        {[
                            { title: 'Frontend Intern', company: 'Swiggy', date: '1 day ago' },
                            { title: 'Data Science Intern', company: 'Microsoft', date: '3 days ago' },
                            { title: 'Product Intern', company: 'Cred', date: '1 week ago' }
                        ].map((job, i) => (
                            <div key={i} style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '0.75rem' }}>
                                <div style={{ fontWeight: 600, fontSize: '0.95rem' }}>{job.title}</div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '0.2rem' }}>
                                    <span>{job.company}</span>
                                    <span>{job.date}</span>
                                </div>
                            </div>
                        ))}
                        <button className="btn btn-link" style={{ textAlign: 'left', paddingLeft: 0, marginTop: '0.5rem' }}>View All Jobs <ArrowRight size={14} /></button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default StudentOverview;
