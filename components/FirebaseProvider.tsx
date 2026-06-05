import React, { createContext, useContext, useEffect, useState } from 'react';
import { auth, onAuthStateChanged, type FirebaseUser, signInWithPopup, googleProvider, db, doc, getDoc, setDoc } from '../firebase';
import type { User } from '../types';

interface FirebaseContextType {
    user: FirebaseUser | null;
    currentUser: User | null;
    loading: boolean;
    isAdmin: boolean;
    error: string | null;
    login: () => Promise<void>;
    logout: () => Promise<void>;
}

const FirebaseContext = createContext<FirebaseContextType | undefined>(undefined);

export const FirebaseProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<FirebaseUser | null>(null);
    const [currentUser, setCurrentUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const [isAdmin, setIsAdmin] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (u) => {
            setLoading(true);
            setError(null);
            setUser(u);
            
            if (u) {
                try {
                    // 1. Check in users collection
                    const userDoc = await getDoc(doc(db, 'users', u.uid));
                    
                    if (userDoc.exists()) {
                        const userData = userDoc.data() as User;
                        setCurrentUser({ ...userData, id: u.uid });
                        setIsAdmin(userData.role === 'admin');
                    } else if (u.email === 'albasha.albasha4454@gmail.com') {
                        // Bootstrapping admin
                        const newAdmin: User = {
                            id: u.uid,
                            username: u.displayName || 'Admin',
                            role: 'admin',
                            passwordHash: 'firebase_auth', // Not used for Google Auth
                            salt: 'firebase_auth'
                        };
                        await setDoc(doc(db, 'users', u.uid), newAdmin);
                        setCurrentUser(newAdmin);
                        setIsAdmin(true);
                    } else {
                        // User exists in Firebase Auth but not in our users list
                        setCurrentUser(null);
                        setIsAdmin(false);
                        setError('عذراً، ليس لديك صلاحية للوصول إلى النظام. يرجى مراجعة المسؤول.');
                    }
                } catch (err) {
                    console.error('Error fetching user profile:', err);
                    setError('حدث خطأ أثناء تحميل بيانات المستخدم.');
                }
            } else {
                setCurrentUser(null);
                setIsAdmin(false);
            }
            setLoading(false);
        });
        return unsubscribe;
    }, []);

    const login = async () => {
        try {
            await signInWithPopup(auth, googleProvider);
        } catch (error: any) {
            console.error('Login failed:', error);
            setError('فشل تسجيل الدخول. يرجى المحاولة مرة أخرى.');
        }
    };

    const logout = async () => {
        try {
            await auth.signOut();
        } catch (error) {
            console.error('Logout failed:', error);
        }
    };

    return (
        <FirebaseContext.Provider value={{ user, currentUser, loading, isAdmin, error, login, logout }}>
            {children}
        </FirebaseContext.Provider>
    );
};

export const useFirebase = () => {
    const context = useContext(FirebaseContext);
    if (context === undefined) {
        throw new Error('useFirebase must be used within a FirebaseProvider');
    }
    return context;
};
