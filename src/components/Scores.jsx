import React, { useEffect, useState } from 'react';

export default function Scores() {
    const [scoreList, setScoreList] = useState([]);

    useEffect(() => {
        const storedScores = JSON.parse(localStorage.getItem("local-scores")) || [];
        setScoreList(storedScores);
        console.log(storedScores);
    }, []);

    return (
        <div>
            {JSON.stringify(scoreList)}
        </div>
    );
}