import { useState, useRef, useEffect, StrictMode } from "react";
import { createRoot } from "react-dom/client";
import Keyboard from "./Keyboard";
import TextField from "./Text_field";
import "./style.css";

function App() {
    const [darkMode, setDarkMode] = useState(false);
    useEffect(() => {
        if (darkMode) {
            document.body.classList.add("dark-mode");
        } else {
            document.body.classList.remove("dark-mode");
        }
    }, [darkMode]);

    // for Keyboard
    const [isUserTyping, setIsUserTyping] = useState(false);
    const [isKeyboardActive, setIsKeyboardActive] = useState(true);

    const [cursorPos, setCursorPos] = useState(0);
    const [words, setWords] = useState([]);
    const [loading, setLoading] = useState(true);
    const [gameModeSettings, setGameModeSettings] = useState({
        mode: "time",
        timeGoal: 15,
        wordGoal: 10,
    });

    const [input, setInput] = useState("");
    const inputRef = useRef(null);
    const [wordIndex, setWordIndex] = useState(0);
    const [typedHistory, setTypedHistory] = useState({});
    const [isStarted, setIsStarted] = useState(false);
    const [isFinished, setIsFinished] = useState(false);
    const [timer, setTimer] = useState(gameModeSettings.timeGoal);
    const timerRef = useRef(null);

    const [score, setScore] = useState({
        letterScore: 0,
        totalLetters: 0,
        standardWPM: 0,
        accuracy: 0,
    });

    const [result, setResult] = useState({
        accuracy: 0,
        wpm: 0,
        typedHistory: {},
    });

    const getText = () => {
        setLoading(true);
        fetch("https://random-word-api.vercel.app/api?words=500")
            .then((r) => r.json())
            .then((data) => {
                setWords(data);
            })
            .catch(() => {
                setWords(localText);
            })
            .finally(() => setLoading(false));
    };

    const resetEverything = () => {
        clearInterval(timerRef.current);
        setInput("");
        setCursorPos(0);
        setWordIndex(0);
        setTypedHistory({});
        setIsStarted(false);
        setIsFinished(false);
        setTimer(gameModeSettings.mode === "time" ? gameModeSettings.timeGoal : 0);
        setScore({
            letterScore: 0,
            totalLetters: 0,
            standardWPM: 0,
            accuracy: 0,
        });
        inputRef.current?.focus();
    };

    const restartText = () => {
        getText();
        resetEverything();
    };

    const calculateScore = () => {
        let totalCorrect = 0;
        let totalTyped = 0;

        // Score completed words
        Object.entries(typedHistory).forEach(([index, typedWord]) => {
            const correctWord = words[parseInt(index)];
            if (!correctWord) return;
            // Count correct letters
            for (let i = 0; i < Math.min(typedWord.length, correctWord.length); i++) {
                if (typedWord[i] === correctWord[i]) {
                    totalCorrect++;
                }
            }
            // Count what was actually typed
            totalTyped += typedWord.length;
            // Penalize skipped letters only after word is finished
            if (typedWord.length < correctWord.length) {
                totalTyped += correctWord.length - typedWord.length;
            }
        });

        // Score current word (do not penalize skipped letters yet)
        if (words[wordIndex]) {
            const currentWord = words[wordIndex];

            for (let i = 0; i < Math.min(input.length, currentWord.length); i++) {
                if (input[i] === currentWord[i]) {
                    totalCorrect++;
                }
            }

            // Only count what was actually typed
            totalTyped += input.length;
        }

        return { totalCorrect, totalTyped };
    };

    const startTimer = () => {
        setIsStarted(true);
        timerRef.current = setInterval(() => {
            setTimer((prev) => {
                if (gameModeSettings.mode === "time") {
                    if (prev <= 1) {
                        clearInterval(timerRef.current);
                        setIsFinished(true);
                        return 0;
                    }
                    return prev - 1;
                }
                return prev + 1;
            });
        }, 1000);
    };

    const handleInputChange = (e) => {
        if (isFinished) return;
        if (!isStarted) startTimer();
        setInput(e.target.value);
    };

    const handleKeyDown = (e) => {
        if (e.key === "Enter") {
            resetEverything();
        } else if (e.key === "Tab") {
            restartText();
        }

        if (e.key === " ") {
            e.preventDefault();
            const trimmedInput = input.trim();
            const currentWord = words[wordIndex] || "";

            // If skipped/empty, fill typed History with wrong chars.
            const skippedWord =
                trimmedInput === ""
                    ? "_".repeat(currentWord.length) // force incorrect comparison.
                    : trimmedInput;

            setTypedHistory((prev) => ({
                ...prev,
                [wordIndex]: skippedWord,
            }));

            setWordIndex((prev) => prev + 1);
            setInput("");
            setCursorPos(0);
        }
    };

    // Initial run.
    useEffect(() => {
        getText();

        const handleKeyDown = (e) => {
            if (e.key === "Tab") {
                e.preventDefault(); // stops focus from jumping.
                console.log("Global Tab detected!");
                resetEverything();
            }
        };

        window.addEventListener("keydown", handleKeyDown);
        return () => {
            window.removeEventListener("keydown", handleKeyDown);
        };
    }, []);

    useEffect(() => {
        const handleSelectionChange = () => {
            if (document.activeElement === inputRef.current) {
                setCursorPos(inputRef.current.selectionStart);
            }
        };
        document.addEventListener("selectionchange", handleSelectionChange);
        return () => document.removeEventListener("selectionchange", handleSelectionChange);
    }, []);

    useEffect(() => {
        const handleGlobalKeyDown = () => {
            inputRef.current?.focus();
        };
        window.addEventListener("keydown", handleGlobalKeyDown);
        return () => {
            window.removeEventListener("keydown", handleGlobalKeyDown);
        };
    }, []);

    // Reset on game mode change.
    useEffect(() => {
        resetEverything();
    }, [gameModeSettings]);

    useEffect(() => () => clearInterval(timerRef.current), []);

    // Calculate score.
    useEffect(() => {
        if (!isStarted) return;

        const { totalCorrect, totalTyped } = calculateScore();

        const elapsed =
            gameModeSettings.mode === "time" ? gameModeSettings.timeGoal - timer : timer;

        if (elapsed > 0 && totalTyped > 0) {
            const wpm = Math.round(totalCorrect / 5 / (elapsed / 60));
            const acc = Math.round((totalCorrect / totalTyped) * 100);
            setScore({
                letterScore: totalCorrect,
                totalLetters: totalTyped,
                standardWPM: wpm,
                accuracy: acc,
            });
        } else {
            setScore((prev) => ({
                ...prev,
                letterScore: totalCorrect,
                totalLetters: totalTyped,
                standardWPM: 0,
                accuracy: totalTyped > 0 ? Math.round((totalCorrect / totalTyped) * 100) : 0,
            }));
        }
    }, [timer, typedHistory, wordIndex, isStarted, gameModeSettings, words]);

    useEffect(() => {
        if (isFinished && score.standardWPM > 0) {
            setResult((prev) => ({
                ...prev,
                wpm: score.standardWPM,
                accuracy: score.accuracy,
                typedHistory: typedHistory,
            }));
        }
    }, [isFinished]);

    useEffect(() => {
        if (gameModeSettings.mode === "words" && wordIndex >= gameModeSettings.wordGoal) {
            setIsFinished(true);
            a;
            clearInterval(timerRef.current);
        }
    }, [wordIndex, gameModeSettings]);

    // Just for debugging.
    useEffect(() => {
        console.log(score);
    }, [score]);

    // For settings window
    const [isSettingsOpen, setIsSettingsOpen] = useState(false);
    const [showKeyboardContainer, setShowKeyboardContainer] = useState(true);
    const [showTextContainer, setShowTextContainer] = useState(true);

    const settingsWindow = (
        <div className={`settings-window ${isSettingsOpen ? "open" : ""}`}>
            <div className="settings-h1">
                UI Settings
                <div className="settings-h2">
                    Keyboard
                    <div className="settings-h3">
                        Hide Keyboard
                        <button
                            className="settings-toggle"
                            onClick={() => setIsKeyboardActive(false)}
                        >
                            off
                        </button>
                        <button
                            className="settings-toggle"
                            onClick={() => setIsKeyboardActive(true)}
                        >
                            on
                        </button>
                    </div>
                    <div className="settings-h3">
                        Container
                        <button
                            className="settings-toggle"
                            onClick={() => setShowKeyboardContainer(false)}
                        >
                            off
                        </button>
                        <button
                            className="settings-toggle"
                            onClick={() => setShowKeyboardContainer(true)}
                        >
                            on
                        </button>
                    </div>
                </div>
                <div className="settings-h2">
                    Text
                    <div className="settings-h3 ">
                        Hide Text Container
                        <button
                            className="settings-toggle"
                            onClick={() => setShowTextContainer(false)}
                        >
                            off
                        </button>
                        <button
                            className="settings-toggle"
                            onClick={() => setShowTextContainer(true)}
                        >
                            on
                        </button>
                    </div>
                </div>
            </div>
            <div className="settings-exit-container">
                <div
                    className="settings-close-btn settings-btn stat-box"
                    onClick={() => setIsSettingsOpen(false)}
                >
                    Save
                </div>
                <div
                    className="settings-close-btn settings-btn stat-box"
                    onClick={() => setIsSettingsOpen(false)}
                >
                    Close
                </div>
            </div>
        </div>
    );

    return (
        <>
            <div
                className={`settings-overlay ${isSettingsOpen ? "open" : ""}`}
                onClick={() => setIsSettingsOpen(false)}
            ></div>
            {settingsWindow}
            <div className="header-container">
                <div className="header-txt"> Keybored</div>
                <div className="header-divider"> </div>
                <button
                    className="theme-toggle-btn header-btn"
                    onClick={() => setDarkMode((prev) => !prev)}
                >
                    {darkMode ? "☀️" : "🌖"}
                </button>
                <button
                    className="keyboard-toggle-btn header-btn"
                    onClick={() => setIsKeyboardActive((prev) => !prev)}
                >
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
                        {gameModeSettings.mode === "time" && (
                            <>
                                <button
                                    className="game-mode-btn timeBtn"
                                    onClick={() =>
                                        setGameModeSettings((prev) => ({
                                            ...prev,
                                            timeGoal: 15,
                                        }))
                                    }
                                >
                                    15
                                </button>
                                <button
                                    className="game-mode-btn timeBtn"
                                    onClick={() =>
                                        setGameModeSettings((prev) => ({
                                            ...prev,
                                            timeGoal: 30,
                                        }))
                                    }
                                >
                                    30
                                </button>
                                <button
                                    className="game-mode-btn timeBtn"
                                    onClick={() =>
                                        setGameModeSettings((prev) => ({
                                            ...prev,
                                            timeGoal: 60,
                                        }))
                                    }
                                >
                                    60
                                </button>
                            </>
                        )}
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
                        {gameModeSettings.mode === "words" && (
                            <>
                                <button
                                    className="game-mode-btn wordsBtn"
                                    onClick={() =>
                                        setGameModeSettings((prev) => ({
                                            ...prev,
                                            wordGoal: 10,
                                        }))
                                    }
                                >
                                    10
                                </button>
                                <button
                                    className="game-mode-btn wordsBtn"
                                    onClick={() =>
                                        setGameModeSettings((prev) => ({
                                            ...prev,
                                            wordGoal: 20,
                                        }))
                                    }
                                >
                                    20
                                </button>
                                <button
                                    className="game-mode-btn wordsBtn"
                                    onClick={() =>
                                        setGameModeSettings((prev) => ({
                                            ...prev,
                                            wordGoal: 30,
                                        }))
                                    }
                                >
                                    30
                                </button>
                            </>
                        )}
                        <button className="game-mode-btn newTextBtn" onClick={restartText}>
                            New Text
                        </button>
                    </div>
                </div>

                <TextField
                    words={words}
                    currentWordIndex={wordIndex}
                    userInput={input}
                    typedHistory={typedHistory}
                    cursorPos={cursorPos}
                    showTextContainer={showTextContainer}
                />

                <div className="form-group">
                    <input
                        className="input-field"
                        type="text"
                        value={input}
                        ref={inputRef}
                        onChange={handleInputChange}
                        disabled={isFinished}
                        onFocus={() => setIsUserTyping(true)}
                        onBlur={() => setIsUserTyping(false)}
                        autoFocus
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

                {isFinished ? (
                    <div className="game-result-container">
                        <div className="result">Game Result</div>
                        <div className="result">WPM: {score.standardWPM}</div>
                        <div className="result">Accuracy: {score.accuracy}%</div>
                    </div>
                ) : (
                    <Keyboard
                        isUserTyping={isUserTyping}
                        isKeyboardActive={isKeyboardActive}
                        showKeyboardContainer={showKeyboardContainer}
                        showTextContainer={showTextContainer}
                    />
                )}
            </div>
        </>
    );
}

