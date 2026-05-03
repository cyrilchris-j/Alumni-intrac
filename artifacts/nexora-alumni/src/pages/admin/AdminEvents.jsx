import React, { useState } from 'react';
import { Calendar, Clock, MapPin, Video, Plus, Users } from 'lucide-react';

const AdminEvents = () => {
    const [events, setEvents] = useState([
        {
            id: 1,
            title: 'Global Alumni Meet 2026',
            type: 'Offline',
            date: 'March 15, 2026',
            time: '10:00 AM - 4:00 PM',
            location: 'College Auditorium',
            registrations: 240,
            image: 'https://images.unsplash.com/photo-1523580494863-6f3031224c94?ixlib=rb-1.2.1&auto=format&fit=crop&w=400&q=80'
        },
        {
            id: 2,
            title: 'Tech Talk: AI in 2026',
            type: 'Webinar',
            date: 'Feb 10, 2026',
            time: '6:00 PM - 7:30 PM',
            location: 'Zoom Meeting',
            link: 'https://zoom.us/j/123456789',
            registrations: 115,
            image: 'https://images.unsplash.com/photo-1591115765373-5207764f72e7?ixlib=rb-1.2.1&auto=format&fit=crop&w=400&q=80'
        },
        {
            id: 3,
            title: 'Batch of 2015 Reunion',
            type: 'Offline',
            date: 'April 05, 2026',
            time: '7:00 PM Onwards',
            location: 'Grand Hotel, City Center',
            registrations: 85,
            image: 'https://images.unsplash.com/photo-1511632765486-a01980e01a18?ixlib=rb-1.2.1&auto=format&fit=crop&w=400&q=80'
        }
    ]);

    const [isModalOpen, setIsModalOpen] = useState(false);

    return (
        <div className="animate-fade-in">
            <div className="page-header">
                <div>
                    <h2>Events & Webinars</h2>
                    <p>Organize reunions, webinars, and tech talks</p>
                </div>
                <button className="btn btn-primary" onClick={() => setIsModalOpen(true)}>
                    <Plus size={18} /> Create Event
                </button>
            </div>

            <div className="events-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: '2rem' }}>
                {events.map((event) => (
                    <div key={event.id} className="card" style={{ padding: 0, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
                        <div style={{ height: '160px', overflow: 'hidden', position: 'relative' }}>
                            <img src={event.image} alt={event.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                            <span className="badge" style={{ position: 'absolute', top: '1rem', right: '1rem', background: 'white', color: 'black' }}>
                                {event.type}
                            </span>
                        </div>

                        <div style={{ padding: '1.5rem', flex: 1, display: 'flex', flexDirection: 'column' }}>
                            <h3 style={{ fontSize: '1.25rem', marginBottom: '0.75rem' }}>{event.title}</h3>

                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem', color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '1.5rem' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                    <Calendar size={16} /> {event.date}
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                    <Clock size={16} /> {event.time}
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                    {event.type === 'Webinar' ? <Video size={16} /> : <MapPin size={16} />}
                                    {event.type === 'Webinar' ? <a href="#" style={{ color: 'var(--primary)' }}>Join Link</a> : event.location}
                                </div>
                            </div>

                            <div style={{ marginTop: 'auto', borderTop: '1px solid var(--border-color)', paddingTop: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                                    <Users size={16} />
                                    <b>{event.registrations}</b> registered
                                </div>
                                <button className="btn btn-outline" style={{ padding: '0.4rem 0.8rem', fontSize: '0.85rem' }}>Manage</button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Create Event Modal */}
            {isModalOpen && (
                <div className="modal-overlay" style={{
                    position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
                    background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100
                }}>
                    <div className="card" style={{ width: '550px', padding: '2rem' }}>
                        <h2 style={{ marginBottom: '1.5rem' }}>Create New Event</h2>
                        <form>
                            <div className="input-group">
                                <label className="form-label">Event Title</label>
                                <input type="text" className="form-input" placeholder="e.g. Annual Alumni Meet" />
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                <div className="input-group">
                                    <label className="form-label">Date</label>
                                    <input type="date" className="form-input" />
                                </div>
                                <div className="input-group">
                                    <label className="form-label">Time</label>
                                    <input type="time" className="form-input" />
                                </div>
                            </div>
                            <div className="input-group">
                                <label className="form-label">Event Type</label>
                                <select className="form-input">
                                    <option>Offline / On-Campus</option>
                                    <option>Webinar / Online</option>
                                </select>
                            </div>
                            <div className="input-group">
                                <label className="form-label">Venue / Link</label>
                                <input type="text" className="form-input" placeholder="Enter Full Address or Zoom Link" />
                            </div>

                            <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem' }}>
                                <button type="button" className="btn btn-secondary w-full" onClick={() => setIsModalOpen(false)}>Cancel</button>
                                <button type="button" className="btn btn-primary w-full" onClick={() => setIsModalOpen(false)}>Create Event</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminEvents;
