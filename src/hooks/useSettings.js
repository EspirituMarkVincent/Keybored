
import { useState, useEffect } from "react";

const defaultSettings = {
    keyboard: { visible: true, container: true, highlightKeys: true },
    text: { container: true, fontSize: "medium", lineHeight: "normal" },
    input: { visible: false, autoFocus: true },
    theme: { mode: "light", colorScheme: "default" },
    game: { showWPM: true, showAccuracy: true, soundEffects: false },
};

function useLocalStorage(key, initialValue) {
    const [value, setValue] = useState(() => {
        try {
            const saved = localStorage.getItem(key);
            return saved ? JSON.parse(saved) : initialValue;
        } catch {
            return initialValue;
        }
    });

    useEffect(() => {
        localStorage.setItem(key, JSON.stringify(value));
    }, [key, value]);

    return [value, setValue];
}

export default function useSettings() {
    const [settings, setSettings] = useLocalStorage("settings", defaultSettings);

    const toggleSetting = (category, key) => {
        setSettings((prev) => ({
            ...prev,
            [category]: {
                ...prev[category],
                [key]: !prev[category][key],
            },
        }));
    };

    const updateSetting = (category, key, value) => {
        setSettings((prev) => ({
            ...prev,
            [category]: {
                ...prev[category],
                [key]: value,
            },
        }));
    };

    const resetToDefaults = () => setSettings(defaultSettings);

    return { settings, setSettings, toggleSetting, updateSetting, resetToDefaults };
}
