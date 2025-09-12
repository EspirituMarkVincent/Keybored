import { useState, useEffect, useRef} from "react";

export default function useGameLogic() {
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
            .then((data) => setWords(data))
            .catch(() => setWords(localText))
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
        setScore({ letterScore: 0, totalLetters: 0, standardWPM: 0, accuracy: 0 });
        inputRef.current?.focus();
    };

    const restartText = () => {
        getText();
        resetEverything();
    };


    const calculateScore = () => {
        let totalCorrect = 0;
        let totalTyped = 0;

        Object.entries(typedHistory).forEach(([index, typedWord]) => {
            const correctWord = words[parseInt(index)];
            if (!correctWord) return;

            for (let i = 0; i < Math.min(typedWord.length, correctWord.length); i++) {
                if (typedWord[i] === correctWord[i]) {
                    totalCorrect++;
                }
            }

            totalTyped += typedWord.length;
            if (typedWord.length < correctWord.length) {
                totalTyped += correctWord.length - typedWord.length;
            }
        });

        if (words[wordIndex]) {
            const currentWord = words[wordIndex];
            for (let i = 0; i < Math.min(input.length, currentWord.length); i++) {
                if (input[i] === currentWord[i]) {
                    totalCorrect++;
                }
            }
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
            e.preventDefault();
            restartText();
        } else if (e.key === " ") {
            e.preventDefault();
            const trimmedInput = input.trim();
            const currentWord = words[wordIndex] || "";

            const skippedWord = trimmedInput === "" ? "_".repeat(currentWord.length) : trimmedInput;

            setTypedHistory((prev) => ({
                ...prev,
                [wordIndex]: skippedWord,
            }));

            setWordIndex((prev) => prev + 1);
            setInput("");
            setCursorPos(0);
        } else if (e.key === "Backspace" && input === "" && wordIndex > 0) {
            e.preventDefault();
            const newWordIndex = wordIndex - 1;
            const newTypedHistory = { ...typedHistory };
            const prevWord = newTypedHistory[newWordIndex];

            delete newTypedHistory[newWordIndex];

            setWordIndex(newWordIndex);
            setInput(prevWord);
            setTypedHistory(newTypedHistory);
            setCursorPos(prevWord.length);
        }
    };

    useEffect(() => {
        getText();

        const handleKeyDown = (e) => {
            if (e.key === "Tab") {
                e.preventDefault();
                resetEverything();
            }
        };

        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
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
        return () => window.removeEventListener("keydown", handleGlobalKeyDown);
    }, []);

    useEffect(() => {
        resetEverything();
    }, [gameModeSettings]);

    useEffect(() => () => clearInterval(timerRef.current), []);

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
            setResult({
                wpm: score.standardWPM,
                accuracy: score.accuracy,
                typedHistory,
            });
        }
    }, [isFinished]);

    useEffect(() => {
        if (gameModeSettings.mode === "words" && wordIndex >= gameModeSettings.wordGoal) {
            setIsFinished(true);
            clearInterval(timerRef.current);
        }
    }, [wordIndex, gameModeSettings]);

    // debugging
    useEffect(() => {
        console.log(score);
    }, [score]);

    return {
        cursorPos,
        setCursorPos,
        words,
        loading,
        gameModeSettings,
        setGameModeSettings,
        input,
        setInput,
        inputRef,
        wordIndex,
        setWordIndex,
        typedHistory,
        setTypedHistory,
        isStarted,
        setIsStarted,
        isFinished,
        setIsFinished,
        timer,
        score,
        setScore,
        result,
        resetEverything,
        restartText,
        handleInputChange,
        handleKeyDown,
    };
}

// prettier-ignore
const localText = [
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