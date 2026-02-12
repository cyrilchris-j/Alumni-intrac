import React, { useState, useEffect } from 'react';
import { User, MapPin, Briefcase, Mail, Linkedin, Globe, Camera } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '../../services/firebase';

const AlumniProfile = ({ readOnly = false }) => {
    const { currentUser, refreshUserData } = useAuth();
    const [isEditing, setIsEditing] = useState(false);
    const [isSaving, setIsSaving] = useState(false);

    // Load profile data from currentUser with defaults
    const [profile, setProfile] = useState({
        name: currentUser?.name || currentUser?.displayName || 'New Alumni',
        profileRole: currentUser?.profileRole || 'Professional',
        company: currentUser?.company || '',
        location: currentUser?.location || '',
        email: currentUser?.email || '',
        about: currentUser?.about || 'Welcome to NEXORA Alumni Network! Please update your profile with your professional information.',
        education: currentUser?.education || [{ degree: '', year: '', college: 'NEXORA College of Engineering' }],
        experience: currentUser?.experience || [],
        linkedin: currentUser?.linkedin || '',
        website: currentUser?.website || ''
    });

    // Update profile when currentUser changes
    useEffect(() => {
        if (currentUser) {
            setProfile({
                name: currentUser.name || currentUser.displayName || 'New Alumni',
                profileRole: currentUser.profileRole || 'Professional',
                company: currentUser.company || '',
                location: currentUser.location || '',
                email: currentUser.email || '',
                about: currentUser.about || 'Welcome to NEXORA Alumni Network! Please update your profile with your professional information.',
                education: currentUser.education || [{ degree: '', year: '', college: 'NEXORA College of Engineering' }],
                experience: currentUser.experience || [],
                linkedin: currentUser.linkedin || '',
                website: currentUser.website || ''
            });
        }
    }, [currentUser]);

    const handleSave = async () => {
        if (!currentUser?.uid) return;
        
        setIsSaving(true);
        try {
            const userDocRef = doc(db, "users", currentUser.uid);
            await updateDoc(userDocRef, {
                name: profile.name,
                profileRole: profile.profileRole,
                company: profile.company,
                location: profile.location,
                about: profile.about,
                education: profile.education,
                experience: profile.experience,
                linkedin: profile.linkedin,
                website: profile.website
            });
            await refreshUserData(); // Refresh the currentUser data
            setIsEditing(false);
            alert("Profile updated successfully!");
        } catch (error) {
            console.error("Error updating profile:", error);
            alert("Failed to update profile. Please try again.");
        } finally {
            setIsSaving(false);
        }
    };

    const handleInputChange = (field, value) => {
        setProfile(prev => ({ ...prev, [field]: value }));
    };

    return (
        <div className="animate-fade-in">
            <div style={{ height: '200px', background: 'linear-gradient(to right, #3b82f6, #06b6d4)', borderRadius: '1rem 1rem 0 0', position: 'relative' }}>
                {!readOnly && <button className="btn btn-secondary" style={{ position: 'absolute', bottom: '1rem', right: '1rem', padding: '0.4rem 0.8rem', fontSize: '0.85rem' }}>
                    <Camera size={16} style={{ marginRight: '0.4rem' }} /> Edit Cover
                </button>}
            </div>

            <div style={{ padding: '0 2rem', position: 'relative', marginTop: '-60px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                    <div style={{ display: 'flex', alignItems: 'flex-end', gap: '1.5rem' }}>
                        <div style={{
                            width: '140px', height: '140px', borderRadius: '50%', background: 'white', padding: '4px',
                            boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)'
                        }}>
                            {currentUser?.photoURL ? (
                                <img src={currentUser.photoURL} alt="Profile" style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }} />
                            ) : (
                                <div style={{ width: '100%', height: '100%', borderRadius: '50%', background: '#e0f2fe', color: '#0369a1', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '3rem', fontWeight: 700 }}>
                                    {profile.name.charAt(0)}
                                </div>
                            )}
                        </div>
                        <div style={{ marginBottom: '1rem' }}>
                            {isEditing ? (
                                <input 
                                    type="text" 
                                    className="form-input" 
                                    value={profile.name} 
                                    onChange={(e) => handleInputChange('name', e.target.value)}
                                    style={{ fontSize: '2rem', marginBottom: '0.25rem' }}
                                />
                            ) : (
                                <h1 style={{ fontSize: '2rem', marginBottom: '0.25rem' }}>{profile.name}</h1>
                            )}
                            {isEditing ? (
                                <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                                    <input 
                                        type="text" 
                                        className="form-input" 
                                        value={profile.profileRole} 
                                        onChange={(e) => handleInputChange('profileRole', e.target.value)}
                                        placeholder="Role"
                                        style={{ flex: 1 }}
                                    />
                                    <span>at</span>
                                    <input 
                                        type="text" 
                                        className="form-input" 
                                        value={profile.company} 
                                        onChange={(e) => handleInputChange('company', e.target.value)}
                                        placeholder="Company"
                                        style={{ flex: 1 }}
                                    />
                                </div>
                            ) : (
                                <p style={{ fontSize: '1.1rem', color: '#4b5563' }}>{profile.profileRole} at {profile.company}</p>
                            )}
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#6b7280', fontSize: '0.9rem', marginTop: '0.25rem' }}>
                                <MapPin size={16} />
                                {isEditing ? (
                                    <input 
                                        type="text" 
                                        className="form-input" 
                                        value={profile.location} 
                                        onChange={(e) => handleInputChange('location', e.target.value)}
                                        placeholder="Location"
                                    />
                                ) : (
                                    profile.location || 'Location not set'
                                )}
                            </div>
                        </div>
                    </div>
                    <div style={{ marginBottom: '1rem' }}>
                        {!readOnly && <button className="btn btn-primary" onClick={isEditing ? handleSave : () => setIsEditing(true)} disabled={isSaving}>
                            {isSaving ? 'Saving...' : isEditing ? 'Save Changes' : 'Edit Profile'}
                        </button>}
                    </div>
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '2rem', marginTop: '2rem' }}>
                {/* Left Column */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                    {/* About */}
                    <div className="card">
                        <h3 style={{ fontSize: '1.25rem', marginBottom: '1rem' }}>About</h3>
                        {isEditing ? (
                            <textarea 
                                className="form-input" 
                                rows={4} 
                                value={profile.about} 
                                onChange={(e) => handleInputChange('about', e.target.value)}
                            />
                        ) : (
                            <p style={{ lineHeight: 1.6 }}>{profile.about}</p>
                        )}
                    </div>

                    {/* Experience */}
                    <div className="card">
                        <h3 style={{ fontSize: '1.25rem', marginBottom: '1.5rem' }}>Experience</h3>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                            {profile.experience.map((exp, i) => (
                                <div key={i} style={{ display: 'flex', gap: '1rem' }}>
                                    <div style={{ width: '48px', height: '48px', background: '#f3f4f6', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                        <Briefcase size={20} color="#6b7280" />
                                    </div>
                                    <div>
                                        <h4 style={{ fontSize: '1.1rem', marginBottom: '0.25rem' }}>{exp.role}</h4>
                                        <p style={{ fontWeight: 500 }}>{exp.company}</p>
                                        <p style={{ fontSize: '0.9rem', color: '#9ca3af' }}>{exp.period}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Education */}
                    <div className="card">
                        <h3 style={{ fontSize: '1.25rem', marginBottom: '1.5rem' }}>Education</h3>
                        {profile.education.map((edu, i) => (
                            <div key={i} style={{ display: 'flex', gap: '1rem' }}>
                                <div style={{ width: '48px', height: '48px', background: '#f3f4f6', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    <div style={{ fontWeight: 700, color: '#6b7280' }}>N</div>
                                </div>
                                <div>
                                    <h4 style={{ fontSize: '1.1rem', marginBottom: '0.25rem' }}>{edu.college}</h4>
                                    <p>{edu.degree}</p>
                                    <p style={{ fontSize: '0.9rem', color: '#9ca3af' }}>{edu.year}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Right Column (Sidebar info) */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                    <div className="card">
                        <h3 style={{ fontSize: '1.1rem', marginBottom: '1rem' }}>Contact Info</h3>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '0.95rem' }}>
                                <Mail size={18} color="#6b7280" />
                                {profile.email}
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '0.9rem', color: '#0077b5' }}>
                                <Linkedin size={18} />
                                {isEditing ? (
                                    <input 
                                        type="text" 
                                        className="form-input" 
                                        value={profile.linkedin} 
                                        onChange={(e) => handleInputChange('linkedin', e.target.value)}
                                        placeholder="LinkedIn profile URL"
                                        style={{ flex: 1 }}
                                    />
                                ) : (
                                    profile.linkedin ? <a href={profile.linkedin} target="_blank" rel="noopener noreferrer">{profile.linkedin}</a> : 'Not provided'
                                )}
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '0.95rem' }}>
                                <Globe size={18} color="#6b7280" />
                                {isEditing ? (
                                    <input 
                                        type="text" 
                                        className="form-input" 
                                        value={profile.website} 
                                        onChange={(e) => handleInputChange('website', e.target.value)}
                                        placeholder="Website URL"
                                        style={{ flex: 1 }}
                                    />
                                ) : (
                                    profile.website ? <a href={profile.website} target="_blank" rel="noopener noreferrer">{profile.website}</a> : 'Not provided'
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AlumniProfile;
