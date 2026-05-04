import React from 'react';
import './TypingIndicator.css';

function TypingIndicator() {
  return (
    <div className="typing-wrapper">
      <div className="typing-avatar">P</div>
      <div className="typing-bubble">
        <span className="dot" />
        <span className="dot" />
        <span className="dot" />
      </div>
    </div>
  );
}

export default TypingIndicator;
