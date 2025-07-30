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
            fetch('https://random-word-api.vercel.app/api?words=10')
            .then(response => response.json())
            .then(data => {
                setText(data.join(' '));
                setIsLoading(false);
                console.log(data);
            });
          apiCalledRef.current = true;
        }
    }, []);

    if (isLoading) {
        return (
          <div>Loading...</div>
        );
    } else {
      return (
          <div className="main-container">
          <TextField givenWords={text}/>
          <Keyboard />
        </div>    
      );
    }
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
      <App />
  </StrictMode>,
) 