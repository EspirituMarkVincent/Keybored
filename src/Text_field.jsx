import React from 'react';
import './style.css';
import { useState, useEffect, useRef } from 'react';

function GetInput( {givenWords} ) {
    const [input, setInput] = useState('');
    const [words, setWords] = useState(givenWords.split(' '));
    const [charIndex, setCharIndex] = useState(0);
    const handleChange = (e) => {
        setInput(e.target.value);
        console.log(e.target.value);
        console.log(words[charIndex]);
        console.log(input[charIndex]);
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

function TextField( {givenWords} ) {
    return (
        <div>
            <div className="form-group">
                <GetInput givenWords={givenWords}/>
                <div className="stat-box wpm">WPM</div>
                <div className="stat-box time">Time</div>
                <div className="stat-box reset-button">Reset</div>
            </div>
        </div> 
    );
}

export { TextField };