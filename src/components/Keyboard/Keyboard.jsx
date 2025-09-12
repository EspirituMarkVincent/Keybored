import { useEffect, useState } from "react";
import useSettings from "../../hooks/useSettings";
import "./Keyboard.css";

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
    q: { label: "Q", size: "60px", shifted: "Q" },
    w: { label: "W", size: "60px", shifted: "W" },
    e: { label: "E", size: "60px", shifted: "E" },
    r: { label: "R", size: "60px", shifted: "R" },
    t: { label: "T", size: "60px", shifted: "T" },
    y: { label: "Y", size: "60px", shifted: "Y" },
    u: { label: "U", size: "60px", shifted: "U" },
    i: { label: "I", size: "60px", shifted: "I" },
    o: { label: "O", size: "60px", shifted: "O" },
    p: { label: "P", size: "60px", shifted: "P" },
    a: { label: "A", size: "60px", shifted: "A" },
    s: { label: "S", size: "60px", shifted: "S" },
    d: { label: "D", size: "60px", shifted: "D" },
    f: { label: "F", size: "60px", shifted: "F" },
    g: { label: "G", size: "60px", shifted: "G" },
    h: { label: "H", size: "60px", shifted: "H" },
    j: { label: "J", size: "60px", shifted: "J" },
    k: { label: "K", size: "60px", shifted: "K" },
    l: { label: "L", size: "60px", shifted: "L" },
    z: { label: "Z", size: "60px", shifted: "Z" },
    x: { label: "X", size: "60px", shifted: "X" },
    c: { label: "C", size: "60px", shifted: "C" },
    v: { label: "V", size: "60px", shifted: "V" },
    b: { label: "B", size: "60px", shifted: "B" },
    n: { label: "N", size: "60px", shifted: "N" },
    m: { label: "M", size: "60px", shifted: "M" },
    1: { label: "1", size: "60px", shifted: "!" },
    2: { label: "2", size: "60px", shifted: "@" },
    3: { label: "3", size: "60px", shifted: "#" },
    4: { label: "4", size: "60px", shifted: "$" },
    5: { label: "5", size: "60px", shifted: "%" },
    6: { label: "6", size: "60px", shifted: "^" },
    7: { label: "7", size: "60px", shifted: "&" },
    8: { label: "8", size: "60px", shifted: "*" },
    9: { label: "9", size: "60px", shifted: "(" },
    0: { label: "0", size: "60px", shifted: ")" },
    "-": { label: "-", size: "60px", shifted: "_" },
    "=": { label: "=", size: "60px", shifted: "+" },
    "[": { label: "[", size: "60px", shifted: "{" },
    "]": { label: "]", size: "60px", shifted: "}" },
    "\\": { label: "\\", size: "120px", shifted: "|" },
    ";": { label: ";", size: "60px", shifted: ":" },
    "'": { label: "'", size: "60px", shifted: '"' },
    ",": { label: ",", size: "60px", shifted: "<" },
    ".": { label: ".", size: "60px", shifted: ">" },
    "/": { label: "/", size: "60px", shifted: "?" },
};

const rows = [
    ["Escape", "1", "2", "3", "4", "5", "6", "7", "8", "9", "0", "-", "=", "Backspace"],
    ["Tab", "q", "w", "e", "r", "t", "y", "u", "i", "o", "p", "[", "]", "\\"],
    ["CapsLock", "a", "s", "d", "f", "g", "h", "j", "k", "l", ";", "'", "Enter"],
    ["ShiftLeft", "z", "x", "c", "v", "b", "n", "m", ",", ".", "/", "ShiftRight"],
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

// Removed props for keyboard visibility and container
export default function Keyboard({ isUserTyping = true }) {
    // Access settings directly from the hook
    const { settings } = useSettings();
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
        const isLetter = /^[a-zA-Z]+$/.test(key);
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
        if (!isUserTyping || !settings.keyboard.highlightKeys) return false;

        const data = keyData[key];
        if (!data) return false;

        if (pressedKey[key]) {
            return true;
        }

        if (data.shifted) {
            const letterCode = `Key${key.toUpperCase()}`;
            const digitCode = `Digit${key}`;
            return pressedKey[letterCode] || pressedKey[digitCode];
        }

        return false;
    };

    return (
        <>
            <div
                // Now using settings.keyboard.visible directly
                className={`grid-board ${settings.keyboard.visible ? "" : "hidden"}`}
                style={{
                    // Now using settings.keyboard.container directly
                    ...(settings.keyboard.container
                        ? {}
                        : { background: "none", boxShadow: "none", border: "none" }),
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