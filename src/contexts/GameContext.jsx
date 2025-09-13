import { createContext, useContext, useState, useRef, useEffect, useCallback } from "react";

// Create context
const GameContext = createContext(null);

export function GameProvider({ children }) {
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
    const [isUserTyping, setIsUserTyping] = useState(false);

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

    // prettier-ignore
    const localText = [
        "apple","ape","axiom","amber","aroma","braid","baker","banks","barge","bases",
        "cable","cache","cakes","calls","camps","dance","darts","dates","dawns","deals",
        "eagle","eases","eaten","edges","eject","flute","fable","fancy","fence","finds",
        "glide","gnome","graft","grain","grape","honey","hound","house","haste","haven",
        "igloo","icy","image","inch","index","jelly","jade","jaguar","jawed","jests",
        "kite","knot","knead","knell","knock","lance","lark","laser","latch","lauds",
        "mango","mere","mesh","mice","might","nerve","nest","night","nile","ninth",
        "ocean","oath","olive","omen","onion","pulse","pain","paint","pales","pants",
        "queen","quake","quark","quay","quest","ranch","rave","raven","rays","reach",
        "sage","sail","sake","sale","says","tiger","tale","tame","tape","task",
        "umpire","used","user","utah","utopia","vase","vast","vial","vice","view",
        "wagon","wail","wane","warp","wash","xray","xylem","xylo","xyris","xyst",
        "yacht","yale","yard","yarn","yeast","zest","zing","zion","zips","zones"
    ];

    const getText = useCallback(() => {
        setLoading(true);
        fetch("1https://random-word-api.vercel.app/api?words=500")
            .then((r) => r.json())
            .then((data) => setWords(data))
            .catch(() => {
                const shuffled = [...localText].sort(() => Math.random() - 0.5);
                setWords(shuffled);
            })
            .finally(() => setLoading(false));
    }, []);

    const resetEverything = useCallback(() => {
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
    }, [gameModeSettings]);

    const restartText = useCallback(() => {
        getText();
        resetEverything();
    }, [getText, resetEverything]);

    const calculateScore = useCallback(() => {
        let totalCorrect = 0;
        let totalTyped = 0;
        Object.entries(typedHistory).forEach(([index, typedWord]) => {
            const correctWord = words[parseInt(index)];
            if (!correctWord) return;
            for (let i = 0; i < Math.min(typedWord.length, correctWord.length); i++) {
                if (typedWord[i] === correctWord[i]) totalCorrect++;
            }
            totalTyped += typedWord.length;
            if (typedWord.length < correctWord.length)
                totalTyped += correctWord.length - typedWord.length;
        });
        if (words[wordIndex]) {
            const currentWord = words[wordIndex];
            for (let i = 0; i < Math.min(input.length, currentWord.length); i++) {
                if (input[i] === currentWord[i]) totalCorrect++;
            }
            totalTyped += input.length;
        }
        return { totalCorrect, totalTyped };
    }, [words, wordIndex, typedHistory, input]);

    const startTimer = useCallback(() => {
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
    }, [gameModeSettings.mode]);

    const handleInputChange = useCallback(
        (e) => {
            if (isFinished) return;
            if (!isStarted) startTimer();
            setInput(e.target.value);
        },
        [isFinished, isStarted, startTimer]
    );

    const handleKeyDown = useCallback(
        (e) => {
            if (e.key === "Enter") resetEverything();
            else if (e.key === "Tab") restartText();
            else if (e.key === " ") {
                e.preventDefault();
                const trimmedInput = input.trim();
                const currentWord = words[wordIndex] || "";
                const skippedWord =
                    trimmedInput === "" ? "_".repeat(currentWord.length) : trimmedInput;
                setTypedHistory((prev) => ({ ...prev, [wordIndex]: skippedWord }));
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
                const cleanedPrevWord = prevWord && prevWord.match(/^_+$/) ? "" : prevWord;
                setInput(cleanedPrevWord);
                setTypedHistory(newTypedHistory);
                setCursorPos(cleanedPrevWord.length);
            }
        },
        [input, wordIndex, words, typedHistory, resetEverything, restartText]
    );

    useEffect(() => {
        getText();
        const handleTabKey = (e) => {
            if (e.key === "Tab") {
                e.preventDefault();
                resetEverything();
            }
        };
        window.addEventListener("keydown", handleTabKey);
        return () => window.removeEventListener("keydown", handleTabKey);
    }, [getText, resetEverything]);

    useEffect(() => {
        const handleSelectionChange = () => {
            if (document.activeElement === inputRef.current)
                setCursorPos(inputRef.current.selectionStart);
        };
        document.addEventListener("selectionchange", handleSelectionChange);
        return () => document.removeEventListener("selectionchange", handleSelectionChange);
    }, []);

    useEffect(() => resetEverything(), [gameModeSettings, resetEverything]);

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
        }
    }, [timer, typedHistory, isStarted, gameModeSettings, words, calculateScore]);

    useEffect(() => {
        if (isFinished && score.standardWPM > 0)
            setResult({ wpm: score.standardWPM, accuracy: score.accuracy, typedHistory });
    }, [isFinished, score, typedHistory]);

    useEffect(() => {
        if (gameModeSettings.mode === "words" && wordIndex >= gameModeSettings.wordGoal) {
            setIsFinished(true);
            clearInterval(timerRef.current);
        }
    }, [wordIndex, gameModeSettings]);

    //save the score on finish
    useEffect(() => {
        if (isFinished) {
            const existingScores = JSON.parse(localStorage.getItem('typing-game-scores')) || [];

            const newScore = {
                wpm: score.standardWPM,
                accuracy: score.accuracy,
                date: new Date().toISOString(),
                mode: gameModeSettings.mode,
                goal: gameModeSettings.mode === "time" ? gameModeSettings.timeGoal : gameModeSettings.wordGoal,
            };

            const updatedScores = [...existingScores, newScore];
            localStorage.setItem('typing-game-scores', JSON.stringify(updatedScores));
        }
    }, [isFinished, score, gameModeSettings]);

    // debugging
    useEffect(() => {
        console.log("score", score);
    }, [score]);

    return (
        <GameContext.Provider
            value={{
                cursorPos,
                words,
                loading,
                gameModeSettings,
                setGameModeSettings,
                input,
                inputRef,
                wordIndex,
                typedHistory,
                isFinished,
                timer,
                score,
                result,
                isUserTyping,
                setIsUserTyping,
                resetEverything,
                restartText,
                handleInputChange,
                handleKeyDown,
            }}
        >
            {children}
        </GameContext.Provider>
    );
}

// Hook to consume the context
export const useGame = () => {
    const context = useContext(GameContext);
    if (!context) throw new Error("useGame must be used within a GameProvider");
    return context;
};
