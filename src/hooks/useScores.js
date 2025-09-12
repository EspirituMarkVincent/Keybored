import { useState, useEffect } from "react";

function useLocalStorage(key, initialValue) {
    const [value, setValue] = useState(() => {
        const saved = localStorage.getItem(key);
        return saved !== null ? JSON.parse(saved) : initialValue;
    });

    useEffect(() => {
        localStorage.setItem(key, JSON.stringify(value));
    }, [key, value]);

    return [value, setValue];
}

export default function useScores() {
    const [scores, setScores] = useLocalStorage("scores", []);

    const saveScore = (newScore) => {
        setScores((prev) => [...prev, newScore]);
    };

    return { scores, saveScore };
}
