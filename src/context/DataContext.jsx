import { createContext, useContext, useState, useEffect } from 'react';
import { db } from '../firebase/config';
import { collection, getDocs, query, orderBy, onSnapshot } from 'firebase/firestore';

const DataContext = createContext();

export const useData = () => {
    return useContext(DataContext);
};

export const DataProvider = ({ children }) => {
    const [sections, setSections] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        // Real-time listener for sections
        const q = query(collection(db, 'sections'), orderBy('order', 'asc'));
        const unsubscribe = onSnapshot(q, (snapshot) => {
            const sectionsData = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
            setSections(sectionsData);
            setLoading(false);
        }, (err) => {
            console.error("Error fetching sections:", err);
            setError(err);
            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

    // Helper to fetch modules for a section (could be optimized)
    const getModules = async (sectionId) => {
        // implementation for independent fetching if needed
        // or we could subscribe to all modules/topics if dataset is small
        // For now, let's keep it simple and maybe load on demand or stick to sections in global state
    };

    const value = {
        sections,
        loading,
        error,
        // Add more data methods here as needed
    };

    return (
        <DataContext.Provider value={value}>
            {children}
        </DataContext.Provider>
    );
};
