import { useState, useEffect, StrictMode } from "react";
import { createRoot } from "react-dom/client";
import Keyboard from "./components/Keyboard";
import TextField from "./components/Text_field";
import SettingsUI from "./components/Settings";
import Scores from "./components/Scores";
import { GameProvider, useGame } from "./contexts/GameContext";
import { SettingsProvider, useSettings } from "./contexts/SettingsContext";
import AutoIcon from "./assets/icons/auto.svg?react";
import DarkIcon from "./assets/icons/dark.svg?react";
import LightIcon from "./assets/icons/light.svg?react";
import ScoreIcon from "./assets/icons/score.svg?react";
import SettingsIcon from "./assets/icons/settings.svg?react";
import KeyboardIcon from "./assets/icons/keyboard.svg?react";
import "./styles/main.css";

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

  const { settings, isDarkMode, themeMode, cycleTheme, toggleSetting } =
    useSettings();

  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isScoresOpen, setIsScoresOpen] = useState(false);

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

  return (
    <div>
      {isStarted && !isFinished && (
        <div className="fixed top-0 left-0 w-screen h-screen bg-bg-primary z-[2]" />
      )}

      <SettingsUI
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
      />

      <div className="header-container">
        <div className="header-txt">Keybored</div>
        <div className="divider"></div>

        <button
          className="theme-toggle-btn header-btn text-bg-tertiary"
          onClick={cycleTheme}
        >
          {themeMode === "auto" ? (
            <AutoIcon className="w-8 h-8" />
          ) : themeMode === "dark" ? (
            <DarkIcon className="w-8 h-8" />
          ) : (
            <LightIcon className="w-8 h-8" />
          )}
        </button>

        <button
          className="keyboard-toggle-btn header-btn text-bg-tertiary"
          onClick={() => toggleSetting("keyboard", "visible")}
        >
          <KeyboardIcon className="w-8 h-8" />
        </button>

        <button
          className={`settings-btn header-btn transition-colors ${
                    isScoresOpen ? "text-color-correct" : "text-bg-tertiary"
          }`}
          onClick={() => setIsScoresOpen((prev) => !prev)}
        >
          <ScoreIcon className="w-8 h-8" />
        </button>

        <button
          className="settings-btn header-btn text-bg-tertiary"
          onClick={() => setIsSettingsOpen((prev) => !prev)}
        >
          <SettingsIcon className="w-8 h-8" />
        </button>
      </div>

      {isScoresOpen ? (
        <Scores onClose={() => setIsScoresOpen(false)} />
      ) : (
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
              <button
                className="game-mode-btn newTextBtn"
                onClick={restartText}
              >
                New Text
              </button>
            </div>
          </div>

          <div className="relative z-3 px-[10px]">
            <TextField showTextContainer={settings.text.container} />
          </div>

          <div className="relative z-3">
            {isFinished ? (
              <Scores onClose={resetEverything} />
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
              className={`input-field ${
                settings.input.visible ? "" : "hidden"
              }`}
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
      )}
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
