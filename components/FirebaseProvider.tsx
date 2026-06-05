import React, { createContext, useContext, useEffect, useState } from 'react';
import { auth, onAuthStateChanged, type FirebaseUser, signInWithPopup, googleProvider, db, doc, getDoc, setDoc, collection, query, where, getDocs } from '../firebase';
import type { User } from '../types';

interface FirebaseContextType {
    user: FirebaseUser | null;
    currentUser: User | null;
    loading: boolean;
    isAdmin: boolean;
    error: string | null;
    login: () => Promise<void>;
    loginWithCredentials: (username: string, password: string, systemCode: string) => Promise<boolean>;
    logout: () => Promise<void>;
}

const FirebaseContext = createContext<FirebaseContextType | undefined>(undefined);

import { simpleHash } from '../utils/authUtils';
const SYSTEM_CODE = 'BK-2026';

export const FirebaseProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<FirebaseUser | null>(null);
    const [currentUser, setCurrentUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const [isAdmin, setIsAdmin] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Persist login state in localStorage
    useEffect(() => {
        const checkAndSeed = async () => {
            try {
                // Use getDoc on the known bootstrap ID to avoid listing permissions if possible
                const bootstrapDoc = await getDoc(doc(db, 'users', 'bootstrap_admin'));
                
                if (!bootstrapDoc.exists()) {
                    // Check if any admin exists before creating bootstrap
                    const usersRef = collection(db, 'users');
                    const q = query(usersRef, where('role', '==', 'admin'));
                    const snapshot = await getDocs(q);
                    
                    if (snapshot.empty) {
                        const salt = 'default_salt';
                        const adminData = {
                            username: 'admin',
                            role: 'admin',
                            passwordHash: simpleHash('admin', salt),
                            salt: salt
                        };
                        await setDoc(doc(db, 'users', 'bootstrap_admin'), adminData);
                        console.log('Database seeded with bootstrap admin');
                    }
                }
            } catch (err) {
                console.error('Seeding failed:', err);
            }
        };
        checkAndSeed();

        const savedUser = localStorage.getItem('sooq_user');
        if (savedUser) {
            try {
                const parsed = JSON.parse(savedUser) as User;
                setCurrentUser(parsed);
                setIsAdmin(parsed.role === 'admin');
                setLoading(false);
            } catch (e) {
                console.error('Failed to parse saved user', e);
                localStorage.removeItem('sooq_user');
                setLoading(false);
            }
        } else {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (u) => {
            // Only use Google Auth for non-admins if desired, but for now we follow "Remove google login for admins"
            // If we are already logged in via credentials, ignore Google Auth state
            if (localStorage.getItem('sooq_user')) return;

            setLoading(true);
            setError(null);
            setUser(u);
            
            if (u) {
                try {
                    const userDoc = await getDoc(doc(db, 'users', u.uid));
                    
                    if (userDoc.exists()) {
                        const userData = userDoc.data() as User;
                        if (userData.role === 'admin') {
                            // Prohibit Google Admin login as requested
                            await auth.signOut();
                            setError('تسجيل الدخول عبر جوجل غير مسموح للمسؤولين. يرجى استخدام اسم المستخدم وكلمة المرور.');
                            setCurrentUser(null);
                        } else {
                            setCurrentUser({ ...userData, id: u.uid });
                            setIsAdmin(false);
                        }
                    } else {
                        // User exists in Firebase Auth but not in our users list
                        // If they are the bootstrap admin, we used to allow it, but now we don't
                        await auth.signOut();
                        setError('عذراً، ليس لديك صلاحية للوصول إلى النظام. يرجى مراجعة المسؤول.');
                        setCurrentUser(null);
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
            setError('فشل تسجيل الدخول عبر جوجل.');
        }
    };

    const loginWithCredentials = async (username: string, password: string, systemCode: string): Promise<boolean> => {
        setLoading(true);
        setError(null);

        if (systemCode !== SYSTEM_CODE) {
            setError('رقم الشركة (الرمز) غير صحيح.');
            setLoading(false);
            return false;
        }

        try {
            const usersRef = collection(db, 'users');
            const q = query(usersRef, where('username', '==', username));
            const querySnapshot = await getDocs(q);

            if (querySnapshot.empty) {
                setError('اسم المستخدم أو كلمة المرور غير صحيحة.');
                setLoading(false);
                return false;
            }

            const userData = querySnapshot.docs[0].data() as User;
            const hashed = simpleHash(password, userData.salt);

            if (hashed === userData.passwordHash) {
                const userObj = { ...userData, id: querySnapshot.docs[0].id };
                setCurrentUser(userObj);
                setIsAdmin(userObj.role === 'admin');
                localStorage.setItem('sooq_user', JSON.stringify(userObj));
                setLoading(false);
                return true;
            } else {
                setError('اسم المستخدم أو كلمة المرور غير صحيحة.');
                setLoading(false);
                return false;
            }
        } catch (err) {
            console.error('Login error:', err);
            setError('حدث خطأ أثناء تسجيل الدخول.');
            setLoading(false);
            return false;
        }
    };

    const logout = async () => {
        try {
            await auth.signOut();
            setCurrentUser(null);
            setIsAdmin(false);
            localStorage.removeItem('sooq_user');
        } catch (error) {
            console.error('Logout failed:', error);
        }
    };

    return (
        <FirebaseContext.Provider value={{ user, currentUser, loading, isAdmin, error, login, loginWithCredentials, logout }}>
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
