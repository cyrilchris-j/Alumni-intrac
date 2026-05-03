import React, { useState } from 'react';
import { Search, Trash2, Mail, MoreVertical, Filter, Download, UserPlus } from 'lucide-react';

const AdminStudents = () => {
    // Mock Data for Students
    const [studentData, setStudentData] = useState([
        { id: 1, name: "John Doe", rollNo: "CS21045", dept: "Computer Science", year: "3rd Year", email: "john.doe@college.edu", status: "Active" },
        { id: 2, name: "Alice Smith", rollNo: "EC22012", dept: "Electronics", year: "2nd Year", email: "alice.s@college.edu", status: "Active" },
        { id: 3, name: "Robert Brown", rollNo: "ME20098", dept: "Mechanical", year: "4th Year", email: "bob.b@college.edu", status: "Inactive" },
        { id: 4, name: "Emma Wilson", rollNo: "CS23102", dept: "Computer Science", year: "1st Year", email: "emma.w@college.edu", status: "Active" },
        { id: 5, name: "Michael Lee", rollNo: "CE21056", dept: "Civil Engineering", year: "3rd Year", email: "m.lee@college.edu", status: "Active" },
    ]);

    const [searchTerm, setSearchTerm] = useState('');
    const [filterDept, setFilterDept] = useState('All');

    // Filter Logic
    const filteredStudents = studentData.filter(student => {
        const matchesSearch = student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            student.rollNo.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesDept = filterDept === 'All' || student.dept === filterDept;
        return matchesSearch && matchesDept;
    });

    const handleRemove = (id) => {
        if (window.confirm("Are you sure you want to remove this student account?")) {
            setStudentData(prev => prev.filter(s => s.id !== id));
        }
    };

    return (
        <div className="animate-fade-in">
            <div className="page-header">
                <div>
                    <h2>Student Directory</h2>
                    <p>Manage currently enrolled student accounts</p>
                </div>
                <div style={{ display: 'flex', gap: '1rem' }}>
                    <button className="btn btn-secondary">
                        <Download size={18} /> Export List
                    </button>
                    <button className="btn btn-primary">
                        <UserPlus size={18} /> Add Student
                    </button>
                </div>
            </div>

            {/* Controls Bar */}
            <div className="card" style={{ marginBottom: '1.5rem', padding: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div className="search-container" style={{ width: '320px' }}>
                    <Search className="search-icon" size={18} />
                    <input
                        type="text"
                        placeholder="Search by Name or Roll No..."
                        className="search-input"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>

                <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <Filter size={18} color="var(--text-secondary)" />
                        <span style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', fontWeight: 500 }}>Department:</span>
                    </div>
                    <select
                        className="form-input"
                        style={{ width: 'auto', padding: '0.5rem 1rem' }}
                        value={filterDept}
                        onChange={(e) => setFilterDept(e.target.value)}
                    >
                        <option value="All">All Departments</option>
                        <option value="Computer Science">Computer Science</option>
                        <option value="Electronics">Electronics</option>
                        <option value="Mechanical">Mechanical</option>
                        <option value="Civil Engineering">Civil</option>
                    </select>
                </div>
            </div>

            {/* Table */}
            <div className="table-container">
                <table className="data-table">
                    <thead>
                        <tr>
                            <th>Student Name</th>
                            <th>Roll Number</th>
                            <th>Department & Year</th>
                            <th>Contact</th>
                            <th>Status</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredStudents.map((student) => (
                            <tr key={student.id}>
                                <td>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                        <div className="avatar" style={{ width: 36, height: 36, fontSize: '0.9rem', background: '#fef3c7', color: '#b45309' }}>
                                            {student.name.charAt(0)}
                                        </div>
                                        <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{student.name}</div>
                                    </div>
                                </td>
                                <td style={{ fontFamily: 'monospace', fontSize: '0.95rem' }}>{student.rollNo}</td>
                                <td>
                                    <div style={{ fontWeight: 500 }}>{student.dept}</div>
                                    <div className="badge" style={{ marginTop: '0.25rem', display: 'inline-block', background: '#f3f4f6', color: '#4b5563', fontWeight: 'normal' }}>
                                        {student.year}
                                    </div>
                                </td>
                                <td>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                                        <Mail size={14} />
                                        {student.email}
                                    </div>
                                </td>
                                <td>
                                    <span className={`badge ${student.status === 'Active' ? 'badge-student' : 'badge-admin'}`}
                                        style={student.status === 'Inactive' ? { background: '#f3f4f6', color: '#9ca3af' } : {}}>
                                        {student.status}
                                    </span>
                                </td>
                                <td>
                                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                                        <button
                                            className="btn-icon"
                                            title="Edit Details"
                                            style={{ padding: '0.4rem', borderRadius: '6px', border: '1px solid #e5e7eb', background: 'white', color: '#6b7280', cursor: 'pointer' }}
                                        >
                                            <MoreVertical size={18} />
                                        </button>
                                        <button
                                            className="btn-icon"
                                            title="Remove Student"
                                            onClick={() => handleRemove(student.id)}
                                            style={{ padding: '0.4rem', borderRadius: '6px', border: '1px solid #fee2e2', background: '#fef2f2', color: '#ef4444', cursor: 'pointer' }}
                                        >
                                            <Trash2 size={18} />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}

                        {filteredStudents.length === 0 && (
                            <tr>
                                <td colSpan="6" style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
                                    No students found matching your criteria.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default AdminStudents;
