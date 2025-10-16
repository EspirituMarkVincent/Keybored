import React, { useEffect, useState } from "react";
import "../styles/main.css";

export default function Scores() {
  const [scoreList, setScoreList] = useState([]);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const loadScores = () => {
      const storedScores = JSON.parse(localStorage.getItem("local-scores")) || [];
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
      className="p-6 bg-bg-secondary rounded-xl max-w-3xl mx-auto mt-3 transition-opacity duration-300 min-h-[280px]"
      style={{ opacity: isVisible ? 1 : 0 }}
    >
      <h2 className="text-2xl font-bold mb-4 text-center text-text-primary">
        Scores
      </h2>

      {scoreList.length > 0 ? (
        <div className="max-h-[200px] overflow-y-auto overflow-x-auto rounded-lg border-4 border-bg-tertiary">
          <table className="table-fixed w-full text-center">
            <thead className="sticky top-0 bg-bg-tertiary text-text-primary">
              <tr>
                <th className="p-3 w-1/12">#</th>
                <th className="p-3 w-2/12">WPM</th>
                <th className="p-3 w-2/12">Accuracy</th>
                <th className="p-3 w-2/12">Mode</th>
                <th className="p-3 w-5/12">Date</th>
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
                    <td className="p-3 text-text-secondary truncate">
                      {index + 1}
                    </td>
                    <td className="p-3 font-semibold text-color-correct-color truncate">
                      {score.wpm}
                    </td>
                    <td className="p-3 text-text-secondary truncate">
                      {score.accuracy}%
                    </td>
                    <td className="p-3 text-text-secondary truncate">
                      {score.mode === "words"
                        ? `${score.goal} Words`
                        : score.mode === "time"
                        ? `${score.goal} Seconds`
                        : ""}
                    </td>
                    <td className="p-3 text-text-secondary truncate">
                      {new Date(score.date).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "2-digit",
                        day: "2-digit",
                      })}{(" ")}
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
        <p className="text-center text-text-secondary italic">No scores yet</p>
      )}
    </div>
  );
}