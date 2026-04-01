import { useEffect, useState } from "react";

export default function DailyQuote() {
  const [quote, setQuote] = useState("");
  const [usedQuotes, setUsedQuotes] = useState([]);

  useEffect(() => {
    loadNewQuote();
  }, []);

  const loadNewQuote = () => {
    fetch("/api/quotes")
      .then(res => res.json())
      .then(data => {
        // Filter out recently used quotes
        const availableQuotes = data.filter(q => !usedQuotes.includes(q));
        
        // If all quotes have been used, reset the used quotes list
        let randomQuote;
        if (availableQuotes.length === 0) {
          setUsedQuotes([]);
          randomQuote = data[Math.floor(Math.random() * data.length)];
        } else {
          randomQuote = availableQuotes[Math.floor(Math.random() * availableQuotes.length)];
        }
        
        setQuote(randomQuote);
        
        // Add to used quotes (keep only last 15)
        setUsedQuotes(prev => {
          const newUsed = [...prev, randomQuote];
          return newUsed.length > 15 ? newUsed.slice(1) : newUsed;
        });
      });
  };

  const shuffleQuote = () => {
    loadNewQuote();
  };

  return (
    <div className="quote-card">
      <h2>💫 Daily Motivation</h2>
      <div className="quote-content">
        "{quote || "Loading quote..."}"
      </div>
      <div className="action-buttons">
        <button className="shuffle-btn" onClick={shuffleQuote}>
          ✨ New Quote
        </button>
      </div>
      <div className="quote-tip">
        Need inspiration? Save this quote to your journal!
      </div>
    </div>
  );
}