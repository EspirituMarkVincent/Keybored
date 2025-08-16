import './style.css';
import { useRef, useEffect } from 'react';

export function TextField({ text, letterRefs, wordRefs, wpmRefs, timeRefs }) {
    const containerRef = useRef(null);

    // Assign which line the words are
    useEffect(() => {
        const updateLinePositions = () => {
            const words = Object.values(wordRefs.current).filter(Boolean);
            let currentLineTop = null;
            let lineNumber = 0;

            // Remove old line classes
            words.forEach(wordElement => {
                wordElement.classList.forEach(className => {
                    if (className.startsWith("line-")) {
                        wordElement.classList.remove(className);
                    }
                });
            });

            // Assign new line classes
            words.forEach((word) => {
                if (currentLineTop === null || word.offsetTop !== currentLineTop) {
                    lineNumber++;
                    currentLineTop = word.offsetTop;
                }
                word.classList.add(`line-${lineNumber}`);
            });
        };

        const observer = new ResizeObserver(updateLinePositions);
        observer.observe(containerRef.current);
        updateLinePositions();

        return () => observer.disconnect();
    }, [text, wordRefs]);

    return (
        <div className="text-container" ref={containerRef}>
            {text.split(' ').map((word, wordIndex) => (
                <div
                    className="word"
                    key={wordIndex}
                    ref={ref => { wordRefs.current[wordIndex] = ref; }}
                >
                    {word.split('').map((letter, letterIndex) => (
                        <div
                            className="letter"
                            key={letterIndex}
                            ref={ref => {
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
                        ref={ref => {
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
        </div>
    );
}
