import React, { useState, useRef, useEffect } from 'react';
import './ChatInput.css';

function ChatInput({ onSend, isTyping }) {
  const [text, setText] = useState('');
  const [attachments, setAttachments] = useState([]);
  const [isListening, setIsListening] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const textareaRef = useRef(null);
  const fileInputRef = useRef(null);
  const recognitionRef = useRef(null);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height =
        Math.min(textareaRef.current.scrollHeight, 120) + 'px';
    }
  }, [text]);

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleSend = () => {
    if ((!text.trim() && attachments.length === 0) || isTyping) return;
    onSend(text, attachments);
    setText('');
    setAttachments([]);
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
  };

  // ── Voice input ──────────────────────────────────────────────
  const toggleListening = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert('Speech recognition requires Chrome or Edge');
      return;
    }

    if (isListening) {
      recognitionRef.current?.stop();
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = true;
    recognition.lang = 'en-US';

    recognition.onstart = () => setIsListening(true);

    recognition.onresult = (e) => {
      let transcript = '';
      for (let i = e.resultIndex; i < e.results.length; i++) {
        transcript += e.results[i][0].transcript;
      }
      setText(transcript);
    };

    recognition.onend = () => setIsListening(false);
    recognition.onerror = () => setIsListening(false);

    recognitionRef.current = recognition;
    recognition.start();
  };

  // ── File processing ──────────────────────────────────────────
  const processFiles = (fileList) => {
    const MAX_SIZE = 20 * 1024 * 1024;
    Array.from(fileList).forEach((file) => {
      if (file.size > MAX_SIZE) {
        alert(`${file.name} is too large (max 20MB)`);
        return;
      }

      const isImage = file.type.startsWith('image/');
      const isText = file.type === 'text/csv' || file.type === 'text/plain' ||
        file.name.endsWith('.csv') || file.name.endsWith('.txt');

      if (isImage) {
        const reader = new FileReader();
        reader.onload = (e) => {
          const dataUrl = e.target.result;
          const base64 = dataUrl.split(',')[1];
          setAttachments(prev => [...prev, {
            id: `att-${Date.now()}-${Math.random()}`,
            name: file.name,
            type: file.type,
            mediaType: file.type,
            isImage: true,
            data: base64,
            preview: dataUrl
          }]);
        };
        reader.readAsDataURL(file);
      } else if (isText) {
        const reader = new FileReader();
        reader.onload = (e) => {
          setAttachments(prev => [...prev, {
            id: `att-${Date.now()}-${Math.random()}`,
            name: file.name,
            type: file.type,
            isImage: false,
            textContent: e.target.result,
            preview: null
          }]);
        };
        reader.readAsText(file);
      }
    });
  };

  const handleFileChange = (e) => {
    processFiles(e.target.files);
    e.target.value = '';
  };

  const removeAttachment = (id) => {
    setAttachments(prev => prev.filter(a => a.id !== id));
  };

  // ── Drag & drop ──────────────────────────────────────────────
  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    if (!e.currentTarget.contains(e.relatedTarget)) {
      setIsDragging(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    processFiles(e.dataTransfer.files);
  };

  const canSend = (text.trim() || attachments.length > 0) && !isTyping;

  return (
    <div
      className="chat-input-container"
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      {isDragging && (
        <div className="drop-overlay">
          <span>drop files here</span>
        </div>
      )}

      {attachments.length > 0 && (
        <div className="attachments-row">
          {attachments.map(att => (
            <div key={att.id} className="attachment-chip">
              {att.isImage
                ? <img src={att.preview} alt={att.name} className="chip-thumb" />
                : <span className="chip-icon">📄</span>
              }
              <span className="chip-name">{att.name}</span>
              <button
                className="chip-remove"
                onClick={() => removeAttachment(att.id)}
                aria-label={`Remove ${att.name}`}
              >
                ×
              </button>
            </div>
          ))}
        </div>
      )}

      <div className="chat-input-wrapper">
        <button
          className="input-icon-btn"
          onClick={() => fileInputRef.current?.click()}
          disabled={isTyping}
          aria-label="Attach file"
          title="Attach image, CSV, or text file"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
            <path d="M21.44 11.05l-9.19 9.19a6 6 0 01-8.49-8.49l9.19-9.19a4 4 0 015.66 5.66l-9.2 9.19a2 2 0 01-2.83-2.83l8.49-8.48" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept="image/*,.csv,.txt"
          onChange={handleFileChange}
          style={{ display: 'none' }}
        />

        <textarea
          ref={textareaRef}
          value={text}
          onChange={e => setText(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={isListening ? 'listening...' : 'ask papap anything...'}
          rows={1}
          disabled={isTyping}
          className={`chat-textarea${isListening ? ' listening' : ''}`}
        />

        <button
          className={`input-icon-btn mic-btn${isListening ? ' active' : ''}`}
          onClick={toggleListening}
          disabled={isTyping}
          aria-label={isListening ? 'Stop listening' : 'Start voice input'}
          title="Voice input"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
            <rect x="9" y="2" width="6" height="11" rx="3" stroke="currentColor" strokeWidth="2"/>
            <path d="M5 10a7 7 0 0014 0" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
            <line x1="12" y1="19" x2="12" y2="23" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
            <line x1="8" y1="23" x2="16" y2="23" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
          </svg>
        </button>

        <button
          onClick={handleSend}
          disabled={!canSend}
          className="send-button"
          aria-label="Send message"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
            <path d="M22 2L11 13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M22 2L15 22L11 13L2 9L22 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
      </div>
    </div>
  );
}

export default ChatInput;
