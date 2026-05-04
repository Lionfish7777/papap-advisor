import React, { useState, useRef } from 'react';
import axios from 'axios';
import './App.css';
import ChatWindow from './components/ChatWindow';
import ChatInput from './components/ChatInput';
import LandingPage from './components/LandingPage';

const WELCOME_MESSAGES = [
  {
    id: 'w1',
    role: 'papap',
    content: "welcome, friend. i'm papap."
  },
  {
    id: 'w2',
    role: 'papap',
    content: "i've been watching markets since before most folks had a television. eighty-plus years of cycles, crashes, and comebacks."
  },
  {
    id: 'w3',
    role: 'papap',
    content: "what's on your mind today?"
  }
];

function buildContentParts(text, attachments) {
  const parts = [];
  for (const att of attachments) {
    if (att.isImage) {
      parts.push({ type: 'image', source: { type: 'base64', media_type: att.mediaType, data: att.data } });
    } else if (att.textContent) {
      parts.push({ type: 'text', text: `[File: ${att.name}]\n${att.textContent}` });
    }
  }
  parts.push({ type: 'text', text: text || 'Please analyze the attached content.' });
  return parts;
}

function buildHistory(messages, newUserText, newAttachments) {
  const history = [];
  let i = 0;

  while (i < messages.length) {
    const msg = messages[i];
    if (msg.role === 'papap') {
      let combined = msg.content;
      let j = i + 1;
      while (j < messages.length && messages[j].role === 'papap') {
        combined += '\n\n' + messages[j].content;
        j++;
      }
      history.push({ role: 'assistant', content: combined });
      i = j;
    } else if (msg.role === 'user') {
      if (msg.attachments && msg.attachments.length > 0) {
        history.push({ role: 'user', content: buildContentParts(msg.content, msg.attachments) });
      } else {
        history.push({ role: 'user', content: msg.content });
      }
      i++;
    } else {
      i++;
    }
  }

  if (newAttachments && newAttachments.length > 0) {
    history.push({ role: 'user', content: buildContentParts(newUserText, newAttachments) });
  } else {
    history.push({ role: 'user', content: newUserText });
  }
  return history;
}

function App() {
  const [view, setView] = useState('landing');
  const [messages, setMessages] = useState(WELCOME_MESSAGES);
  const [isTyping, setIsTyping] = useState(false);
  const [voiceActive, setVoiceActive] = useState(false);
  const audioRef = useRef(null);

  const sendMessage = async (text, attachments = []) => {
    if ((!text.trim() && attachments.length === 0) || isTyping) return;

    const userMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: text.trim(),
      attachments
    };

    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);
    setIsTyping(true);

    try {
      const history = buildHistory(messages, text.trim(), attachments);
      const { data } = await axios.post('/api/chat', { messages: history });
      const reply = data.reply;

      const bubbles = reply.split(/\n\n+/).filter(b => b.trim());

      setIsTyping(false);

      for (let i = 0; i < bubbles.length; i++) {
        if (i > 0) await new Promise(resolve => setTimeout(resolve, 600));
        const newMsg = {
          id: `papap-${Date.now()}-${i}`,
          role: 'papap',
          content: bubbles[i].trim()
        };
        setMessages(prev => [...prev, newMsg]);
      }

      playVoice(reply);
    } catch (error) {
      const detail = error.response?.data?.error || error.message || 'unknown error';
      console.error('Chat error:', detail, error);
      setIsTyping(false);
      setMessages(prev => [...prev, {
        id: `err-${Date.now()}`,
        role: 'papap',
        content: `something went sideways on my end. error: ${detail}`
      }]);
    }
  };

  const playVoice = async (text) => {
    try {
      const response = await axios.post('/api/voice', { text }, {
        responseType: 'blob'
      });
      const url = URL.createObjectURL(response.data);
      if (audioRef.current) {
        audioRef.current.src = url;
        setVoiceActive(true);
        audioRef.current.play().catch(() => {
          setVoiceActive(false);
          playBrowserTTS(text);
        });
        audioRef.current.onended = () => setVoiceActive(false);
      }
    } catch {
      // ElevenLabs not configured or failed — fall back to browser TTS
      playBrowserTTS(text);
    }
  };

  const playBrowserTTS = (text) => {
    const synth = window.speechSynthesis;
    if (!synth) return;
    synth.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 0.88;
    utterance.pitch = 0.72;
    utterance.volume = 1;
    // Pick a deep, calm voice if available
    const voices = synth.getVoices();
    const preferred = voices.find(v =>
      /alex|daniel|fred|reed|thomas/i.test(v.name) ||
      (v.lang === 'en-US' && v.name.toLowerCase().includes('male'))
    ) || voices.find(v => v.lang === 'en-US') || voices[0];
    if (preferred) utterance.voice = preferred;
    setVoiceActive(true);
    utterance.onend = () => setVoiceActive(false);
    utterance.onerror = () => setVoiceActive(false);
    synth.speak(utterance);
  };

  if (view === 'landing') {
    return <LandingPage onStart={() => setView('chat')} />;
  }

  return (
    <div className="app">
      <header className="app-header">
        <div className="header-avatar">P</div>
        <div className="header-info">
          <h1>Papap</h1>
          <p>
            <span className="status-dot" />
            Financial Advisor · Born 1942
            {voiceActive && <span className="voice-badge">♪ speaking</span>}
          </p>
        </div>
        <button className="back-btn" onClick={() => setView('landing')} aria-label="Back to home">
          ←
        </button>
      </header>

      <ChatWindow messages={messages} isTyping={isTyping} />
      <ChatInput onSend={sendMessage} isTyping={isTyping} />

      <audio ref={audioRef} style={{ display: 'none' }} />
    </div>
  );
}

export default App;
