    import './style.css';
    import { useState, useEffect, useRef, use } from 'react';
    import { HidePrevLine } from './Text_field';

    function GetInput({ givenWords, letterRefs, wordRefs, wpmRefs, timeRefs, onFocusChange, gameMode, timeGoalSelected, wordGoalSelected }) {
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
        const [timer, setTimer] = useState(timeGoalSelected);
        const timerRef = useRef(null);
        const [isFinished, setIsFinished] = useState(false);

        // When spacebar is clicked, move to next word
        const handleKeyDown = (e) => {
            if (e.key === ' ' && input !== '') {
                e.preventDefault();
                setWordIndex((prev) => prev + 1);
                setCursorPos(0);
                setInput('');   
            }
        };

        // Start time on first input
        const handleInputChange = (e) => {
            if (!isStarted) {
                setIsStarted(true);
                timerRef.current = setInterval(() => {
                    setTimer((prev) => {
                        if (prev <= 1) {
                            clearInterval(timerRef.current);
                            return 0;
                        }
                        
                        if (gameMode === 'time') return prev - 1;
                        if (gameMode === 'words') return prev + 1;
                    });
                }, 1000);
            }
            setInput(e.target.value);
        };

        useEffect(() => {
            return () => clearInterval(timerRef.current);
        }, []);

        //Reset Stats on gamemode change
        useEffect(() => {
            resetStats();
            console.log(`Game Mode: ${gameMode}`);
        }, [gameMode]);

        // Compute Score Data
        useEffect(() => {
            if (!timeRefs?.current) return;

            const elapsedTime = timeGoalSelected - timer;

            switch (gameMode) {
                // by time mode
                case 'time':
                    timeRefs.current.textContent = `${timer}s`;
                    console.log(`Time Left: ${timer}s | Elapsed: ${elapsedTime}s | Word Score: ${wordScore}/${totalCurrentWords} | Letter Score: ${letterScore}/${totalCurrentLetters}`);
                    if (timer === 0) {
                        console.log("Time’s up!");
                        onFocusChange(false);
                        setIsFinished(true);
                        break;
                    }
                    break;
                // by words mode
                case 'words':
                    timeRefs.current.textContent = `${wordIndex}/${wordGoalSelected}`;
                    console.log(`Time Left: ${timer}s | Elapsed: ${elapsedTime}s | Word Score: ${wordScore}/${totalCurrentWords} | Letter Score: ${letterScore}/${totalCurrentLetters}`);
                    if (wordIndex === wordGoalSelected) {
                        console.log("Words limit reached!");
                        onFocusChange(false);
                        setIsFinished(true);
                        break;
                    }
                    break;
            }

            wpmRefs.current.textContent = `${((wordScore / elapsedTime) * 60).toFixed(2)} WPM`;
        }, [input, timer, wordIndex]);

        // Get Score Data
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
            const cursor = document.querySelector('.cursor');

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
            }

            checkLetterCorrectness();
            HidePrevLine();
        }, [cursorPos, wordIndex]);


        function checkLetterCorrectness() {
            const currentGivenWord = letterRefs.current[wordIndex];
            if (!currentGivenWord) return;
            const givenWordLength = Object.keys(currentGivenWord).length;

           for (let i = 0; i < givenWordLength; i++) {
                const letterElem = currentGivenWord[i];
                const typedLetter = input[i];

                letterElem.classList.toggle('correct', typedLetter === letterElem.textContent);
                letterElem.classList.toggle('incorrect', typedLetter != null && typedLetter !== letterElem.textContent);
            }
        }

        function resetStats() {
            setInput('');
            setWordIndex(0);
            setCursorPos(0);
            setCurrentLine(1);

            setLetterScore(0);
            setTotalCurrentLetters(0);
            setWordScore(0);
            setTotalCurrentWords(0);

            setTimer(timeGoalSelected);
            clearInterval(timerRef.current);
            setIsStarted(false);
            setIsFinished(false);

            if (gameMode === 'time') {
                setTimer(timeGoalSelected)
                timeRefs.current.textContent = `${timer}s`;
            };
            if (gameMode === 'words') {
                setTimer(0);
                timeRefs.current.textContent = `${wordIndex}/${wordGoalSelected}`;
            };
            wpmRefs.current.textContent = `0 WPM`;

            Object.values(letterRefs.current).forEach((word) => {
                Object.values(word).forEach((letter) => {
                    letter.classList.remove('correct', 'incorrect');
                    if (cursorPos !== 0) {
                        letter.classList.remove('highlight');
                    }
                });
            });
        }

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

                <div className="stat-box wpm" ref={wpmRefs}> WPM </div>
                <div className="stat-box time" ref={timeRefs}>Time </div>
                <div
                    className="stat-box reset-button"
                    onClick={() => { 
                        resetStats(); 
                    }}
                    >
                        Reset
                    </div>
            </div>
        );
    }

    export { GetInput };
