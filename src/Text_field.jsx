import React, { use } from 'react';
import './style.css';
import { useState, useEffect, useRef } from 'react';

function TextField({ givenWords }) {
    const letterRefs = useRef({});

    return (
        <div>
        <div className="text-container">
            {givenWords.split(' ').map((word, wordIndex) => (
            <div className="word" key={wordIndex}>
                {word.split('').map((letter, letterIndex) => (
                <div className="letter" 
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
            </div>
            ))}
        </div>
        <div className="form-group">
            <GetInput givenWords={givenWords} letterRefs={letterRefs} />
            <div className="stat-box wpm">WPM</div>
            <div className="stat-box time">Time</div>
            <div className="stat-box reset-button">Reset</div>
        </div>
        </div>
  );
}

function GetInput({ givenWords, letterRefs }) {
    const [input, setInput] = useState('');
    // const [words, setWords] = useState(givenWords.split(''));
    const [charIndex, setCharIndex] = useState(0);
    const [wordIndex, setWordIndex] = useState(0);
    const [isWrong, setIsWrong] = useState(false);
    const [isSpacePressed, setIsSpacePressed] = useState(false);

    const handleChange = (e) => {
        
        if (e.target.value.slice(-1) === ' ') {
            setIsSpacePressed(true);
            console.log("space");
            setInput('');
            setWordIndex(wordIndex + 1);
            setCharIndex(0);
        }

        try {
        if (!isSpacePressed) {
            if (e.target.value.slice(-1) === letterRefs.current[wordIndex][charIndex].textContent) {
                setInput(e.target.value);
                letterRefs.current[wordIndex][charIndex].style.color = 'green';
                console.log("You typed the correct text!");
                setCharIndex(charIndex + 1);
                if (isWrong) {
                    letterRefs.current[wordIndex][charIndex].style.color = 'red';
                    setIsWrong(false);
                }
            } else {
                letterRefs.current[wordIndex][charIndex].style.color = 'red';
                setIsWrong(true);
            }
        }
        } catch (error) {
            console.log("space");
        }

        setIsSpacePressed(false);

        console.log("input: " + e.target.value.slice(-1) + 
            ", wordIndex: " + wordIndex + 
            ", charIndex: " + charIndex);            
    };

    return (
        <input
            id="input-field"
            className='input-field'
            type="text"
            value={input}
            onChange={handleChange}
        />
    );
}

export { TextField };