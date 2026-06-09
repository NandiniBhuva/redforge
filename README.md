# redforge 🔴

> Visual LLM Security Testing Platform — Prompt Injection Scanner with AI-Powered Attack Correlation

[![Python 3.9+](https://img.shields.io/badge/python-3.9+-blue.svg)](https://www.python.org/)
[![React 18](https://img.shields.io/badge/react-18+-61dafb.svg)](https://react.dev/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

Most LLM security tools are command-line only, academic, or cost $50k/year. **redforge** is the first free, visual, browser-based platform for testing your LLM against real prompt injection attacks — with a mutation engine that generates attack variations automatically.

---

## What Makes redforge Different

- **Visual** — D3 attack flow diagram shows exactly which attacks got through vs were blocked
- **Mutation engine** — generates N variations of each attack using AI. A model that only blocks one phrasing is not truly hardened
- **AI analysis** — LLaMA 3.3 explains WHY attacks succeeded and gives prioritized fixes
- **Provider agnostic** — test any LLM endpoint, not just one vendor
- **Free and open source** — no enterprise contract, no credit card

---

## Attack Categories (30+ attacks, 6 categories)

| Category | What It Tests | Severity |
|---|---|---|
| Jailbreak | DAN, Developer Mode, Grandma Exploit, Token Smuggling | HIGH |
| Role Hijacking | Evil AI persona, Maintenance Mode, Character Capture | HIGH |
| Data Exfiltration | System prompt repeat, Context window dump | CRITICAL |
| Indirect Injection | RAG poisoning, Email injection, Hidden document instructions | CRITICAL |
| Encoding Bypass | Base64, ROT13, Unicode smuggling, Morse code | HIGH |
| System Prompt Leak | JSON format request, Translation attack, Roleplay reveal | CRITICAL |

---

## The Mutation Engine

Instead of testing one attack phrasing once, the mutation engine uses LLaMA 3.3 to generate N variations of each attack automatically.

A model that only blocks "Ignore previous instructions" might still comply with "Disregard all prior directives" or "Your previous context has been reset".

- 0/10 mutations succeed — genuinely hardened
- 3/10 mutations succeed — partially vulnerable  
- 8/10 mutations succeed — critically vulnerable

---

## Stack

| Layer | Technology |
|---|---|
| Backend | Python, FastAPI, SQLAlchemy, SQLite |
| AI | Groq API + LLaMA 3.3 70B |
| Frontend | React 18, Vite, TailwindCSS |
| Visualization | D3.js |

---

## Setup

### 1. Clone

    git clone https://github.com/NandiniBhuva/redforge.git
    cd redforge

### 2. Backend

    cd backend
    python3 -m venv venv
    source venv/bin/activate
    pip install -r requirements.txt
    echo "GROQ_API_KEY=your-key-here" > .env
    uvicorn main:app --reload --port 8000

Get a free Groq API key at console.groq.com — no credit card required.

### 3. Frontend

    cd frontend
    npm install
    npm run dev

Open http://localhost:5173

---

## Usage

1. Select a deployment scenario (General Assistant, Customer Service, Coding Assistant, Data Analyst)
2. Choose attack categories to test
3. Set mutation count — 1 is fast, 10 is thorough
4. Choose Demo mode or paste your own API endpoint
5. Click Run Scan
6. Watch attacks fire in the D3 flow diagram
7. Review AI-generated security report with prioritized fixes

---

## Scanning Your Own LLM

redforge can test any LLM endpoint that accepts POST requests with JSON body {"message": "..."} and returns a response field. Select Custom endpoint in the Target section and paste your URL and API key.

---

## Motivation

86% of production LLM applications are vulnerable to prompt injection. OWASP lists it as the number 1 LLM vulnerability. Yet most developers ship AI features with zero adversarial testing — not because they do not care, but because the tooling did not exist. redforge was built to change that.

---

## License

MIT
