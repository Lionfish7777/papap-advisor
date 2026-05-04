import React from 'react';
import ReadReceipt from './ReadReceipt';
import './MessageBubble.css';

function MessageBubble({ role, content, attachments, isLast }) {
  const isPapap = role === 'papap';

  return (
    <div className={`message-wrapper ${isPapap ? 'papap' : 'user'}`}>
      {isPapap && <div className="bubble-avatar">P</div>}
      <div className="bubble-content">
        <div className={`bubble ${isPapap ? 'bubble-papap' : 'bubble-user'}`}>
          {!isPapap && attachments && attachments.length > 0 && (
            <div className="bubble-attachments">
              {attachments.map(att => (
                att.isImage
                  ? <img key={att.id} src={att.preview} alt={att.name} className="bubble-image" />
                  : <span key={att.id} className="bubble-file-chip">📄 {att.name}</span>
              ))}
            </div>
          )}
          {content}
        </div>
        {isLast && isPapap && <ReadReceipt />}
      </div>
    </div>
  );
}

export default MessageBubble;
