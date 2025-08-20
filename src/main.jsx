// App.jsx
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

    useEffect(() => {
        setLoading(true);
        fetch('1https://random-word-api.vercel.app/api?words=100')
        .then(r => r.json())
        .then(data => setText(data.join(' ')))
        .catch(() => setText(localText.join(' ')))
        .finally(() => setLoading(false));
    }, []);
  
    if (loading) return <div>Loading...</div>;

    return (
    <div className="main-container">
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
        />
        <Keyboard isFocused={isFocused} />
    </div>
  );
}

createRoot(document.getElementById('root')).render(<App />);
