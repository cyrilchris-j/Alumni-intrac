import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Briefcase, GraduationCap, Users, User, ShieldCheck, AlertCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import '../styles/Entry.css';

const Entry = () => {
    const [isSignUp, setIsSignUp] = useState(false);
    const [role, setRole] = useState('student');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const { login, signup, userRole, currentUser, loading, logout, googleSignIn } = useAuth();
    const navigate = useNavigate();

    // Redirect if already logged in
    useEffect(() => {
        if (!loading && currentUser) {
            if (userRole === 'student') navigate('/student');
            else if (userRole === 'alumni') navigate('/alumni');
            else if (userRole === 'admin') navigate('/admin');
            else if (userRole === null) {
                // Critical: User logged in but no role found (Firestore doc missing) 
                setError("Account Error: User profile missing. Please logout and try again.");
            }
        }
    }, [currentUser, userRole, navigate, loading]);

    const handleAuth = async (e) => {
        e.preventDefault();
        setError('');
        setIsSubmitting(true);

        if (isSignUp && password !== confirmPassword) {
            setError("Passwords do not match");
            setIsSubmitting(false);
            return;
        }

        try {
            if (isSignUp) {
                console.log("Attempting Signup...", { email, role });
                
                // Prepare default profile data for new accounts
                let additionalData = {};
                if (role === 'alumni') {
                    additionalData = {
                        name: email.split('@')[0].replace(/[^a-zA-Z]/g, ' ').trim() || 'New Alumni',
                        profileRole: 'Professional', // to avoid conflict with user role
                        company: '',
                        location: '',
                        about: 'Welcome to NEXORA Alumni Network! Please update your profile with your professional information.',
                        education: [{ degree: '', year: '', college: 'NEXORA College of Engineering' }],
                        experience: [],
                        linkedin: '',
                        website: ''
                    };
                } else if (role === 'student') {
                    additionalData = {
                        name: email.split('@')[0].replace(/[^a-zA-Z]/g, ' ').trim() || 'New Student'
                    };
                }
                
                await signup(email, password, role, additionalData);
                console.log("Signup successful!");
                alert("Account Created Successfully! Redirecting...");
                // Force Direct Navigation for Signup as we know the role
                if (role === 'student') window.location.href = '/student';
                else if (role === 'alumni') window.location.href = '/alumni';
                else if (role === 'admin') window.location.href = '/admin';
            } else {
                console.log("Attempting Login...", { email });
                await login(email, password);
                console.log("Login successful! Waiting for Redirect...");
                // Navigation relies on useEffect when userRole is fetched
            }
        } catch (err) {
            console.error(err);
            const msg = err.message.replace('Firebase: ', '');
            setError(msg);
            alert("Authentication Error: " + msg);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleGoogleSignIn = async () => {
        setError('');
        setIsSubmitting(true);
        try {
            await googleSignIn();
            console.log("Google Sign In successful!");
        } catch (err) {
            console.error(err);
            const msg = err.message.replace('Firebase: ', '');
            setError(msg);
            alert("Google Sign In Error: " + msg);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="entry-page">
            <div className="entry-overlay"></div>

            <div className="entry-container">
                {/* Left Side - Welcome & Highlights */}
                <div className="entry-info animate-fade-in">
                    <div className="brand-badge">
                        <GraduationCap size={24} />
                        <span>NEXORA.ALUMNI</span>
                    </div>

                    <h1 className="welcome-text">
                        Welcome back to <br />
                        <span className="highlight-text">Cyril Chris</span>
                    </h1>

                    <p className="welcome-subtext">
                        Sign in to your account to continue your journey
                    </p>

                    <div className="features-list">
                        <div className="feature-item">
                            <div className="feature-icon"><Users size={20} /></div>
                            <div className="feature-text">
                                <h3>Alumni Network</h3>
                                <p>Connect with peers and seniors</p>
                            </div>
                        </div>

                        <div className="feature-item">
                            <div className="feature-icon"><Briefcase size={20} /></div>
                            <div className="feature-text">
                                <h3>Job Opportunities</h3>
                                <p>Find exclusive career openings</p>
                            </div>
                        </div>

                        <div className="feature-item">
                            <div className="feature-icon"><ShieldCheck size={20} /></div>
                            <div className="feature-text">
                                <h3>Mentorship</h3>
                                <p>Get guidance from experts</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Side - Auth Form */}
                <div className="entry-form-wrapper glass-panel animate-fade-in">
                    <div className="form-header">
                        <h2>{isSignUp ? 'Create Account' : 'Sign In'}</h2>
                        <p>Select your role to proceed</p>
                    </div>

                    {error && (
                        <div className="error-banner" style={{
                            background: '#fee2e2', color: '#b91c1c', padding: '0.75rem',
                            borderRadius: '0.5rem', marginBottom: '1rem', display: 'flex',
                            gap: '0.5rem', fontSize: '0.9rem',
                            flexDirection: 'column', alignItems: 'flex-start'
                        }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <AlertCircle size={16} />
                                <span>{error}</span>
                            </div>
                            {currentUser && (
                                <button
                                    onClick={() => { logout(); setError(''); }}
                                    style={{
                                        marginTop: '0.5rem', padding: '0.25rem 0.75rem',
                                        background: '#dc2626', color: 'white', border: 'none',
                                        borderRadius: '4px', cursor: 'pointer', fontSize: '0.8rem'
                                    }}
                                >
                                    Logout / Reset
                                </button>
                            )}
                        </div>
                    )}

                    <form onSubmit={handleAuth}>
                        {/* Role Selection */}
                        <div className="role-selector">
                            <div
                                className={`role-option ${role === 'student' ? 'active student' : ''}`}
                                onClick={() => setRole('student')}
                            >
                                <User size={20} />
                                <span>Student</span>
                            </div>
                            <div
                                className={`role-option ${role === 'alumni' ? 'active alumni' : ''}`}
                                onClick={() => setRole('alumni')}
                            >
                                <GraduationCap size={20} />
                                <span>Alumni</span>
                            </div>
                            <div
                                className={`role-option ${role === 'admin' ? 'active admin' : ''}`}
                                onClick={() => setRole('admin')}
                            >
                                <ShieldCheck size={20} />
                                <span>Admin</span>
                            </div>
                        </div>

                        <div className="input-group">
                            <label className="form-label">Email Address</label>
                            <input
                                type="email"
                                className="form-input"
                                placeholder="john@example.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                            />
                        </div>

                        <div className="input-group">
                            <label className="form-label">Password</label>
                            <input
                                type="password"
                                className="form-input"
                                placeholder="••••••••"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                            />
                        </div>

                        {isSignUp && (
                            <div className="input-group">
                                <label className="form-label">Confirm Password</label>
                                <input
                                    type="password"
                                    className="form-input"
                                    placeholder="••••••••"
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    required
                                />
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className={`btn btn-primary w-full ${role}-theme-btn`}
                            style={{ opacity: isSubmitting ? 0.7 : 1 }}
                        >
                            {isSubmitting ? 'Processing...' : (isSignUp ? 'Sign Up' : 'Sign In')}
                        </button>

                        <button
                            type="button"
                            onClick={handleGoogleSignIn}
                            disabled={isSubmitting}
                            className="btn btn-outline w-full"
                            style={{ opacity: isSubmitting ? 0.7 : 1, marginTop: '1rem' }}
                        >
                            Sign in with Google
                        </button>
                    </form>

                    <div className="form-footer">
                        <p>
                            {isSignUp ? 'Already have an account?' : "Don't have an account?"}
                            <button
                                className="btn-link"
                                onClick={() => {
                                    setIsSignUp(!isSignUp);
                                    setError('');
                                }}
                            >
                                {isSignUp ? 'Sign In' : 'Sign Up'}
                            </button>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Entry;
