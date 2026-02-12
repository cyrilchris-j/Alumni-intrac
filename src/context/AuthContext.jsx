import React, { createContext, useContext, useState, useEffect } from 'react';
import {
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    signOut,
    onAuthStateChanged,
    GoogleAuthProvider,
    signInWithPopup
} from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { auth, db } from '../services/firebase';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
    const [currentUser, setCurrentUser] = useState(null);
    const [userRole, setUserRole] = useState(null); // 'student', 'alumni', 'admin'
    const [loading, setLoading] = useState(true);

    // Sign Up Function
    const signup = async (email, password, role, additionalData = {}) => {
        try {
            // 1. Create Auth User
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            const user = userCredential.user;

            // 2. Create User Document in Firestore
            try {
                await setDoc(doc(db, "users", user.uid), {
                    uid: user.uid,
                    email: user.email,
                    role: role,
                    createdAt: new Date(),
                    ...additionalData
                });
            } catch (dbError) {
                console.error("Firestore Write Error:", dbError);
                if (dbError.code === 'permission-denied') {
                    // Critical error - user needs to know
                    alert("Database Permission Denied! Please check your Firestore Security Rules in the Firebase Console.");
                    throw new Error("Database permission denied. Check Firestore Rules.");
                }
                throw new Error("Failed to save user profile: " + dbError.message);
            }

            setUserRole(role);
            return user;
        } catch (error) {
            console.error("Signup Error:", error);
            throw error;
        }
    };

    // Login Function
    const login = async (email, password) => {
        try {
            const userCredential = await signInWithEmailAndPassword(auth, email, password);
            return userCredential.user;
        } catch (error) {
            throw error;
        }
    };

    // Google Sign In Function
    const googleSignIn = async () => {
        try {
            const provider = new GoogleAuthProvider();
            const result = await signInWithPopup(auth, provider);
            const user = result.user;

            // Check if user exists in Firestore
            const userDocRef = doc(db, "users", user.uid);
            const userDoc = await getDoc(userDocRef);

            if (!userDoc.exists()) {
                // Create new user document for alumni
                await setDoc(userDocRef, {
                    uid: user.uid,
                    email: user.email,
                    role: 'alumni',
                    name: user.displayName,
                    photoURL: user.photoURL,
                    profileRole: 'Professional',
                    company: '',
                    location: '',
                    about: 'Welcome to NEXORA Alumni Network! Please update your profile with your professional information.',
                    education: [{ degree: '', year: '', college: 'NEXORA College of Engineering' }],
                    experience: [],
                    linkedin: '',
                    website: '',
                    createdAt: new Date()
                });
            }

            setUserRole('alumni');
            return user;
        } catch (error) {
            console.error("Google Sign In Error:", error);
            throw error;
        }
    };

    // Refresh user data from Firestore
    const refreshUserData = async () => {
        if (!currentUser?.uid) return;
        
        try {
            const userDocRef = doc(db, "users", currentUser.uid);
            const userDoc = await getDoc(userDocRef);
            if (userDoc.exists()) {
                const userData = userDoc.data();
                setCurrentUser({ ...currentUser, ...userData });
            }
        } catch (error) {
            console.error("Error refreshing user data:", error);
        }
    };

    useEffect(() => {
        const safetyTimer = setTimeout(() => {
            console.warn("Firebase Auth listener timed out. Forcing app load.");
            setLoading(false);
        }, 5000);

        const unsubscribe = onAuthStateChanged(auth, async (user) => {
            clearTimeout(safetyTimer);
            console.log("Auth State Changed:", user ? "User Logged In" : "No User");

            if (user) {
                try {
                    const userDocRef = doc(db, "users", user.uid);
                    const userDoc = await getDoc(userDocRef);

                    if (userDoc.exists()) {
                        const userData = userDoc.data();
                        setUserRole(userData.role);
                        setCurrentUser({ ...user, ...userData });
                    } else {
                        console.error("User document not found in Firestore!");
                        // Fallback: If no doc, we can't determine role. 
                        // Suggestion: Force logout or assume a default if legitimate.
                        // For now, alerting the user to broken state.
                        // alert("User profile not found. Please contact admin.");
                        setCurrentUser(user);
                        setUserRole(null); // Explicitly null
                    }
                } catch (error) {
                    console.error("Error fetching user role:", error);
                    if (error.code === 'permission-denied') {
                        console.error("Check Firestore Rules!");
                    }
                    // Fallback to allow 'logged in' state even if DB check fails
                    setCurrentUser(user);
                    setUserRole(null);
                }
            } else {
                setCurrentUser(null);
                setUserRole(null);
            }
            setLoading(false);
        });

        return () => {
            unsubscribe();
            clearTimeout(safetyTimer);
        };
    }, []);

    // Logout Function
    const logout = async () => {
        try {
            await signOut(auth);
            setCurrentUser(null);
            setUserRole(null);
        } catch (error) {
            console.error("Logout Error:", error);
            throw error;
        }
    };

    const value = {
        currentUser,
        userRole,
        signup,
        login,
        googleSignIn,
        logout,
        refreshUserData,
        loading
    };

    return (
        <AuthContext.Provider value={value}>
            {loading ? (
                <div style={{
                    height: '100vh',
                    width: '100vw',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexDirection: 'column',
                    background: '#f0f2f5',
                    fontFamily: 'sans-serif'
                }}>
                    <div style={{
                        width: '40px',
                        height: '40px',
                        border: '4px solid #e5e7eb',
                        borderTop: '4px solid #0077b5',
                        borderRadius: '50%',
                        animation: 'spin 1s linear infinite'
                    }}></div>
                    <p style={{ marginTop: '1rem', color: '#6b7280' }}>Loading NEXORA...</p>
                    <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
                </div>
            ) : (
                children
            )}
        </AuthContext.Provider>
    );
};
