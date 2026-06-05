import React, { createContext, useContext, useEffect, useState } from 'react';
import { auth, onAuthStateChanged, type FirebaseUser, signInWithPopup, googleProvider, db, doc, getDoc } from '../firebase';

interface FirebaseContextType {
    user: FirebaseUser | null;
    loading: boolean;
    isAdmin: boolean;
    login: () => Promise<void>;
}

const FirebaseContext = createContext<FirebaseContextType | undefined>(undefined);

export const FirebaseProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<FirebaseUser | null>(null);
    const [loading, setLoading] = useState(true);
    const [isAdmin, setIsAdmin] = useState(false);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (u) => {
            setUser(u);
            if (u) {
                // Check if admin
                const adminDoc = await getDoc(doc(db, 'admins', u.uid));
                if (adminDoc.exists() || u.email === 'albasha.albasha4454@gmail.com') {
                    setIsAdmin(true);
                } else {
                    setIsAdmin(false);
                }
            } else {
                setIsAdmin(false);
            }
            setLoading(false);
        });
        return unsubscribe;
    }, []);

    const login = async () => {
        try {
            await signInWithPopup(auth, googleProvider);
        } catch (error) {
            console.error('Login failed:', error);
        }
    };

    return (
        <FirebaseContext.Provider value={{ user, loading, isAdmin, login }}>
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
