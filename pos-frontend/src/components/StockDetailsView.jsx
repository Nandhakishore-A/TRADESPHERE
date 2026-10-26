import React, { useState } from 'react';
import {
  ArrowLeft,
  ArrowUpRight,
  ArrowDownRight,
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
    change: '+5.23%',
    exchange: 'NSE: RELIANCE',
    category: 'Energy & Retail',
  };

  const symbol = currentStock.sku || currentStock.symbol || 'EQUITY';
  const isWatched = watchlist.includes(symbol);
  const basePrice = Number(currentStock.price) || 100;
  const isUp = !(currentStock.change && String(currentStock.change).includes('-'));

  // Company profiles dictionary for realism
  const companyProfiles = {
    AAPL: { sector: 'Technology', industry: 'Consumer Electronics', employees: '161,000+', isin: 'US0378331005', desc: 'Apple Inc. designs, manufactures, and markets smartphones, personal computers, tablets, wearables, and accessories, and sells a variety of related services including Apple Music, iCloud, and App Store.' },
    MSFT: { sector: 'Technology', industry: 'Enterprise Software & Cloud', employees: '221,000+', isin: 'US5949181045', desc: 'Microsoft Corporation is a multinational technology corporation producing computer software, consumer electronics, personal computers, and cloud infrastructure services through Azure.' },
    NVDA: { sector: 'Semiconductors', industry: 'AI Hardware & GPUs', employees: '29,600+', isin: 'US67066G1040', desc: 'NVIDIA Corporation designs graphics processing units (GPUs) for gaming and professional markets, as well as system on a chip units for mobile computing and automotive markets.' },
    TSLA: { sector: 'Automotive', industry: 'Electric Vehicles & Clean Energy', employees: '140,000+', isin: 'US88160R1014', desc: 'Tesla Inc. designs, develops, manufactures, sells, and leases electric vehicles, energy storage systems, and solar panels, alongside autonomous driving software.' },
    AMZN: { sector: 'Consumer Cyclical', industry: 'E-Commerce & Cloud Computing', employees: '1,525,000+', isin: 'US0231351067', desc: 'Amazon.com Inc. focuses on e-commerce, cloud computing (AWS), online advertising, digital streaming, and artificial intelligence.' },
    GOOGL: { sector: 'Technology', industry: 'Internet & Search Services', employees: '182,000+', isin: 'US02079K3059', desc: 'Alphabet Inc. is a multinational technology conglomerate holding company created through a restructuring of Google, focusing on search, cloud, advertising, and hardware.' },
    RELIANCE: { sector: 'Energy & Retail', industry: 'Oil & Gas / Telecom', employees: '389,000+', isin: 'INE002A01018', desc: 'Reliance Industries Limited operates across hydrocarbon exploration and production, petroleum refining and marketing, petrochemicals, retail, and digital telecommunication services via Jio.' },
    TCS: { sector: 'Technology', industry: 'IT Services & Consulting', employees: '601,000+', isin: 'INE467B01029', desc: 'Tata Consultancy Services is a global leader in IT services, consulting, and business solutions, operating in 55 countries.' },
    HDFCBANK: { sector: 'Banking', industry: 'Private Sector Banking', employees: '177,000+', isin: 'INE040A01034', desc: 'HDFC Bank is India’s largest private sector bank by assets, providing wholesale, retail, and treasury banking products.' },
    INFY: { sector: 'Technology', industry: 'Digital IT & Cloud Solutions', employees: '317,000+', isin: 'INE009A01021', desc: 'Infosys is a global leader in next-generation digital services and consulting, enabling clients in more than 56 countries to navigate their digital transformation.' },
  };

  const profile = companyProfiles[symbol] || {
    sector: currentStock.category || 'General Equity',
    industry: 'Diversified Commercial',
    employees: '50,000+',
    isin: `TS-${symbol}-001`,
    desc: `${currentStock.name} is a publicly traded enterprise actively listed on TradeSphere with live execution and settlement support.`,
  };

  // Dynamic simulated chart points tailored to the current stock price
  const chartPointsByTf = {
    '1D': [basePrice * 0.988, basePrice * 0.993, basePrice * 0.991, basePrice * 0.997, basePrice * 0.994, basePrice * 0.999, basePrice],
    '1W': [basePrice * 0.965, basePrice * 0.978, basePrice * 0.972, basePrice * 0.985, basePrice * 0.991, basePrice * 0.995, basePrice],
    '1M': [basePrice * 0.925, basePrice * 0.945, basePrice * 0.938, basePrice * 0.962, basePrice * 0.978, basePrice * 0.989, basePrice],
    '3M': [basePrice * 0.865, basePrice * 0.905, basePrice * 0.885, basePrice * 0.942, basePrice * 0.965, basePrice * 0.982, basePrice],
    '1Y': [basePrice * 0.765, basePrice * 0.825, basePrice * 0.805, basePrice * 0.865, basePrice * 0.915, basePrice * 0.955, basePrice],
    'ALL': [basePrice * 0.585, basePrice * 0.695, basePrice * 0.745, basePrice * 0.855, basePrice * 0.925, basePrice],
  };

  const activePoints = chartPointsByTf[timeframe] || chartPointsByTf['1M'];
  const minVal = Math.min(...activePoints) * 0.985;
  const maxVal = Math.max(...activePoints) * 1.015;

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

  // Realistic statistics tailored to base price
  const metrics = [
    { label: 'Day Range', value: `$${(basePrice * 0.982).toFixed(2)} - $${(basePrice * 1.018).toFixed(2)}` },
    { label: '52 Week Range', value: `$${(basePrice * 0.78).toFixed(2)} - $${(basePrice * 1.15).toFixed(2)}` },
    { label: 'Market Cap', value: basePrice > 1000 ? '₹18.4T' : '$2.1T' },
    { label: 'P/E Ratio', value: (24.5 + (basePrice % 15)).toFixed(2) },
    { label: 'EPS (TTM)', value: `$${(basePrice / 25).toFixed(2)}` },
    { label: 'Dividend Yield', value: '1.24%' },
    { label: 'Beta (5Y)', value: '1.08' },
    { label: 'Volume (24h)', value: '14.2M' },
    { label: 'Avg. Volume (3M)', value: '18.6M' },
  ];

  const tabs = ['Overview', 'Financials', 'Technicals', 'Peers', 'News', 'Chart'];

  return (
    <div className="ts-stock-details-view">
      {/* Breadcrumb Navigation */}
      <div className="stock-breadcrumb-row">
        <button type="button" className="btn-back-link" onClick={onBack}>
          <ArrowLeft size={16} />
          <span>Back to Markets</span>
        </button>
        <span className="breadcrumb-slash">/</span>
        <span className="breadcrumb-active">{symbol}</span>
      </div>

      {/* Stock Main Title & Quick Trade Actions */}
      <div className="stock-hero-header">
        <div className="stock-identity">
          <div className="flex items-center gap-3">
            <h1 className="stock-full-name">{currentStock.name}</h1>
            <span className="stock-exchange-tag">{currentStock.exchange || `NASDAQ: ${symbol}`}</span>
            <button
              type="button"
              className={`btn-star-round ${isWatched ? 'starred' : ''}`}
              onClick={() => onToggleWatchlist(symbol)}
              title={isWatched ? 'Remove from Watchlist' : 'Add to Watchlist'}
            >
              <Star size={16} fill={isWatched ? '#F59E0B' : 'transparent'} stroke={isWatched ? '#F59E0B' : '#94A3B8'} />
            </button>
          </div>

          <div className="stock-price-banner">
            <h2 className="current-price-huge">${basePrice.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</h2>
            <span className={`price-change-pill ${isUp ? 'text-emerald' : 'text-danger'}`}>
              {isUp ? <ArrowUpRight size={16} /> : <ArrowDownRight size={16} />}
              {currentStock.change || '+2.34%'}
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
            Buy {symbol}
          </button>
          <button
            type="button"
            className="btn-stock-sell"
            onClick={() => onOpenTradeModal(currentStock, 'SELL')}
          >
            Sell {symbol}
          </button>
        </div>
      </div>

      {/* Main Grid: Interactive Chart + Key Metrics */}
      <div className="stock-chart-metrics-grid">
        {/* Left: Interactive Area & Line Chart */}
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
              Intraday &amp; Trailing Area View
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
                const val = (maxVal - p * (maxVal - minVal)).toFixed(2);
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
                      ${val}
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

      {/* In-Depth Interactive Bottom Tabs */}
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
          {/* TAB 1: Overview */}
          {activeTab === 'Overview' && (
            <div className="tab-pane-overview">
              <h4 className="pane-title">Company Profile</h4>
              <p className="text-muted text-sm leading-relaxed mb-4">
                {profile.desc}
              </p>
              <div className="company-quick-chips">
                <span className="chip-item">Sector: {profile.sector}</span>
                <span className="chip-item">Industry: {profile.industry}</span>
                <span className="chip-item">Employees: {profile.employees}</span>
                <span className="chip-item">ISIN: {profile.isin}</span>
              </div>
            </div>
          )}

          {/* TAB 2: Financials */}
          {activeTab === 'Financials' && (
            <div className="tab-pane-financials">
              <h4 className="pane-title">Annual Performance &amp; Margins</h4>
              <div className="financials-stat-row">
                <div className="fin-box">
                  <span className="fin-label">Annual Revenue</span>
                  <span className="fin-val">${(basePrice * 2.8).toFixed(1)}B</span>
                  <span className="text-emerald text-xs">+11.5% YoY</span>
                </div>
                <div className="fin-box">
                  <span className="fin-label">Net Income</span>
                  <span className="fin-val">${(basePrice * 0.72).toFixed(1)}B</span>
                  <span className="text-emerald text-xs">+8.4% YoY</span>
                </div>
                <div className="fin-box">
                  <span className="fin-label">Operating Margin</span>
                  <span className="fin-val">26.4%</span>
                  <span className="text-emerald text-xs">+0.8% bps</span>
                </div>
                <div className="fin-box">
                  <span className="fin-label">Cash &amp; Equivalents</span>
                  <span className="fin-val">${(basePrice * 1.1).toFixed(1)}B</span>
                  <span className="text-emerald text-xs">Strong Reserves</span>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: Technicals */}
          {activeTab === 'Technicals' && (
            <div className="p-2">
              <h4 className="pane-title mb-4">Technical Indicators (Daily)</h4>
              <div className="grid grid-cols-3 gap-4" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '14px' }}>
                <div className="ts-card" style={{ padding: '14px' }}>
                  <div className="text-muted text-xs">Relative Strength Index (RSI 14)</div>
                  <strong className="text-emerald text-lg">58.42</strong>
                  <div className="text-xs text-muted">Neutral / Bullish Momentum</div>
                </div>
                <div className="ts-card" style={{ padding: '14px' }}>
                  <div className="text-muted text-xs">MACD (12, 26, 9)</div>
                  <strong className="text-emerald text-lg">+4.12</strong>
                  <div className="text-xs text-emerald">Bullish Signal Crossover</div>
                </div>
                <div className="ts-card" style={{ padding: '14px' }}>
                  <div className="text-muted text-xs">50 Day Moving Average</div>
                  <strong className="text-white text-lg">${(basePrice * 0.96).toFixed(2)}</strong>
                  <div className="text-xs text-emerald">Above 50 DMA</div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: Peers */}
          {activeTab === 'Peers' && (
            <div className="table-responsive">
              <h4 className="pane-title mb-3">Industry Competitors &amp; Comparables</h4>
              <table className="ts-market-table">
                <thead>
                  <tr>
                    <th>Company</th>
                    <th>Ticker</th>
                    <th style={{ textAlign: 'right' }}>Price</th>
                    <th style={{ textAlign: 'right' }}>P/E Ratio</th>
                    <th style={{ textAlign: 'right' }}>Market Cap</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td><strong>{currentStock.name}</strong></td>
                    <td>{symbol}</td>
                    <td style={{ textAlign: 'right' }}>${basePrice.toFixed(2)}</td>
                    <td style={{ textAlign: 'right' }}>28.4</td>
                    <td style={{ textAlign: 'right' }}>$2.1T</td>
                  </tr>
                  <tr>
                    <td>Microsoft Corporation</td>
                    <td>MSFT</td>
                    <td style={{ textAlign: 'right' }}>$412.30</td>
                    <td style={{ textAlign: 'right' }}>34.2</td>
                    <td style={{ textAlign: 'right' }}>$3.1T</td>
                  </tr>
                  <tr>
                    <td>Alphabet Inc.</td>
                    <td>GOOGL</td>
                    <td style={{ textAlign: 'right' }}>$145.20</td>
                    <td style={{ textAlign: 'right' }}>23.8</td>
                    <td style={{ textAlign: 'right' }}>$1.8T</td>
                  </tr>
                </tbody>
              </table>
            </div>
          )}

          {/* TAB 5: News */}
          {activeTab === 'News' && (
            <div className="p-2">
              <h4 className="pane-title mb-3">Latest Headlines for {symbol}</h4>
              <div className="flex flex-col gap-3" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div className="ts-card" style={{ padding: '14px' }}>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="trend-pill trend-up">Earnings Update</span>
                    <span className="text-muted text-xs">• 3 hours ago</span>
                  </div>
                  <h5 className="text-white font-semibold">{currentStock.name} reports robust quarterly performance beating consensus estimates.</h5>
                  <p className="text-muted text-xs mt-1">Operating revenue expanded across core division segments with increased capital expenditures allocated to cloud and AI infrastructure.</p>
                </div>
                <div className="ts-card" style={{ padding: '14px' }}>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="trend-pill trend-up-blue">Analyst Ratings</span>
                    <span className="text-muted text-xs">• 1 day ago</span>
                  </div>
                  <h5 className="text-white font-semibold">Major investment firms reiterate Overweight rating with upgraded 12-month price targets.</h5>
                  <p className="text-muted text-xs mt-1">Institutional inflow momentum remains strong following resilient gross margin retention.</p>
                </div>
              </div>
            </div>
          )}

          {/* TAB 6: Chart */}
          {activeTab === 'Chart' && (
            <div className="p-4 text-center">
              <h4 className="pane-title mb-2">Technical Chart Terminal</h4>
              <p className="text-muted text-sm">Interactive Candlestick, Volume Profile, and MACD overlays synchronized in the main chart module above.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
