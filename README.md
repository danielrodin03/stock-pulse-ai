# StockPulse AI

A full-stack real-time stock market analysis dashboard combining financial market data, NLP sentiment analysis, and machine learning price trend prediction.

## Features
- Real-Time Market Data: Fetches live stock prices and 30-day historical trends using yfinance.
- NLP Sentiment Analysis: Analyzes recent financial news headlines with VADER to calculate an overall market sentiment score (Bullish / Bearish / Neutral).
- ML Price Prediction: Uses scikit-learn Linear Regression to forecast next-day closing price trends.
- Persistent Watchlist: Full CRUD operations (GET, POST, DELETE) backed by SQLite and SQLAlchemy ORM.
- Interactive Dashboard: Responsive dark-mode UI built with React, Vite, and Recharts.

## Tech Stack
- Frontend: React, Vite, Recharts, Lucide Icons
- Backend: Python, FastAPI, Uvicorn, SQLAlchemy, Pydantic
- Database: SQLite
- Data & AI: yfinance, vaderSentiment, scikit-learn, NumPy

## Local Setup
1. Backend:
   python -m venv venv
   source venv/bin/activate
   pip install -r backend/requirements.txt
   python -m uvicorn backend.main:app --reload

2. Frontend:
   cd frontend
   npm install
   npm run dev
