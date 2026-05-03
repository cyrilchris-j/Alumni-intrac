import React from 'react';
import { DollarSign, TrendingUp, Download, PieChart, ArrowUpRight } from 'lucide-react';

const AdminDonations = () => {
    return (
        <div className="animate-fade-in">
            <div className="page-header">
                <div>
                    <h2>Donations & Fundraising</h2>
                    <p>Track alumni contributions and fund allocation</p>
                </div>
                <button className="btn btn-primary">
                    <Download size={18} /> Download Report
                </button>
            </div>

            {/* Overview Stats */}
            <div className="stats-grid">
                <div className="stat-card" style={{ background: 'linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%)', color: 'white', border: 'none' }}>
                    <div className="stat-info">
                        <h3 style={{ color: 'white' }}>$45,200</h3>
                        <p style={{ color: 'rgba(255,255,255,0.8)' }}>Total Raised (FY 2025)</p>
                    </div>
                    <div className="stat-icon" style={{ background: 'rgba(255,255,255,0.2)', color: 'white' }}>
                        <DollarSign size={24} />
                    </div>
                </div>

                <div className="stat-card">
                    <div className="stat-info">
                        <h3>142</h3>
                        <p>Total Donors</p>
                    </div>
                    <div className="stat-icon bg-blue-100">
                        <UsersIcon size={24} color="var(--primary)" />
                    </div>
                </div>

                <div className="stat-card">
                    <div className="stat-info">
                        <h3>$318</h3>
                        <p>Average Donation</p>
                    </div>
                    <div className="stat-icon green">
                        <TrendingUp size={24} />
                    </div>
                </div>
            </div>

            {/* Main Content Split */}
            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '2rem' }}>
                {/* Recent Donations List */}
                <div className="card">
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem', alignItems: 'center' }}>
                        <h3 style={{ fontSize: '1.2rem' }}>Recent Contributions</h3>
                        <a href="#" style={{ fontSize: '0.9rem', color: 'var(--primary)', fontWeight: 500 }}>View All</a>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0' }}>
                        {[
                            { name: 'Michael Chen', batch: '2015', amount: '$1,000', purpose: 'Scholarship Fund', time: '2 hours ago' },
                            { name: 'Sarah Johnson', batch: '2018', amount: '$500', purpose: 'Campus Renovation', time: '1 day ago' },
                            { name: 'David Wilson', batch: '2020', amount: '$250', purpose: 'Sports Equipment', time: '2 days ago' },
                            { name: 'Emily Davis', batch: '2019', amount: '$100', purpose: 'General Fund', time: '3 days ago' },
                            { name: 'Robert Brown', batch: '2012', amount: '$5,000', purpose: 'Endowment', time: '1 week ago' },
                        ].map((donation, i) => (
                            <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem 0', borderBottom: '1px solid var(--border-color)' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                    <div className="avatar" style={{ background: '#f0f9ff', color: 'var(--primary)', fontSize: '0.9rem' }}>{donation.name.charAt(0)}</div>
                                    <div>
                                        <div style={{ fontWeight: 600 }}>{donation.name}</div>
                                        <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Class of {donation.batch} • {donation.purpose}</div>
                                    </div>
                                </div>
                                <div style={{ textAlign: 'right' }}>
                                    <div style={{ fontWeight: 700, color: '#15803d' }}>{donation.amount}</div>
                                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{donation.time}</div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Fundraising Goal / Breakdown */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                    <div className="card" style={{ background: '#1e293b', color: 'white', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', textAlign: 'center', padding: '2.5rem' }}>
                        <PieChart size={48} color="#fbbf24" style={{ marginBottom: '1rem' }} />
                        <h3 style={{ color: 'white', marginBottom: '0.5rem' }}>Annual Goal</h3>
                        <div style={{ fontSize: '2.5rem', fontWeight: 800, marginBottom: '0.5rem' }}>45%</div>
                        <p style={{ color: '#94a3b8' }}>$45,200 raised of $100,000 goal</p>
                        <div style={{ width: '100%', height: '8px', background: '#334155', borderRadius: '4px', marginTop: '1.5rem', overflow: 'hidden' }}>
                            <div style={{ width: '45%', height: '100%', background: '#fbbf24' }}></div>
                        </div>
                    </div>

                    <div className="card">
                        <h3 style={{ fontSize: '1.1rem', marginBottom: '1rem' }}>Top Donors</h3>
                        {[1, 2, 3].map(i => (
                            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
                                <div style={{ fontWeight: 700, color: '#9ca3af', width: '20px' }}>{i}</div>
                                <div className="avatar" style={{ width: 32, height: 32, fontSize: '0.8rem' }}>D</div>
                                <div style={{ flex: 1 }}>
                                    <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>Anonymous Donor</div>
                                    <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>$10,000</div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

// Simple Icon component helper
const UsersIcon = ({ size, color }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color || "currentColor"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M22 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>
);

export default AdminDonations;
