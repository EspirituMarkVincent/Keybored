import { useState, useEffect, StrictMode } from "react";
import { createRoot } from "react-dom/client";
import Keyboard from "./components/Keyboard";
import TextField from "./components/Text_field";
import SettingsUI from "./components/Settings";
import Scores from "./components/Scores";
import { GameProvider, useGame } from "./contexts/GameContext";
import { SettingsProvider, useSettings } from "./contexts/SettingsContext";
import "./styles/main.css";
import "./styles/Keyboard.css";
import "./styles/Settings.css";
import "./styles/Text_field.css";

function App() {
  const {
    cursorPos,
    words,
    gameModeSettings,
    setGameModeSettings,
    input,
    inputRef,
    wordIndex,
    typedHistory,
    isFinished,
    isStarted,
    timer,
    score,
    isUserTyping,
    setIsUserTyping,
    resetEverything,
    restartText,
    handleInputChange,
    handleKeyDown,
  } = useGame();

  const { settings, isDarkMode, themeMode, cycleTheme } = useSettings();

  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  useEffect(() => {
    if (isDarkMode) document.body.classList.add("dark-mode");
    else document.body.classList.remove("dark-mode");
  }, [isDarkMode]);

  // force to focus on inputfield at run
  useEffect(() => {
    const forceFocus = () => {
      if (inputRef.current) {
        inputRef.current.focus();
      }
    };
    window.addEventListener("keydown", forceFocus);
    return () => window.removeEventListener("keydown", forceFocus);
  }, []);

  useEffect(() => {
    console.log(isUserTyping);
  }, [isUserTyping]);

  return (
    <div>
      {isStarted && !isFinished && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100vw",
            height: "100vh",
            backgroundColor: "var(--bg-primary)",
            zIndex: 2,
          }}
        />
      )}

      <SettingsUI
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
      />

      <div className="header-container">
        <div className="header-txt">Keybored</div>
        <div className="divider"></div>
        <button className="theme-toggle-btn header-btn" onClick={cycleTheme}>
          {themeMode === "auto" ? "🌓" : themeMode === "dark" ? "🌒" : "☀️"}
        </button>
        <button className="keyboard-toggle-btn header-btn" onClick={() => {}}>
          ⌨️
        </button>
        <button
          className="settings-btn header-btn"
          onClick={() => setIsSettingsOpen((prev) => !prev)}
        >
          ⚙️
        </button>
      </div>

      <div className="main-container">
        <div className="menu-top">
          <div className="gameModeSelection">
            <button
              className={`game-mode-btn ${
                gameModeSettings.mode === "time" ? "active" : ""
              }`}
              onClick={() =>
                setGameModeSettings((prev) => ({ ...prev, mode: "time" }))
              }
            >
              Time
            </button>
            {gameModeSettings.mode === "time" &&
              [15, 30, 60].map((timeAmountSelected) => (
                <button
                  key={timeAmountSelected}
                  className="game-mode-btn timeBtn"
                  onClick={() =>
                    setGameModeSettings((prev) => ({
                      ...prev,
                      timeGoal: timeAmountSelected,
                    }))
                  }
                >
                  {timeAmountSelected}
                </button>
              ))}
            <button
              className={`game-mode-btn ${
                gameModeSettings.mode === "words" ? "active" : ""
              }`}
              onClick={() =>
                setGameModeSettings((prev) => ({ ...prev, mode: "words" }))
              }
            >
              Words
            </button>
            {gameModeSettings.mode === "words" &&
              [10, 20, 30].map((wordsAmountSelected) => (
                <button
                  key={wordsAmountSelected}
                  className="game-mode-btn wordsBtn"
                  onClick={() =>
                    setGameModeSettings((prev) => ({
                      ...prev,
                      wordGoal: wordsAmountSelected,
                    }))
                  }
                >
                  {wordsAmountSelected}
                </button>
              ))}
            <button className="game-mode-btn newTextBtn" onClick={restartText}>
              New Text
            </button>
          </div>
        </div>

        <div style={{ position: "relative", zIndex: 3 }}>
          <TextField showTextContainer={settings.text.container} />
        </div>

        <div style={{ position: "relative", zIndex: 3 }}>
          {isFinished ? (
            <Scores />
          ) : (
            <Keyboard
              isUserTyping={isUserTyping}
              isKeyboardActive={settings.keyboard.visible}
              showKeyboardContainer={settings.keyboard.container}
            />
          )}
        </div>

        <div className="form-group">
          <input
            className={`input-field ${settings.input.visible ? "" : "hidden"}`}
            type="text"
            value={input}
            ref={inputRef}
            onChange={handleInputChange}
            disabled={isFinished}
            onFocus={() => setIsUserTyping(true)}
            onBlur={() => setIsUserTyping(false)}
            onKeyDown={(e) => {
              if (
                [
                  "ArrowLeft",
                  "ArrowRight",
                  "ArrowUp",
                  "ArrowDown",
                  "Home",
                  "End",
                ].includes(e.key)
              ) {
                e.preventDefault();
                return;
              }
              handleKeyDown(e);
            }}
            onMouseDown={(e) => {
              if (isUserTyping) e.preventDefault();
              e.target.setSelectionRange(
                e.target.value.length,
                e.target.value.length
              );
            }}
            onSelect={(e) => {
              e.target.setSelectionRange(
                e.target.value.length,
                e.target.value.length
              );
            }}
          />
          <div className="stat-box wpm">{score.standardWPM} WPM</div>
          <div className="stat-box time">
            {gameModeSettings.mode === "time"
              ? `${timer}s`
              : `${wordIndex}/${gameModeSettings.wordGoal}`}
          </div>
          <div className="stat-box reset-button" onClick={resetEverything}>
            Reset
          </div>
        </div>
      </div>
    </div>
  );
}

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <SettingsProvider>
      <GameProvider>
        <App />
      </GameProvider>
    </SettingsProvider>
  </StrictMode>
);
