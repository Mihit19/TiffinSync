import React, { useEffect, useState } from 'react';
import '../App.css';

export default function Loader() {
  const [letters, setLetters] = useState([]);
  const word = "TiffinSync";
  
  useEffect(() => {
    // Animate letters one by one
    const timer = setTimeout(() => {
      const lettersArray = [];
      for (let i = 0; i < word.length; i++) {
        setTimeout(() => {
          lettersArray.push(word[i]);
          setLetters([...lettersArray]);
        }, i * 150);
      }
    }, 500);

    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="loader">
      <div className="logo-animation">
        {/* Animated letters */}
        <div className="word-container">
          {letters.map((letter, index) => (
            <span 
              key={index} 
              className="letter"
              style={{ animationDelay: `${index * 0.05}s` }}
            >
              {letter}
            </span>
          ))}
        </div>
        
        {/* Tiffin stack that forms after text animation */}
        {letters.length === word.length && (
          <div className="tiffin-stack">
            <div className="tiffin-top"></div>
            <div className="tiffin-middle"></div>
            <div className="tiffin-bottom"></div>
          </div>
        )}
      </div>
      
      <p className="loading-text">Loading your tiffin experience...</p>
    </div>
  );
}