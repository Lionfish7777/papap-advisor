# Papap — AI Financial Advisor

> *"Compound interest is the eighth wonder of the world. He who understands it, earns it."*

Papap is not a chatbot. It is a character — a market veteran born in 1942, built to deliver eighty years of financial wisdom through the intimacy of a text conversation. The interface is deliberately minimal: no dashboards, no charts. Just a voice that has survived every crash since the postwar boom, speaking directly to you.

Powered by Claude claude-opus-4-6 and ElevenLabs voice synthesis. Built on React, Node.js, and Express.

---

## Features

- **Persona-driven AI** — Papap responds in short, warm, text-message-style bursts. Warren Buffett's discipline. Bob Proctor's warmth. Never hypes. Never gambles. Always teaches.
- **Deliberate UX rhythm** — Responses split across multiple bubbles with timed delays, engineered to feel like receiving real texts rather than reading an API response
- **Voice synthesis** — Every reply is spoken aloud via ElevenLabs (`eleven_turbo_v2`), streamed directly from the server. Graceful fallback to the browser's Web Speech API when ElevenLabs is not configured — voice is never optional, only sourced differently
- **Multimodal input** — Users can attach images, documents, or screenshots. Attachments are encoded and passed to Claude as structured content blocks alongside the user's message
- **Persistent conversation memory** — The full message history is rebuilt and sent to Claude on every request, preserving context across the entire session

---

## Tech Stack

**Frontend**
- React 18 + Vite
- Component architecture — `ChatWindow`, `ChatInput`, `MessageBubble`, `TypingIndicator`, `ReadReceipt`, `LandingPage`
- Axios for API communication

**Backend**
- Node.js + Express
- Anthropic SDK — `claude-opus-4-6`
- ElevenLabs REST API — `eleven_turbo_v2`, streamed as `audio/mpeg`
- CORS configured for local development

---

## Architecture

```
client/                   # React + Vite frontend
  src/
    App.jsx               # Root — state management, message history, voice orchestration
    components/
      LandingPage.jsx     # Entry screen
      ChatWindow.jsx      # Scrollable message thread
      ChatInput.jsx       # Text input + file/image attachment handler
      MessageBubble.jsx   # Individual message rendering
      TypingIndicator.jsx
      ReadReceipt.jsx

server/                   # Node.js + Express API
  index.js                # Entry point — CORS, middleware, routing
  routes/
    chat.js               # POST /api/chat  — Claude API, system prompt, conversation history
    voice.js              # POST /api/voice — ElevenLabs TTS, streams audio/mpeg to client
```

---

## Getting Started

### Prerequisites
- Node.js 18+
- Anthropic API key
- ElevenLabs API key + Voice ID *(optional — app falls back to browser TTS without these)*

### Install & Run

**1. Clone the repo**
```bash
git clone https://github.com/Lionfish7777/papap-advisor.git
cd papap-advisor
```

**2. Start the server**
```bash
cd server
npm install
cp .env.example .env
# Fill in your API keys
npm start
```

**3. Start the client**
```bash
cd client
npm install
npm run dev
```

Client: `http://localhost:5173` — Server: `http://localhost:5001`

---

## Environment Variables

```env
ANTHROPIC_API_KEY=your_anthropic_api_key
ELEVENLABS_API_KEY=your_elevenlabs_api_key   # optional
ELEVENLABS_VOICE_ID=your_voice_id            # optional
PORT=5001
```

Without ElevenLabs keys, voice routes return a 503 and the client falls back to the browser's `SpeechSynthesis` API automatically. The persona still speaks — just through a different channel.

---

## Prompt Engineering

The system prompt is the core of the product. Papap is instructed to respond in 1–3 sentence bursts — lowercase, conversational, unhurried. Occasionally split across 2–3 paragraphs to mimic real texting rhythm. Every response ends with a grounded insight or a small, concrete task.

Client-side, Claude's reply is split at double-newlines and each segment is rendered as a separate `MessageBubble` with a 600ms stagger — transforming a single API response into a sequence of arriving texts. The effect is intentional: it makes the advisor feel present, not instantaneous.

The persona — patience, precision, earned authority — is held entirely in the prompt. No fine-tuning. No retrieval. Just language, carefully chosen.

---

## Status

Active development. Private.

---
