import React, { useState } from 'react';
import {
  Shield,
  FileText,
  Download,
  AlertCircle
} from 'lucide-react';

export default function AnalyticsView({ analyticsData: _analyticsData }) {
  const [activeTab, setActiveTab] = useState('Overview');

  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

  // Portfolio vs Benchmark Cumulative Performance
  const portfolioTrend = [8, 14, 12, 19, 25, 22, 28, 35, 39, 44, 48, 54];
  const benchmarkTrend = [5, 9, 8, 13, 16, 15, 20, 24, 26, 29, 32, 36];

  const svgW = 760;
  const svgH = 240;
  const padX = 40;
  const padY = 24;

  const maxVal = 60;

  const getX = (i) => padX + (i / (months.length - 1)) * (svgW - padX * 2);
  const getY = (val) => svgH - padY - (val / maxVal) * (svgH - padY * 2);

  const portCoords = portfolioTrend.map((v, i) => ({ x: getX(i), y: getY(v) }));
  const benchCoords = benchmarkTrend.map((v, i) => ({ x: getX(i), y: getY(v) }));

  const makePath = (coords) =>
    coords.reduce((acc, p, i) => {
      if (i === 0) return `M ${p.x} ${p.y}`;
      const prev = coords[i - 1];
      const cx = (prev.x + p.x) / 2;
      return `${acc} C ${cx} ${prev.y}, ${cx} ${p.y}, ${p.x} ${p.y}`;
    }, '');

  const portPath = makePath(portCoords);
  const benchPath = makePath(benchCoords);
  const portArea = `${portPath} L ${portCoords[portCoords.length - 1].x} ${svgH - padY} L ${portCoords[0].x} ${svgH - padY} Z`;

  // Monthly Bar Comparison Data
  const monthlyBars = [
    { m: 'Jan', port: 8, bench: 5 },
    { m: 'Feb', port: 6, bench: 4 },
    { m: 'Mar', port: -2, bench: -1 },
    { m: 'Apr', port: 7, bench: 5 },
    { m: 'May', port: 6, bench: 3 },
    { m: 'Jun', port: -3, bench: -1 },
    { m: 'Jul', port: 6, bench: 5 },
    { m: 'Aug', port: 7, bench: 4 },
    { m: 'Sep', port: 4, bench: 2 },
    { m: 'Oct', port: 5, bench: 3 },
    { m: 'Nov', port: 4, bench: 3 },
    { m: 'Dec', port: 6, bench: 4 },
  ];

  return (
    <div className="ts-analytics-view">
      {/* Header & Tabs */}
      <div className="view-header flex-between">
        <div>
          <h1 className="view-title">Analytics</h1>
          <p className="view-subtitle">Portfolio risk metrics, alpha generation, and benchmark comparison</p>
        </div>

        <div className="analytics-nav-tabs">
          {['Overview', 'Performance', 'Risk Analysis', 'Reports'].map((tab) => (
            <button
              key={tab}
              type="button"
              className={`cat-pill ${activeTab === tab ? 'active' : ''}`}
              onClick={() => setActiveTab(tab)}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* TAB 1: Overview */}
      {activeTab === 'Overview' && (
        <>
          {/* Main Benchmark Comparison Line Chart */}
          <div className="ts-card analytics-chart-card mb-6">
            <div className="chart-card-header">
              <h3 className="card-heading">Cumulative Benchmark Comparison</h3>
              <div className="chart-legend-row">
                <span className="legend-chip">
                  <span className="legend-dot bg-emerald" /> Your Portfolio (+54%)
                </span>
                <span className="legend-chip">
                  <span className="legend-dot bg-sky" /> NIFTY 50 / S&amp;P 500 (+36%)
                </span>
              </div>
            </div>

            <div className="svg-chart-wrapper">
              <svg viewBox={`0 0 ${svgW} ${svgH}`} className="performance-svg" preserveAspectRatio="none">
                <defs>
                  <linearGradient id="analyticsGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#10B981" stopOpacity="0.25" />
                    <stop offset="100%" stopColor="#10B981" stopOpacity="0.0" />
                  </linearGradient>
                </defs>

                {/* Grid lines */}
                {[0, 20, 40, 60].map((v, i) => {
                  const y = getY(v);
                  return (
                    <g key={i}>
                      <line x1={padX} y1={y} x2={svgW - padX} y2={y} stroke="#1E293B" strokeDasharray="4 4" strokeWidth="1" />
                      <text x={padX - 8} y={y + 4} fill="#64748B" fontSize="10" textAnchor="end">
                        {v}%
                      </text>
                    </g>
                  );
                })}

                {/* Area & Lines */}
                <path d={portArea} fill="url(#analyticsGrad)" />
                <path d={benchPath} fill="none" stroke="#0284C7" strokeWidth="2.4" strokeDasharray="5 3" />
                <path d={portPath} fill="none" stroke="#10B981" strokeWidth="2.8" strokeLinecap="round" />

                {/* End Point highlights */}
                <circle cx={portCoords[portCoords.length - 1].x} cy={portCoords[portCoords.length - 1].y} r="5" fill="#10B981" />
                <circle cx={benchCoords[benchCoords.length - 1].x} cy={benchCoords[benchCoords.length - 1].y} r="5" fill="#0284C7" />
              </svg>

              {/* Month labels */}
              <div className="chart-x-labels">
                {months.map((m, i) => (
                  <span key={i} className="x-label">{m}</span>
                ))}
              </div>
            </div>

            {/* 4 Analytics KPI Stat Boxes */}
            <div className="analytics-summary-bar">
              <div className="summary-stat-cell">
                <span className="stat-sublabel">Total Return</span>
                <strong className="stat-main-number text-emerald">+33.12%</strong>
              </div>
              <div className="summary-stat-cell">
                <span className="stat-sublabel">Annualized Return</span>
                <strong className="stat-main-number text-emerald">+18.45%</strong>
              </div>
              <div className="summary-stat-cell">
                <span className="stat-sublabel">Volatility</span>
                <strong className="stat-main-number text-slate-200">12.34%</strong>
              </div>
              <div className="summary-stat-cell">
                <span className="stat-sublabel">Sharpe Ratio</span>
                <strong className="stat-main-number text-purple">1.56</strong>
              </div>
            </div>
          </div>

          {/* Monthly Performance Comparison Bar Chart */}
          <div className="ts-card monthly-bar-card">
            <div className="chart-card-header">
              <h3 className="card-heading">Performance Comparison (Monthly Alpha)</h3>
              <div className="chart-legend-row">
                <span className="legend-chip">
                  <span className="legend-dot bg-emerald" /> Your Portfolio
                </span>
                <span className="legend-chip">
                  <span className="legend-dot bg-sky" /> Benchmark Index
                </span>
              </div>
            </div>

            <div className="monthly-bars-container">
              {monthlyBars.map((b, idx) => (
                <div key={idx} className="month-bar-group">
                  <div className="bar-pair">
                    <div
                      className="bar-single bg-emerald"
                      style={{ height: `${Math.max(8, Math.abs(b.port) * 6)}px` }}
                      title={`Portfolio: ${b.port}%`}
                    />
                    <div
                      className="bar-single bg-sky"
                      style={{ height: `${Math.max(6, Math.abs(b.bench) * 6)}px` }}
                      title={`Index: ${b.bench}%`}
                    />
                  </div>
                  <span className="bar-month-text">{b.m}</span>
                </div>
              ))}
            </div>
          </div>
        </>
      )}

      {/* TAB 2: Performance Deep-Dive */}
      {activeTab === 'Performance' && (
        <div className="ts-card p-6">
          <h3 className="card-heading mb-4">Trailing Horizon Performance Breakdown</h3>
          <div className="table-responsive">
            <table className="ts-market-table">
              <thead>
                <tr>
                  <th>Period</th>
                  <th>Portfolio ROI</th>
                  <th>Benchmark (NIFTY / S&amp;P)</th>
                  <th>Excess Return (Alpha)</th>
                  <th style={{ textAlign: 'right' }}>Win Ratio</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td><strong>1 Week</strong></td>
                  <td className="text-emerald">+2.34%</td>
                  <td>+1.12%</td>
                  <td className="text-emerald font-bold">+1.22%</td>
                  <td style={{ textAlign: 'right' }}>78%</td>
                </tr>
                <tr>
                  <td><strong>1 Month</strong></td>
                  <td className="text-emerald">+4.82%</td>
                  <td>+2.10%</td>
                  <td className="text-emerald font-bold">+2.72%</td>
                  <td style={{ textAlign: 'right' }}>82%</td>
                </tr>
                <tr>
                  <td><strong>3 Months</strong></td>
                  <td className="text-emerald">+12.45%</td>
                  <td>+6.20%</td>
                  <td className="text-emerald font-bold">+6.25%</td>
                  <td style={{ textAlign: 'right' }}>85%</td>
                </tr>
                <tr>
                  <td><strong>6 Months</strong></td>
                  <td className="text-emerald">+21.30%</td>
                  <td>+11.80%</td>
                  <td className="text-emerald font-bold">+9.50%</td>
                  <td style={{ textAlign: 'right' }}>89%</td>
                </tr>
                <tr>
                  <td><strong>1 Year</strong></td>
                  <td className="text-emerald">+33.12%</td>
                  <td>+18.40%</td>
                  <td className="text-emerald font-bold">+14.72%</td>
                  <td style={{ textAlign: 'right' }}>92%</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 3: Risk Analysis */}
      {activeTab === 'Risk Analysis' && (
        <div className="ts-card p-6">
          <div className="flex items-center gap-2 mb-4">
            <Shield size={18} className="text-cyan" />
            <h3 className="card-heading">Risk &amp; Drawdown Analytics</h3>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '24px' }}>
            <div className="ts-card" style={{ padding: '16px' }}>
              <span className="text-muted text-xs">Value at Risk (95% Daily)</span>
              <h4 className="text-xl font-bold text-white mt-1">-1.42%</h4>
              <p className="text-muted text-xs mt-1">Maximum 1-day expected loss</p>
            </div>
            <div className="ts-card" style={{ padding: '16px' }}>
              <span className="text-muted text-xs">Maximum Drawdown</span>
              <h4 className="text-xl font-bold text-emerald mt-1">-8.45%</h4>
              <p className="text-muted text-xs mt-1">Peak-to-trough decline</p>
            </div>
            <div className="ts-card" style={{ padding: '16px' }}>
              <span className="text-muted text-xs">Beta Coefficient</span>
              <h4 className="text-xl font-bold text-sky mt-1">0.92</h4>
              <p className="text-muted text-xs mt-1">Lower market volatility</p>
            </div>
            <div className="ts-card" style={{ padding: '16px' }}>
              <span className="text-muted text-xs">Sortino Ratio</span>
              <h4 className="text-xl font-bold text-purple mt-1">2.14</h4>
              <p className="text-muted text-xs mt-1">Downside risk protection</p>
            </div>
          </div>

          <div className="concurrency-notice" style={{ padding: '16px' }}>
            <AlertCircle size={16} className="text-emerald" />
            <span>Portfolio risk profile is classified as Conservative Growth with zero leverage exposure.</span>
          </div>
        </div>
      )}

      {/* TAB 4: Reports */}
      {activeTab === 'Reports' && (
        <div className="ts-card p-6">
          <div className="flex-between mb-4">
            <div>
              <h3 className="card-heading">Financial Statements &amp; Audit Reports</h3>
              <p className="text-muted text-xs">Download audit statements, tax ledgers, and trade execution reports</p>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div className="ts-card flex-between" style={{ padding: '14px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div className="flex items-center gap-3">
                <FileText size={18} className="text-emerald" />
                <div>
                  <strong className="text-white text-sm">Annual Capital Gains Statement (FY 2024-25)</strong>
                  <div className="text-muted text-xs">Includes realized short-term and long-term capital gains</div>
                </div>
              </div>
              <button type="button" className="btn-secondary-sm" onClick={() => alert('Downloading Capital Gains Statement (PDF)...')}>
                <Download size={13} /> Export PDF
              </button>
            </div>

            <div className="ts-card flex-between" style={{ padding: '14px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div className="flex items-center gap-3">
                <FileText size={18} className="text-blue" />
                <div>
                  <strong className="text-white text-sm">Trade Execution &amp; Settlement Ledger (CSV)</strong>
                  <div className="text-muted text-xs">Raw transaction logs with idempotency timestamps</div>
                </div>
              </div>
              <button type="button" className="btn-secondary-sm" onClick={() => alert('Downloading Trade Execution Ledger (CSV)...')}>
                <Download size={13} /> Export CSV
              </button>
            </div>

            <div className="ts-card flex-between" style={{ padding: '14px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div className="flex items-center gap-3">
                <FileText size={18} className="text-purple" />
                <div>
                  <strong className="text-white text-sm">Portfolio Valuation Certificate</strong>
                  <div className="text-muted text-xs">Signed institutional audit snapshot of holdings and net asset value</div>
                </div>
              </div>
              <button type="button" className="btn-secondary-sm" onClick={() => alert('Generating Valuation Certificate...')}>
                <Download size={13} /> Export PDF
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
