import React, { useState, useEffect } from 'react';
import { Search, Trash2, CheckCircle, XCircle, MoreVertical, Filter, Download } from 'lucide-react';

const AdminAlumni = () => {
    // Mock Data for UI demonstration
    const [alumniData, setAlumniData] = useState([
        { id: 1, name: "Cyril Chris", batch: "2023", dept: "Computer Science", company: "Google", role: "Software Engineer", status: "Verified", email: "cyril@example.com" },
        { id: 2, name: "Sarah Johnson", batch: "2022", dept: "Electronics", company: "Microsoft", role: "Product Manager", status: "Verified", email: "sarah@example.com" },
        { id: 3, name: "Michael Chen", batch: "2024", dept: "Mechanical", company: "Tesla", role: "Design Engineer", status: "Pending", email: "michael@example.com" },
        { id: 4, name: "Emily Davis", batch: "2021", dept: "Civil", company: "L&T", role: "Site Engineer", status: "Verified", email: "emily@example.com" },
        { id: 5, name: "David Wilson", batch: "2023", dept: "Computer Science", company: "Amazon", role: "SDE I", status: "Pending", email: "david@example.com" },
    ]);

    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState('All');

    // Filter Logic
    const filteredAlumni = alumniData.filter(alumnus => {
        const matchesSearch = alumnus.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            alumnus.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
            alumnus.dept.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus = filterStatus === 'All' || alumnus.status === filterStatus;
        return matchesSearch && matchesStatus;
    });

    const handleVerify = (id) => {
        setAlumniData(prev => prev.map(a => a.id === id ? { ...a, status: 'Verified' } : a));
    };

    const handleRemove = (id) => {
        if (window.confirm("Are you sure you want to remove this alumni account?")) {
            setAlumniData(prev => prev.filter(a => a.id !== id));
        }
    };

    return (
        <div className="animate-fade-in">
            <div className="page-header">
                <div>
                    <h2>Alumni Directory</h2>
                    <p>Manage and verify registered alumni accounts</p>
                </div>
                <div style={{ display: 'flex', gap: '1rem' }}>
                    <button className="btn btn-secondary">
                        <Download size={18} /> Export CSV
                    </button>
                    <button className="btn btn-primary">
                        + Add Alumni manually
                    </button>
                </div>
            </div>

            {/* Controls Bar */}
            <div className="card" style={{ marginBottom: '1.5rem', padding: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div className="search-container" style={{ width: '300px' }}>
                    <Search className="search-icon" size={18} />
                    <input
                        type="text"
                        placeholder="Search alumni by name, company..."
                        className="search-input"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>

                <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <Filter size={18} color="var(--text-secondary)" />
                        <span style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', fontWeight: 500 }}>Filter by Status:</span>
                    </div>
                    <select
                        className="form-input"
                        style={{ width: 'auto', padding: '0.5rem 1rem' }}
                        value={filterStatus}
                        onChange={(e) => setFilterStatus(e.target.value)}
                    >
                        <option value="All">All Status</option>
                        <option value="Verified">Verified</option>
                        <option value="Pending">Pending Approval</option>
                    </select>
                </div>
            </div>

            {/* Table */}
            <div className="table-container">
                <table className="data-table">
                    <thead>
                        <tr>
                            <th>Name / Email</th>
                            <th>Batch & Dept</th>
                            <th>Current Role</th>
                            <th>Status</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredAlumni.map((alumnus) => (
                            <tr key={alumnus.id}>
                                <td>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                        <div className="avatar" style={{ width: 36, height: 36, fontSize: '0.9rem', background: '#e0f2fe', color: '#0284c7' }}>
                                            {alumnus.name.charAt(0)}
                                        </div>
                                        <div>
                                            <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{alumnus.name}</div>
                                            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{alumnus.email}</div>
                                        </div>
                                    </div>
                                </td>
                                <td>
                                    <div style={{ fontWeight: 500 }}>{alumnus.dept}</div>
                                    <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Class of {alumnus.batch}</div>
                                </td>
                                <td>
                                    {alumnus.company !== '-' ? (
                                        <div>
                                            <div style={{ fontWeight: 500 }}>{alumnus.role}</div>
                                            <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>@ {alumnus.company}</div>
                                        </div>
                                    ) : (
                                        <span style={{ color: 'var(--text-muted)' }}>Not Updated</span>
                                    )}
                                </td>
                                <td>
                                    <span className={`badge ${alumnus.status === 'Verified' ? 'badge-alumni' : 'badge-admin'}`}
                                        style={{ background: alumnus.status === 'Pending' ? '#fff7ed' : undefined, color: alumnus.status === 'Pending' ? '#c2410c' : undefined }}>
                                        {alumnus.status}
                                    </span>
                                </td>
                                <td>
                                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                                        {alumnus.status === 'Pending' && (
                                            <button
                                                className="btn-icon"
                                                title="Approve"
                                                onClick={() => handleVerify(alumnus.id)}
                                                style={{ padding: '0.4rem', borderRadius: '6px', border: '1px solid #dcfce7', background: '#f0fdf4', color: '#16a34a', cursor: 'pointer' }}
                                            >
                                                <CheckCircle size={18} />
                                            </button>
                                        )}
                                        <button
                                            className="btn-icon"
                                            title="View Details"
                                            style={{ padding: '0.4rem', borderRadius: '6px', border: '1px solid #e5e7eb', background: 'white', color: '#6b7280', cursor: 'pointer' }}
                                        >
                                            <MoreVertical size={18} />
                                        </button>
                                        <button
                                            className="btn-icon"
                                            title="Remove"
                                            onClick={() => handleRemove(alumnus.id)}
                                            style={{ padding: '0.4rem', borderRadius: '6px', border: '1px solid #fee2e2', background: '#fef2f2', color: '#ef4444', cursor: 'pointer' }}
                                        >
                                            <Trash2 size={18} />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}

                        {filteredAlumni.length === 0 && (
                            <tr>
                                <td colSpan="5" style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
                                    No alumni found matching your criteria.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default AdminAlumni;
