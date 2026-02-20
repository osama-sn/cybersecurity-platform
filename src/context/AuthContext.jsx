import { createContext, useContext, useEffect, useState } from 'react';
import { onAuthStateChanged, signInWithPopup, GoogleAuthProvider, signOut, createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from '../firebase/config';

const AuthContext = createContext();

export const useAuth = () => {
    return useContext(AuthContext);
};

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [userData, setUserData] = useState(null); // Firestore user data
    const [loading, setLoading] = useState(true);
    const [isAdmin, setIsAdmin] = useState(false);
    const [isSuperAdmin, setIsSuperAdmin] = useState(false);

    // Specific super admin email
    const SUPER_ADMIN_EMAIL = "osamaessamkhalifa@gmail.com";

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
            setUser(currentUser);

            if (currentUser) {
                try {
                    const userRef = doc(db, 'users', currentUser.uid);
                    const userSnap = await getDoc(userRef);

                    let data = null;

                    if (userSnap.exists()) {
                        data = userSnap.data();
                    } else {
                        // Create user doc if it doesn't exist
                        data = {
                            email: currentUser.email,
                            role: 'user',
                            createdAt: serverTimestamp(),
                            allowedSections: []
                        };
                        await setDoc(userRef, data);
                    }

                    setUserData(data);

                    // Determine Roles
                    const isSuper = currentUser.email === SUPER_ADMIN_EMAIL || data.role === 'super_admin';
                    const isAdminUser = isSuper || data.role === 'admin';

                    setIsSuperAdmin(isSuper);
                    setIsAdmin(isAdminUser);

                } catch (error) {
                    console.error("Error fetching user data:", error);
                    setIsAdmin(false);
                    setIsSuperAdmin(false);
                }
            } else {
                setUserData(null);
                setIsAdmin(false);
                setIsSuperAdmin(false);
            }

            setLoading(false);
        });

        return unsubscribe;
    }, []);

    const signup = (email, password) => {
        return createUserWithEmailAndPassword(auth, email, password);
    };

    const login = (email, password) => {
        return signInWithEmailAndPassword(auth, email, password);
    };

    const loginWithGoogle = async () => {
        try {
            const provider = new GoogleAuthProvider();
            await signInWithPopup(auth, provider);
        } catch (error) {
            console.error("Google Login Error:", error);
            throw error;
        }
    };

    const logout = () => {
        return signOut(auth);
    };

    const value = {
        user,
        userData, // Expose full firestore data (includes allowedSections)
        isAdmin,
        isSuperAdmin,
        signup,
        login,
        loginWithGoogle,
        logout,
        loading
    };

    return (
        <AuthContext.Provider value={value}>
            {!loading && children}
        </AuthContext.Provider>
    );
};
