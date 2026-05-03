import React, { useState } from 'react';
import { Search, UserPlus, MessageCircle, MoreHorizontal, Filter } from 'lucide-react';

const AlumniConnections = () => {
    // Mock Connections Data
    const [users, setUsers] = useState([
        { id: 1, name: "Sarah Johnson", role: "Product Manager", company: "Microsoft", batch: "2020", mutual: 12, status: 'Connect', type: 'Alumni' },
        { id: 2, name: "David Wilson", role: "SDE II", company: "Amazon", batch: "2019", mutual: 8, status: 'Pending', type: 'Alumni' },
        { id: 3, name: "Emily Davis", role: "Student (Final Year)", company: "NEXORA College", batch: "2024", mutual: 2, status: 'Connect', type: 'Student' },
        { id: 4, name: "Michael Chen", role: "Data Scientist", company: "Tesla", batch: "2021", mutual: 24, status: 'Connected', type: 'Alumni' },
        { id: 5, name: "Anita Roy", role: "Student (3rd Year)", company: "NEXORA College", batch: "2025", mutual: 0, status: 'Connect', type: 'Student' },
    ]);

    const [filterType, setFilterType] = useState('All');

    const handleConnect = (id) => {
        setUsers(prev => prev.map(u => u.id === id ? { ...u, status: 'Pending' } : u));
    };

    const filteredUsers = users.filter(u => filterType === 'All' || u.type === filterType);

    return (
        <div className="animate-fade-in">
            <div className="page-header">
                <div>
                    <h2>My Network</h2>
                    <p>Connect with alumni and students to grow your professional circle.</p>
                </div>
            </div>

            {/* Controls */}
            <div className="card" style={{ marginBottom: '2rem', padding: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div className="search-container" style={{ width: '400px' }}>
                    <Search className="search-icon" size={18} />
                    <input type="text" placeholder="Search by name, role, or company" className="search-input" />
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Filter size={18} color="var(--text-secondary)" />
                    <select
                        className="form-input"
                        style={{ width: 'auto', padding: '0.5rem 1rem' }}
                        value={filterType}
                        onChange={(e) => setFilterType(e.target.value)}
                    >
                        <option value="All">All People</option>
                        <option value="Alumni">Alumni Only</option>
                        <option value="Student">Students Only</option>
                    </select>
                </div>
            </div>

            {/* Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '1.5rem' }}>
                {filteredUsers.map(user => (
                    <div key={user.id} className="card" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', padding: '2rem 1rem' }}>

                        <div style={{ position: 'relative', marginBottom: '1rem' }}>
                            <div className="avatar" style={{ width: 80, height: 80, fontSize: '1.5rem', background: user.type === 'Alumni' ? '#dcfce7' : '#e0f2fe', color: user.type === 'Alumni' ? '#16a34a' : '#0369a1' }}>
                                {user.name.charAt(0)}
                            </div>
                            <span className={`badge ${user.type === 'Alumni' ? 'badge-alumni' : 'badge-student'}`} style={{ position: 'absolute', bottom: -5, left: '50%', transform: 'translateX(-50%)', padding: '0.1rem 0.5rem', fontSize: '0.7rem' }}>
                                {user.type}
                            </span>
                        </div>

                        <h3 style={{ fontSize: '1.1rem', marginBottom: '0.25rem' }}>{user.name}</h3>
                        <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '0.25rem' }}>{user.role}</p>
                        <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{user.company} • Batch {user.batch}</p>

                        <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.75rem', marginBottom: '1.5rem' }}>
                            {user.mutual > 0 ? `${user.mutual} mutual connections` : 'New to network'}
                        </div>

                        <div style={{ width: '100%', marginTop: 'auto' }}>
                            {user.status === 'Connected' ? (
                                <button className="btn btn-secondary w-full">
                                    <MessageCircle size={18} /> Message
                                </button>
                            ) : user.status === 'Pending' ? (
                                <button className="btn btn-outline w-full" disabled style={{ opacity: 0.6 }}>
                                    Request Sent
                                </button>
                            ) : (
                                <button className="btn btn-primary w-full" onClick={() => handleConnect(user.id)}>
                                    <UserPlus size={18} /> Connect
                                </button>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default AlumniConnections;
