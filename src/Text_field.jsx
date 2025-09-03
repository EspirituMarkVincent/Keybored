import { useState, useRef, useEffect, memo } from "react";

const MemoizedWord = memo(
    ({ word, wordIndex, currentWordIndex, userInput, typedHistory, lineNumber, currentLineNumber }) => {
        const isCurrent = wordIndex === currentWordIndex;
        const pastWordUserInput = typedHistory[wordIndex];
        const isTyped = pastWordUserInput !== undefined;

        const wordClasses = ["word"];

        const highlightSpace = isCurrent && userInput.length >= word.length;

        return (
            <span className={wordClasses.join(" ")}>
                {word.split("").map((char, charIndex) => {
                    let className = "letter ";
                    
                    if (isCurrent) {
                        if (charIndex < userInput.length) {
                            className += userInput[charIndex] === char ? "correct" : "incorrect";
                        }

                        if (charIndex === userInput.length) {
                            className += "highlight ";
                        }
                    } else if (isTyped) {
                        className += pastWordUserInput[charIndex] === char ? "correct" : "incorrect";
                    }

                    return (
                        <span key={charIndex} className={className}>
                            {char}
                        </span>
                    );
                })}

                {(() => {
                    const typed = isCurrent ? userInput : pastWordUserInput || "";
                    if (typed.length > word.length) {
                        return typed.substring(word.length).split("").map((char, index) => (
                            <span key={`excess-${index}`} className="letter excess">
                                {char}
                            </span>
                        ));
                    }
                    return null;
                })()}

                <span className={`letter space ${highlightSpace ? "highlight" : ""}`}>&nbsp;</span>
            </span>
        );
    }
);

// This component now owns the logic for measuring and assigning line numbers.
export default function TextField({ words, currentWordIndex, userInput, typedHistory }) {
    const [lineAssignments, setLineAssignments] = useState({});
    const containerRef = useRef(null);
    const wordRefs = useRef({});

    useEffect(() => {
        const updateLinePositions = () => {
            const wordElements = Object.values(wordRefs.current).filter(Boolean);
            if (wordElements.length === 0) return;

            let currentLineTop = -1;
            let lineNumber = 0;
            const newAssignments = {};

            wordElements.forEach((wordEl, index) => {
                if (wordEl.offsetTop > currentLineTop) {
                    lineNumber++;
                    currentLineTop = wordEl.offsetTop;
                }
                newAssignments[index] = lineNumber;
            });
            setLineAssignments(newAssignments);
        };

        const observer = new ResizeObserver(updateLinePositions);
        if (containerRef.current) {
            observer.observe(containerRef.current);
        }

        updateLinePositions();

        return () => observer.disconnect();
    }, [words]);

    const currentLineNumber = lineAssignments[currentWordIndex] || 1;

    return (
        <div className="text-wrapper">
            <div className="text-container" ref={containerRef}>
                {words.map((word, wIndex) => (
                    <span
                        key={wIndex}
                        ref={(el) => {
                            wordRefs.current[wIndex] = el;
                        }}
                    >
                        <MemoizedWord
                            word={word}
                            wordIndex={wIndex}
                            currentWordIndex={currentWordIndex}
                            userInput={userInput}
                            typedHistory={typedHistory}
                            lineNumber={lineAssignments[wIndex] || 0}
                            currentLineNumber={currentLineNumber}
                        />
                    </span>
                ))}
            </div>
        </div>
    );
}
