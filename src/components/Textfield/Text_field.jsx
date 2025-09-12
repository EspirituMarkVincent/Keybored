import { useRef, useEffect, useState, memo, useCallback } from "react";
import "./Text_field.css";

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
    const renderLen = Math.max(word.length, typed.length);

    return (
        <span className={`word line-${lineNum}`} ref={(el) => registerWordEl(wordIndex, el)}>
            {Array.from({ length: renderLen }).map((_, i) => {
                const char = i >= word.length ? typed[i] : word[i];
                let className = "letter ";

                if (typed === "") {
                } else if (i >= word.length) {
                    className += "excess";
                } else if (isCurrent) {
                    if (typed[i] !== undefined) {
                        className += typed[i] === word[i] ? "correct" : "incorrect";
                    }
                } else {
                    className += typed[i] === word[i] ? "correct" : "incorrect";
                }

                return (
                    <span
                        key={i}
                        ref={(el) => (isCurrent && i === cursorPos ? registerLetter(el) : null)}
                        className={className}
                    >
                        {char}
                    </span>
                );
            })}

            <span
                ref={(el) => (isCurrent && cursorPos === renderLen ? registerLetter(el) : null)}
                className="letter space"
            >
                &nbsp;
            </span>
        </span>
    );
});

export default function TextField({
    words,
    currentWordIndex,
    userInput,
    typedHistory,
    cursorPos,
    showTextContainer = true,
}) {
    const cursorRef = useRef(null);
    const wordRefs = useRef({});
    const textContainerRef = useRef(null);
    const [lineNumbers, setLineNumbers] = useState({});
    const [cursorStyle, setCursorStyle] = useState({ display: "none" });

    const registerLetter = useCallback((el) => {
        if (el) cursorRef.current = el;
    }, []);

    const registerWordEl = useCallback((index, el) => {
        if (el) wordRefs.current[index] = el;
    }, []);

    const updateLineNumbers = useCallback(() => {
        const lines = {};
        let currentLine = 1;
        let lastTop = null;
        Object.entries(wordRefs.current).forEach(([index, el]) => {
            if (!el) return;
            if (lastTop === null) lastTop = el.offsetTop;
            if (el.offsetTop > lastTop) {
                currentLine++;
                lastTop = el.offsetTop;
            }
            lines[index] = currentLine;
        });
        setLineNumbers(lines);
    }, []);

    useEffect(() => {
        updateLineNumbers();
        window.addEventListener("resize", updateLineNumbers);
        return () => window.removeEventListener("resize", updateLineNumbers);
    }, [words, updateLineNumbers]);

    useEffect(() => {
        const activeLetterEl = cursorRef.current;

        if (activeLetterEl) {
            const top = activeLetterEl.offsetTop;
            const left = activeLetterEl.offsetLeft;

            const letterRect = activeLetterEl.getBoundingClientRect();

            setCursorStyle({
                display: "block",
                transform: `translate(${left}px, ${top}px)`,
                width: letterRect.width,
                height: letterRect.height,
            });
        }
    }, [currentWordIndex, cursorPos, userInput, words, lineNumbers]);

    // Handles auto-scrolling to keep the cursor in view.
    useEffect(() => {
        cursorRef.current?.scrollIntoView({
            block: "center",
            inline: "nearest",
            behavior: "smooth",
        });
    }, [currentWordIndex, cursorPos]);

    return (
        <div
            className="text-wrapper"
            style={
                showTextContainer ? {} : { background: "none", border: "none", boxShadow: "none" }
            }
        >
            <div className="text-container" ref={textContainerRef}>
                <span className="smooth-cursor" style={cursorStyle}></span>

                {words.map((word, wIndex) => {
                    const lineNum = lineNumbers[wIndex] || 1;
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
                            registerLetter={registerLetter}
                            registerWordEl={registerWordEl}
                            lineNum={lineNum}
                        />
                    );
                })}
            </div>
        </div>
    );
}
