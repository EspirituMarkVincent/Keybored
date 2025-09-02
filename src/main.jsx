import { useState, useRef, useEffect } from "react";
import { createRoot } from "react-dom/client";
import Keyboard from "./Keyboard";
import TextField, { hidePrevLine } from "./Text_field";

function App() {
    const letterRefs = useRef({});
    const wordRefs = useRef({});
    const wpmRefs = useRef(null);
    const timeRefs = useRef(null);

    const [text, setText] = useState("");
    const [words, setWords] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isUserTyping, setIsUserTyping] = useState(false);

    const [gameModeSettings, setGameModeSettings] = useState({
        mode: "time",
        timeGoal: 15,
        wordGoal: 10,
    });

    const [isFinished, setIsFinished] = useState(false);
    const [score, setScore] = useState({
        wordScore: 0,
        totalWords: 0,
        letterScore: 0,
        totalLetters: 0,
        wordWPM: 0,
        standardWPM: 0,
        accuracy: 0,
    });

    // game logic
    const { mode, timeGoal, wordGoal } = gameModeSettings;
    const [input, setInput] = useState("");
    const [wordIndex, setWordIndex] = useState(0);
    const [cursorPos, setCursorPos] = useState(0);
    const inputRef = useRef(null);
    const [isStarted, setIsStarted] = useState(false);
    const [timer, setTimer] = useState(timeGoal);
    const timerRef = useRef(null);
    const prevCursor = useRef(null);

    // fetch text
    function getText() {
        setLoading(true);
        fetch("https://random-word-api.vercel.app/api?words=500")
            .then((r) => r.json())
            .then((data) => {
                setText(data.join(" "));
                setWords(data); // <- keep the array version too
            })
            .catch(() => {
                setText(localText.join(" "));
                setWords(localText);
            })
            .finally(() => setLoading(false));
    }

    function restartText() {
        getText();
        setIsFinished(false);
        setIsUserTyping(false);
        setScore({
            wordScore: 0,
            totalWords: 0,
            letterScore: 0,
            totalLetters: 0,
            wordWPM: 0,
            standardWPM: 0,
            accuracy: 0,
        });
        resetEverything();
    }

    // fetch text at start
    useEffect(() => {
        getText();
    }, []);

    // restart text when game mode settings change
    const firstRun = useRef(true);
    useEffect(() => {
        if (firstRun.current) {
            firstRun.current = false;
            return;
        }
        restartText();
    }, [gameModeSettings]);

    const handleKeyDown = (e) => {
        if (e.key === " " && input !== "") {
            e.preventDefault();
            setWordIndex((prev) => prev + 1);
            setCursorPos(0);
            setInput("");
        }
    };

    const handleInputChange = (e) => {
        if (!isStarted) startTimer();
        setInput(e.target.value);
    };

    const startTimer = () => {
        setIsStarted(true);
        timerRef.current = setInterval(() => {
            setTimer((prev) => {
                if (mode === "time") {
                    if (prev <= 1) {
                        clearInterval(timerRef.current);
                        return 0;
                    }
                    return prev - 1;
                }
                return prev + 1;
            });
        }, 1000);
    };

    const resetEverything = () => {
        clearInterval(timerRef.current);
        setInput("");
        setWordIndex(0);
        setCursorPos(0);
        setIsStarted(false);
        setIsFinished(false);

        if (mode === "time") {
            setTimer(timeGoal);
            if (timeRefs?.current) timeRefs.current.textContent = `${timeGoal}s`;
        } else {
            setTimer(0);
            if (timeRefs?.current) timeRefs.current.textContent = `0/${wordGoal}`;
        }

        setScore({
            wordScore: 0,
            totalWords: 0,
            letterScore: 0,
            totalLetters: 0,
            wordWPM: 0,
            standardWPM: 0,
            accuracy: 0,
        });

        if (wpmRefs?.current) wpmRefs.current.textContent = `0 WPM`;
        if (prevCursor.current?.classList) prevCursor.current.classList.remove("highlight");
        prevCursor.current = null;

        if (letterRefs.current) {
            Object.values(letterRefs.current).forEach((word) => {
                if (word) {
                    Object.values(word).forEach((letter) => {
                        letter?.classList.remove("correct", "incorrect", "highlight");
                    });
                }
            });
        }
    };

    const checkLetterCorrectness = () => {
        const currentWord = letterRefs.current?.[wordIndex];
        if (!currentWord) return;
        Object.keys(currentWord).forEach((i) => {
            const elem = currentWord[i];
            if (!elem?.classList) return;
            const typed = input[i];
            elem.classList.toggle("correct", typed === elem.textContent);
            elem.classList.toggle("incorrect", typed != null && typed !== elem.textContent);
        });
    };

    const updateCursorHighlight = () => {
        if (!text || !letterRefs.current?.[wordIndex]) return;
        const letters = letterRefs.current[wordIndex];
        const keys = Object.keys(letters);
        if (keys.length === 0) return;

        const safeIndex = Math.min(cursorPos, keys.length - 1);
        if (prevCursor.current?.classList) prevCursor.current.classList.remove("highlight");

        const targetLetter = letters[safeIndex];
        if (targetLetter?.classList) {
            targetLetter.classList.add("highlight");
            prevCursor.current = targetLetter;
        }
    };

    const scoreWord = (index) => {
        const word = words[index];
        if (!word) return;

        const letters = letterRefs.current[index] || {};
        let lettersScored = 0;
        let correctLetters = 0;
        let correctWord = true;

        for (let i = 0; i < word.length; i++) {
            const letter = letters[i];
            if (!letter) continue;
            lettersScored++;
            if (letter.classList.contains("correct")) correctLetters++;
            else {
                letter.classList.add("incorrect");
                correctWord = false;
            }
        }

        setScore((prev) => ({
            ...prev,
            totalLetters: prev.totalLetters + lettersScored,
            letterScore: prev.letterScore + correctLetters,
            totalWords: prev.totalWords + 1,
            wordScore: correctWord ? prev.wordScore + 1 : prev.wordScore,
        }));
    };

    useEffect(() => () => clearInterval(timerRef.current), []);

    useEffect(() => {
        resetEverything();
    }, [text, gameModeSettings]);

    useEffect(() => {
        const handleSelectionChange = () => {
            if (document.activeElement === inputRef.current) {
                setCursorPos(inputRef.current.selectionStart || 0);
            }
        };
        document.addEventListener("selectionchange", handleSelectionChange);
        return () => document.removeEventListener("selectionchange", handleSelectionChange);
    }, []);

    useEffect(() => {
        updateCursorHighlight();
        checkLetterCorrectness();
        if (wordRefs.current) hidePrevLine(wordRefs);
    }, [input, cursorPos, wordIndex, text]);

    // set word score
    useEffect(() => {
        if (wordIndex > 0) scoreWord(wordIndex - 1);
    }, [wordIndex]);

    useEffect(() => {
        if (!timeRefs?.current) return;
        const elapsed = mode === "time" ? timeGoal - timer : timer;
        if (isFinished) {
            clearInterval(timerRef.current);
            return;
        }
        if (mode === "time") {
            timeRefs.current.textContent = `${timer}s`;
            if (timer === 0) setIsFinished(true);
        } else {
            timeRefs.current.textContent = `${wordIndex}/${wordGoal}`;
            if (wordIndex >= wordGoal) setIsFinished(true);
        }
        if (elapsed > 0) {
            const wpm = Math.round(score.letterScore / 5 / (elapsed / 60));
            const acc =
                score.totalLetters > 0
                    ? Math.round((score.letterScore / score.totalLetters) * 100)
                    : 100;
            if (wpmRefs?.current) wpmRefs.current.textContent = `${wpm} WPM`;
            setScore((prev) => ({ ...prev, standardWPM: wpm, accuracy: acc }));
        }
    }, [timer, wordIndex, isFinished]);

    useEffect(() => {
        if (isFinished) {
            setInput("");
            setIsUserTyping(false);
        }
    }, [isFinished]);

    return (
        <div className="main-container">
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

            <TextField text={text} letterRefs={letterRefs} wordRefs={wordRefs} />

            <div className="form-group">
                <input
                    className="input-field"
                    type="text"
                    value={input}
                    ref={inputRef}
                    onChange={handleInputChange}
                    onKeyDown={handleKeyDown}   
                    disabled={isFinished}
                    onFocus={() => setIsUserTyping(true)}
                    onBlur={() => setIsUserTyping(false)}
                />
                <div className="stat-box wpm" ref={wpmRefs}>
                    WPM
                </div>
                <div className="stat-box time" ref={timeRefs}>
                    Time
                </div>
                <div className="stat-box reset-button" onClick={resetEverything}>
                    Reset
                </div>
            </div>

            {isFinished ? (
                <>
                    <div className="gameResult">Game Result </div>
                    <div className="gameResult">WPM: {score.standardWPM}</div>
                    <div className="gameResult">Accuracy: {score.accuracy}</div>
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
