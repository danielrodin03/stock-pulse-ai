from fastapi import FastAPI, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from sqlalchemy import create_engine, Column, Integer, String
from sqlalchemy.orm import declarative_base, sessionmaker, Session
import yfinance as yf
from vaderSentiment.vaderSentiment import SentimentIntensityAnalyzer
from sklearn.linear_model import LinearRegression
import numpy as np

# הגדרת מסד הנתונים SQLite
SQLALCHEMY_DATABASE_URL = "sqlite:///./stocks.db"
engine = create_engine(SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False})
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

# הגדרת טבלת רשימת המעקב (Watchlist)
class WatchlistItem(Base):
    __tablename__ = "watchlist"
    id = Column(Integer, primary_key=True, index=True)
    ticker = Column(String, unique=True, index=True)

Base.metadata.create_all(bind=engine)

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

class TickerRequest(BaseModel):
    ticker: str

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

analyzer = SentimentIntensityAnalyzer()

@app.get("/")
def home():
    return {"message": "StockPulse API is running"}

@app.get("/api/watchlist")
def get_watchlist(db: Session = Depends(get_db)):
    items = db.query(WatchlistItem).all()
    return [item.ticker for item in items]

@app.post("/api/watchlist")
def add_to_watchlist(req: TickerRequest, db: Session = Depends(get_db)):
    symbol = req.ticker.upper().strip()
    existing = db.query(WatchlistItem).filter(WatchlistItem.ticker == symbol).first()
    if existing:
        return {"message": "Already in watchlist", "ticker": symbol}
    new_item = WatchlistItem(ticker=symbol)
    db.add(new_item)
    db.commit()
    return {"message": "Added", "ticker": symbol}

@app.delete("/api/watchlist/{ticker}")
def remove_from_watchlist(ticker: str, db: Session = Depends(get_db)):
    symbol = ticker.upper().strip()
    item = db.query(WatchlistItem).filter(WatchlistItem.ticker == symbol).first()
    if not item:
        raise HTTPException(status_code=404, detail="Not found in watchlist")
    db.delete(item)
    db.commit()
    return {"message": "Removed", "ticker": symbol}

@app.get("/api/stock/{ticker}")
def get_stock_data(ticker: str):
    ticker = ticker.upper()
    stock = yf.Ticker(ticker)
    hist = stock.history(period="30d")

    if hist.empty:
        raise HTTPException(status_code=404, detail="המניה לא נמצאה")

    current_price = round(float(hist["Close"].iloc[-1]), 2)
    dates = [d.strftime("%Y-%m-%d") for d in hist.index]
    closes = [round(float(p), 2) for p in hist["Close"].tolist()]

    X = np.arange(len(closes)).reshape(-1, 1)
    y = np.array(closes)
    model = LinearRegression()
    model.fit(X, y)
    predicted_next_price = round(float(model.predict([[len(closes)]])[0]), 2)

    raw_news = stock.news[:8] if stock.news else []
    analyzed_news = []
    scores = []

    for item in raw_news:
        title = item.get("content", {}).get("title") or item.get("title")
        if title:
            score = analyzer.polarity_scores(title)["compound"]
            scores.append(score)
            label = "Positive" if score > 0.05 else ("Negative" if score < -0.05 else "Neutral")
            analyzed_news.append({
                "title": title,
                "score": round(score, 2),
                "sentiment": label
            })

    avg_sentiment = round(sum(scores) / len(scores), 2) if scores else 0.0
    overall_label = "Bullish" if avg_sentiment > 0.05 else ("Bearish" if avg_sentiment < -0.05 else "Neutral")

    return {
        "ticker": ticker,
        "price": current_price,
        "predicted_next_price": predicted_next_price,
        "avg_sentiment": avg_sentiment,
        "overall_label": overall_label,
        "history": [{"date": d, "price": p} for d, p in zip(dates, closes)],
        "news": analyzed_news
    }
