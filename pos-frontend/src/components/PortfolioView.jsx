import React, { useState } from 'react';
import {
  ArrowUpRight,
  ArrowDownRight,
  PlusCircle,
  Briefcase,
  DollarSign,
  TrendingUp,
  Wallet
} from 'lucide-react';

export default function PortfolioView({
  stocks = [],
  orders: _orders = [],
  onSelectStock,
  onOpenTradeModal
}) {
  const [activeTab, setActiveTab] = useState('Holdings');

  // Holdings data matching the reference image
  const defaultHoldings = [
    { symbol: 'RELIANCE', name: 'Reliance Industries', shares: 10, avgPrice: 2450.00, ltp: 2892.45, isProfit: true },
    { symbol: 'TCS', name: 'Tata Consultancy Services', shares: 5, avgPrice: 3650.00, ltp: 4123.80, isProfit: true },
    { symbol: 'HDFCBANK', name: 'HDFC Bank Ltd', shares: 8, avgPrice: 1450.00, ltp: 1678.90, isProfit: true },
    { symbol: 'INFY', name: 'Infosys Ltd', shares: 15, avgPrice: 1250.00, ltp: 1456.20, isProfit: true },
    { symbol: 'ICICIBANK', name: 'ICICI Bank Ltd', shares: 12, avgPrice: 1100.00, ltp: 1234.50, isProfit: true },
  ];

  // Calculated portfolio values
  const holdingsWithMetrics = defaultHoldings.map((h) => {
    const liveStock = stocks.find((s) => s.sku === h.symbol);
    const currentPrice = liveStock ? liveStock.price : h.ltp;
    const investedVal = h.shares * h.avgPrice;
    const currentVal = h.shares * currentPrice;
    const pnl = currentVal - investedVal;
    const pnlPct = (pnl / investedVal) * 100;

    return {
      ...h,
      ltp: currentPrice,
      currentVal,
      investedVal,
      pnl,
      pnlPct,
      isProfit: pnl >= 0,
      rawProduct: liveStock,
    };
  });

  const totalCurrentValue = holdingsWithMetrics.reduce((sum, h) => sum + h.currentVal, 0);
  const totalInvested = holdingsWithMetrics.reduce((sum, h) => sum + h.investedVal, 0);
  const totalPnl = totalCurrentValue - totalInvested;
  const totalReturnPct = (totalPnl / totalInvested) * 100;

  // Asset allocation percentages for donut chart
  const allocations = [
    { name: 'RELIANCE', pct: 28.5, color: '#3B82F6' },
    { name: 'TCS', pct: 20.4, color: '#06B6D4' },
    { name: 'INFY', pct: 18.2, color: '#10B981' },
    { name: 'HDFCBANK', pct: 15.6, color: '#8B5CF6' },
    { name: 'ICICIBANK', pct: 11.4, color: '#F59E0B' },
    { name: 'Others', pct: 5.9, color: '#64748B' },
  ];

  // SVG Donut Chart Geometry
  const size = 200;
  const strokeWidth = 26;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;

  let cumulativePct = 0;

  return (
    <div className="ts-portfolio-view">
      {/* View Header */}
      <div className="view-header flex-between">
        <div>
          <h1 className="view-title">Portfolio</h1>
          <p className="view-subtitle">Track and manage your investments</p>
        </div>
        <button
          type="button"
          className="btn-trade-primary"
          onClick={() => onOpenTradeModal()}
        >
          <PlusCircle size={16} />
          <span>New Trade</span>
        </button>
      </div>

      {/* Top 4 KPI Metrics Bar */}
      <div className="ts-kpi-grid">
        <div className="ts-kpi-card">
          <div className="kpi-top">
            <span className="kpi-label">Total Value</span>
            <div className="kpi-icon-badge bg-emerald-dim">
              <Briefcase size={17} className="text-emerald" />
            </div>
          </div>
          <h2 className="kpi-value">${totalCurrentValue.toLocaleString('en-US', { minimumFractionDigits: 2 })}</h2>
          <span className="trend-pill trend-up">
            <ArrowUpRight size={12} /> +12.34%
          </span>
        </div>

        <div className="ts-kpi-card">
          <div className="kpi-top">
            <span className="kpi-label">Total Investment</span>
            <div className="kpi-icon-badge bg-blue-dim">
              <Wallet size={17} className="text-blue" />
            </div>
          </div>
          <h2 className="kpi-value">${totalInvested.toLocaleString('en-US', { minimumFractionDigits: 2 })}</h2>
          <span className="trend-pill trend-up-blue">
            <ArrowUpRight size={12} /> +6.21%
          </span>
        </div>

        <div className="ts-kpi-card">
          <div className="kpi-top">
            <span className="kpi-label">Today's P/L</span>
            <div className="kpi-icon-badge bg-emerald-dim">
              <DollarSign size={17} className="text-emerald" />
            </div>
          </div>
          <h2 className="kpi-value text-emerald">+$1,234.56</h2>
          <span className="trend-pill trend-up">
            <ArrowUpRight size={12} /> +5.28%
          </span>
        </div>

        <div className="ts-kpi-card">
          <div className="kpi-top">
            <span className="kpi-label">Total Returns</span>
            <div className="kpi-icon-badge bg-purple-dim">
              <TrendingUp size={17} className="text-purple" />
            </div>
          </div>
          <h2 className="kpi-value text-purple">+{totalReturnPct.toFixed(2)}%</h2>
          <span className="trend-pill trend-up">
            +${totalPnl.toLocaleString('en-US', { minimumFractionDigits: 2 })}
          </span>
        </div>
      </div>

      {/* Main Grid: Holdings Table (Left) + Asset Allocation Donut (Right) */}
      <div className="portfolio-main-grid">
        {/* Left Column: Holdings & Tabs */}
        <div className="ts-card portfolio-holdings-card">
          <div className="portfolio-tabs-bar">
            {['Holdings', 'Allocation', 'Performance', 'Orders'].map((t) => (
              <button
                key={t}
                type="button"
                className={`port-tab-btn ${activeTab === t ? 'active' : ''}`}
                onClick={() => setActiveTab(t)}
              >
                {t}
              </button>
            ))}
          </div>

          <div className="table-responsive">
            <table className="ts-market-table">
              <thead>
                <tr>
                  <th>Symbol</th>
                  <th>Shares</th>
                  <th>Avg. Price</th>
                  <th>LTP</th>
                  <th>Current Value</th>
                  <th>P/L</th>
                  <th>P/L %</th>
                  <th style={{ textAlign: 'right' }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {holdingsWithMetrics.map((item) => (
                  <tr
                    key={item.symbol}
                    className="market-row-hover"
                    onClick={() => onSelectStock(item.rawProduct || { name: item.name, sku: item.symbol, price: item.ltp })}
                  >
                    <td>
                      <strong className="stock-primary-name">{item.symbol}</strong>
                      <div className="text-muted text-xs">{item.name}</div>
                    </td>
                    <td>{item.shares}</td>
                    <td>₹{item.avgPrice.toFixed(2)}</td>
                    <td>₹{item.ltp.toFixed(2)}</td>
                    <td>
                      <strong>₹{item.currentVal.toLocaleString('en-US', { minimumFractionDigits: 2 })}</strong>
                    </td>
                    <td className={item.isProfit ? 'text-emerald' : 'text-danger'}>
                      {item.isProfit ? '+' : ''}₹{item.pnl.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                    </td>
                    <td>
                      <span className={`trend-badge-pill ${item.isProfit ? 'trend-badge-up' : 'trend-badge-down'}`}>
                        {item.isProfit ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
                        {item.isProfit ? '+' : ''}{item.pnlPct.toFixed(2)}%
                      </span>
                    </td>
                    <td style={{ textAlign: 'right' }} onClick={(e) => e.stopPropagation()}>
                      <button
                        type="button"
                        className="btn-table-trade"
                        onClick={() => onOpenTradeModal(item.rawProduct || { name: item.name, sku: item.symbol, price: item.ltp })}
                      >
                        Trade
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right Column: Asset Allocation Donut Chart */}
        <div className="ts-card asset-allocation-card">
          <div className="card-header-simple">
            <h3 className="card-heading">Asset Allocation</h3>
          </div>

          {/* SVG Donut */}
          <div className="donut-center-container">
            <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="donut-svg">
              {allocations.map((item, idx) => {
                const strokeDashoffset = circumference - (item.pct / 100) * circumference;
                const rotation = (cumulativePct / 100) * 360;
                cumulativePct += item.pct;

                return (
                  <circle
                    key={idx}
                    cx={size / 2}
                    cy={size / 2}
                    r={radius}
                    fill="transparent"
                    stroke={item.color}
                    strokeWidth={strokeWidth}
                    strokeDasharray={circumference}
                    strokeDashoffset={strokeDashoffset}
                    transform={`rotate(${rotation - 90} ${size / 2} ${size / 2})`}
                    style={{ transition: 'stroke-dashoffset 0.5s ease' }}
                  />
                );
              })}
            </svg>

            {/* Inner Center Text */}
            <div className="donut-center-label">
              <span className="donut-center-total">${totalCurrentValue.toLocaleString('en-US', { minimumFractionDigits: 0 })}</span>
              <span className="donut-center-sub">Total Value</span>
            </div>
          </div>

          {/* Legend Items */}
          <div className="donut-legend-list">
            {allocations.map((a, i) => (
              <div key={i} className="donut-legend-row">
                <div className="legend-indicator-cell">
                  <span className="legend-color-dot" style={{ backgroundColor: a.color }} />
                  <span className="legend-stock-name">{a.name}</span>
                </div>
                <strong className="legend-stock-pct">{a.pct}%</strong>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
