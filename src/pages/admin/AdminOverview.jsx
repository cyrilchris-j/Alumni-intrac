import React from 'react';
import {
    Users,
    GraduationCap,
    Briefcase,
    Calendar,
    DollarSign,
    TrendingUp,
    MapPin,
    Building
} from 'lucide-react';

const AdminOverview = () => {
    return (
        <div className="animate-fade-in">
            <div className="page-header">
                <div>
                    <h2>Dashboard Overview</h2>
                    <p>Welcome back, Admin. Here's what's happening today.</p>
                </div>
                <button className="btn btn-primary">Generate Report</button>
            </div>

            {/* Analytics Cards */}
            <div className="stats-grid">
                <div className="stat-card">
                    <div className="stat-info">
                        <h3>1,240</h3>
                        <p>Total Alumni</p>
                    </div>
                    <div className="stat-icon bg-blue-100">
                        <GraduationCap size={24} />
                    </div>
                </div>

                <div className="stat-card">
                    <div className="stat-info">
                        <h3>856</h3>
                        <p>Employed Alumni</p>
                    </div>
                    <div className="stat-icon green">
                        <Briefcase size={24} />
                    </div>
                </div>

                <div className="stat-card">
                    <div className="stat-info">
                        <h3>42</h3>
                        <p>Active Events</p>
                    </div>
                    <div className="stat-icon orange">
                        <Calendar size={24} />
                    </div>
                </div>

                <div className="stat-card">
                    <div className="stat-info">
                        <h3>$12.5k</h3>
                        <p>Total Donations</p>
                    </div>
                    <div className="stat-icon purple">
                        <DollarSign size={24} />
                    </div>
                </div>
            </div>

            {/* Analytics Content Area */}
            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1.5rem', marginBottom: '2rem' }}>
                {/* Main Chart/Table Placeholder */}
                <div className="card">
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
                        <h3 style={{ fontSize: '1.2rem' }}>Department-wise Alumni Stats</h3>
                        <button className="btn btn-secondary btn-sm">Filter</button>
                    </div>
                    <div style={{ height: '300px', background: '#f9fafb', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#9ca3af' }}>
                        Chart Placeholder (Use Recharts or Chart.js)
                    </div>
                </div>

                {/* Top Hiring Companies */}
                <div className="card">
                    <h3 style={{ fontSize: '1.2rem', marginBottom: '1.5rem' }}>Top Hiring Companies</h3>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        {[
                            { name: 'Google', count: 124, loc: 'Mountain View' },
                            { name: 'Microsoft', count: 98, loc: 'Redmond' },
                            { name: 'Amazon', count: 86, loc: 'Seattle' },
                            { name: 'TCS', count: 75, loc: 'Mumbai' },
                            { name: 'Infosys', count: 62, loc: 'Bangalore' },
                        ].map((company, i) => (
                            <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.5rem 0', borderBottom: i < 4 ? '1px solid #f3f4f6' : 'none' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                    <div style={{ width: '32px', height: '32px', borderRadius: '6px', background: '#f3f4f6', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                        <Building size={16} color="#6b7280" />
                                    </div>
                                    <div>
                                        <h4 style={{ fontSize: '0.9rem', margin: 0 }}>{company.name}</h4>
                                        <span style={{ fontSize: '0.8rem', color: '#9ca3af' }}>{company.loc}</span>
                                    </div>
                                </div>
                                <span className="badge badge-alumni">{company.count}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

        </div>
    );
};

export default AdminOverview;
