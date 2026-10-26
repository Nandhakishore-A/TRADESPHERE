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

  // Comprehensive market assets across categories
  const allMarketAssets = [
    // Stocks
    { rank: 1, name: 'Apple Inc.', symbol: 'AAPL', category: 'Stocks', price: 188.50, change: '+2.34%', isPositive: true, cap: '$2.9T', vol: '52.4M', path: 'M0,18 Q20,12 40,14 T80,4' },
    { rank: 2, name: 'Microsoft Corp', symbol: 'MSFT', category: 'Stocks', price: 412.30, change: '+1.89%', isPositive: true, cap: '$3.1T', vol: '23.1M', path: 'M0,16 Q20,13 40,11 T80,3' },
    { rank: 3, name: 'Alphabet Inc.', symbol: 'GOOGL', category: 'Stocks', price: 145.20, change: '-0.56%', isPositive: false, cap: '$1.8T', vol: '32.6M', path: 'M0,6 Q20,10 40,14 T80,20' },
    { rank: 4, name: 'Amazon.com Inc.', symbol: 'AMZN', category: 'Stocks', price: 178.90, change: '+2.12%', isPositive: true, cap: '$1.9T', vol: '45.2M', path: 'M0,17 Q20,14 40,9 T80,4' },
    { rank: 5, name: 'NVIDIA Corporation', symbol: 'NVDA', category: 'Stocks', price: 875.30, change: '+3.45%', isPositive: true, cap: '$2.1T', vol: '58.9M', path: 'M0,19 Q20,14 40,7 T80,2' },
    { rank: 6, name: 'Tesla Inc.', symbol: 'TSLA', category: 'Stocks', price: 248.50, change: '-1.23%', isPositive: false, cap: '$789B', vol: '52.4M', path: 'M0,5 Q20,12 40,16 T80,21' },
    { rank: 7, name: 'Meta Platforms', symbol: 'META', category: 'Stocks', price: 326.40, change: '+2.78%', isPositive: true, cap: '$832B', vol: '24.1M', path: 'M0,16 Q20,12 40,8 T80,3' },
    { rank: 8, name: 'Reliance Industries Ltd', symbol: 'RELIANCE', category: 'Stocks', price: 2892.45, change: '+5.23%', isPositive: true, cap: '₹19.5T', vol: '12.4M', path: 'M0,19 Q20,15 40,8 T80,2' },
    { rank: 9, name: 'Tata Consultancy Services', symbol: 'TCS', category: 'Stocks', price: 4123.80, change: '+4.56%', isPositive: true, cap: '₹15.1T', vol: '8.3M', path: 'M0,18 Q20,14 40,9 T80,3' },
    { rank: 10, name: 'HDFC Bank Ltd', symbol: 'HDFCBANK', category: 'Stocks', price: 1678.90, change: '+3.45%', isPositive: true, cap: '₹12.8T', vol: '15.2M', path: 'M0,17 Q20,13 40,10 T80,4' },
    { rank: 11, name: 'Infosys Ltd', symbol: 'INFY', category: 'Stocks', price: 1456.20, change: '+3.12%', isPositive: true, cap: '₹6.2T', vol: '18.7M', path: 'M0,16 Q20,12 40,9 T80,4' },

    // Indices
    { rank: 12, name: 'S&P 500 Index', symbol: 'SPX', category: 'Indices', price: 5038.45, change: '+1.23%', isPositive: true, cap: 'Benchmark', vol: '3.4B', path: 'M0,15 Q20,18 40,10 T80,5' },
    { rank: 13, name: 'NASDAQ Composite', symbol: 'IXIC', category: 'Indices', price: 15628.32, change: '+1.56%', isPositive: true, cap: 'Tech Index', vol: '4.8B', path: 'M0,18 Q20,12 40,14 T80,4' },
    { rank: 14, name: 'NIFTY 50 Index', symbol: 'NIFTY', category: 'Indices', price: 22456.75, change: '+1.34%', isPositive: true, cap: 'NSE India', vol: '780M', path: 'M0,16 Q20,14 40,9 T80,3' },
    { rank: 15, name: 'BSE SENSEX', symbol: 'SENSEX', category: 'Indices', price: 74382.29, change: '+1.21%', isPositive: true, cap: 'BSE India', vol: '450M', path: 'M0,17 Q20,15 40,11 T80,4' },

    // ETFs
    { rank: 16, name: 'SPDR S&P 500 ETF Trust', symbol: 'SPY', category: 'ETFs', price: 502.80, change: '+1.18%', isPositive: true, cap: '$498B', vol: '64.2M', path: 'M0,15 Q20,18 40,10 T80,5' },
    { rank: 17, name: 'Invesco QQQ Trust', symbol: 'QQQ', category: 'ETFs', price: 436.40, change: '+1.52%', isPositive: true, cap: '$240B', vol: '38.5M', path: 'M0,18 Q20,13 40,11 T80,4' },
    { rank: 18, name: 'Nippon India Nifty 50 ETF', symbol: 'NIFTYBEES', category: 'ETFs', price: 246.50, change: '+1.31%', isPositive: true, cap: '₹22.5K Cr', vol: '12.8M', path: 'M0,16 Q20,14 40,9 T80,3' },
    { rank: 19, name: 'Vanguard Total Stock Market', symbol: 'VTI', category: 'ETFs', price: 254.10, change: '+1.05%', isPositive: true, cap: '$360B', vol: '18.4M', path: 'M0,14 Q20,16 40,11 T80,6' },

    // Crypto
    { rank: 20, name: 'Bitcoin', symbol: 'BTC', category: 'Crypto', price: 67450.00, change: '+4.12%', isPositive: true, cap: '$1.3T', vol: '$32.1B', path: 'M0,20 Q20,15 40,8 T80,2' },
    { rank: 21, name: 'Ethereum', symbol: 'ETH', category: 'Crypto', price: 3520.80, change: '+3.45%', isPositive: true, cap: '$420B', vol: '$18.4B', path: 'M0,18 Q20,14 40,9 T80,4' },
    { rank: 22, name: 'Solana', symbol: 'SOL', category: 'Crypto', price: 174.60, change: '+6.25%', isPositive: true, cap: '$78B', vol: '$5.2B', path: 'M0,21 Q20,16 40,7 T80,1' },

    // Commodities
    { rank: 23, name: 'Gold Spot', symbol: 'XAU', category: 'Commodities', price: 2384.50, change: '+0.85%', isPositive: true, cap: 'Precious', vol: '142K oz', path: 'M0,14 Q20,13 40,11 T80,6' },
    { rank: 24, name: 'Silver Spot', symbol: 'XAG', category: 'Commodities', price: 28.70, change: '+1.94%', isPositive: true, cap: 'Industrial', vol: '890K oz', path: 'M0,16 Q20,14 40,9 T80,4' },
    { rank: 25, name: 'Crude Oil (WTI)', symbol: 'WTI', category: 'Commodities', price: 82.40, change: '-1.15%', isPositive: false, cap: 'Energy', vol: '1.2M bbl', path: 'M0,6 Q20,10 40,15 T80,20' },
  ];

  // Merge live stocks from DB if available
  const displayStocks = allMarketAssets.map((def) => {
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

  // Filter by active category tab AND search text
  const filtered = displayStocks.filter((s) => {
    const matchesCategory =
      activeCategory === 'Overview' ||
      s.category.toLowerCase() === activeCategory.toLowerCase();
    const matchesSearch =
      s.name.toLowerCase().includes(searchFilter.toLowerCase()) ||
      s.symbol.toLowerCase().includes(searchFilter.toLowerCase()) ||
      s.category.toLowerCase().includes(searchFilter.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="ts-markets-view">
      {/* Header */}
      <div className="view-header">
        <div>
          <h1 className="view-title">Markets</h1>
          <p className="view-subtitle">Track global equities, indices, ETFs, crypto, and commodities in real time</p>
        </div>
      </div>

      {/* Category Tabs & Search Bar */}
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
                <th style={{ width: '44px', textAlign: 'center' }}>#</th>
                <th style={{ textAlign: 'left' }}>Asset Name</th>
                <th style={{ textAlign: 'right' }}>Price</th>
                <th style={{ textAlign: 'right' }}>24h Change</th>
                <th style={{ textAlign: 'right' }}>Cap / Volume</th>
                <th style={{ textAlign: 'center' }}>24h Trend</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan="7" className="text-center py-8 text-muted">
                    No assets found in category "{activeCategory}" matching "{searchFilter}".
                  </td>
                </tr>
              ) : (
                filtered.map((stock) => {
                  const isWatched = watchlist.includes(stock.symbol);
                  return (
                    <tr
                      key={stock.symbol}
                      className="market-row-hover"
                      onClick={() => onSelectStock(stock.rawProduct || { name: stock.name, sku: stock.symbol, price: stock.price })}
                    >
                      <td className="text-muted text-xs" style={{ textAlign: 'center' }}>{stock.rank}</td>
                      <td>
                        <div className="market-symbol-cell">
                          <div className="stock-logo-circle">
                            {stock.symbol.slice(0, 2)}
                          </div>
                          <div>
                            <div className="stock-primary-name">{stock.name}</div>
                            <div className="stock-secondary-ticker">
                              {stock.symbol} • <span className="text-muted">{stock.category}</span>
                            </div>
                          </div>
                        </div>
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        <strong className="stock-price-tabular">
                          ${stock.price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </strong>
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        <span className={`trend-badge-pill ${stock.isPositive ? 'trend-badge-up' : 'trend-badge-down'}`}>
                          {stock.isPositive ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
                          {stock.change}
                        </span>
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        <span className="text-slate-300 font-medium">{stock.cap}</span>
                        <div className="text-muted text-xs">{stock.vol}</div>
                      </td>
                      <td style={{ textAlign: 'center' }}>
                        <svg width="74" height="20" viewBox="0 0 80 24" fill="none" style={{ display: 'inline-block' }}>
                          <path
                            d={stock.path}
                            stroke={stock.isPositive ? '#10B981' : '#EF4444'}
                            strokeWidth="2"
                            strokeLinecap="round"
                          />
                        </svg>
                      </td>
                      <td style={{ textAlign: 'right' }} onClick={(e) => e.stopPropagation()}>
                        <div className="row-action-group" style={{ justifyContent: 'flex-end' }}>
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
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
