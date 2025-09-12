// src/main.jsx
import { useState, useEffect, StrictMode } from "react";
import { createRoot } from "react-dom/client";
import Keyboard from "./components/Keyboard";
import TextField from "./components/Text_field";
import SettingsUI from "./components/Settings";
import useGameLogic from "./hooks/useGameLogic";
import "./styles/main.css";
import "./styles/Keyboard.css";
import "./styles/Settings.css";
import "./styles/Text_field.css";

function App() {
	const {
		cursorPos,
		words,
		gameModeSettings,
		setGameModeSettings,
		input,
		inputRef,
		wordIndex,
		typedHistory,
		isFinished,
		timer,
		score,
		isUserTyping,
		setIsUserTyping,
		resetEverything,
		restartText,
		handleInputChange,
		handleKeyDown,
	} = useGameLogic();

	const [darkMode, setDarkMode] = useState(false);
	const [isKeyboardActive, setIsKeyboardActive] = useState(true);
	const [isSettingsOpen, setIsSettingsOpen] = useState(false);
	const [showKeyboardContainer, setShowKeyboardContainer] = useState(true);
	const [showTextContainer, setShowTextContainer] = useState(true);
	const [showInputField, setShowInputField] = useState(false);

	useEffect(() => {
		if (darkMode) {
			document.body.classList.add("dark-mode");
		} else {
			document.body.classList.remove("dark-mode");
		}
	}, [darkMode]);

	return (
		<>
			<SettingsUI
				isOpen={isSettingsOpen}
				onClose={() => setIsSettingsOpen(false)}
			/>

			<div className="header-container">
				<div className="header-txt">Keybored</div>
				<div className="divider"></div>
				<button
					className="theme-toggle-btn header-btn"
					onClick={() => setDarkMode((prev) => !prev)}
				>
					{darkMode ? "🌒" : "🌙"}
				</button>
				<button
					className="keyboard-toggle-btn header-btn"
					onClick={() => setIsKeyboardActive((prev) => !prev)}
				>
					⌨️
				</button>
				<button
					className="settings-btn header-btn"
					onClick={() => setIsSettingsOpen((prev) => !prev)}
				>
					⚙️
				</button>
			</div>
			<div className="main-container">
				<div className="menu-top">
					<div className="gameModeSelection">
						<button
							className={`game-mode-btn ${
								gameModeSettings.mode === "time" ? "active" : ""
							}`}
							onClick={() =>
								setGameModeSettings((prev) => ({ ...prev, mode: "time" }))
							}
						>
							Time
						</button>
						{gameModeSettings.mode === "time" && (
							<>
								{[15, 30, 60].map((t) => (
									<button
										key={t}
										className="game-mode-btn timeBtn"
										onClick={() =>
											setGameModeSettings((prev) => ({
												...prev,
												timeGoal: t,
											}))
										}
									>
										{t}
									</button>
								))}
							</>
						)}
						<button
							className={`game-mode-btn ${
								gameModeSettings.mode === "words" ? "active" : ""
							}`}
							onClick={() =>
								setGameModeSettings((prev) => ({
									...prev,
									mode: "words",
								}))
							}
						>
							Words
						</button>
						{gameModeSettings.mode === "words" && (
							<>
								{[10, 20, 30].map((w) => (
									<button
										key={w}
										className="game-mode-btn wordsBtn"
										onClick={() =>
											setGameModeSettings((prev) => ({
												...prev,
												wordGoal: w,
											}))
										}
									>
										{w}
									</button>
								))}
							</>
						)}
						<button
							className="game-mode-btn newTextBtn"
							onClick={restartText}
						>
							New Text
						</button>
					</div>
				</div>

				<TextField
					words={words}
					currentWordIndex={wordIndex}
					userInput={input}
					typedHistory={typedHistory}
					cursorPos={cursorPos}
					showTextContainer={showTextContainer}
				/>

				<div className="form-group">
					<input
						className={`input-field ${showInputField ? "hidden" : ""}`}
						type="text"
						value={input}
						ref={inputRef}
						onChange={handleInputChange}
						disabled={isFinished}
						onFocus={() => setIsUserTyping(true)}
						onBlur={() => setIsUserTyping(false)}
						autoFocus
						onKeyDown={(e) => {
							if (
								[
									"ArrowLeft",
									"ArrowRight",
									"ArrowUp",
									"ArrowDown",
									"Home",
									"End",
								].includes(e.key)
							) {
								e.preventDefault();
								return;
							}
							handleKeyDown(e);
						}}
						onMouseDown={(e) => {
							if (isUserTyping) e.preventDefault();
							e.target.setSelectionRange(
								e.target.value.length,
								e.target.value.length
							);
						}}
						onSelect={(e) => {
							e.target.setSelectionRange(
								e.target.value.length,
								e.target.value.length
							);
						}}
					/>
					<div className="stat-box wpm">{score.standardWPM} WPM</div>
					<div className="stat-box time">
						{gameModeSettings.mode === "time"
							? `${timer}s`
							: `${wordIndex}/${gameModeSettings.wordGoal}`}
					</div>
					<div
						className="stat-box reset-button"
						onClick={resetEverything}
					>
						Reset
					</div>
				</div>

				{isFinished ? (
					<div className="game-result-container">
						<div className="result">Game Result</div>
						<div className="result">WPM: {score.standardWPM}</div>
						<div className="result">
							Accuracy: {score.accuracy}%
						</div>
					</div>
				) : (
					<Keyboard
						isUserTyping={isUserTyping}
						isKeyboardActive={isKeyboardActive}
						showKeyboardContainer={showKeyboardContainer}
					/>
				)}
			</div>
		</>
	);
}

createRoot(document.getElementById("root")).render(
	<StrictMode>
		<App />
	</StrictMode>
);