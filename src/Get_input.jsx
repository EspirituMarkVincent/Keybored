import "./style.css";
import { useState, useEffect, useRef } from "react";
import { hidePrevLine } from "./Text_field";

function GetInput({
    givenWords,
    letterRefs,
    wordRefs,
    wpmRefs,
    timeRefs,
    onFocusChange,
    gameModeSettings,
    isFinished,
    setIsFinished,
    score,
    setScore,
}) {
    const { mode, timeGoal, wordGoal } = gameModeSettings;

    const [input, setInput] = useState("");
    const [wordIndex, setWordIndex] = useState(0);
    const [cursorPos, setCursorPos] = useState(0);
    const inputRef = useRef(null);

    // Timer
    const [isStarted, setIsStarted] = useState(false);
    const [timer, setTimer] = useState(timeGoal);
    const timerRef = useRef(null);

    // local WPM + acc
    const [wordWPM, setWordWPM] = useState(0);
    const [standardWPM, setStandardWPM] = useState(0);
    const [accuracy, setAccuracy] = useState(0);

    // handle space (next word)
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
                if (mode === "words") return prev + 1; // elapsed
                return prev;
            });
        }, 1000);
    };

    // cleanup
    useEffect(() => {
        return () => clearInterval(timerRef.current);
    }, []);

    // reset when mode/goal changes
    useEffect(() => {
        resetStats();
    }, [gameModeSettings]);

    // update timer + stats
    useEffect(() => {
        if (!timeRefs?.current) return;

        const elapsed = mode === "time" ? timeGoal - timer : timer;

        if (isFinished) clearInterval(timerRef.current);

        // time/progress display
        if (mode === "time") {
            timeRefs.current.textContent = `${timer}s`;
            if (timer === 0) setIsFinished(true);
        } else {
            timeRefs.current.textContent = `${wordIndex}/${wordGoal}`;
            if (wordIndex >= wordGoal) setIsFinished(true);
        }

        // stats
        let currentWordWPM = 0;
        let currentStandardWPM = 0;
        if (elapsed > 0) {
            currentWordWPM = ((score.wordScore / elapsed) * 60).toFixed(2);
            currentStandardWPM = (score.letterScore / 5 / (elapsed / 60)).toFixed(2);
        }

        setWordWPM(currentWordWPM);
        setStandardWPM(currentStandardWPM);

        const acc =
            score.totalLetters > 0
                ? ((score.letterScore / score.totalLetters) * 100).toFixed(2)
                : 100;
        setAccuracy(acc);

        if (wpmRefs?.current) {
            wpmRefs.current.textContent = `${Math.round(currentStandardWPM)} WPM`;
        }

        // debug
        const debug =
            mode === "time"
                ? `[TIME-${timeGoal}] Left: ${timer}s | Elapsed: ${elapsed}s`
                : `[WORDS-${wordGoal}] Words: ${wordIndex}/${wordGoal} | Elapsed: ${elapsed}s`;

        console.log(
            `${debug} | WordScore: ${score.wordScore}/${score.totalWords} | ` +
                `LetterScore: ${score.letterScore}/${score.totalLetters} | ` +
                `Word-WPM: ${currentWordWPM} | Std-WPM: ${currentStandardWPM} | Acc: ${acc}%`
        );
    }, [input, timer, wordIndex, wordGoal, score, isFinished]);

    // on finish
    useEffect(() => {
        if (!isFinished) return;
        setInput("");
        console.log("Finished");
        onFocusChange(false);
    }, [isFinished]);

    // score word
    useEffect(() => {
        if (wordIndex === 0) return;
        scoreWord(wordIndex - 1);
    }, [wordIndex]);

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

    const prevCursor = useRef(null);

    useEffect(() => {
        const letters = letterRefs.current[wordIndex];
        if (!letters) return;

        const wordLength = Object.keys(letters).length;
        const safeIndex = Math.min(cursorPos, wordLength - 1);

        if (prevCursor.current) {
            prevCursor.current.classList.remove("highlight");
        }

        if (letters[safeIndex]) {
            letters[safeIndex].classList.add("highlight");
            prevCursor.current = letters[safeIndex];
        }

        checkLetterCorrectness();
        hidePrevLine(wordRefs);
    }, [cursorPos, wordIndex, letterRefs]);

    const checkLetterCorrectness = () => {
        const currentWord = letterRefs.current[wordIndex];
        if (!currentWord) return;

        Object.keys(currentWord).forEach((i) => {
            const elem = currentWord[i];
            const typed = input[i];
            elem.classList.toggle("correct", typed === elem.textContent);
            elem.classList.toggle("incorrect", typed != null && typed !== elem.textContent);
        });
    };

    const scoreWord = (index) => {
        const prevWord = givenWords.split(" ")[index];
        const letters = letterRefs.current[index] || {};
        let lettersScored = 0;
        let correctLetters = 0;
        let correctWord = true;

        for (let i = 0; i < prevWord.length; i++) {
            const letter = letters[i];
            if (!letter) continue;

            lettersScored++;
            if (letter.classList.contains("correct")) {
                correctLetters++;
            } else {
                letter.classList.add("incorrect");
                correctWord = false;
            }
        }

        setScore((prev) => {
            return {
                ...prev,
                totalLetters: prev.totalLetters + lettersScored,
                letterScore: prev.letterScore + correctLetters,
                totalWords: prev.totalWords + 1,
                wordScore: correctWord ? prev.wordScore + 1 : prev.wordScore,
            };
        });
    };

    const resetStats = () => {
        clearInterval(timerRef.current);
        setInput("");
        setWordIndex(0);
        setCursorPos(0);

        setWordWPM(0);
        setStandardWPM(0);
        setAccuracy(0);

        setIsStarted(false);
        setIsFinished(false);

        setScore({
            totalLetters: 0,
            letterScore: 0,
            totalWords: 0,
            wordScore: 0,
        });

        if (mode === "time") {
            setTimer(timeGoal);
            timeRefs.current.textContent = `${timeGoal}s`;
        } else {
            setTimer(0);
            timeRefs.current.textContent = `0/${wordGoal}`;
        }

        if (wpmRefs?.current) wpmRefs.current.textContent = `0 WPM`;

        Object.values(letterRefs.current).forEach((word) =>
            Object.values(word).forEach((letter) => letter.classList.remove("correct", "incorrect"))
        );
    };

    return (
        <div className="form-group">
            <input
                className="input-field"
                type="text"
                value={input}
                ref={inputRef}
                onChange={handleInputChange}
                onKeyDown={handleKeyDown}
                disabled={isFinished}
                onFocus={() => onFocusChange(true)}
                onBlur={() => onFocusChange(false)}
            />
            <div className="stat-box wpm" ref={wpmRefs}>
                WPM
            </div>
            <div className="stat-box time" ref={timeRefs}>
                Time
            </div>
            <div className="stat-box reset-button" onClick={resetStats}>
                Reset
            </div>
        </div>
    );
}

export { GetInput };
