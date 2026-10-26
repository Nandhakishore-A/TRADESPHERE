import React, { useState } from 'react';
import {
  TrendingUp,
  DollarSign,
  Wallet,
  ArrowUpRight,
  ArrowDownRight,
  ArrowRight
} from 'lucide-react';

export default function DashboardView({
  portfolioData: _portfolioData,
  stocks = [],
  orders = [],
  onSelectStock,
  onOpenTradeModal: _onOpenTradeModal,
  onSelectView,
}) {
  const [chartTimeframe, setChartTimeframe] = useState('1Y');
  const [hoveredPoint, setHoveredPoint] = useState(null);

  // Timeframe chart datasets for portfolio growth simulation
  const chartDatasets = {
    '1D': [
      { label: '09:30', val: 24100 },
      { label: '11:00', val: 24220 },
      { label: '12:30', val: 24180 },
      { label: '14:00', val: 24450 },
      { label: '15:30', val: 24567.89 },
    ],
    '1W': [
      { label: 'Mon', val: 23600 },
      { label: 'Tue', val: 23900 },
      { label: 'Wed', val: 23800 },
      { label: 'Thu', val: 24250 },
      { label: 'Fri', val: 24567.89 },
    ],
    '1M': [
      { label: 'Week 1', val: 22800 },
      { label: 'Week 2', val: 23400 },
      { label: 'Week 3', val: 23950 },
      { label: 'Week 4', val: 24567.89 },
    ],
    '3M': [
      { label: 'Oct', val: 21500 },
      { label: 'Nov', val: 22900 },
      { label: 'Dec', val: 24567.89 },
    ],
    '1Y': [
      { label: 'Jan', val: 18450 },
      { label: 'Feb', val: 19100 },
      { label: 'Mar', val: 18950 },
      { label: 'Apr', val: 19800 },
      { label: 'May', val: 20400 },
      { label: 'Jun', val: 21200 },
      { label: 'Jul', val: 20900 },
      { label: 'Aug', val: 22100 },
      { label: 'Sep', val: 22850 },
      { label: 'Oct', val: 23400 },
      { label: 'Nov', val: 23950 },
      { label: 'Dec', val: 24567.89 },
    ],
    'ALL': [
      { label: '2021', val: 12000 },
      { label: '2022', val: 15400 },
      { label: '2023', val: 18200 },
      { label: '2024', val: 24567.89 },
    ],
  };

  const activeData = chartDatasets[chartTimeframe] || chartDatasets['1Y'];

  // SVG Chart Dimensions & Calculations
  const chartWidth = 720;
  const chartHeight = 260;
  const paddingX = 40;
  const paddingY = 30;

  const minVal = Math.min(...activeData.map((d) => d.val)) * 0.95;
  const maxVal = Math.max(...activeData.map((d) => d.val)) * 1.05;

  const getX = (idx) => paddingX + (idx / (activeData.length - 1)) * (chartWidth - paddingX * 2);
  const getY = (val) => chartHeight - paddingY - ((val - minVal) / (maxVal - minVal)) * (chartHeight - paddingY * 2);

  // Generate SVG Path
  const points = activeData.map((d, idx) => ({ x: getX(idx), y: getY(d.val), ...d }));
  const pathD = points.reduce((acc, p, i) => {
    if (i === 0) return `M ${p.x} ${p.y}`;
    const prev = points[i - 1];
    const cx = (prev.x + p.x) / 2;
    return `${acc} C ${cx} ${prev.y}, ${cx} ${p.y}, ${p.x} ${p.y}`;
  }, '');

  const areaD = `${pathD} L ${points[points.length - 1].x} ${chartHeight - paddingY} L ${points[0].x} ${chartHeight - paddingY} Z`;

  // Top Gainers data matching the screenshot
  const topGainers = [
    { symbol: 'RELIANCE', name: 'Reliance Industries', price: 2892.45, change: '+5.23%', isPositive: true },
    { symbol: 'TCS', name: 'Tata Consultancy Services', price: 4123.80, change: '+4.56%', isPositive: true },
    { symbol: 'HDFCBANK', name: 'HDFC Bank Ltd', price: 1678.90, change: '+3.45%', isPositive: true },
    { symbol: 'INFY', name: 'Infosys Ltd', price: 1456.20, change: '+3.12%', isPositive: true },
    { symbol: 'ICICIBANK', name: 'ICICI Bank Ltd', price: 1234.50, change: '+2.89%', isPositive: true },
  ];

  // Top Losers data matching the screenshot
  const topLosers = [
    { symbol: 'ADANIENT', name: 'Adani Enterprises', price: 3245.70, change: '-2.34%', isPositive: false },
    { symbol: 'SBIN', name: 'State Bank of India', price: 612.40, change: '-1.89%', isPositive: false },
    { symbol: 'BAJFINANCE', name: 'Bajaj Finance', price: 6789.20, change: '-1.23%', isPositive: false },
    { symbol: 'HINDUNILVR', name: 'Hindustan Unilever', price: 2456.90, change: '-0.98%', isPositive: false },
    { symbol: 'KOTAKBANK', name: 'Kotak Mahindra Bank', price: 1890.35, change: '-0.85%', isPositive: false },
  ];

  // Market Indices matching the screenshot
  const marketIndices = [
    { name: 'S&P 500', value: '5,038.45', change: '+1.23%', isUp: true, path: 'M0,15 Q20,18 40,10 T80,5' },
    { name: 'NASDAQ', value: '15,628.32', change: '+1.56%', isUp: true, path: 'M0,18 Q20,12 40,14 T80,4' },
    { name: 'DOW JONES', value: '38,723.12', change: '+0.19%', isUp: true, path: 'M0,12 Q20,14 40,8 T80,9' },
    { name: 'NIFTY', value: '22,456.75', change: '+1.34%', isUp: true, path: 'M0,16 Q20,14 40,9 T80,3' },
    { name: 'SENSEX', value: '74,382.29', change: '+1.21%', isUp: true, path: 'M0,17 Q20,15 40,11 T80,4' },
  ];

  // Recent Transactions preview
  const recentTrades = orders.length > 0
    ? orders.slice(0, 4).map((o) => ({
        id: o._id,
        type: o.items?.[0]?.quantity > 0 ? 'Buy' : 'Sell',
        symbol: o.items?.[0]?.name || 'RELIANCE',
        shares: o.items?.[0]?.quantity || 10,
        amount: o.totalAmount ? `$${o.totalAmount.toFixed(2)}` : '$28,924.50',
        date: o.createdAt ? new Date(o.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'Dec 12, 2024',
      }))
    : [
        { id: '1', type: 'Buy', symbol: 'RELIANCE', shares: 10, amount: '$28,924.50', date: 'Dec 12, 2024' },
        { id: '2', type: 'Sell', symbol: 'TCS', shares: 5, amount: '$20,619.00', date: 'Dec 11, 2024' },
        { id: '3', type: 'Buy', symbol: 'INFY', shares: 15, amount: '$21,843.00', date: 'Dec 10, 2024' },
        { id: '4', type: 'Buy', symbol: 'HDFCBANK', shares: 8, amount: '$13,431.20', date: 'Dec 08, 2024' },
      ];

  return (
    <div className="ts-dashboard-view">
      {/* View Header */}
      <div className="view-header">
        <div>
          <h1 className="view-title">Dashboard</h1>
          <p className="view-subtitle">Welcome back! Here's your investment overview.</p>
        </div>
      </div>

      {/* 4 Stat KPI Cards Grid */}
      <div className="ts-kpi-grid">
        {/* Card 1: Total Portfolio Value */}
        <div className="ts-kpi-card">
          <div className="kpi-top">
            <span className="kpi-label">Total Portfolio Value</span>
            <div className="kpi-icon-badge bg-emerald-dim">
              <TrendingUp size={18} className="text-emerald" />
            </div>
          </div>
          <div className="kpi-value-row">
            <h2 className="kpi-value">$24,567.89</h2>
          </div>
          <div className="kpi-trend-row">
            <span className="trend-pill trend-up">
              <ArrowUpRight size={13} /> +12.34% (+$2,698.45)
            </span>
          </div>
        </div>

        {/* Card 2: Total Investment */}
        <div className="ts-kpi-card">
          <div className="kpi-top">
            <span className="kpi-label">Total Investment</span>
            <div className="kpi-icon-badge bg-blue-dim">
              <Wallet size={18} className="text-blue" />
            </div>
          </div>
          <div className="kpi-value-row">
            <h2 className="kpi-value">$18,450.00</h2>
          </div>
          <div className="kpi-trend-row">
            <span className="trend-pill trend-up-blue">
              <ArrowUpRight size={13} /> +6.21% (+$1,078.34)
            </span>
          </div>
        </div>

        {/* Card 3: Today's P/L */}
        <div className="ts-kpi-card">
          <div className="kpi-top">
            <span className="kpi-label">Today's P/L</span>
            <div className="kpi-icon-badge bg-emerald-dim">
              <DollarSign size={18} className="text-emerald" />
            </div>
          </div>
          <div className="kpi-value-row">
            <h2 className="kpi-value text-emerald">+$1,234.56</h2>
          </div>
          <div className="kpi-trend-row">
            <span className="trend-pill trend-up">
              <ArrowUpRight size={13} /> +5.28%
            </span>
          </div>
        </div>

        {/* Card 4: Total Returns */}
        <div className="ts-kpi-card">
          <div className="kpi-top">
            <span className="kpi-label">Total Returns</span>
            <div className="kpi-icon-badge bg-purple-dim">
              <TrendingUp size={18} className="text-purple" />
            </div>
          </div>
          <div className="kpi-value-row">
            <h2 className="kpi-value text-purple">+33.12%</h2>
          </div>
          <div className="kpi-trend-row">
            <span className="trend-pill trend-up">
              +$6,117.89
            </span>
          </div>
        </div>
      </div>

      {/* Main Charts & Indices Row */}
      <div className="ts-chart-indices-row">
        {/* Left: Portfolio Performance Chart */}
        <div className="ts-card performance-chart-card">
          <div className="chart-card-header">
            <div>
              <h3 className="card-heading">Portfolio Performance</h3>
              <div className="chart-current-stat">
                <span className="chart-price-large">
                  ${hoveredPoint ? hoveredPoint.val.toLocaleString('en-US', { minimumFractionDigits: 2 }) : '24,567.89'}
                </span>
                <span className="trend-pill trend-up">
                  <ArrowUpRight size={12} /> +12.34%
                </span>
              </div>
            </div>

            <div className="timeframe-selector">
              {['1D', '1W', '1M', '3M', '1Y', 'ALL'].map((tf) => (
                <button
                  key={tf}
                  type="button"
                  className={`tf-btn ${chartTimeframe === tf ? 'active' : ''}`}
                  onClick={() => {
                    setChartTimeframe(tf);
                    setHoveredPoint(null);
                  }}
                >
                  {tf}
                </button>
              ))}
            </div>
          </div>

          {/* High-Performance SVG Chart */}
          <div className="svg-chart-wrapper">
            <svg
              className="performance-svg"
              viewBox={`0 0 ${chartWidth} ${chartHeight}`}
              preserveAspectRatio="none"
              onMouseLeave={() => setHoveredPoint(null)}
            >
              <defs>
                <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#10B981" stopOpacity="0.35" />
                  <stop offset="60%" stopColor="#10B981" stopOpacity="0.08" />
                  <stop offset="100%" stopColor="#10B981" stopOpacity="0.00" />
                </linearGradient>
              </defs>

              {/* Grid Lines */}
              {[0, 0.25, 0.5, 0.75, 1].map((pct, i) => {
                const y = paddingY + pct * (chartHeight - paddingY * 2);
                const gridVal = Math.round(maxVal - pct * (maxVal - minVal));
                return (
                  <g key={i}>
                    <line
                      x1={paddingX}
                      y1={y}
                      x2={chartWidth - paddingX}
                      y2={y}
                      stroke="#1E293B"
                      strokeDasharray="4 4"
                      strokeWidth="1"
                    />
                    <text
                      x={paddingX - 10}
                      y={y + 4}
                      fill="#64748B"
                      fontSize="11"
                      textAnchor="end"
                    >
                      {Math.round(gridVal / 1000)}k
                    </text>
                  </g>
                );
              })}

              {/* Area Fill */}
              <path d={areaD} fill="url(#chartGradient)" />

              {/* Glowing Line */}
              <path
                d={pathD}
                fill="none"
                stroke="#10B981"
                strokeWidth="2.8"
                strokeLinecap="round"
                strokeLinejoin="round"
              />

              {/* Interactive Points & Hover Crosshair */}
              {points.map((p, i) => (
                <g key={i}>
                  <circle
                    cx={p.x}
                    cy={p.y}
                    r={hoveredPoint?.label === p.label ? 6 : 3.5}
                    fill={hoveredPoint?.label === p.label ? '#10B981' : '#0B0F17'}
                    stroke="#10B981"
                    strokeWidth="2.5"
                    style={{ cursor: 'pointer', transition: 'r 0.15s ease' }}
                    onMouseEnter={() => setHoveredPoint(p)}
                  />
                  {/* Invisible hit target for smooth mouse interaction */}
                  <rect
                    x={p.x - 20}
                    y={0}
                    width={40}
                    height={chartHeight}
                    fill="transparent"
                    onMouseEnter={() => setHoveredPoint(p)}
                  />
                </g>
              ))}

              {/* Active Hover Tooltip Indicator */}
              {hoveredPoint && (
                <g>
                  <line
                    x1={hoveredPoint.x}
                    y1={paddingY}
                    x2={hoveredPoint.x}
                    y2={chartHeight - paddingY}
                    stroke="#34D399"
                    strokeDasharray="2 2"
                    strokeWidth="1.5"
                  />
                  <circle cx={hoveredPoint.x} cy={hoveredPoint.y} r="7" fill="#10B981" />
                  <circle cx={hoveredPoint.x} cy={hoveredPoint.y} r="3" fill="#FFFFFF" />
                </g>
              )}
            </svg>

            {/* X-Axis Labels */}
            <div className="chart-x-labels">
              {activeData.map((d, i) => (
                <span
                  key={i}
                  className={`x-label ${hoveredPoint?.label === d.label ? 'highlighted' : ''}`}
                >
                  {d.label}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Right: Market Indices Side Panel */}
        <div className="ts-card market-indices-card">
          <div className="card-header-simple">
            <h3 className="card-heading">Market Indices</h3>
            <span className="badge-live-pulse">LIVE</span>
          </div>

          <div className="indices-list">
            {marketIndices.map((idx, i) => (
              <div key={i} className="index-row-item">
                <div className="index-info-col">
                  <span className="index-name">{idx.name}</span>
                  <span className="index-value">{idx.value}</span>
                </div>

                <div className="index-spark-col">
                  <svg width="64" height="24" viewBox="0 0 80 24" fill="none">
                    <path
                      d={idx.path}
                      stroke={idx.isUp ? '#10B981' : '#EF4444'}
                      strokeWidth="2"
                      strokeLinecap="round"
                    />
                  </svg>
                </div>

                <div className="index-change-col">
                  <span className={`index-change-pill ${idx.isUp ? 'text-emerald' : 'text-danger'}`}>
                    {idx.isUp ? <ArrowUpRight size={13} /> : <ArrowDownRight size={13} />}
                    {idx.change}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom 3-Column Section: Top Gainers, Top Losers, Recent Transactions */}
      <div className="ts-bottom-three-grid">
        {/* Column 1: Top Gainers */}
        <div className="ts-card table-preview-card">
          <div className="card-header-simple">
            <div className="flex items-center gap-2">
              <div className="dot-indicator bg-emerald" />
              <h3 className="card-heading">Top Gainers</h3>
            </div>
            <button
              type="button"
              className="btn-card-link"
              onClick={() => onSelectView('markets')}
            >
              See All <ArrowRight size={13} />
            </button>
          </div>

          <div className="compact-equities-list">
            {topGainers.map((stock, i) => (
              <div
                key={i}
                className="compact-equity-row"
                onClick={() => {
                  const match = stocks.find((s) => s.sku === stock.symbol);
                  onSelectStock(match || { name: stock.name, sku: stock.symbol, price: stock.price });
                }}
              >
                <div className="stock-avatar-badge bg-emerald-dim text-emerald">
                  {stock.symbol.slice(0, 3)}
                </div>
                <div className="equity-title-col">
                  <span className="equity-symbol">{stock.symbol}</span>
                  <span className="equity-subname">{stock.name}</span>
                </div>
                <div className="equity-price-col">
                  <span className="equity-price">₹{stock.price.toFixed(2)}</span>
                  <span className="equity-change text-emerald">{stock.change}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Column 2: Top Losers */}
        <div className="ts-card table-preview-card">
          <div className="card-header-simple">
            <div className="flex items-center gap-2">
              <div className="dot-indicator bg-danger" />
              <h3 className="card-heading">Top Losers</h3>
            </div>
            <button
              type="button"
              className="btn-card-link"
              onClick={() => onSelectView('markets')}
            >
              See All <ArrowRight size={13} />
            </button>
          </div>

          <div className="compact-equities-list">
            {topLosers.map((stock, i) => (
              <div
                key={i}
                className="compact-equity-row"
                onClick={() => {
                  const match = stocks.find((s) => s.sku === stock.symbol);
                  onSelectStock(match || { name: stock.name, sku: stock.symbol, price: stock.price });
                }}
              >
                <div className="stock-avatar-badge bg-danger-dim text-danger">
                  {stock.symbol.slice(0, 3)}
                </div>
                <div className="equity-title-col">
                  <span className="equity-symbol">{stock.symbol}</span>
                  <span className="equity-subname">{stock.name}</span>
                </div>
                <div className="equity-price-col">
                  <span className="equity-price">₹{stock.price.toFixed(2)}</span>
                  <span className="equity-change text-danger">{stock.change}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Column 3: Recent Transactions */}
        <div className="ts-card table-preview-card">
          <div className="card-header-simple">
            <h3 className="card-heading">Recent Transactions</h3>
            <button
              type="button"
              className="btn-card-link"
              onClick={() => onSelectView('transactions')}
            >
              View All <ArrowRight size={13} />
            </button>
          </div>

          <div className="recent-trades-list">
            {recentTrades.map((t, idx) => (
              <div key={idx} className="recent-trade-item">
                <span className={`trade-badge ${t.type.toLowerCase() === 'buy' ? 'badge-buy' : 'badge-sell'}`}>
                  {t.type}
                </span>
                <div className="trade-meta-col">
                  <span className="trade-symbol">{t.symbol}</span>
                  <span className="trade-shares">{t.shares} Shares • {t.date}</span>
                </div>
                <span className="trade-total-val">{t.amount}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
