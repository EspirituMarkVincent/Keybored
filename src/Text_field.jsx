import { useRef, useEffect, useState, memo, useCallback } from "react";

// Memoized for performance, preventing re-renders of unchanged words.
const Word = memo(function Word({
    word,
    wordIndex,
    currentWordIndex,
    typed, // User's input for this word.
    cursorPos,
    registerLetter,
    registerWordEl,
    lineNum,
}) {
    const isCurrent = wordIndex === currentWordIndex;
    // Loop length is the max of word and typed lengths to handle excess characters.
    const renderLen = Math.max(word.length, typed.length);

    return (
        // Styles the word and its line number.
        <span className={`word line-${lineNum}`} ref={(el) => registerWordEl(wordIndex, el)}>
            {Array.from({ length: renderLen }).map((_, i) => {
                const char = i >= word.length ? typed[i] : word[i];
                let className = "letter ";

                // Highlights the current letter.
                if (isCurrent && i === cursorPos) className += "highlight ";

                // Core logic for styling each letter.
                if (typed === "") {
                    // Future word, no styling.
                } else if (i >= word.length) {
                    // Excess characters.
                    className += "excess";
                } else if (isCurrent) {
                    // Style only typed characters for the current word.
                    if (typed[i] !== undefined) {
                        className += typed[i] === word[i] ? "correct" : "incorrect";
                    }
                } else {
                    // Style all characters for past words.
                    className += typed[i] === word[i] ? "correct" : "incorrect";
                }

                return (
                    <span
                        key={i}
                        // This ref tracks the cursor's position for scrolling.
                        ref={(el) => (isCurrent && i === cursorPos ? registerLetter(el) : null)}
                        className={className}
                    >
                        {char}
                    </span>
                );
            })}

            {/* A span for the space, appears on every end of word. */}
            <span
                ref={(el) => (isCurrent && cursorPos === renderLen ? registerLetter(el) : null)}
                className={`letter space ${
                    isCurrent && cursorPos === renderLen ? "highlight" : ""
                }`}
            >
                &nbsp;
            </span>
        </span>
    );
});

export default function TextField({ words, currentWordIndex, userInput, typedHistory, cursorPos }) {
    const cursorRef = useRef(null);
    const wordRefs = useRef({});
    const [lineNumbers, setLineNumbers] = useState({});

    // Memoize callbacks to prevent re-renders in memoized components.
    const registerLetter = useCallback((el) => {
        if (el) cursorRef.current = el;
    }, []);

    const registerWordEl = useCallback((index, el) => {
        if (el) wordRefs.current[index] = el;
    }, []);

    // Calculates line numbers based on vertical position to handle text wrapping.
    const updateLineNumbers = () => {
        const lines = {};
        let currentLine = 1;
        let lastTop = null;

        Object.entries(wordRefs.current).forEach(([index, el]) => {
            if (!el) return;
            if (lastTop === null) lastTop = el.offsetTop;

            if (el.offsetTop !== lastTop) {
                currentLine++;
                lastTop = el.offsetTop;
            }

            lines[index] = currentLine;
        });

        setLineNumbers(lines);
    };

    useEffect(() => {
        updateLineNumbers();
        window.addEventListener("resize", updateLineNumbers);
        return () => window.removeEventListener("resize", updateLineNumbers);
    }, [words]);

    // Auto-scrolls to keep the cursor visible.
    useEffect(() => {
        cursorRef.current?.scrollIntoView({
            block: "center",
            inline: "nearest",
            behavior: "smooth",
        });
    }, [currentWordIndex, cursorPos]);

    return (
        <div className="text-wrapper">
            <div className="text-container">
                {words.map((word, wIndex) => {
                    const lineNum = lineNumbers[wIndex] || 1;

                    // Selects the correct typed string for the current or past word.
                    const typedForThisWord =
                        wIndex === currentWordIndex ? userInput : typedHistory[wIndex] || "";

                    return (
                        <Word
                            key={wIndex}
                            word={word}
                            wordIndex={wIndex}
                            currentWordIndex={currentWordIndex}
                            typed={typedForThisWord}
                            cursorPos={cursorPos}
                            // Callback to register the cursor's DOM element for scrolling.
                            registerLetter={registerLetter}
                            // Callback to register each word's DOM element for line calculations.
                            registerWordEl={registerWordEl}
                            lineNum={lineNum}
                        />
                    );
                })}
            </div>
        </div>
    );
}
