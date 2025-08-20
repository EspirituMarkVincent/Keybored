import { useEffect, useState } from "react";
import { rows, setKeySize } from "./Keys";
import './style.css';

export default function Keyboard({ isFocused }) {
    const [pressedKey, setPressedKey] = useState({});

    useEffect(() => {
        const handleKeyDown = (e) => {
            if (!isFocused) return;
            const key = e.key;
            setPressedKey((prev) => ({ ...prev, [key]: true }));
        };

        const handleKeyUp = (e) => {
            if (!isFocused) return;
            const key = e.key;
            setPressedKey((prev) => ({ ...prev, [key]: false }));
        };

        window.addEventListener("keydown", handleKeyDown);
        window.addEventListener("keyup", handleKeyUp);
        return () => {
            window.removeEventListener("keydown", handleKeyDown);
            window.removeEventListener("keyup", handleKeyUp);
        };
    }, [isFocused]);

    const isKeyPressed = (key) => {
        if (!isFocused) return false;
        const keys = key.key;
        if (Array.isArray(keys)) {
            return keys.some((k) => pressedKey[k]);
        } else if (key.key === 'ShiftLeft' || key.key === 'ShiftRight') {
            return pressedKey['Shift'];
        } else {
            return pressedKey[keys];
        }
    };

    return (
        <div className="grid-board">
            {rows.map((row, rowIndex) => (
                <div key={rowIndex} className="grid-row">
                    {row.map((key, keyIndex) => (
                        <button
                            key={keyIndex}
                            className={`grid-key ${isKeyPressed(key) ? "pressed" : ""}`}
                            style={{ width: setKeySize(key).size }}
                        >
                            {key.label}
                        </button>
                    ))}
                </div>
            ))}
        </div>
    );
}
