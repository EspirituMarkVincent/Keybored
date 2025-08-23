import './style.css';
import { useRef, useEffect } from 'react';

export function HidePrevLine() {
    const highlighted = document.querySelector('.letter.highlight');
    const wordElem = highlighted?.closest('.word');

    if (wordElem) {
        const line = [...wordElem.classList].find(c => c.startsWith("line-"));
        const lineNum = line ? parseInt(line.replace("line-", ""), 10) : null;
    
        const prevLineElems = document.querySelectorAll(`.word.line-${lineNum - 2}`);
        prevLineElems.forEach(el => el.classList.add("lineDone"));
    }
}

export default function TextField({ text, letterRefs, wordRefs, wpmRefs, timeRefs }) {
    const containerRef = useRef(null);

    useEffect(() => {
        const updateLinePositions = () => {
            const words = Object.values(wordRefs.current).filter(Boolean);
            let currentLineTop = null;
            let currentLine = 1;
            let lineNumber = 0;

            words.forEach(wordElement => {
                wordElement.classList.forEach(className => {
                    if (className.startsWith("line-")) {
                        wordElement.classList.remove(className);
                    }
                });
            });

            words.forEach((word) => {
                if (currentLineTop === null || word.offsetTop !== currentLineTop) {
                    lineNumber++;
                    currentLineTop = word.offsetTop;
                }
                word.classList.add(`line-${lineNumber}`);
            });

            HidePrevLine();
        };
        
        const observer = new ResizeObserver(updateLinePositions);
        observer.observe(containerRef.current);
        updateLinePositions();

        return () => observer.disconnect();
    }, [text, wordRefs]);

    return (
        <div className='text-wrapper'>
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
                <div className='cursor'></div>
            </div>
        </div>
        
    );
}
