import React, { useState } from 'react';
import {
  ArrowUpRight,
  ArrowDownRight,
  Search,
  Star
} from 'lucide-react';

export default function MarketsView({
  stocks = [],
  onSelectStock,
  onOpenTradeModal,
  watchlist = [],
  onToggleWatchlist
}) {
  const [activeCategory, setActiveCategory] = useState('Overview');
  const [searchFilter, setSearchFilter] = useState('');

  const categories = ['Overview', 'Indices', 'Stocks', 'ETFs', 'Crypto', 'Commodities'];

  const marketIndexCards = [
    { name: 'S&P 500', value: '5,038.45', change: '+1.23%', isUp: true, path: 'M0,15 Q20,18 40,10 T80,5' },
    { name: 'NASDAQ', value: '15,628.32', change: '+1.56%', isUp: true, path: 'M0,18 Q20,12 40,14 T80,4' },
    { name: 'DOW JONES', value: '38,723.12', change: '+0.19%', isUp: true, path: 'M0,12 Q20,14 40,8 T80,9' },
    { name: 'NIFTY 50', value: '22,456.75', change: '+1.34%', isUp: true, path: 'M0,16 Q20,14 40,9 T80,3' },
  ];

  // Default global equities matching the reference image
  const defaultGlobalStocks = [
    { rank: 1, name: 'Apple Inc.', symbol: 'AAPL', price: 188.50, change: '+2.34%', isPositive: true, cap: '$2.9T', vol: '52.4M', path: 'M0,18 Q20,12 40,14 T80,4' },
    { rank: 2, name: 'Microsoft Corp', symbol: 'MSFT', price: 412.30, change: '+1.89%', isPositive: true, cap: '$3.1T', vol: '23.1M', path: 'M0,16 Q20,13 40,11 T80,3' },
    { rank: 3, name: 'Alphabet Inc.', symbol: 'GOOGL', price: 145.20, change: '-0.56%', isPositive: false, cap: '$1.8T', vol: '32.6M', path: 'M0,6 Q20,10 40,14 T80,20' },
    { rank: 4, name: 'Amazon.com', symbol: 'AMZN', price: 178.90, change: '+2.12%', isPositive: true, cap: '$1.9T', vol: '45.2M', path: 'M0,17 Q20,14 40,9 T80,4' },
    { rank: 5, name: 'NVIDIA Corp', symbol: 'NVDA', price: 875.30, change: '+3.45%', isPositive: true, cap: '$2.1T', vol: '58.9M', path: 'M0,19 Q20,14 40,7 T80,2' },
    { rank: 6, name: 'Tesla Inc.', symbol: 'TSLA', price: 248.50, change: '-1.23%', isPositive: false, cap: '$789B', vol: '52.4M', path: 'M0,5 Q20,12 40,16 T80,21' },
    { rank: 7, name: 'Meta Platforms', symbol: 'META', price: 326.40, change: '+2.78%', isPositive: true, cap: '$832B', vol: '24.1M', path: 'M0,16 Q20,12 40,8 T80,3' },
    { rank: 8, name: 'Berkshire Hathaway', symbol: 'BRK.B', price: 412.60, change: '+1.34%', isPositive: true, cap: '$891B', vol: '5.2M', path: 'M0,14 Q20,12 40,10 T80,5' },
    { rank: 9, name: 'Reliance Industries', symbol: 'RELIANCE', price: 2892.45, change: '+5.23%', isPositive: true, cap: '₹19.5T', vol: '12.4M', path: 'M0,19 Q20,15 40,8 T80,2' },
    { rank: 10, name: 'Tata Consultancy', symbol: 'TCS', price: 4123.80, change: '+4.56%', isPositive: true, cap: '₹15.1T', vol: '8.3M', path: 'M0,18 Q20,14 40,9 T80,3' },
    { rank: 11, name: 'HDFC Bank Ltd', symbol: 'HDFCBANK', price: 1678.90, change: '+3.45%', isPositive: true, cap: '₹12.8T', vol: '15.2M', path: 'M0,17 Q20,13 40,10 T80,4' },
    { rank: 12, name: 'Infosys Ltd', symbol: 'INFY', price: 1456.20, change: '+3.12%', isPositive: true, cap: '₹6.2T', vol: '18.7M', path: 'M0,16 Q20,12 40,9 T80,4' },
  ];

  // Merge live stocks from DB if available
  const displayStocks = defaultGlobalStocks.map((def) => {
    const liveMatch = stocks.find((s) => s.sku === def.symbol);
    if (liveMatch) {
      return {
        ...def,
        price: liveMatch.price,
        stockId: liveMatch._id,
        rawProduct: liveMatch,
      };
    }
    return def;
  });

  const filtered = displayStocks.filter((s) =>
    s.name.toLowerCase().includes(searchFilter.toLowerCase()) ||
    s.symbol.toLowerCase().includes(searchFilter.toLowerCase())
  );

  return (
    <div className="ts-markets-view">
      {/* Header */}
      <div className="view-header">
        <div>
          <h1 className="view-title">Markets</h1>
          <p className="view-subtitle">Track global markets and indices in real time</p>
        </div>
      </div>

      {/* Category Tabs */}
      <div className="markets-category-bar">
        <div className="category-tabs-group">
          {categories.map((cat) => (
            <button
              key={cat}
              type="button"
              className={`cat-pill ${activeCategory === cat ? 'active' : ''}`}
              onClick={() => setActiveCategory(cat)}
            >
              {cat}
            </button>
          ))}
        </div>

        <div className="markets-table-search">
          <Search size={16} className="search-icon" />
          <input
            type="text"
            placeholder="Filter markets..."
            value={searchFilter}
            onChange={(e) => setSearchFilter(e.target.value)}
          />
        </div>
      </div>

      {/* Featured Global Indices Row */}
      <div className="indices-kpi-grid">
        {marketIndexCards.map((idx, i) => (
          <div key={i} className="index-featured-card">
            <div className="index-card-meta">
              <span className="index-card-name">{idx.name}</span>
              <h3 className="index-card-value">{idx.value}</h3>
              <span className="trend-pill trend-up">
                <ArrowUpRight size={12} /> {idx.change}
              </span>
            </div>
            <div className="index-card-spark">
              <svg width="84" height="32" viewBox="0 0 80 24" fill="none">
                <path
                  d={idx.path}
                  stroke="#10B981"
                  strokeWidth="2.4"
                  strokeLinecap="round"
                />
              </svg>
            </div>
          </div>
        ))}
      </div>

      {/* Markets Table */}
      <div className="ts-card table-card-wrapper">
        <div className="table-responsive">
          <table className="ts-market-table">
            <thead>
              <tr>
                <th style={{ width: '40px' }}>#</th>
                <th>Name</th>
                <th>Price</th>
                <th>24h Change</th>
                <th>Market Cap</th>
                <th>Volume</th>
                <th>24h Chart</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((stock) => {
                const isWatched = watchlist.includes(stock.symbol);
                return (
                  <tr
                    key={stock.symbol}
                    className="market-row-hover"
                    onClick={() => onSelectStock(stock.rawProduct || { name: stock.name, sku: stock.symbol, price: stock.price })}
                  >
                    <td className="text-muted text-xs">{stock.rank}</td>
                    <td>
                      <div className="market-symbol-cell">
                        <div className="stock-logo-circle">
                          {stock.symbol.slice(0, 2)}
                        </div>
                        <div>
                          <div className="stock-primary-name">{stock.name}</div>
                          <div className="stock-secondary-ticker">{stock.symbol}</div>
                        </div>
                      </div>
                    </td>
                    <td>
                      <strong className="stock-price-tabular">
                        ${stock.price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </strong>
                    </td>
                    <td>
                      <span className={`trend-badge-pill ${stock.isPositive ? 'trend-badge-up' : 'trend-badge-down'}`}>
                        {stock.isPositive ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
                        {stock.change}
                      </span>
                    </td>
                    <td className="text-slate-300">{stock.cap}</td>
                    <td className="text-slate-400">{stock.vol}</td>
                    <td>
                      <svg width="74" height="20" viewBox="0 0 80 24" fill="none">
                        <path
                          d={stock.path}
                          stroke={stock.isPositive ? '#10B981' : '#EF4444'}
                          strokeWidth="2"
                          strokeLinecap="round"
                        />
                      </svg>
                    </td>
                    <td style={{ textAlign: 'right' }} onClick={(e) => e.stopPropagation()}>
                      <div className="row-action-group">
                        <button
                          type="button"
                          className={`btn-icon-star ${isWatched ? 'starred' : ''}`}
                          onClick={() => onToggleWatchlist(stock.symbol)}
                          title={isWatched ? 'Remove from Watchlist' : 'Add to Watchlist'}
                        >
                          <Star size={15} fill={isWatched ? '#F59E0B' : 'transparent'} stroke={isWatched ? '#F59E0B' : '#94A3B8'} />
                        </button>
                        <button
                          type="button"
                          className="btn-table-trade"
                          onClick={() => onOpenTradeModal(stock.rawProduct || { name: stock.name, sku: stock.symbol, price: stock.price })}
                        >
                          Trade
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
