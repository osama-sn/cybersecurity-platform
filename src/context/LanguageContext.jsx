import { createContext, useContext, useState, useEffect } from 'react';
import { translations } from '../utils/translations';

const LanguageContext = createContext();

export const useLanguage = () => {
    return useContext(LanguageContext);
};

export const LanguageProvider = ({ children }) => {
    const [language, setLanguage] = useState('ar'); // Default to Arabic

    const t = (path) => {
        const keys = path.split('.');
        let value = translations[language];
        for (const key of keys) {
            value = value?.[key];
        }
        return value || path;
    };

    const toggleLanguage = () => {
        setLanguage(prev => prev === 'ar' ? 'en' : 'ar');
    };

    const dir = language === 'ar' ? 'rtl' : 'ltr';

    useEffect(() => {
        document.documentElement.dir = dir;
        document.documentElement.lang = language;
    }, [language, dir]);

    const value = {
        language,
        toggleLanguage,
        t,
        dir,
        isRTL: dir === 'rtl'
    };

    return (
        <LanguageContext.Provider value={value}>
            {children}
        </LanguageContext.Provider>
    );
};
