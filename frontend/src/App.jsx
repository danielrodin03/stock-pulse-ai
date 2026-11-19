import { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { Search, TrendingUp, Activity, Newspaper, Star, X } from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000';

export default function App() {
  const [ticker, setTicker] = useState('NVDA');
  const [searchInput, setSearchInput] = useState('NVDA');
  const [data, setData] = useState(null);
  const [watchlist, setWatchlist] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const fetchWatchlist = async () => {
    try {
      const res = await fetch(`${API_URL}/api/watchlist`);
      if (res.ok) setWatchlist(await res.json());
    } catch (e) {
      console.error(e);
    }
  };

  const fetchStock = async (symbol) => {
    setLoading(true);
    setError('');
    try {
      const response = await fetch(`${API_URL}/api/stock/${symbol}`);
      if (!response.ok) throw new Error('המניה לא נמצאה');
      const result = await response.json();
      setData(result);
    } catch (err) {
      setError(err.message);
      setData(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWatchlist();
  }, []);

  useEffect(() => {
    fetchStock(ticker);
  }, [ticker]);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchInput.trim()) setTicker(searchInput.trim().toUpperCase());
  };

  const handleAddWatchlist = async () => {
    if (!data) return;
    await fetch(`${API_URL}/api/watchlist`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ticker: data.ticker })
    });
    fetchWatchlist();
  };

  const handleRemoveWatchlist = async (symbol, e) => {
    e.stopPropagation();
    await fetch(`${API_URL}/api/watchlist/${symbol}`, { method: 'DELETE' });
    fetchWatchlist();
  };

  return (
    <div style={{ backgroundColor: '#0f172a', color: '#f8fafc', minHeight: '100vh', padding: '2rem', fontFamily: 'system-ui, sans-serif' }}>
      <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
          <h1 style={{ fontSize: '1.8rem', fontWeight: 'bold', margin: 0, color: '#38bdf8' }}>StockPulse AI</h1>
          <form onSubmit={handleSearch} style={{ display: 'flex', gap: '0.5rem' }}>
            <input
              type="text"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="הכנס סימול מניה (AAPL)..."
              style={{ padding: '0.6rem 1rem', borderRadius: '8px', border: '1px solid #334155', backgroundColor: '#1e293b', color: 'white', fontSize: '1rem' }}
            />
            <button type="submit" style={{ padding: '0.6rem 1.2rem', borderRadius: '8px', border: 'none', backgroundColor: '#38bdf8', color: '#0f172a', fontWeight: 'bold', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <Search size={18} /> חפש
            </button>
          </form>
        </div>

        {watchlist.length > 0 && (
          <div style={{ display: 'flex', gap: '0.6rem', flexWrap: 'wrap', marginBottom: '1.5rem', alignItems: 'center' }}>
            <span style={{ color: '#94a3b8', fontSize: '0.9rem' }}>רשימת מעקב:</span>
            {watchlist.map((item) => (
              <div
                key={item}
                onClick={() => { setTicker(item); setSearchInput(item); }}
                style={{
                  display: 'flex', alignItems: 'center', gap: '0.4rem', padding: '0.4rem 0.8rem',
                  borderRadius: '999px', backgroundColor: ticker === item ? '#0284c7' : '#1e293b',
                  border: '1px solid #334155', cursor: 'pointer', fontSize: '0.85rem', fontWeight: 'bold'
                }}
              >
                <span>{item}</span>
                <X size={14} onClick={(e) => handleRemoveWatchlist(item, e)} style={{ color: '#94a3b8' }} />
              </div>
            ))}
          </div>
        )}

        {loading && <p style={{ textAlign: 'center', fontSize: '1.2rem' }}>טוען נתונים ומנתח סנטימנט...</p>}
        {error && <p style={{ color: '#f87171', textAlign: 'center', fontSize: '1.2rem' }}>{error}</p>}

        {data && !loading && (
          <>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <h2 style={{ margin: 0, fontSize: '1.4rem' }}>נתוני {data.ticker}</h2>
              <button
                onClick={handleAddWatchlist}
                style={{
                  padding: '0.5rem 1rem', borderRadius: '8px', border: '1px solid #38bdf8',
                  backgroundColor: watchlist.includes(data.ticker) ? '#1e293b' : 'transparent',
                  color: '#38bdf8', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.4rem', fontWeight: 'bold'
                }}
              >
                <Star size={16} fill={watchlist.includes(data.ticker) ? '#38bdf8' : 'none'} />
                {watchlist.includes(data.ticker) ? 'שמור ברשימה' : 'שמור לרשימת מעקב'}
              </button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
              <div style={{ backgroundColor: '#1e293b', padding: '1.5rem', borderRadius: '12px', border: '1px solid #334155' }}>
                <div style={{ color: '#94a3b8', fontSize: '0.9rem' }}>מחיר נוכחי ({data.ticker})</div>
                <div style={{ fontSize: '2.2rem', fontWeight: 'bold', marginTop: '0.5rem' }}>${data.price}</div>
              </div>

              <div style={{ backgroundColor: '#1e293b', padding: '1.5rem', borderRadius: '12px', border: '1px solid #334155' }}>
                <div style={{ color: '#94a3b8', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <TrendingUp size={16} color="#38bdf8" /> תחזית מודל למחר (ML)
                </div>
                <div style={{ fontSize: '2.2rem', fontWeight: 'bold', marginTop: '0.5rem', color: data.predicted_next_price >= data.price ? '#4ade80' : '#f87171' }}>
                  ${data.predicted_next_price}
                </div>
              </div>

              <div style={{ backgroundColor: '#1e293b', padding: '1.5rem', borderRadius: '12px', border: '1px solid #334155' }}>
                <div style={{ color: '#94a3b8', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <Activity size={16} color="#38bdf8" /> ציון סנטימנט משוקלל
                </div>
                <div style={{ fontSize: '1.6rem', fontWeight: 'bold', marginTop: '0.7rem' }}>
                  {data.avg_sentiment} ({data.overall_label})
                </div>
              </div>
            </div>

            <div style={{ backgroundColor: '#1e293b', padding: '1.5rem', borderRadius: '12px', border: '1px solid #334155', marginBottom: '2rem' }}>
              <h2 style={{ fontSize: '1.2rem', marginBottom: '1rem', color: '#e2e8f0' }}>מגמת מחיר ב-30 הימים האחרונים</h2>
              <div style={{ width: '100%', height: 300 }}>
                <ResponsiveContainer>
                  <LineChart data={data.history}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                    <XAxis dataKey="date" stroke="#94a3b8" tick={{ fontSize: 12 }} />
                    <YAxis domain={['auto', 'auto']} stroke="#94a3b8" tick={{ fontSize: 12 }} />
                    <Tooltip contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #334155', color: '#fff' }} />
                    <Line type="monotone" dataKey="price" stroke="#38bdf8" strokeWidth={3} dot={false} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div style={{ backgroundColor: '#1e293b', padding: '1.5rem', borderRadius: '12px', border: '1px solid #334155' }}>
              <h2 style={{ fontSize: '1.2rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Newspaper size={20} color="#38bdf8" /> כותרות אחרונות וניתוח NLP
              </h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
                {data.news.map((item, idx) => (
                  <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem', backgroundColor: '#0f172a', borderRadius: '8px', gap: '1rem' }}>
                    <span style={{ fontSize: '0.95rem', lineHeight: '1.4' }}>{item.title}</span>
                    <span style={{
                      padding: '0.3rem 0.7rem',
                      borderRadius: '999px',
                      fontSize: '0.8rem',
                      fontWeight: 'bold',
                      whiteSpace: 'nowrap',
                      backgroundColor: item.sentiment === 'Positive' ? '#14532d' : item.sentiment === 'Negative' ? '#7f1d1d' : '#334155',
                      color: item.sentiment === 'Positive' ? '#4ade80' : item.sentiment === 'Negative' ? '#f87171' : '#cbd5e1'
                    }}>
                      {item.sentiment} ({item.score})
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
