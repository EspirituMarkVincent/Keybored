import React, { createContext, useContext, useState } from "react";

const DataContext = createContext();

export const DataProvider = ({ children }) => {
    const [settings, setSettings] = useState({
        keyboard: { visible: true, container: true, highlightKeys: true },
        text: { container: true, fontSize: "medium", lineHeight: "normal" },
        input: { visible: false, autoFocus: true },
        theme: { mode: "light", colorScheme: "default" },
        game: { showWPM: true, showAccuracy: true, soundEffects: false },
    });

    const [score, setScore] = useState({
        wpm: 0,
        accuracy: 0,
        history: [],
    });

    const toggleSetting = (category, key) => {
        setSettings((prev) => ({
            ...prev,
            [category]: {
                ...prev[category],
                [key]: !prev[category][key],
            },
        }));
    };

    const saveScore = (newScore) => {
        setScore((prev) => ({
            ...prev,
            history: [...prev.history, newScore],
        }));
    };

    return (
        <DataContext.Provider
            value={{ settings, setSettings, toggleSetting, score, setScore, saveScore }}
        >
            {children}
        </DataContext.Provider>
    );
};

export const useData = () => useContext(DataContext);
