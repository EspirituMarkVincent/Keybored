import React, { useState } from "react";

const SettingsUI = ({ isOpen, onClose }) => {
    const [settings, setSettings] = useState({
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

    const updateSetting = (category, key, value) => {
        setSettings((prev) => ({
            ...prev,
            [category]: {
                ...prev[category],
                [key]: value,
            },
        }));
    };

    const resetToDefaults = () => {
        setSettings({
            keyboard: { visible: true, container: true, highlightKeys: true },
            text: { container: true, fontSize: "medium", lineHeight: "normal" },
            input: { visible: false, autoFocus: true },
            theme: { mode: "light", colorScheme: "default" },
            game: { showWPM: true, showAccuracy: true, soundEffects: false },
        });
    };

    const ToggleSwitch = ({ isOn, onToggle, disabled = false }) => (
        <button
            onClick={onToggle}
            disabled={disabled}
            className={`toggle-switch ${isOn ? "on" : "off"} ${disabled ? "disabled" : ""}`}
            aria-pressed={isOn}
        >
            <div className="toggle-slider">
                <div className="toggle-handle"></div>
            </div>
        </button>
    );

    const SelectDropdown = ({ value, options, onChange, label }) => (
        <div className="select-wrapper">
            <select
                value={value}
                onChange={(e) => onChange(e.target.value)}
                className="custom-select"
                aria-label={label}
            >
                {options.map((option) => (
                    <option key={option.value} value={option.value}>
                        {option.label}
                    </option>
                ))}
            </select>
        </div>
    );

    const SettingRow = ({ label, children, description }) => (
        <div className="setting-row">
            <div className="setting-info">
                <div className="setting-label">{label}</div>
                {description && <div className="setting-description">{description}</div>}
            </div>
            <div className="setting-control">{children}</div>
        </div>
    );

    const SettingSection = ({ title, icon, children }) => (
        <div className="setting-section">
            <div className="section-header">
                <span className="section-icon">{icon}</span>
                <h3 className="section-title">{title}</h3>
            </div>
            <div className="section-content">{children}</div>
        </div>
    );

    if (!isOpen) return null;

    return (
        <>
            <div className="settings-overlay" onClick={onClose} />

            <div className="settings-panel">
                <div className="settings-header">
                    <h2 className="settings-title">Settings</h2>
                    <button
                        className="settings-close"
                        onClick={onClose}
                        aria-label="Close settings"
                    >
                        ✕
                    </button>
                </div>

                <div className="settings-content">
                    <SettingSection title="Keyboard" icon="⌨️">
                        <SettingRow
                            label="Show Keyboard"
                            description="Display the visual keyboard below the text"
                        >
                            <ToggleSwitch
                                isOn={settings.keyboard.visible}
                                onToggle={() => toggleSetting("keyboard", "visible")}
                            />
                        </SettingRow>

                        <SettingRow
                            label="Keyboard Container"
                            description="Show background and border around keyboard"
                        >
                            <ToggleSwitch
                                isOn={settings.keyboard.container}
                                onToggle={() => toggleSetting("keyboard", "container")}
                                disabled={!settings.keyboard.visible}
                            />
                        </SettingRow>

                        <SettingRow
                            label="Highlight Keys"
                            description="Highlight keys as you type them"
                        >
                            <ToggleSwitch
                                isOn={settings.keyboard.highlightKeys}
                                onToggle={() => toggleSetting("keyboard", "highlightKeys")}
                                disabled={!settings.keyboard.visible}
                            />
                        </SettingRow>
                    </SettingSection>

                    <SettingSection title="Text Display" icon="📝">
                        <SettingRow
                            label="Text Container"
                            description="Show background container around text"
                        >
                            <ToggleSwitch
                                isOn={settings.text.container}
                                onToggle={() => toggleSetting("text", "container")}
                            />
                        </SettingRow>

                        <SettingRow
                            label="Font Size"
                            description="Adjust the size of the typing text"
                        >
                            <SelectDropdown
                                value={settings.text.fontSize}
                                options={[
                                    { value: "small", label: "Small" },
                                    { value: "medium", label: "Medium" },
                                    { value: "large", label: "Large" },
                                ]}
                                onChange={(value) => updateSetting("text", "fontSize", value)}
                                label="Font Size"
                            />
                        </SettingRow>

                        <SettingRow label="Line Height" description="Spacing between lines of text">
                            <SelectDropdown
                                value={settings.text.lineHeight}
                                options={[
                                    { value: "compact", label: "Compact" },
                                    { value: "normal", label: "Normal" },
                                    { value: "relaxed", label: "Relaxed" },
                                ]}
                                onChange={(value) => updateSetting("text", "lineHeight", value)}
                                label="Line Height"
                            />
                        </SettingRow>
                    </SettingSection>

                    <SettingSection title="Input Field" icon="'📥'">
                        <SettingRow
                            label="Show Input Field"
                            description="Display the input field below text"
                        >
                            <ToggleSwitch
                                isOn={settings.input.visible}
                                onToggle={() => toggleSetting("input", "visible")}
                            />
                        </SettingRow>

                        <SettingRow
                            label="Auto Focus"
                            description="Automatically focus input when page loads"
                        >
                            <ToggleSwitch
                                isOn={settings.input.autoFocus}
                                onToggle={() => toggleSetting("input", "autoFocus")}
                            />
                        </SettingRow>
                    </SettingSection>

                    <SettingSection title="Theme" icon="🎨">
                        <SettingRow
                            label="Color Theme"
                            description="Choose your preferred color scheme"
                        >
                            <div className="preset-buttons">
                                <button
                                    className={`preset-btn ${
                                        settings.theme.mode === "light" ? "active" : ""
                                    }`}
                                    onClick={() => updateSetting("theme", "mode", "light")}
                                >
                                    Light
                                </button>
                                <button
                                    className={`preset-btn ${
                                        settings.theme.mode === "dark" ? "active" : ""
                                    }`}
                                    onClick={() => updateSetting("theme", "mode", "dark")}
                                >
                                    Dark
                                </button>
                                <button
                                    className={`preset-btn ${
                                        settings.theme.mode === "auto" ? "active" : ""
                                    }`}
                                    onClick={() => updateSetting("theme", "mode", "auto")}
                                >
                                    Auto
                                </button>
                            </div>
                        </SettingRow>
                    </SettingSection>

                    <SettingSection title="Game Features" icon="🎮">
                        <SettingRow label="Show WPM" description="Display words per minute counter">
                            <ToggleSwitch
                                isOn={settings.game.showWPM}
                                onToggle={() => toggleSetting("game", "showWPM")}
                            />
                        </SettingRow>

                        <SettingRow
                            label="Show Accuracy"
                            description="Display typing accuracy percentage"
                        >
                            <ToggleSwitch
                                isOn={settings.game.showAccuracy}
                                onToggle={() => toggleSetting("game", "showAccuracy")}
                            />
                        </SettingRow>

                        <SettingRow
                            label="Sound Effects"
                            description="Play sounds for typing feedback"
                        >
                            <ToggleSwitch
                                isOn={settings.game.soundEffects}
                                onToggle={() => toggleSetting("game", "soundEffects")}
                            />
                        </SettingRow>
                    </SettingSection>
                </div>

                <div className="settings-footer">
                    <button className="btn btn-secondary" onClick={resetToDefaults}>
                        Reset to Defaults
                    </button>
                    <button className="btn btn-primary" onClick={onClose}>
                        Save Settings
                    </button>
                </div>
            </div>
        </>
    );
};

export default SettingsUI;