// prettier-ignore
export const localText = [
  "apple", "ape", "axiom", "amber", "aroma",
  "braid", "baker", "banks", "barge", "bases",
  "cable", "cache", "cakes", "calls", "camps",
  "dance", "darts", "dates", "dawns", "deals",
  "eagle", "eases", "eaten", "edges", "eject",
  "flute", "fable", "fancy", "fence", "finds",
  "glide", "gnome", "graft", "grain", "grape",
  "honey", "hound", "house", "haste", "haven",
  "igloo", "icy", "image", "inch", "index",
  "jelly", "jade", "jaguar", "jawed", "jests",
  "kite", "knot", "knead", "knell", "knock",
  "lance", "lark", "laser", "latch", "lauds",
  "mango", "mere", "mesh", "mice", "might",
  "nerve", "nest", "night", "nile", "ninth",
  "ocean", "oath", "olive", "omen", "onion",
  "pulse", "pain", "paint", "pales", "pants",
  "queen", "quake", "quark", "quay", "quest",
  "ranch", "rave", "raven", "rays", "reach",
  "sage", "sail", "sake", "sale", "says",
  "tiger", "tale", "tame", "tape", "task",
  "umpire", "used", "user", "utah", "utopia",
  "vase", "vast", "vial", "vice", "view",
  "wagon", "wail", "wane", "warp", "wash",
  "xray", "xylem", "xylo", "xyris", "xyst",
  "yacht", "yale", "yard", "yarn", "yeast",
  "zest", "zing", "zion", "zips", "zones",
];
localText.sort(() => Math.random() - 0.5);

createRoot(document.getElementById("root")).render(
    <StrictMode>
        <App />
    </StrictMode>
);
