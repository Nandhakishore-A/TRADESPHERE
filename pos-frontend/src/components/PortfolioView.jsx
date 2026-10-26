import React, { useState } from 'react';
import {
  ArrowUpRight,
  ArrowDownRight,
  PlusCircle,
  Briefcase,
  DollarSign,
  TrendingUp,
  Wallet,
  PieChart,
  CheckCircle2,
  Clock,
  XCircle,
  BarChart2
} from 'lucide-react';

export default function PortfolioView({
  stocks = [],
  orders = [],
  onSelectStock,
  onOpenTradeModal
}) {
  const [activeTab, setActiveTab] = useState('Holdings');

  // Holdings data matching reference portfolio
  const defaultHoldings = [
    { symbol: 'RELIANCE', name: 'Reliance Industries', shares: 10, avgPrice: 2450.00, ltp: 2892.45, sector: 'Energy & Retail' },
    { symbol: 'TCS', name: 'Tata Consultancy Services', shares: 5, avgPrice: 3650.00, ltp: 4123.80, sector: 'Technology' },
    { symbol: 'HDFCBANK', name: 'HDFC Bank Ltd', shares: 8, avgPrice: 1450.00, ltp: 1678.90, sector: 'Banking' },
    { symbol: 'INFY', name: 'Infosys Ltd', shares: 15, avgPrice: 1250.00, ltp: 1456.20, sector: 'Technology' },
    { symbol: 'ICICIBANK', name: 'ICICI Bank Ltd', shares: 12, avgPrice: 1100.00, ltp: 1234.50, sector: 'Banking' },
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
    { name: 'RELIANCE', pct: 28.5, color: '#3B82F6', sector: 'Energy' },
    { name: 'TCS', pct: 20.4, color: '#06B6D4', sector: 'Tech' },
    { name: 'INFY', pct: 18.2, color: '#10B981', sector: 'Tech' },
    { name: 'HDFCBANK', pct: 15.6, color: '#8B5CF6', sector: 'Banking' },
    { name: 'ICICIBANK', pct: 11.4, color: '#F59E0B', sector: 'Banking' },
    { name: 'Cash / Reserve', pct: 5.9, color: '#64748B', sector: 'Liquid' },
  ];

  // SVG Donut Chart Geometry
  const size = 200;
  const strokeWidth = 26;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;

  let cumulativeOffset = 0;

  return (
    <div className="ts-portfolio-view">
      {/* View Header */}
      <div className="view-header flex-between">
        <div>
          <h1 className="view-title">Portfolio</h1>
          <p className="view-subtitle">Track, analyze, and manage your asset holdings and trade allocations</p>
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
            <span className="kpi-label">Total Portfolio Value</span>
            <div className="kpi-icon-badge bg-emerald-dim">
              <Briefcase size={17} className="text-emerald" />
            </div>
          </div>
          <h2 className="kpi-value">${totalCurrentValue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</h2>
          <span className="trend-pill trend-up">
            <ArrowUpRight size={12} /> +12.34% (+$2,698.45)
          </span>
        </div>

        <div className="ts-kpi-card">
          <div className="kpi-top">
            <span className="kpi-label">Total Invested Capital</span>
            <div className="kpi-icon-badge bg-blue-dim">
              <Wallet size={17} className="text-blue" />
            </div>
          </div>
          <h2 className="kpi-value">${totalInvested.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</h2>
          <span className="trend-pill trend-up-blue">
            <ArrowUpRight size={12} /> +6.21%
          </span>
        </div>

        <div className="ts-kpi-card">
          <div className="kpi-top">
            <span className="kpi-label">Unrealized P/L</span>
            <div className="kpi-icon-badge bg-emerald-dim">
              <DollarSign size={17} className="text-emerald" />
            </div>
          </div>
          <h2 className="kpi-value text-emerald">+${totalPnl.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</h2>
          <span className="trend-pill trend-up">
            <ArrowUpRight size={12} /> +{totalReturnPct.toFixed(2)}%
          </span>
        </div>

        <div className="ts-kpi-card">
          <div className="kpi-top">
            <span className="kpi-label">Today's Performance</span>
            <div className="kpi-icon-badge bg-purple-dim">
              <TrendingUp size={17} className="text-purple" />
            </div>
          </div>
          <h2 className="kpi-value text-purple">+5.28%</h2>
          <span className="trend-pill trend-up">
            +$1,234.56 Today
          </span>
        </div>
      </div>

      {/* Main Grid: Tabs & Content on Left + Donut Chart on Right */}
      <div className="portfolio-main-grid">
        {/* Left Column: Interactive Sub-Tabs & Dynamic Views */}
        <div className="ts-card portfolio-holdings-card">
          {/* Sub-nav Tab Bar */}
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

          {/* TAB 1: Holdings */}
          {activeTab === 'Holdings' && (
            <div className="table-responsive">
              <table className="ts-market-table">
                <thead>
                  <tr>
                    <th style={{ textAlign: 'left' }}>Asset</th>
                    <th style={{ textAlign: 'center' }}>Shares</th>
                    <th style={{ textAlign: 'right' }}>Avg. Price</th>
                    <th style={{ textAlign: 'right' }}>LTP</th>
                    <th style={{ textAlign: 'right' }}>Current Value</th>
                    <th style={{ textAlign: 'right' }}>P/L ($)</th>
                    <th style={{ textAlign: 'right' }}>P/L (%)</th>
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
                      <td style={{ textAlign: 'center' }}>{item.shares}</td>
                      <td style={{ textAlign: 'right' }}>${item.avgPrice.toFixed(2)}</td>
                      <td style={{ textAlign: 'right' }}>${item.ltp.toFixed(2)}</td>
                      <td style={{ textAlign: 'right' }}>
                        <strong>${item.currentVal.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</strong>
                      </td>
                      <td style={{ textAlign: 'right' }} className={item.isProfit ? 'text-emerald' : 'text-danger'}>
                        {item.isProfit ? '+' : ''}${item.pnl.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </td>
                      <td style={{ textAlign: 'right' }}>
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
          )}

          {/* TAB 2: Allocation Breakdown */}
          {activeTab === 'Allocation' && (
            <div className="table-responsive">
              <table className="ts-market-table">
                <thead>
                  <tr>
                    <th style={{ textAlign: 'left' }}>Asset / Position</th>
                    <th style={{ textAlign: 'left' }}>Sector</th>
                    <th style={{ textAlign: 'right' }}>Weight (%)</th>
                    <th style={{ textAlign: 'right' }}>Value</th>
                    <th style={{ textAlign: 'right' }}>Risk Profile</th>
                  </tr>
                </thead>
                <tbody>
                  {allocations.map((a, i) => (
                    <tr key={i} className="market-row-hover">
                      <td>
                        <div className="flex items-center gap-2">
                          <span className="legend-color-dot" style={{ backgroundColor: a.color }} />
                          <strong className="text-white">{a.name}</strong>
                        </div>
                      </td>
                      <td className="text-muted">{a.sector}</td>
                      <td style={{ textAlign: 'right' }}>
                        <strong className="text-white">{a.pct}%</strong>
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        ${((totalCurrentValue * a.pct) / 100).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        <span className="trend-pill trend-up-blue">Core Holding</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* TAB 3: Performance Analysis */}
          {activeTab === 'Performance' && (
            <div className="p-4">
              <div className="grid grid-cols-2 gap-4 mb-4" style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px', marginBottom: '20px' }}>
                <div className="ts-card" style={{ padding: '16px' }}>
                  <div className="flex items-center gap-2 mb-2">
                    <TrendingUp size={16} className="text-emerald" />
                    <span className="text-muted text-xs">Best Performing Asset</span>
                  </div>
                  <h3 className="text-lg font-bold text-white">RELIANCE (+18.06%)</h3>
                  <p className="text-emerald text-xs mt-1">Unrealized Gain: +$4,424.50</p>
                </div>
                <div className="ts-card" style={{ padding: '16px' }}>
                  <div className="flex items-center gap-2 mb-2">
                    <BarChart2 size={16} className="text-purple" />
                    <span className="text-muted text-xs">Sharpe Ratio Alpha</span>
                  </div>
                  <h3 className="text-lg font-bold text-white">1.84 vs 1.12 Benchmark</h3>
                  <p className="text-purple text-xs mt-1">Low Volatility Premium Active</p>
                </div>
              </div>

              <div className="table-responsive">
                <table className="ts-market-table">
                  <thead>
                    <tr>
                      <th>Time Horizon</th>
                      <th>Portfolio Return</th>
                      <th>NIFTY 50</th>
                      <th>S&amp;P 500</th>
                      <th style={{ textAlign: 'right' }}>Alpha Generated</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td>1 Month</td>
                      <td className="text-emerald">+4.82%</td>
                      <td>+2.10%</td>
                      <td>+1.85%</td>
                      <td style={{ textAlign: 'right' }} className="text-emerald">+2.72%</td>
                    </tr>
                    <tr>
                      <td>3 Months</td>
                      <td className="text-emerald">+12.45%</td>
                      <td>+6.20%</td>
                      <td>+5.40%</td>
                      <td style={{ textAlign: 'right' }} className="text-emerald">+6.25%</td>
                    </tr>
                    <tr>
                      <td>1 Year</td>
                      <td className="text-emerald">+33.12%</td>
                      <td>+18.40%</td>
                      <td>+24.10%</td>
                      <td style={{ textAlign: 'right' }} className="text-emerald">+9.02%</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 4: Orders History */}
          {activeTab === 'Orders' && (
            <div className="table-responsive">
              <table className="ts-market-table">
                <thead>
                  <tr>
                    <th>Ref ID</th>
                    <th>Date</th>
                    <th>Type</th>
                    <th>Asset</th>
                    <th style={{ textAlign: 'center' }}>Shares</th>
                    <th style={{ textAlign: 'right' }}>Amount</th>
                    <th style={{ textAlign: 'right' }}>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.length === 0 ? (
                    <tr>
                      <td colSpan="7" className="text-center py-8 text-muted">
                        No trade settlements recorded yet. Use the "New Trade" button to place your first trade order!
                      </td>
                    </tr>
                  ) : (
                    orders.map((o, idx) => (
                      <tr key={idx} className="market-row-hover">
                        <td className="text-muted text-xs">{o.orderNumber || o._id?.slice(-6)}</td>
                        <td className="text-slate-300 text-xs">
                          {o.createdAt ? new Date(o.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'Today'}
                        </td>
                        <td>
                          <span className={`trade-badge ${o.items?.[0]?.quantity > 0 ? 'badge-buy' : 'badge-sell'}`}>
                            {o.items?.[0]?.quantity > 0 ? 'Buy' : 'Sell'}
                          </span>
                        </td>
                        <td>
                          <strong>{o.items?.[0]?.name || 'Trade Position'}</strong>
                          <div className="text-muted text-xs">{o.items?.[0]?.sku || 'EQUITY'}</div>
                        </td>
                        <td style={{ textAlign: 'center' }}>{o.items?.[0]?.quantity || 1}</td>
                        <td style={{ textAlign: 'right' }}>
                          <strong>${Number(o.totalAmount || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}</strong>
                        </td>
                        <td style={{ textAlign: 'right' }}>
                          {o.status === 'COMPLETED' ? (
                            <span className="status-badge status-completed">
                              <CheckCircle2 size={11} /> Settled
                            </span>
                          ) : (
                            <span className="status-badge status-reserved">
                              <Clock size={11} /> {o.status}
                            </span>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Right Column: Asset Allocation Donut Chart & Legend */}
        <div className="ts-card asset-allocation-card">
          <div className="card-header-simple">
            <div className="flex items-center gap-2">
              <PieChart size={16} className="text-emerald" />
              <h3 className="card-heading">Asset Allocation</h3>
            </div>
          </div>

          {/* SVG Donut */}
          <div className="donut-center-container">
            <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="donut-svg">
              {allocations.map((item, idx) => {
                const strokeDashoffset = circumference - (item.pct / 100) * circumference;
                const rotation = (cumulativeOffset / 100) * 360;
                cumulativeOffset += item.pct;

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
              <span className="donut-center-total">${totalCurrentValue.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}</span>
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
