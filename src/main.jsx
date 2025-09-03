import { useState, useRef, useEffect } from "react";
import { createRoot } from "react-dom/client";
import Keyboard from "./Keyboard";
import TextField from "./Text_field";

function App() {
    // Refs for input field focus
    const inputRef = useRef(null);

    // State for text and game settings
    const [cursorPos, setCursorPos] = useState(0);
    const [words, setWords] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isUserTyping, setIsUserTyping] = useState(false);
    const [gameModeSettings, setGameModeSettings] = useState({
        mode: "time",
        timeGoal: 15,
        wordGoal: 10,
    });

    // Game logic state
    const [input, setInput] = useState("");
    const [wordIndex, setWordIndex] = useState(0);
    const [typedHistory, setTypedHistory] = useState({});
    const [isStarted, setIsStarted] = useState(false);
    const [isFinished, setIsFinished] = useState(false);
    const [timer, setTimer] = useState(gameModeSettings.timeGoal);
    const timerRef = useRef(null);

    // Score state
    const [score, setScore] = useState({
        letterScore: 0, // Correct letters
        totalLetters: 0, // Total letters in typed words
        standardWPM: 0,
        accuracy: 0,
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
                    return prev - 1; // Decrement for time mode
                }
                return prev + 1; // Increment for word mode
            });
        }, 1000);
    };

    const handleInputChange = (e) => {
        if (isFinished) return;
        if (!isStarted) startTimer();
        setInput(e.target.value);
    };

    const handleKeyDown = (e) => {
        if (e.key === " " && input.trim() !== "") {
            e.preventDefault();
            const trimmedInput = input.trim();

            const wordToScore = words[wordIndex];
            let correctLettersInWord = 0;
            for (let i = 0; i < wordToScore.length; i++) {
                if (trimmedInput[i] === wordToScore[i]) {
                    correctLettersInWord++;
                }
            }

            setScore((prev) => ({
                ...prev,
                totalLetters: prev.totalLetters + wordToScore.length,
                letterScore: prev.letterScore + correctLettersInWord,
            }));
            setTypedHistory((prev) => ({ ...prev, [wordIndex]: trimmedInput }));
            setWordIndex((prev) => prev + 1);
            setInput("");
            setCursorPos(0);
        }
    };

    // get text at first run
    useEffect(() => {
        getText();
    }, []);

    // cursor tracking
    useEffect(() => {
        const handleSelectionChange = () => {
            if (document.activeElement === inputRef.current) {
                setCursorPos(inputRef.current.selectionStart);
            }
        };
        document.addEventListener("selectionchange", handleSelectionChange);
        return () => document.removeEventListener("selectionchange", handleSelectionChange);
    }, []);

    // Auto foucs on input on keypress
    useEffect(() => {
        const handleGlobalKeyDown = () => {
            inputRef.current?.focus();
        };
        window.addEventListener("keydown", handleGlobalKeyDown);
        return () => {
            window.removeEventListener("keydown", handleGlobalKeyDown);
        };
    }, []);

    // debuggin only
    useEffect(() => {
        console.log(score);
    }, [score]);

    // Reset when game mode changes
    useEffect(() => {
        resetEverything();
    }, [gameModeSettings]);

    useEffect(() => () => clearInterval(timerRef.current), []);

    // Scoring
    useEffect(() => {
        const elapsed =
            gameModeSettings.mode === "time" ? gameModeSettings.timeGoal - timer : timer;

        if (elapsed > 0 && score.totalLetters > 0) {
            const wpm = Math.round(score.letterScore / 5 / (elapsed / 60));
            const acc = Math.round((score.letterScore / score.totalLetters) * 100);
            setScore((prev) => ({ ...prev, standardWPM: wpm, accuracy: acc }));
        } else {
            setScore((prev) => ({ ...prev, standardWPM: 0, accuracy: 0 }));
        }
    }, [timer, score.letterScore, score.totalLetters, gameModeSettings]);

    useEffect(() => {
        if (gameModeSettings.mode === "words" && wordIndex >= gameModeSettings.wordGoal) {
            setIsFinished(true);
            clearInterval(timerRef.current);
        }
    }, [wordIndex, gameModeSettings]);

    return (
        <div className="main-container">
            <div className="gameModeSelection">
                <div className="gameModeSelection">
                    <button
                        className={`gameMode ${gameModeSettings.mode === "time" ? "active" : ""}`}
                        onClick={() => setGameModeSettings((prev) => ({ ...prev, mode: "time" }))}
                    >
                        Time
                    </button>
                    {gameModeSettings.mode === "time" && (
                        <>
                            <button
                                className="gameMode timeBtn"
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
                                className="gameMode timeBtn"
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
                                className="gameMode timeBtn"
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
                        className={`gameMode ${gameModeSettings.mode === "words" ? "active" : ""}`}
                        onClick={() => setGameModeSettings((prev) => ({ ...prev, mode: "words" }))}
                    >
                        Words
                    </button>
                    {gameModeSettings.mode === "words" && (
                        <>
                            <button
                                className="gameMode wordsBtn"
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
                                className="gameMode wordsBtn"
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
                                className="gameMode wordsBtn"
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
                    <button className="gameMode newTextBtn" onClick={restartText}>
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
                        // block arrow keys, home/end
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
                        // for space
                        handleKeyDown(e);
                    }}
                    onMouseDown={(e) => {
                        // prevent mouse from moving caret
                        e.preventDefault();
                        e.target.setSelectionRange(e.target.value.length, e.target.value.length);
                    }}
                    onSelect={(e) => {
                        // always force caret to end
                        e.target.setSelectionRange(e.target.value.length, e.target.value.length);
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
                <>
                    <div className="gameResult">Game Result</div>
                    <div className="gameResult">WPM: {score.standardWPM}</div>
                    <div className="gameResult">Accuracy: {score.accuracy}%</div>
                </>
            ) : (
                <Keyboard isUserTyping={isUserTyping} />
            )}
        </div>
    );
}

export const localText = [
    "apple",
    "ape",
    "axiom",
    "amber",
    "aroma",
    "braid",
    "baker",
    "banks",
    "barge",
    "bases",
    "cable",
    "cache",
    "cakes",
    "calls",
    "camps",
    "dance",
    "darts",
    "dates",
    "dawns",
    "deals",
    "eagle",
    "eases",
    "eaten",
    "edges",
    "eject",
    "flute",
    "fable",
    "fancy",
    "fence",
    "finds",
    "glide",
    "gnome",
    "graft",
    "grain",
    "grape",
    "honey",
    "hound",
    "house",
    "haste",
    "haven",
    "igloo",
    "icy",
    "image",
    "inch",
    "index",
    "jelly",
    "jade",
    "jaguar",
    "jawed",
    "jests",
    "kite",
    "knot",
    "knead",
    "knell",
    "knock",
    "lance",
    "lark",
    "laser",
    "latch",
    "lauds",
    "mango",
    "mere",
    "mesh",
    "mice",
    "might",
    "nerve",
    "nest",
    "night",
    "nile",
    "ninth",
    "ocean",
    "oath",
    "olive",
    "omen",
    "onion",
    "pulse",
    "pain",
    "paint",
    "pales",
    "pants",
    "queen",
    "quake",
    "quark",
    "quay",
    "quest",
    "ranch",
    "rave",
    "raven",
    "rays",
    "reach",
    "sage",
    "sail",
    "sake",
    "sale",
    "says",
    "tiger",
    "tale",
    "tame",
    "tape",
    "task",
    "umpire",
    "used",
    "user",
    "utah",
    "utopia",
    "vase",
    "vast",
    "vial",
    "vice",
    "view",
    "wagon",
    "wail",
    "wane",
    "warp",
    "wash",
    "xray",
    "xylem",
    "xylo",
    "xyris",
    "xyst",
    "yacht",
    "yale",
    "yard",
    "yarn",
    "yeast",
    "zest",
    "zing",
    "zion",
    "zips",
    "zones",
];

localText.sort(() => Math.random() - 0.5);

createRoot(document.getElementById("root")).render(<App />);
