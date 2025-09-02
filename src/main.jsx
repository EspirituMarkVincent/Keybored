import { useState, useRef, useEffect } from "react";
import { createRoot } from "react-dom/client";
import Keyboard from "./Keyboard";
import TextField from "./Text_field";
import { GetInput } from "./Get_input";

function App() {
    const letterRefs = useRef({});
    const wordRefs = useRef({});
    const wpmRefs = useRef(null);
    const timeRefs = useRef(null);

    const [text, setText] = useState("");
    const [loading, setLoading] = useState(true);
    const [isFocused, setIsFocused] = useState(false);

    const [gameModeSettings, setGameModeSettings] = useState({
        mode: "time",
        timeGoal: 15,
        wordGoal: 10,
    });

    const [isFinished, setIsFinished] = useState(false);

    const [score, setScore] = useState({
        wordScore: 0,
        totalWords: 0,
        letterScore: 0,
        totalLetters: 0,
        wordWPM: 0,
        standardWPM: 0,
        accuracy: 0,
    });

    function getText() {
        setLoading(true);
        fetch("https://random-word-api.vercel.app/api?words=500")
            .then((r) => r.json())
            .then((data) => setText(data.join(" ")))
            .catch(() => setText(localText.join(" ")))
            .finally(() => setLoading(false));
    }

    function restartText() {
        getText();

        setIsFinished(false);
        setIsFocused(false);

        setScore({
            wordScore: 0,
            totalWords: 0,
            letterScore: 0,
            totalLetters: 0,
            wordWPM: 0,
            standardWPM: 0,
            accuracy: 0,
        });
    }

    useEffect(() => {
        getText();
    }, []);

    const firstRun = useRef(true);
    useEffect(() => {
        if (firstRun.current) {
            firstRun.current = false;
            return;
        }
        restartText();
    }, [gameModeSettings]);

    return (
        <div className="main-container">
            <div className="gameModeSelection">
                <button
                    className={`gameMode ${gameModeSettings.mode === "time" ? "active" : ""}`}
                    onClick={() => setGameModeSettings((prev) => ({ ...prev, mode: "time" }))}
                >
                    Time
                </button>
                {gameModeSettings.mode === "time" && (
                    <>
                        <button
                            className="gameMode timeBtn"
                            onClick={() =>
                                setGameModeSettings((prev) => ({
                                    ...prev,
                                    timeGoal: 15,
                                }))
                            }
                        >
                            15
                        </button>
                        <button
                            className="gameMode timeBtn"
                            onClick={() =>
                                setGameModeSettings((prev) => ({
                                    ...prev,
                                    timeGoal: 30,
                                }))
                            }
                        >
                            30
                        </button>
                        <button
                            className="gameMode timeBtn"
                            onClick={() =>
                                setGameModeSettings((prev) => ({
                                    ...prev,
                                    timeGoal: 60,
                                }))
                            }
                        >
                            60
                        </button>
                    </>
                )}
                <button
                    className={`gameMode ${gameModeSettings.mode === "words" ? "active" : ""}`}
                    onClick={() => setGameModeSettings((prev) => ({ ...prev, mode: "words" }))}
                >
                    Words
                </button>
                {gameModeSettings.mode === "words" && (
                    <>
                        <button
                            className="gameMode wordsBtn"
                            onClick={() =>
                                setGameModeSettings((prev) => ({
                                    ...prev,
                                    wordGoal: 10,
                                }))
                            }
                        >
                            10
                        </button>
                        <button
                            className="gameMode wordsBtn"
                            onClick={() =>
                                setGameModeSettings((prev) => ({
                                    ...prev,
                                    wordGoal: 20,
                                }))
                            }
                        >
                            20
                        </button>
                        <button
                            className="gameMode wordsBtn"
                            onClick={() =>
                                setGameModeSettings((prev) => ({
                                    ...prev,
                                    wordGoal: 30,
                                }))
                            }
                        >
                            30
                        </button>
                    </>
                )}
                <button className="gameMode newTextBtn" onClick={restartText}>
                    New Text
                </button>
            </div>

            <TextField text={text} letterRefs={letterRefs} wordRefs={wordRefs} />

            <GetInput
                text={text}
                letterRefs={letterRefs}
                wordRefs={wordRefs}
                wpmRefs={wpmRefs}
                timeRefs={timeRefs}
                onFocusChange={setIsFocused}
                gameModeSettings={gameModeSettings}
                isFinished={isFinished}
                setIsFinished={setIsFinished}
                score={score}
                setScore={setScore}
            />

            {isFinished ? (
                <>
                    <div className="gameResult">Game Result </div>
                    <div className="gameResult">WPM: {score.standardWPM}</div>
                    <div className="gameResult">Accuracy: {score.accuracy}</div>
                </>
            ) : (
                <Keyboard isFocused={isFocused} />
            )}
        </div>
    );
}

export const localText = [
    "apple",
    "ape",
    "axiom",
    "amber",
    "aroma",
    "braid",
    "baker",
    "banks",
    "barge",
    "bases",
    "cable",
    "cache",
    "cakes",
    "calls",
    "camps",
    "dance",
    "darts",
    "dates",
    "dawns",
    "deals",
    "eagle",
    "eases",
    "eaten",
    "edges",
    "eject",
    "flute",
    "fable",
    "fancy",
    "fence",
    "finds",
    "glide",
    "gnome",
    "graft",
    "grain",
    "grape",
    "honey",
    "hound",
    "house",
    "haste",
    "haven",
    "igloo",
    "icy",
    "image",
    "inch",
    "index",
    "jelly",
    "jade",
    "jaguar",
    "jawed",
    "jests",
    "kite",
    "knot",
    "knead",
    "knell",
    "knock",
    "lance",
    "lark",
    "laser",
    "latch",
    "lauds",
    "mango",
    "mere",
    "mesh",
    "mice",
    "might",
    "nerve",
    "nest",
    "night",
    "nile",
    "ninth",
    "ocean",
    "oath",
    "olive",
    "omen",
    "onion",
    "pulse",
    "pain",
    "paint",
    "pales",
    "pants",
    "queen",
    "quake",
    "quark",
    "quay",
    "quest",
    "ranch",
    "rave",
    "raven",
    "rays",
    "reach",
    "sage",
    "sail",
    "sake",
    "sale",
    "says",
    "tiger",
    "tale",
    "tame",
    "tape",
    "task",
    "umpire",
    "used",
    "user",
    "utah",
    "utopia",
    "vase",
    "vast",
    "vial",
    "vice",
    "view",
    "wagon",
    "wail",
    "wane",
    "warp",
    "wash",
    "xray",
    "xylem",
    "xylo",
    "xyris",
    "xyst",
    "yacht",
    "yale",
    "yard",
    "yarn",
    "yeast",
    "zest",
    "zing",
    "zion",
    "zips",
    "zones",
];
localText.sort(() => Math.random() - 0.5);

createRoot(document.getElementById("root")).render(<App />);
