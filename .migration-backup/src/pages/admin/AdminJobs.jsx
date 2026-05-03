import React, { useState } from 'react';
import { Search, Briefcase, MapPin, Clock, Plus, Filter, Building } from 'lucide-react';

const AdminJobs = () => {
    // Mock Job Data
    const [jobs, setJobs] = useState([
        { id: 1, title: 'Software Engineer Intern', company: 'Google', location: 'Bangalore', type: 'Internship', postedBy: 'Cyril Chris (Alumni)', date: '2 days ago', applicants: 12 },
        { id: 2, title: 'Product Manager', company: 'Microsoft', location: 'Hyderabad', type: 'Full-time', postedBy: 'Admin', date: '5 days ago', applicants: 45 },
        { id: 3, title: 'Data Scientist', company: 'Amazon', location: 'Chennai', type: 'Full-time', postedBy: 'Sarah Johnson (Alumni)', date: '1 week ago', applicants: 28 },
        { id: 4, title: 'Frontend Developer', company: 'Swiggy', location: 'Remote', type: 'Full-time', postedBy: 'Admin', date: '3 days ago', applicants: 18 },
    ]);

    const [isPostModalOpen, setIsPostModalOpen] = useState(false);
    const [filterType, setFilterType] = useState('All');
    const [searchTerm, setSearchTerm] = useState('');

    const filteredJobs = jobs.filter(job => {
        const matchesSearch = job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            job.company.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesType = filterType === 'All' || job.type === filterType;
        return matchesSearch && matchesType;
    });

    const handlePostJob = (e) => {
        e.preventDefault();
        // Just a mock function to close modal
        alert("Job Posted Successfully!");
        setIsPostModalOpen(false);
    };

    return (
        <div className="animate-fade-in">
            <div className="page-header">
                <div>
                    <h2>Job Portal</h2>
                    <p>Manage job postings and internship opportunities</p>
                </div>
                <button className="btn btn-primary" onClick={() => setIsPostModalOpen(true)}>
                    <Plus size={18} /> Post New Job
                </button>
            </div>

            {/* Controls */}
            <div className="card" style={{ marginBottom: '2rem', padding: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div className="search-container" style={{ width: '400px' }}>
                    <Search className="search-icon" size={18} />
                    <input
                        type="text"
                        placeholder="Search jobs by title or company..."
                        className="search-input"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Filter size={18} color="var(--text-secondary)" />
                    <select
                        className="form-input"
                        style={{ width: 'auto', padding: '0.5rem 1rem' }}
                        value={filterType}
                        onChange={(e) => setFilterType(e.target.value)}
                    >
                        <option value="All">All Job Types</option>
                        <option value="Full-time">Full-time</option>
                        <option value="Internship">Internship</option>
                    </select>
                </div>
            </div>

            {/* Jobs Grid */}
            <div className="jobs-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.5rem' }}>
                {filteredJobs.map(job => (
                    <div key={job.id} className="card job-card" style={{ transition: 'transform 0.2s', cursor: 'pointer' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                            <div style={{ width: 48, height: 48, borderRadius: 8, background: '#f3f4f6', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <Building size={24} color="#4b5563" />
                            </div>
                            <span className={`badge ${job.type === 'Internship' ? 'badge-student' : 'badge-alumni'}`}>
                                {job.type}
                            </span>
                        </div>

                        <h3 style={{ fontSize: '1.1rem', marginBottom: '0.25rem' }}>{job.title}</h3>
                        <p style={{ fontWeight: 500, color: 'var(--text-primary)', marginBottom: '1rem' }}>{job.company}</p>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <MapPin size={16} /> {job.location}
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <Clock size={16} /> Posted {job.date}
                            </div>
                        </div>

                        <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '1rem', marginTop: 'auto' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.85rem' }}>
                                <span style={{ color: 'var(--text-muted)' }}>By: {job.postedBy}</span>
                                <span style={{ fontWeight: 600, color: 'var(--primary)' }}>{job.applicants} Applicants</span>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Post Job Modal (Simplified) */}
            {isPostModalOpen && (
                <div className="modal-overlay" style={{
                    position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
                    background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100
                }}>
                    <div className="card" style={{ width: '500px', padding: '2rem' }}>
                        <h2 style={{ marginBottom: '1.5rem' }}>Post New Opportunity</h2>
                        <form onSubmit={handlePostJob}>
                            <div className="input-group">
                                <label className="form-label">Job Title</label>
                                <input type="text" className="form-input" placeholder="e.g. Software Engineer" required />
                            </div>
                            <div className="input-group">
                                <label className="form-label">Company Name</label>
                                <input type="text" className="form-input" placeholder="e.g. Google" required />
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                <div className="input-group">
                                    <label className="form-label">Employment Type</label>
                                    <select className="form-input">
                                        <option>Full-time</option>
                                        <option>Internship</option>
                                        <option>Contract</option>
                                    </select>
                                </div>
                                <div className="input-group">
                                    <label className="form-label">Location</label>
                                    <input type="text" className="form-input" placeholder="e.g. Remote" required />
                                </div>
                            </div>

                            <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                                <button type="button" className="btn btn-secondary w-full" onClick={() => setIsPostModalOpen(false)}>Cancel</button>
                                <button type="submit" className="btn btn-primary w-full">Post Job</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminJobs;
