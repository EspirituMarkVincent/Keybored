import './style.css';
import { useState, useEffect, useRef } from 'react';

function GetInput({ givenWords, letterRefs, wordRefs, wpmRefs, timeRefs }) {
    const [input, setInput] = useState('');
    const [wordIndex, setWordIndex] = useState(0);
    const [cursorPos, setCursorPos] = useState(0);
    const inputRef = useRef(null);
    const [currentLine, setCurrentLine] = useState(1);

    // Scoring
    const [letterScore, setLetterScore] = useState(0);
    const [totalCurrentLetters, setTotalCurrentLetters] = useState(0);
    const [wordScore, setWordScore] = useState(0);
    const [totalCurrentWords, setTotalCurrentWords] = useState(0);

    // Timer
    const [isStarted, setIsStarted] = useState(false);
    const [time, setTime] = useState(100);
    const [timeLeft, setTimeLeft] = useState(time);
    const timerRef = useRef(null);

    // Highlight active line
    useEffect(() => {
        Object.values(wordRefs.current).forEach(wordElement => {
            if (wordElement?.classList.contains(`line-${currentLine}`)) {
                wordElement.classList.add('active');
            } else {
                wordElement.classList.remove('active');
            }
        });
    }, [cursorPos, currentLine, wordRefs]);

    const handleKeyDown = (e) => {
        if (e.key === ' ' && input !== '') {
            e.preventDefault();
            setWordIndex((prev) => prev + 1);
            setCursorPos(0);
            setInput('');
        }
    };

    const handleInputChange = (e) => {
        if (!isStarted) {
            setIsStarted(true);
            timerRef.current = setInterval(() => {
                setTimeLeft((prev) => {
                    if (prev <= 1) {
                        clearInterval(timerRef.current);
                        return 0;
                    }
                    return prev - 1;
                });
            }, 1000);
        }
        setInput(e.target.value);
    };

    useEffect(() => {
        if (!timeRefs?.current) return;

        timeRefs.current.textContent = `${timeLeft}s`;
        const elapsedTime = time - timeLeft;
        const currentWord = givenWords.split(' ')[wordIndex] || '';
        console.log(`Time Left: ${timeLeft}s | Elapsed: ${elapsedTime}s | Current Word: "${currentWord}" | Word Score: ${wordScore}/${totalCurrentWords} | Letter Score: ${letterScore}/${totalCurrentLetters}`);

        if (timeLeft === 0) {
            console.log("Time’s up!");
        }
    }, [timeLeft, time, wordIndex, givenWords, timeRefs]);

    useEffect(() => {
        return () => clearInterval(timerRef.current);
    }, []);

    // Track cursor position
    useEffect(() => {
        const handleSelectionChange = () => {
            if (document.activeElement === inputRef.current) {
                setCursorPos(inputRef.current.selectionStart);
            }
        };
        document.addEventListener('selectionchange', handleSelectionChange);
        return () =>
            document.removeEventListener('selectionchange', handleSelectionChange);
    }, []);

    // Highlight current letter
    useEffect(() => {
        const letters = letterRefs.current[wordIndex];
        if (!letters) return;

        if (givenWords.split(' ')[wordIndex]?.length >= input.length) {
            Object.values(letterRefs.current).forEach((word) => {
                Object.values(word).forEach((letter) =>
                    letter.classList.remove('highlight')
                );
            });
            if (letters[cursorPos]) {
                letters[cursorPos].classList.add('highlight');
            }

            letterCorrectness();
        }
    }, [cursorPos, wordIndex, input, letterRefs, givenWords]);

    function letterCorrectness() {
        const currentGivenWord = letterRefs.current[wordIndex];
        if (!currentGivenWord) return;
        const givenWordLength = Object.keys(currentGivenWord).length;

        for (let i = 0; i < input.length; i++) {
            if (input[i] === currentGivenWord[i].textContent) {
                currentGivenWord[i].classList.add('correct');
                currentGivenWord[i].classList.remove('incorrect');
            } else {
                currentGivenWord[i].classList.add('incorrect');
                currentGivenWord[i].classList.remove('correct');
            }
        }

        for (let i = input.length; i < givenWordLength; i++) {
            currentGivenWord[i].classList.remove('correct', 'incorrect');
        }
    }

    // Scoring
    useEffect(() => {
        if (wordIndex === 0) return;

        const prevWordIndex = wordIndex - 1;
        const prevWord = givenWords.split(' ')[prevWordIndex];
        let lettersScored = 0;
        let correctLetters = 0;
        let correctWord = true;

        for (let i = 0; i < prevWord.length; i++) {
            const letter = letterRefs.current[prevWordIndex]?.[i];
            if (!letter) continue;

            lettersScored++;

            if (letter.classList.contains('correct')) {
                correctLetters++;
            } else if (!letter.classList.contains('incorrect')) {
                letter.classList.add('incorrect');
                correctWord = false;
            } else {
                correctWord = false;
            }
        }

        setTotalCurrentLetters((prev) => prev + lettersScored);
        setLetterScore((prev) => prev + correctLetters);
        setTotalCurrentWords((prev) => prev + 1);
        if (correctWord) setWordScore((prev) => prev + 1);
    }, [wordIndex, isStarted, givenWords, letterRefs]);

    return (
        <div className="form-group">
            <input
                className="input-field"
                type="text"
                value={input}
                ref={inputRef}
                onChange={handleInputChange}
                onKeyDown={handleKeyDown}
                disabled={timeLeft === 0}
            />

            <div className="stat-box wpm" ref={wpmRefs}> WPM </div>
            <div className="stat-box time" ref={timeRefs}>Time </div>
            <div className="stat-box reset-button">Reset</div>
        </div>
    );
}

export default GetInput;
