import React, { useState } from 'react';
import {
  ArrowLeft,
  ArrowUpRight,
  Star,
  Info
} from 'lucide-react';

export default function StockDetailsView({
  stock,
  onBack,
  onOpenTradeModal,
  watchlist = [],
  onToggleWatchlist
}) {
  const [timeframe, setTimeframe] = useState('1M');
  const [activeTab, setActiveTab] = useState('Overview');

  // Fallback defaults if no specific stock passed
  const currentStock = stock || {
    name: 'Reliance Industries Ltd',
    sku: 'RELIANCE',
    price: 2892.45,
    change: '+143.20 (+5.23%)',
    exchange: 'NSE: RELIANCE',
  };

  const isWatched = watchlist.includes(currentStock.sku);

  // Simulated chart points based on timeframe
  const chartPointsByTf = {
    '1D': [2840, 2855, 2850, 2872, 2865, 2885, 2892.45],
    '1W': [2780, 2810, 2795, 2840, 2860, 2875, 2892.45],
    '1M': [2650, 2710, 2690, 2760, 2815, 2840, 2860, 2892.45],
    '3M': [2520, 2590, 2640, 2610, 2720, 2790, 2850, 2892.45],
    '1Y': [2310, 2420, 2390, 2510, 2620, 2580, 2710, 2790, 2840, 2892.45],
    'ALL': [1850, 2100, 2050, 2350, 2520, 2710, 2892.45],
  };

  const activePoints = chartPointsByTf[timeframe] || chartPointsByTf['1M'];
  const minVal = Math.min(...activePoints) * 0.98;
  const maxVal = Math.max(...activePoints) * 1.02;

  const svgW = 680;
  const svgH = 300;
  const padX = 40;
  const padY = 30;

  const getX = (i) => padX + (i / (activePoints.length - 1)) * (svgW - padX * 2);
  const getY = (val) => svgH - padY - ((val - minVal) / (maxVal - minVal)) * (svgH - padY * 2);

  const coords = activePoints.map((v, i) => ({ x: getX(i), y: getY(v), val: v }));
  const pathD = coords.reduce((acc, p, i) => {
    if (i === 0) return `M ${p.x} ${p.y}`;
    const prev = coords[i - 1];
    const cx = (prev.x + p.x) / 2;
    return `${acc} C ${cx} ${prev.y}, ${cx} ${p.y}, ${p.x} ${p.y}`;
  }, '');

  const areaD = `${pathD} L ${coords[coords.length - 1].x} ${svgH - padY} L ${coords[0].x} ${svgH - padY} Z`;

  // Financial Statistics matching the reference image
  const metrics = [
    { label: 'Day Range', value: '2,730.15 - 2,945.60' },
    { label: '52 Week Range', value: '2,220.30 - 3,024.70' },
    { label: 'Market Cap', value: '₹19.5T' },
    { label: 'P/E Ratio', value: '28.45' },
    { label: 'EPS', value: '101.65' },
    { label: 'Dividend Yield', value: '0.34%' },
    { label: 'Beta', value: '1.15' },
    { label: 'Volume', value: '12.4M' },
    { label: 'Avg. Volume', value: '15.2M' },
  ];

  const tabs = ['Overview', 'Financials', 'News', 'Chart', 'Technicals', 'Peers'];

  return (
    <div className="ts-stock-details-view">
      {/* Breadcrumb & Navigation */}
      <div className="stock-breadcrumb-row">
        <button type="button" className="btn-back-link" onClick={onBack}>
          <ArrowLeft size={16} />
          <span>Back to Markets</span>
        </button>
        <span className="breadcrumb-slash">/</span>
        <span className="breadcrumb-active">{currentStock.sku}</span>
      </div>

      {/* Stock Main Title & Quick Trade Actions */}
      <div className="stock-hero-header">
        <div className="stock-identity">
          <div className="flex items-center gap-3">
            <h1 className="stock-full-name">{currentStock.name}</h1>
            <span className="stock-exchange-tag">{currentStock.exchange || `NSE: ${currentStock.sku}`}</span>
            <button
              type="button"
              className={`btn-star-round ${isWatched ? 'starred' : ''}`}
              onClick={() => onToggleWatchlist(currentStock.sku)}
              title={isWatched ? 'Remove from Watchlist' : 'Add to Watchlist'}
            >
              <Star size={16} fill={isWatched ? '#F59E0B' : 'transparent'} stroke={isWatched ? '#F59E0B' : '#94A3B8'} />
            </button>
          </div>

          <div className="stock-price-banner">
            <h2 className="current-price-huge">₹{Number(currentStock.price).toLocaleString('en-US', { minimumFractionDigits: 2 })}</h2>
            <span className="price-change-pill text-emerald">
              <ArrowUpRight size={16} /> +143.20 (+5.23%)
            </span>
            <span className="text-muted text-xs">• Real-time Market Data</span>
          </div>
        </div>

        {/* Primary Trade Execution CTA Buttons */}
        <div className="stock-trade-cta-group">
          <button
            type="button"
            className="btn-stock-buy"
            onClick={() => onOpenTradeModal(currentStock, 'BUY')}
          >
            Buy
          </button>
          <button
            type="button"
            className="btn-stock-sell"
            onClick={() => onOpenTradeModal(currentStock, 'SELL')}
          >
            Sell
          </button>
        </div>
      </div>

      {/* Main Grid: Interactive Chart + Key Metrics */}
      <div className="stock-chart-metrics-grid">
        {/* Left: Interactive Candlestick / Area Chart */}
        <div className="ts-card stock-chart-box">
          <div className="stock-chart-controls">
            <div className="timeframe-selector">
              {['1D', '1W', '1M', '3M', '1Y', 'ALL'].map((tf) => (
                <button
                  key={tf}
                  type="button"
                  className={`tf-btn ${timeframe === tf ? 'active' : ''}`}
                  onClick={() => setTimeframe(tf)}
                >
                  {tf}
                </button>
              ))}
            </div>
            <div className="chart-type-indicator text-muted text-xs">
              Candle / Area View
            </div>
          </div>

          <div className="stock-svg-chart-container">
            <svg
              className="stock-svg"
              viewBox={`0 0 ${svgW} ${svgH}`}
              preserveAspectRatio="none"
            >
              <defs>
                <linearGradient id="stockDetailGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#10B981" stopOpacity="0.4" />
                  <stop offset="60%" stopColor="#10B981" stopOpacity="0.1" />
                  <stop offset="100%" stopColor="#10B981" stopOpacity="0.0" />
                </linearGradient>
              </defs>

              {/* Grid Lines */}
              {[0, 0.25, 0.5, 0.75, 1].map((p, idx) => {
                const y = padY + p * (svgH - padY * 2);
                const val = Math.round(maxVal - p * (maxVal - minVal));
                return (
                  <g key={idx}>
                    <line
                      x1={padX}
                      y1={y}
                      x2={svgW - padX}
                      y2={y}
                      stroke="#1E293B"
                      strokeDasharray="4 4"
                      strokeWidth="1"
                    />
                    <text x={svgW - padX + 8} y={y + 4} fill="#64748B" fontSize="10">
                      ₹{val}
                    </text>
                  </g>
                );
              })}

              <path d={areaD} fill="url(#stockDetailGrad)" />
              <path
                d={pathD}
                fill="none"
                stroke="#10B981"
                strokeWidth="2.8"
                strokeLinecap="round"
                strokeLinejoin="round"
              />

              {/* Current Price Line */}
              <line
                x1={padX}
                y1={coords[coords.length - 1].y}
                x2={svgW - padX}
                y2={coords[coords.length - 1].y}
                stroke="#34D399"
                strokeDasharray="3 3"
                strokeWidth="1.2"
              />
              <circle
                cx={coords[coords.length - 1].x}
                cy={coords[coords.length - 1].y}
                r="5"
                fill="#10B981"
              />
            </svg>
          </div>
        </div>

        {/* Right: Key Financial Metrics Panel */}
        <div className="ts-card stock-metrics-box">
          <div className="card-header-simple">
            <h3 className="card-heading">Key Statistics</h3>
            <Info size={15} className="text-muted" />
          </div>

          <div className="metrics-rows-list">
            {metrics.map((m, i) => (
              <div key={i} className="metric-spec-row">
                <span className="spec-label">{m.label}</span>
                <span className="spec-value">{m.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* In-Depth Bottom Tabs */}
      <div className="stock-tabs-container">
        <div className="stock-nav-tabs">
          {tabs.map((tab) => (
            <button
              key={tab}
              type="button"
              className={`stock-tab-btn ${activeTab === tab ? 'active' : ''}`}
              onClick={() => setActiveTab(tab)}
            >
              {tab}
            </button>
          ))}
        </div>

        <div className="ts-card stock-tab-content">
          {activeTab === 'Overview' && (
            <div className="tab-pane-overview">
              <h4 className="pane-title">Company Profile</h4>
              <p className="text-muted text-sm leading-relaxed mb-4">
                {currentStock.name} is a leading conglomerate operating across energy, petrochemicals, telecommunications, retail, and digital services. Headquartered in Mumbai, it stands as one of the most heavily capitalized enterprises in the global market index.
              </p>
              <div className="company-quick-chips">
                <span className="chip-item">Sector: Energy &amp; Technology</span>
                <span className="chip-item">Industry: Oil &amp; Gas / Retail</span>
                <span className="chip-item">Employees: 389,000+</span>
                <span className="chip-item">ISIN: INE002A01018</span>
              </div>
            </div>
          )}

          {activeTab === 'Financials' && (
            <div className="tab-pane-financials">
              <h4 className="pane-title">Annual Performance (FY 2024)</h4>
              <div className="financials-stat-row">
                <div className="fin-box">
                  <span className="fin-label">Revenue</span>
                  <span className="fin-val">₹9,74,864 Cr</span>
                  <span className="text-emerald text-xs">+11.5% YoY</span>
                </div>
                <div className="fin-box">
                  <span className="fin-label">Net Profit</span>
                  <span className="fin-val">₹79,020 Cr</span>
                  <span className="text-emerald text-xs">+7.3% YoY</span>
                </div>
                <div className="fin-box">
                  <span className="fin-label">Operating Margin</span>
                  <span className="fin-val">17.8%</span>
                  <span className="text-emerald text-xs">+0.4% bps</span>
                </div>
              </div>
            </div>
          )}

          {activeTab !== 'Overview' && activeTab !== 'Financials' && (
            <div className="text-center py-6 text-muted">
              Live {activeTab} information synchronized with TradeSphere analytics feed.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
