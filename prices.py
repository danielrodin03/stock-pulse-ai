import yfinance as yf

tickers = ["AAPL", "TSLA", "NVDA", "MSFT"]

for symbol in tickers:
    data = yf.Ticker(symbol).history(period="5d")
    last_price = data["Close"].iloc[-1]
    print(symbol, round(last_price, 2))