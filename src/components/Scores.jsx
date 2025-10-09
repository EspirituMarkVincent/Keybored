import React, { useEffect, useState } from "react";
import "../styles/main.css";

export default function Scores() {
  const [scoreList, setScoreList] = useState([]);

  useEffect(() => {
    const storedScores = JSON.parse(localStorage.getItem("local-scores")) || [];
    setScoreList(storedScores);
    console.log(storedScores);
  }, []);

  return (
    <div className="p-4 grid grid-cols-1">
      <h2 className="text-2xl font-bold mb-4">Scores</h2>
      {scoreList.length > 0 ? (
        <ul className="space-y-2">
          {scoreList.map((score, index) => (
            <li key={index} className="p-3 bg-bg-secondary rounded-lg">
              <div>
                Score: {score.wpm} | Accuracy: {score.accuracy}% | Date:{" "}
                {score.date} | Mode: {score.goal}-{score.mode}
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <p>No scores yet</p>
      )}
    </div>
  );
}
