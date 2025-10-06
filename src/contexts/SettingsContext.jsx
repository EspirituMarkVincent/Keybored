import { createContext, useContext, useState, useEffect, useCallback } from "react";

// Create context
const SettingsContext = createContext(null);

// Default settings
const defaultSettings = {
    UI: {
        compactMode: true,
    },
    keyboard: {
        visible: true,
        container: false,
        highlightKeys: true,
    },
    text: {
        container: false,
        fontSize: "medium",
        lineHeight: "normal",
    },
    input: {
        visible: true,
        autoFocus: true,
    },
    theme: {
        mode: "dark",
        colorScheme: "default",
    },
    game: {
        showWPM: true,
        showAccuracy: true,
        soundEffects: false,
    },
};

// localStorage helper functions
const loadFromStorage = () => {
    try {
        const stored = localStorage.getItem('local-settings');
        if (stored) {
            const parsedSettings = JSON.parse(stored);
            // Merge with defaults to ensure all properties exist
            return {
                ...defaultSettings,
                ...parsedSettings,
                UI: { ...defaultSettings.UI, ...parsedSettings.UI },
                keyboard: { ...defaultSettings.keyboard, ...parsedSettings.keyboard },
                text: { ...defaultSettings.text, ...parsedSettings.text },
                input: { ...defaultSettings.input, ...parsedSettings.input },
                theme: { ...defaultSettings.theme, ...parsedSettings.theme },
                game: { ...defaultSettings.game, ...parsedSettings.game },
            };
        }
    } catch (error) {
        console.warn('Failed to load settings from localStorage:', error);
    }
    return defaultSettings;
};

const saveToStorage = (settings) => {
    try {
        localStorage.setItem('local-settings', JSON.stringify(settings));
    } catch (error) {
        console.warn('Failed to save settings to localStorage:', error);
    }
};

export function SettingsProvider({ children }) {
    const [settings, setSettings] = useState(loadFromStorage);

    // Save settings to localStorage whenever settings change
    useEffect(() => {
        saveToStorage(settings);
    }, [settings]);

    const toggleSetting = useCallback((category, key) => {
        setSettings(prev => ({
            ...prev,
            [category]: {
                ...prev[category],
                [key]: !prev[category][key],
            },
        }));
    }, []);

    // Update a specific setting
    const updateSetting = useCallback((category, key, value) => {
        setSettings(prev => ({
            ...prev,
            [category]: {
                ...prev[category],
                [key]: value,
            },
        }));
    }, []);

    const resetToDefaults = useCallback(() => {
        setSettings(defaultSettings);
        localStorage.removeItem('typingAppSettings');
    }, []);

    // cycle theme mode using 1 button
    const cycleTheme = useCallback(() => {
        const mode = settings.theme.mode;
        if (mode === "dark") {
            updateSetting("theme", "mode", "light");
        } else if (mode === "light") {
            updateSetting("theme", "mode", "auto");
        } else {
            updateSetting("theme", "mode", "dark");
        }
    }, [settings.theme.mode, updateSetting]);

    // Apply theme to document body
    useEffect(() => {
        const body = document.body;

        body.classList.remove('dark-mode', 'light-mode');

        if (settings.theme.mode === 'dark') {
            body.classList.add('dark-mode');
        } else if (settings.theme.mode === 'light') {
            body.classList.add('light-mode');
        } else if (settings.theme.mode === 'auto') {
            // Auto mode - check system preference
            const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
            body.classList.add(prefersDark ? 'dark-mode' : 'light-mode');

            const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
            const handleChange = (e) => {
                body.classList.remove('dark-mode', 'light-mode');
                body.classList.add(e.matches ? 'dark-mode' : 'light-mode');
            };

            mediaQuery.addEventListener('change', handleChange);
            return () => mediaQuery.removeEventListener('change', handleChange);
        }
    }, [settings.theme.mode]);


    // Context value with all settings and helper functions
    const contextValue = {
        settings,
        toggleSetting,

        // Themes
        cycleTheme,
        themeMode: settings.theme.mode,
        colorScheme: settings.theme.colorScheme,
        isDarkMode: settings.theme.mode === 'dark' ||
            (settings.theme.mode === 'auto' &&
                window.matchMedia('(prefers-color-scheme: dark)').matches),
    };

    return (
        <SettingsContext.Provider value={contextValue}>
            {children}
        </SettingsContext.Provider>
    );
}

// Hook to consume the settings context
export const useSettings = () => {
    const context = useContext(SettingsContext);
    if (!context) {
        throw new Error('useSettings must be used within a SettingsProvider');
    }
    return context;
};

// Export default settings for reference
export { defaultSettings };