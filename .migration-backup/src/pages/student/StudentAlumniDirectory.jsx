import React, { useState } from 'react';
import { Search, Filter, MapPin, Briefcase, GraduationCap, Mail, MessageCircle } from 'lucide-react';

const StudentAlumniDirectory = () => {
    // Mock Alumni Data
    const [alumni, setAlumni] = useState([
        { id: 1, name: "Cyril Chris", batch: "2023", dept: "Computer Science", role: "Software Engineer", company: "Google", location: "Bangalore", verified: true },
        { id: 2, name: "Sarah Johnson", batch: "2020", dept: "Electronics", role: "Product Manager", company: "Microsoft", location: "Hyderabad", verified: true },
        { id: 3, name: "Mike Ross", batch: "2018", dept: "Law", role: "Associate", company: "Pearson Specter", location: "New York", verified: true },
        { id: 4, name: "Jessica Liu", batch: "2021", dept: "Data Science", role: "Data Analyst", company: "Netflix", location: "California", verified: true },
        { id: 5, name: "Rahul Verma", batch: "2019", dept: "Mechanical", role: "Design Engineer", company: "Tesla", location: "Berlin", verified: true },
    ]);

    const [filters, setFilters] = useState({
        dept: 'All',
        year: 'All',
        name: ''
    });

    const filteredAlumni = alumni.filter(a => {
        const matchesName = a.name.toLowerCase().includes(filters.name.toLowerCase()) ||
            a.company.toLowerCase().includes(filters.name.toLowerCase()) ||
            a.role.toLowerCase().includes(filters.name.toLowerCase());
        const matchesDept = filters.dept === 'All' || a.dept === filters.dept;
        const matchesYear = filters.year === 'All' || a.batch === filters.year;

        return matchesName && matchesDept && matchesYear;
    });

    return (
        <div className="animate-fade-in">
            <div className="page-header">
                <div>
                    <h2>Find Alumni</h2>
                    <p>Search for seniors by department, company, or role.</p>
                </div>
            </div>

            {/* Filter Bar */}
            <div className="card" style={{ marginBottom: '2rem', padding: '1.5rem' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', gap: '1rem', alignItems: 'end' }}>
                    <div className="input-group" style={{ marginBottom: 0 }}>
                        <label className="form-label">Search</label>
                        <div style={{ position: 'relative' }}>
                            <Search size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: '#9ca3af' }} />
                            <input
                                type="text"
                                className="form-input"
                                style={{ paddingLeft: '2.5rem' }}
                                placeholder="Name, Company, or Role"
                                value={filters.name}
                                onChange={(e) => setFilters({ ...filters, name: e.target.value })}
                            />
                        </div>
                    </div>

                    <div className="input-group" style={{ marginBottom: 0 }}>
                        <label className="form-label">Department</label>
                        <select
                            className="form-input"
                            value={filters.dept}
                            onChange={(e) => setFilters({ ...filters, dept: e.target.value })}
                        >
                            <option value="All">All Departments</option>
                            <option value="Computer Science">Computer Science</option>
                            <option value="Electronics">Electronics</option>
                            <option value="Mechanical">Mechanical</option>
                            <option value="Law">Law</option>
                            <option value="Data Science">Data Science</option>
                        </select>
                    </div>

                    <div className="input-group" style={{ marginBottom: 0 }}>
                        <label className="form-label">Graduation Year</label>
                        <select
                            className="form-input"
                            value={filters.year}
                            onChange={(e) => setFilters({ ...filters, year: e.target.value })}
                        >
                            <option value="All">All Years</option>
                            <option value="2023">2023</option>
                            <option value="2022">2022</option>
                            <option value="2021">2021</option>
                            <option value="2020">2020</option>
                            <option value="2019">2019</option>
                            <option value="2018">2018</option>
                        </select>
                    </div>
                </div>
            </div>

            {/* Results Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.5rem' }}>
                {filteredAlumni.map(person => (
                    <div key={person.id} className="card" style={{ padding: '0', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
                        <div style={{ height: '80px', background: 'linear-gradient(to right, #e0f2fe, #dbeafe)' }}></div>
                        <div style={{ padding: '0 1.5rem 1.5rem', display: 'flex', flexDirection: 'column', flex: 1, marginTop: '-40px' }}>
                            <div className="avatar" style={{ width: 80, height: 80, fontSize: '1.5rem', border: '4px solid white', background: 'white', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
                                <div style={{ width: '100%', height: '100%', background: '#0284c7', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '50%' }}>
                                    {person.name.charAt(0)}
                                </div>
                            </div>

                            <div style={{ marginTop: '0.75rem' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <h3 style={{ fontSize: '1.15rem' }}>{person.name}</h3>
                                    {person.verified && <span className="badge badge-alumni">Verified</span>}
                                </div>
                                <p style={{ fontWeight: 500, color: 'var(--text-primary)' }}>{person.role}</p>
                                <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>{person.company}</p>
                            </div>

                            <div style={{ marginTop: '1rem', display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.85rem', color: '#6b7280' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                    <GraduationCap size={16} /> Batch of {person.batch}, {person.dept}
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                    <MapPin size={16} /> {person.location}
                                </div>
                            </div>

                            <div style={{ marginTop: '1.5rem', display: 'flex', gap: '0.75rem' }}>
                                <button className="btn btn-primary w-full" style={{ padding: '0.5rem', fontSize: '0.9rem' }}>
                                    <MessageCircle size={16} /> Message
                                </button>
                                <button className="btn btn-secondary w-full" style={{ padding: '0.5rem', fontSize: '0.9rem' }}>
                                    View Profile
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {filteredAlumni.length === 0 && (
                <div style={{ textAlign: 'center', padding: '4rem', color: '#9ca3af' }}>
                    <h3>No alumni found matching filters.</h3>
                    <p>Try adjusting your search criteria.</p>
                </div>
            )}
        </div>
    );
};

export default StudentAlumniDirectory;
