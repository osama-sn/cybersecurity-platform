import { createContext, useContext, useState } from 'react';

const ModeContext = createContext();

export const useMode = () => {
    return useContext(ModeContext);
};

export const ModeProvider = ({ children }) => {
    const [mode, setMode] = useState('learning'); // 'learning' or 'reference'

    const toggleMode = () => {
        setMode((prevMode) => (prevMode === 'learning' ? 'reference' : 'learning'));
    };

    const value = {
        mode,
        setMode,
        toggleMode,
        isLearningMode: mode === 'learning',
        isReferenceMode: mode === 'reference',
    };

    return (
        <ModeContext.Provider value={value}>
            {children}
        </ModeContext.Provider>
    );
};
