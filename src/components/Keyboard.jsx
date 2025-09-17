import { useEffect, useState } from "react";

const keyData = {
    Escape: { label: "Esc", size: "60px" },
    Tab: { label: "Tab", size: "100px" },
    Backspace: { label: "Backspace", size: "150px" },
    CapsLock: { label: "Caps", size: "120px" },
    Enter: { label: "Enter", size: "160px" },
    ShiftLeft: { label: "Shift", size: "160px" },
    ShiftRight: { label: "Shift", size: "180px" },
    ControlLeft: { label: "Ctrl", size: "70px" },
    ControlRight: { label: "Ctrl", size: "70px" },
    AltLeft: { label: "Alt", size: "70px" },
    AltRight: { label: "Alt", size: "70px" },
    MetaLeft: { label: "Win", size: "70px" },
    ContextMenu: { label: "Menu", size: "70px" },
    Fn: { label: "Fn", size: "70px" },
    Space: { label: "Space", size: "470px" },
    KeyQ: { label: "Q", size: "60px", shifted: "Q" },
    KeyW: { label: "W", size: "60px", shifted: "W" },
    KeyE: { label: "E", size: "60px", shifted: "E" },
    KeyR: { label: "R", size: "60px", shifted: "R" },
    KeyT: { label: "T", size: "60px", shifted: "T" },
    KeyY: { label: "Y", size: "60px", shifted: "Y" },
    KeyU: { label: "U", size: "60px", shifted: "U" },
    KeyI: { label: "I", size: "60px", shifted: "I" },
    KeyO: { label: "O", size: "60px", shifted: "O" },
    KeyP: { label: "P", size: "60px", shifted: "P" },
    KeyA: { label: "A", size: "60px", shifted: "A" },
    KeyS: { label: "S", size: "60px", shifted: "S" },
    KeyD: { label: "D", size: "60px", shifted: "D" },
    KeyF: { label: "F", size: "60px", shifted: "F" },
    KeyG: { label: "G", size: "60px", shifted: "G" },
    KeyH: { label: "H", size: "60px", shifted: "H" },
    KeyJ: { label: "J", size: "60px", shifted: "J" },
    KeyK: { label: "K", size: "60px", shifted: "K" },
    KeyL: { label: "L", size: "60px", shifted: "L" },
    KeyZ: { label: "Z", size: "60px", shifted: "Z" },
    KeyX: { label: "X", size: "60px", shifted: "X" },
    KeyC: { label: "C", size: "60px", shifted: "C" },
    KeyV: { label: "V", size: "60px", shifted: "V" },
    KeyB: { label: "B", size: "60px", shifted: "B" },
    KeyN: { label: "N", size: "60px", shifted: "N" },
    KeyM: { label: "M", size: "60px", shifted: "M" },
    Digit1: { label: "1", size: "60px", shifted: "!" },
    Digit2: { label: "2", size: "60px", shifted: "@" },
    Digit3: { label: "3", size: "60px", shifted: "#" },
    Digit4: { label: "4", size: "60px", shifted: "$" },
    Digit5: { label: "5", size: "60px", shifted: "%" },
    Digit6: { label: "6", size: "60px", shifted: "^" },
    Digit7: { label: "7", size: "60px", shifted: "&" },
    Digit8: { label: "8", size: "60px", shifted: "*" },
    Digit9: { label: "9", size: "60px", shifted: "(" },
    Digit0: { label: "0", size: "60px", shifted: ")" },
    Minus: { label: "-", size: "60px", shifted: "_" },
    Equal: { label: "=", size: "60px", shifted: "+" },
    BracketLeft: { label: "[", size: "60px", shifted: "{" },
    BracketRight: { label: "]", size: "60px", shifted: "}" },
    Backslash: { label: "\\", size: "120px", shifted: "|" },
    Semicolon: { label: ";", size: "60px", shifted: ":" },
    Quote: { label: "'", size: "60px", shifted: '"' },
    Comma: { label: ",", size: "60px", shifted: "<" },
    Period: { label: ".", size: "60px", shifted: ">" },
    Slash: { label: "/", size: "60px", shifted: "?" },
};

