import { useState, useRef, useEffect } from 'react';
import { createRoot } from 'react-dom/client';
import Keyboard from './Keyboard';
import TextField from './Text_field';
import { GetInput } from './Get_input';
import { localText } from './No_word_api';

function App() {
    const letterRefs = useRef({});
    const wordRefs = useRef({});
    const wpmRefs = useRef(null);
    const timeRefs = useRef(null);

    const [text, setText] = useState('');
    const [loading, setLoading] = useState(true);
    const [isFocused, setIsFocused] = useState(false);

    const [gameMode, setGameMode] = useState('time');
    const [timeGoalSelected, setTimeGoalSelected] = useState(5);
    const [wordGoalSelected, setWordGoalSelected] = useState(2);

    useEffect(() => {
        setLoading(true);
        fetch('https://random-word-api.vercel.app/api?words=500')
            .then(r => r.json())
            .then(data => setText(data.join(' ')))
            .catch(() => setText(localText.join(' ')))
            .finally(() => setLoading(false));
    }, []);
  
    if (loading) return <div>Loading...</div>;

    return (
        <div className="main-container">
            <div>
                <button 
                    className={`GameMode ${gameMode === `time` ? 'active' : ''}`}
                    onClick={() => setGameMode('time')}>Time</button>
                <button className={`GameMode ${gameMode === `time` ? 'active' : ''}`}
                    onClick={() => setGameMode('words')}>Words</button>
            </div>

            <TextField
                text={text}
                letterRefs={letterRefs}
                wordRefs={wordRefs}
                wpmRefs={wpmRefs}
                timeRefs={timeRefs}
            />

            <GetInput
                givenWords={text}
                letterRefs={letterRefs}
                wordRefs={wordRefs}
                wpmRefs={wpmRefs}
                timeRefs={timeRefs}
                onFocusChange={setIsFocused}
                gameMode={gameMode}
                timeGoalSelected={timeGoalSelected}
                wordGoalSelected={wordGoalSelected}
            />

            <Keyboard isFocused={isFocused} />
        </div>
    );
}

createRoot(document.getElementById('root')).render(<App />);
