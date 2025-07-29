import React from 'react';
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
    const [words, setWords] = useState(givenWords.split(' '));
    const [charIndex, setCharIndex] = useState(0);
    const [wordIndex, setWordIndex] = useState(0);
    const handleChange = (e) => {
        setInput(e.target.value);
        setCharIndex(charIndex + 1);
        console.log(letterRefs.current[wordIndex][charIndex]);
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