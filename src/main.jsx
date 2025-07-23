import { useEffect, StrictMode, useState, useRef } from 'react'
import { createRoot } from 'react-dom/client'
import Keyboard from './Keyboard'
import { TextField } from './Text_field'
import './style.css'

function App() {
    const [text, setText] = useState('');
    const apiCalledRef = useRef(false);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        if (!apiCalledRef.current) {
            fetch('https://random-word-api.herokuapp.com/word?number=100')
            .then(response => response.json())
            .then(data => {
                setText(data.join(' '));
                apiCalledRef.current = true;
                setIsLoading(false);
                console.log(data);
            });
        }
    }, []);

    if (isLoading) {
        return (
          <div>Loading...</div>
        );
    } else {
      return (
        <div>
          <div className="main-container">
            <span>{text}</span>
            <TextField givenWords={text}/>
            <Keyboard />
          </div>    
        </div>
      );
    }
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
      <App />
  </StrictMode>,
) 