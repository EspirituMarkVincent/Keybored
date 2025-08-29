import "./style.css";
import { useRef, useEffect } from "react";

// Hide the previous line
export function hidePrevLine(wordRefs) {
    const words = Object.values(wordRefs.current).filter(Boolean);

    const wordElem = words.find((word) =>
        Array.from(word.children).some((letter) => letter.classList.contains("highlight"))
    );

    if (!wordElem) return;

    const line = [...wordElem.classList].find((c) => c.startsWith("line-"));
    const lineNum = line ? parseInt(line.replace("line-", ""), 10) : null;

    if (lineNum && lineNum > 1) {
        const prevLineElems = words.filter((word) =>
            word.classList.contains(`line-${lineNum - 2}`)
        );
        prevLineElems.forEach((el) => el.classList.add("lineDone"));
    }
}

export default function TextField({ text, letterRefs, wordRefs }) {
    const containerRef = useRef(null);

    useEffect(() => {
        const updateLinePositions = () => {
            const words = Object.values(wordRefs.current).filter(Boolean);
            let currentLineTop = null;
            let lineNumber = 0;

            // Clear old line classes
            words.forEach((wordElement) => {
                wordElement.classList.forEach((className) => {
                    if (className.startsWith("line-")) {
                        wordElement.classList.remove(className);
                    }
                });
            });

            // Reassign line numbers
            words.forEach((word) => {
                if (currentLineTop === null || word.offsetTop !== currentLineTop) {
                    lineNumber++;
                    currentLineTop = word.offsetTop;
                }
                word.classList.add(`line-${lineNumber}`);
            });

            hidePrevLine(wordRefs);
        };

        // Change line nums if size changes
        const observer = new ResizeObserver(updateLinePositions);
        if (containerRef.current) {
            observer.observe(containerRef.current);
        }
        updateLinePositions();

        return () => observer.disconnect();
    }, [text, wordRefs]);

    return (
        <div className="text-wrapper">
            <div className="text-container" ref={containerRef}>
                {text.split(" ").map((word, wordIndex) => (
                    <div
                        className="word"
                        key={wordIndex}
                        ref={(ref) => {
                            wordRefs.current[wordIndex] = ref;
                        }}
                    >
                        {word.split("").map((letter, letterIndex) => (
                            <div
                                className="letter"
                                key={letterIndex}
                                ref={(ref) => {
                                    if (!letterRefs.current[wordIndex]) {
                                        letterRefs.current[wordIndex] = {};
                                    }
                                    letterRefs.current[wordIndex][letterIndex] = ref;
                                }}
                            >
                                {letter}
                            </div>
                        ))}
                        <div
                            className="letter"
                            ref={(ref) => {
                                if (!letterRefs.current[wordIndex]) {
                                    letterRefs.current[wordIndex] = {};
                                }
                                letterRefs.current[wordIndex][word.length] = ref;
                            }}
                        >
                            &nbsp;
                        </div>
                    </div>
                ))}
                <div className="cursor"></div>
            </div>
        </div>
    );
}