const rows = [
    ["Escape", "Digit1", "Digit2", "Digit3", "Digit4", "Digit5", "Digit6", "Digit7", "Digit8", "Digit9", "Digit0", "Minus", "Equal", "Backspace"],
    ["Tab", "KeyQ", "KeyW", "KeyE", "KeyR", "KeyT", "KeyY", "KeyU", "KeyI", "KeyO", "KeyP", "BracketLeft", "BracketRight", "Backslash"],
    ["CapsLock", "KeyA", "KeyS", "KeyD", "KeyF", "KeyG", "KeyH", "KeyJ", "KeyK", "KeyL", "Semicolon", "Quote", "Enter"],
    ["ShiftLeft", "KeyZ", "KeyX", "KeyC", "KeyV", "KeyB", "KeyN", "KeyM", "Comma", "Period", "Slash", "ShiftRight"],
    [
        "ControlLeft",
        "MetaLeft",
        "AltLeft",
        "Space",
        "AltRight",
        "Fn",
        "ContextMenu",
        "ControlRight",
    ],
];

export default function Keyboard({
    isUserTyping = true,
    isKeyboardActive = true,
    showKeyboardContainer = true,
    onlyLetters = false,
}) {
    const [pressedKey, setPressedKey] = useState({});
    const [isShiftPressed, setIsShiftPressed] = useState(false);
    const [isCapsLockOn, setIsCapsLockOn] = useState(false);

    useEffect(() => {
        if (!isUserTyping) {
            setPressedKey({});
            setIsShiftPressed(false);
        }
        const handleKeyDown = (e) => {
            const code = e.code;
            setIsCapsLockOn(e.getModifierState("CapsLock"));
            if (e.key === "Shift") {
                setIsShiftPressed(true);
            }
            setPressedKey((prev) => ({ ...prev, [code]: true }));
        };

        const handleKeyUp = (e) => {
            const code = e.code;
            setIsCapsLockOn(e.getModifierState("CapsLock"));

            if (e.key === "Shift") {
                setIsShiftPressed(false);
            }
            setPressedKey((prev) => ({ ...prev, [code]: false }));
        };
        window.addEventListener("keydown", handleKeyDown);
        window.addEventListener("keyup", handleKeyUp);

        return () => {
            window.removeEventListener("keydown", handleKeyDown);
            window.removeEventListener("keyup", handleKeyUp);
        };
    }, [isUserTyping]);

    const getDisplayLabel = (key) => {
        const data = keyData[key];
        const isLetter = key.startsWith('Key');
        if (!data) return key;

        if (isShiftPressed && data.shifted) {
            if (isLetter && isCapsLockOn) {
                return data.shifted.toLowerCase();
            }
            return data.shifted;
        }

        if (!isCapsLockOn && data.shifted && isLetter) {
            return data.shifted.toLowerCase();
        }

        return data.label;
    };

    const isKeyHighlighted = (key) => {
        if (!isUserTyping) return false;

        const data = keyData[key];
        if (!data) return false;

        // Check if the specific physical key is pressed.
        return pressedKey[key];
    };

    const hideObject = {
        position: "absolute",
        opacity: 0,
        pointerEvents: "none",
        height: 0,
        width: 0,
    };

    return (
        <>
            <div
                className={`grid-board ${isKeyboardActive ? "" : "hidden"}`}
                style={{
                    ...(showKeyboardContainer
                        ? {}
                        : { background: "none", boxShadow: "none", border: "none", padding: "0px"}),
                }}
            >
                {rows.map((row, rowIndex) => (
                    <div key={rowIndex} className="grid-row">
                        {row.map((key, keyIndex) => (
                            <button
                                key={keyIndex}
                                className={`grid-key ${isKeyHighlighted(key) ? "pressed" : ""}`}
                                style={{ width: keyData[key]?.size || "60px" }}
                            >
                                {getDisplayLabel(key)}
                            </button>
                        ))}
                    </div>
                ))}
            </div>
        </>
    );
}