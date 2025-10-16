import React, { useEffect, useState } from "react";
import "../styles/main.css";

export default function Scores({ onClose }) {
  const [scoreList, setScoreList] = useState([]);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const loadScores = () => {
      const storedScores =
        JSON.parse(localStorage.getItem("local-scores")) || [];
      setScoreList(storedScores);
    };
    loadScores();

    // Delay visibility to prevent flicker
    const visibilityTimer = setTimeout(() => setIsVisible(true), 100);

    const intervalId = setInterval(loadScores, 500);
    const handleStorageChange = (e) => {
      if (e.key === "local-scores") {
        loadScores();
      }
    };
    window.addEventListener("storage", handleStorageChange);
    return () => {
      clearTimeout(visibilityTimer);
      clearInterval(intervalId);
      window.removeEventListener("storage", handleStorageChange);
    };
  }, []);

  return (
    <div
      className="min-h-screen flex flex-col transition-opacity duration-300"
      style={{ opacity: isVisible ? 1 : 0 }}
    >
      {/* <div className="p-6">
        <button
          onClick={onClose}
          className="flex items-center gap-2 px-6 py-3 rounded-lg bg-bg-secondary hover:bg-bg-tertiary
                    transition-colors text-text-primary font-semibold text-lg"
        >
          Back
        </button>
      </div> */}

      <div className="flex-1 px-6 pb-6">
        <div className="max-w-5xl mx-auto">
          <h1 className="text-4xl font-bold mb-6 text-center text-text-primary">
            Scores
          </h1>

          {scoreList.length > 0 ? (
            <div className="rounded-xl overflow-hidden border-4 border-bg-tertiary bg-bg-secondary">
              <table className="w-full text-center">
                <thead className="sticky top-0 bg-bg-tertiary text-text-primary">
                  <tr>
                    <th className="p-4 text-lg">#</th>
                    <th className="p-4 text-lg">WPM</th>
                    <th className="p-4 text-lg">Accuracy</th>
                    <th className="p-4 text-lg">Mode</th>
                    <th className="p-4 text-lg">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {[...scoreList]
                    .sort((a, b) => new Date(b.date) - new Date(a.date))
                    .map((score, index) => (
                      <tr
                        key={index}
                        className="hover:bg-bg-primary transition-colors"
                      >
                        <td className="p-4 text-text-secondary text-lg">
                          {index + 1}
                        </td>
                        <td className="p-4 font-bold text-2xl text-color-correct">
                          {score.wpm}
                        </td>
                        <td className="p-4 text-text-secondary text-lg">
                          {score.accuracy}%
                        </td>
                        <td className="p-4 text-text-secondary text-lg">
                          {score.mode === "words"
                            ? `${score.goal} Words`
                            : score.mode === "time"
                            ? `${score.goal} Seconds`
                            : ""}
                        </td>
                        <td className="p-4 text-text-secondary">
                          {new Date(score.date).toLocaleDateString("en-US", {
                            year: "numeric",
                            month: "2-digit",
                            day: "2-digit",
                          })}{" "}
                          {new Date(score.date).toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="flex items-center justify-center h-64 bg-bg-secondary rounded-xl">
              <p className="text-center text-text-secondary italic text-xl">
                No scores yet. Start typing to record your first score!
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
