import { createContext, useContext, useState, useEffect, useCallback } from "react";

// Create context
const SettingsContext = createContext(null);

// Default settings
const defaultSettings = {
    keyboard: {
        visible: true,
        container: true,
        highlightKeys: true,
    },
    text: {
        container: true,
        fontSize: "medium",
        lineHeight: "normal",
    },
    input: {
        visible: false,
        autoFocus: true,
    },
    theme: {
        mode: "light",
        colorScheme: "default",
    },
    game: {
        showWPM: true,
        showAccuracy: true,
        soundEffects: false,
    },
};

export function SettingsProvider({ children }) {
    const [settings, setSettings] = useState(defaultSettings);

    // Load settings from localStorage on mount
    useEffect(() => {
        try {
            const savedSettings = localStorage.getItem('typing-game-settings');
            if (savedSettings) {
                const parsedSettings = JSON.parse(savedSettings);
                // Merge with defaults to handle any missing properties
                setSettings(prev => ({
                    ...prev,
                    ...parsedSettings,
                    keyboard: { ...prev.keyboard, ...parsedSettings.keyboard },
                    text: { ...prev.text, ...parsedSettings.text },
                    input: { ...prev.input, ...parsedSettings.input },
                    theme: { ...prev.theme, ...parsedSettings.theme },
                    game: { ...prev.game, ...parsedSettings.game },
                }));
            }
        } catch (error) {
            console.error('Error loading settings from localStorage:', error);
        }
    }, []);

    // Save settings to localStorage whenever settings change
    useEffect(() => {
        try {
            localStorage.setItem('typing-game-settings', JSON.stringify(settings));
        } catch (error) {
            console.error('Error saving settings to localStorage:', error);
        }
    }, [settings]);

    // Toggle a specific setting
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

    // Reset all settings to defaults
    const resetToDefaults = useCallback(() => {
        setSettings(defaultSettings);
    }, []);

    // Apply theme to document body
    useEffect(() => {
        const body = document.body;
        
        // Remove existing theme classes
        body.classList.remove('dark-mode', 'light-mode');
        
        if (settings.theme.mode === 'dark') {
            body.classList.add('dark-mode');
        } else if (settings.theme.mode === 'light') {
            body.classList.add('light-mode');
        } else if (settings.theme.mode === 'auto') {
            // Auto mode - check system preference
            const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
            body.classList.add(prefersDark ? 'dark-mode' : 'light-mode');
        }
    }, [settings.theme.mode]);

    // Context value with all settings and helper functions
    const contextValue = {
        // Raw settings object
        settings,
        
        // Helper functions
        toggleSetting,
        updateSetting,
        resetToDefaults,
        
        // Individual settings for easy access
        // Keyboard
        keyboardVisible: settings.keyboard.visible,
        keyboardContainer: settings.keyboard.container,
        keyboardHighlight: settings.keyboard.highlightKeys,
        
        // Text
        textContainer: settings.text.container,
        textFontSize: settings.text.fontSize,
        textLineHeight: settings.text.lineHeight,
        
        // Input
        inputVisible: settings.input.visible,
        inputAutoFocus: settings.input.autoFocus,
        
        // Theme
        themeMode: settings.theme.mode,
        colorScheme: settings.theme.colorScheme,
        isDarkMode: settings.theme.mode === 'dark' || 
                   (settings.theme.mode === 'auto' && 
                    window.matchMedia('(prefers-color-scheme: dark)').matches),
        
        // Game
        showWPM: settings.game.showWPM,
        showAccuracy: settings.game.showAccuracy,
        soundEffects: settings.game.soundEffects,
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