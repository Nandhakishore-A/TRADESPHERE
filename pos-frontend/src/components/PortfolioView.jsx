import React, { useState } from 'react';
import {
  ArrowUpRight,
  ArrowDownRight,
  PlusCircle,
  Briefcase,
  DollarSign,
  TrendingUp,
  Wallet,
  CheckCircle2,
  Clock,
  BarChart2
} from 'lucide-react';

export default function PortfolioView({
  stocks = [],
  orders = [],
  onSelectStock,
  onOpenTradeModal,
  cashBalance = 25000,
  dynamicHoldings
}) {
  const [activeTab, setActiveTab] = useState('Holdings');

  // Base holdings baseline
  const baseHoldings = [
    { symbol: 'RELIANCE', name: 'Reliance Industries', shares: 10, avgPrice: 2450.00, ltp: 2892.45, sector: 'Energy & Retail' },
    { symbol: 'TCS', name: 'Tata Consultancy Services', shares: 5, avgPrice: 3650.00, ltp: 4123.80, sector: 'Technology' },
    { symbol: 'HDFCBANK', name: 'HDFC Bank Ltd', shares: 8, avgPrice: 1450.00, ltp: 1678.90, sector: 'Banking' },
    { symbol: 'INFY', name: 'Infosys Ltd', shares: 15, avgPrice: 1250.00, ltp: 1456.20, sector: 'Technology' },
    { symbol: 'ICICIBANK', name: 'ICICI Bank Ltd', shares: 12, avgPrice: 1100.00, ltp: 1234.50, sector: 'Banking' },
  ];

  // Merge base holdings with live completed orders
  const effectiveHoldingsMap = {};
  baseHoldings.forEach((h) => {
    effectiveHoldingsMap[h.symbol] = { ...h };
  });

  // Apply user's settled orders
  orders.forEach((o) => {
    if (o.status === 'COMPLETED') {
      const item = o.items?.[0];
      if (item) {
        const sym = item.sku || item.name;
        const isBuy = o.side ? o.side.toUpperCase() === 'BUY' : item.quantity > 0;
        const qty = item.quantity || 0;
        const price = item.price || 0;

        if (!effectiveHoldingsMap[sym]) {
          effectiveHoldingsMap[sym] = {
            symbol: sym,
            name: item.name || sym,
            shares: 0,
            avgPrice: price,
            ltp: price,
            sector: 'Equities',
          };
        }

        const holding = effectiveHoldingsMap[sym];
        if (isBuy) {
          const oldShares = holding.shares;
          const oldCost = oldShares * holding.avgPrice;
          const newCost = qty * price;
          const totalShares = oldShares + qty;
          holding.shares = totalShares;
          holding.avgPrice = totalShares > 0 ? (oldCost + newCost) / totalShares : price;
        } else {
          holding.shares = Math.max(0, holding.shares - qty);
        }
      }
    }
  });

  const activeHoldingsList = dynamicHoldings || Object.values(effectiveHoldingsMap).filter((h) => h.shares > 0);

  // Calculated portfolio values
  const holdingsWithMetrics = activeHoldingsList.map((h) => {
    const liveStock = stocks.find((s) => s.sku === h.symbol);
    const currentPrice = liveStock ? liveStock.price : h.ltp;
    const investedVal = h.shares * h.avgPrice;
    const currentVal = h.shares * currentPrice;
    const pnl = currentVal - investedVal;
    const pnlPct = investedVal > 0 ? (pnl / investedVal) * 100 : 0;

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
  const totalReturnPct = totalInvested > 0 ? (totalPnl / totalInvested) * 100 : 0;

  // Asset allocation percentages for donut chart
  const allocations = totalCurrentValue > 0
    ? holdingsWithMetrics.map((h, i) => {
        const colors = ['#3B82F6', '#06B6D4', '#10B981', '#8B5CF6', '#F59E0B', '#EC4899', '#6366F1'];
        return {
          name: h.symbol,
          pct: Number(((h.currentVal / totalCurrentValue) * 100).toFixed(1)),
          color: colors[i % colors.length],
          sector: h.sector || 'Equities',
        };
      })
    : [{ name: 'Cash Reserve', pct: 100, color: '#10B981', sector: 'Liquid' }];

  // SVG Donut Chart Geometry
  const size = 200;
  const strokeWidth = 26;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;

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
            <span className="kpi-label">Holdings Valuation</span>
            <div className="kpi-icon-badge bg-emerald-dim">
              <Briefcase size={17} className="text-emerald" />
            </div>
          </div>
          <h2 className="kpi-value">${totalCurrentValue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</h2>
          <span className="trend-pill trend-up">
            <ArrowUpRight size={12} /> {totalReturnPct >= 0 ? '+' : ''}{totalReturnPct.toFixed(2)}%
          </span>
        </div>

        <div className="ts-kpi-card">
          <div className="kpi-top">
            <span className="kpi-label">Invested Capital</span>
            <div className="kpi-icon-badge bg-blue-dim">
              <Wallet size={17} className="text-blue" />
            </div>
          </div>
          <h2 className="kpi-value">${totalInvested.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</h2>
          <span className="trend-pill trend-up-blue">
            <ArrowUpRight size={12} /> Principal Value
          </span>
        </div>

        <div className="ts-kpi-card">
          <div className="kpi-top">
            <span className="kpi-label">Unrealized P/L</span>
            <div className="kpi-icon-badge bg-emerald-dim">
              <DollarSign size={17} className="text-emerald" />
            </div>
          </div>
          <h2 className={`kpi-value ${totalPnl >= 0 ? 'text-emerald' : 'text-danger'}`}>
            {totalPnl >= 0 ? '+' : ''}${totalPnl.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </h2>
          <span className={`trend-pill ${totalPnl >= 0 ? 'trend-up' : 'trend-down'}`}>
            <ArrowUpRight size={12} /> {totalReturnPct >= 0 ? '+' : ''}{totalReturnPct.toFixed(2)}% Net
          </span>
        </div>

        <div className="ts-kpi-card">
          <div className="kpi-top">
            <span className="kpi-label">Available Cash Reserve</span>
            <div className="kpi-icon-badge bg-purple-dim">
              <TrendingUp size={17} className="text-purple" />
            </div>
          </div>
          <h2 className="kpi-value text-purple">${cashBalance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</h2>
          <span className="trend-pill trend-up">
            Zero Leverage Risk
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
                  {holdingsWithMetrics.length === 0 ? (
                    <tr>
                      <td colSpan="8" className="text-center py-8 text-muted">
                        No active equity holdings. Place an order to start investing!
                      </td>
                    </tr>
                  ) : (
                    holdingsWithMetrics.map((item) => (
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
                    ))
                  )}
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
                        <span className="trend-pill trend-up-blue">Core Asset</span>
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

          {/* TAB 4: Active Orders */}
          {activeTab === 'Orders' && (
            <div className="table-responsive">
              <table className="ts-market-table">
                <thead>
                  <tr>
                    <th>Order #</th>
                    <th>Side</th>
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
                        No orders recorded yet. Place an order to see live execution tracking.
                      </td>
                    </tr>
                  ) : (
                    orders.slice(0, 8).map((o, idx) => (
                      <tr key={idx} className="market-row-hover">
                        <td className="font-mono text-xs text-muted">{o.orderNumber || o._id?.slice(-6)}</td>
                        <td>
                          <span className={`trade-badge ${o.side === 'SELL' ? 'badge-sell' : 'badge-buy'}`}>
                            {o.side || 'BUY'}
                          </span>
                        </td>
                        <td>
                          <span className="text-xs font-mono text-slate-400 bg-slate-800 px-2 py-0.5 rounded">
                            {o.orderType || 'MARKET'}
                          </span>
                        </td>
                        <td>
                          <strong className="text-white">{o.items?.[0]?.sku || o.items?.[0]?.name}</strong>
                        </td>
                        <td style={{ textAlign: 'center' }}>{o.items?.[0]?.quantity || 1}</td>
                        <td style={{ textAlign: 'right' }}>
                          ${Number(o.totalAmount || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                        </td>
                        <td style={{ textAlign: 'right' }}>
                          {o.status === 'COMPLETED' ? (
                            <span className="status-badge status-completed">
                              <CheckCircle2 size={12} /> Settled
                            </span>
                          ) : (
                            <span className="status-badge status-reserved">
                              <Clock size={12} /> {o.status}
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

        {/* Right Column: Allocation Donut Chart & Legend */}
        <div className="ts-card portfolio-allocation-card">
          <h3 className="card-heading">Asset Allocation</h3>

          <div className="donut-chart-container">
            <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
              {allocations.map((item, index) => {
                const prevPct = allocations.slice(0, index).reduce((acc, a) => acc + a.pct, 0);
                const strokeDasharray = `${(item.pct / 100) * circumference} ${circumference}`;
                const strokeDashoffset = -((prevPct / 100) * circumference);

                return (
                  <circle
                    key={index}
                    cx={size / 2}
                    cy={size / 2}
                    r={radius}
                    fill="none"
                    stroke={item.color}
                    strokeWidth={strokeWidth}
                    strokeDasharray={strokeDasharray}
                    strokeDashoffset={strokeDashoffset}
                    strokeLinecap="round"
                    style={{ transition: 'stroke-dasharray 0.3s ease, stroke-dashoffset 0.3s ease' }}
                  />
                );
              })}
            </svg>

            {/* Inner Center Content */}
            <div className="donut-center-stat">
              <span className="stat-label">Total Assets</span>
              <span className="stat-val">
                ${totalCurrentValue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </span>
            </div>
          </div>

          {/* Allocation Legend */}
          <div className="allocation-legend-list">
            {allocations.map((item, index) => (
              <div key={index} className="legend-row">
                <div className="legend-left">
                  <span className="legend-color-dot" style={{ backgroundColor: item.color }} />
                  <span className="legend-name">{item.name}</span>
                </div>
                <span className="legend-pct">{item.pct}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
