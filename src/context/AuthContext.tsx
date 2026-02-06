'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { db, auth } from '@/lib/firebase';
import { signInAnonymously } from 'firebase/auth';
import { collection, query, where, getDocs, doc, getDoc } from 'firebase/firestore';

interface UserProfile {
    uid: string;
    email: string;
    role: 'super_admin' | 'admin' | 'user';
    businessId?: string;
    displayName?: string;
    photoURL?: string;
    initialized?: boolean;
}

interface AuthContextType {
    user: UserProfile | null;
    loading: boolean;
    login: (email: string) => Promise<UserProfile>;
    logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<UserProfile | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const savedAuth = localStorage.getItem('unideals_auth_profile');
        if (savedAuth) {
            const parsed = JSON.parse(savedAuth);

            // Live Session Verification: Check if user still exists/is authorized
            const verifySession = async () => {
                try {
                    const q = query(collection(db, 'users'), where('email', '==', parsed.email.toLowerCase().trim()));
                    const snapshot = await getDocs(q);

                    if (snapshot.empty && parsed.email !== 'bertrand.chagal@gmail.com') {
                        // User was deleted from DB, clear local session
                        logout();
                    } else if (!snapshot.empty) {
                        const docData = snapshot.docs[0].data();
                        const email = docData.email;
                        const role = email === 'bertrand.chagal@gmail.com' ? 'super_admin' : docData.role;

                        // Update local state if role changed in DB
                        const updatedProfile: UserProfile = {
                            uid: snapshot.docs[0].id,
                            email: email,
                            displayName: docData.displayName || email.split('@')[0],
                            role: role,
                            businessId: docData.businessId,
                            initialized: docData.initialized || false
                        };

                        // Silent Auth Bridge: Ensure Firebase Storage recognizes this session
                        await signInAnonymously(auth);

                        setUser(updatedProfile);
                        localStorage.setItem('unideals_auth_profile', JSON.stringify(updatedProfile));
                    }
                } catch (err) {
                    console.error("Session verification failed:", err);
                } finally {
                    setLoading(false);
                }
            };

            verifySession();
        } else {
            setLoading(false);
        }
    }, []);

    const login = async (email: string) => {
        const q = query(collection(db, 'users'), where('email', '==', email.toLowerCase().trim()));
        const snap = await getDocs(q);

        if (snap.empty) {
            throw new Error("UNAUTHORIZED");
        }

        const docData = snap.docs[0].data();
        const userEmail = docData.email;
        const role = userEmail === 'bertrand.chagal@gmail.com' ? 'super_admin' : docData.role;

        const profile: UserProfile = {
            uid: snap.docs[0].id,
            email: userEmail,
            displayName: docData.displayName || userEmail.split('@')[0],
            role: role,
            businessId: docData.businessId,
            initialized: docData.initialized || false
        };

        // Silent Auth Bridge: Grant identity to Firebase Storage
        await signInAnonymously(auth);

        setUser(profile);
        localStorage.setItem('unideals_auth_profile', JSON.stringify(profile));
        return profile;
    };

    const logout = () => {
        setUser(null);
        localStorage.removeItem('unideals_auth_profile'); // Changed key
        window.location.href = '/';
    };

    return (
        <AuthContext.Provider value={{ user, loading, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (!context) throw new Error('useAuth must be used within AuthProvider');
    return context;
}
