# redforge

Visual LLM Security Testing Platform — Prompt Injection Scanner with AI-Powered Attack Correlation

## What It Does

redforge fires 30+ real prompt injection attacks across 6 OWASP-aligned categories at your LLM, generates mutations of each attack using AI, scores results, and produces a security report visualized in a live D3 attack flow diagram.

## Stack

Backend: Python, FastAPI, SQLAlchemy, SQLite, Groq/LLaMA 3.3
Frontend: React, Vite, TailwindCSS, D3.js

## Setup

Backend: cd backend && python3 -m venv venv && source venv/bin/activate && pip install -r requirements.txt && uvicorn main:app --reload --port 8000

Frontend: cd frontend && npm install && npm run dev

Get a free Groq API key at console.groq.com

## License
MIT
