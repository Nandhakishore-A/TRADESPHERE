import React, { useState } from 'react';
import {
  Search,
  CheckCircle2,
  Clock,
  XCircle
} from 'lucide-react';

export default function TransactionsView({ orders = [] }) {
  const [filterType, setFilterType] = useState('All');
  const [search, setSearch] = useState('');

  // Sample static defaults if database empty
  const defaultTransactions = [
    { id: 'TX-101', date: 'Dec 12, 2024', type: 'Buy', symbol: 'RELIANCE', shares: 10, price: 2892.45, total: 28924.50, status: 'COMPLETED' },
    { id: 'TX-102', date: 'Dec 11, 2024', type: 'Sell', symbol: 'TCS', shares: 5, price: 4123.80, total: 20619.00, status: 'COMPLETED' },
    { id: 'TX-103', date: 'Dec 10, 2024', type: 'Buy', symbol: 'INFY', shares: 15, price: 1456.20, total: 21843.00, status: 'COMPLETED' },
    { id: 'TX-104', date: 'Dec 08, 2024', type: 'Buy', symbol: 'HDFCBANK', shares: 8, price: 1678.90, total: 13431.20, status: 'COMPLETED' },
    { id: 'TX-105', date: 'Dec 05, 2024', type: 'Buy', ICICIBANK: 'ICICIBANK', symbol: 'ICICIBANK', shares: 12, price: 1234.50, total: 14814.00, status: 'COMPLETED' },
  ];

  // Map orders from MongoDB
  const liveTransactions = orders.map((o) => {
    const item = o.items?.[0] || {};
    return {
      id: o.orderNumber || o._id.slice(-6),
      date: new Date(o.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      type: o.items?.[0]?.quantity > 0 ? 'Buy' : 'Sell',
      symbol: item.name || 'EQUITY',
      shares: item.quantity || 1,
      price: item.price || 0,
      total: o.totalAmount || 0,
      status: o.status,
    };
  });

  const merged = liveTransactions.length > 0 ? liveTransactions : defaultTransactions;

  const filtered = merged.filter((t) => {
    const matchType = filterType === 'All' || t.type.toLowerCase() === filterType.toLowerCase();
    const matchSearch = t.symbol.toLowerCase().includes(search.toLowerCase()) || t.id.toLowerCase().includes(search.toLowerCase());
    return matchType && matchSearch;
  });

  return (
    <div className="ts-transactions-view">
      {/* Header */}
      <div className="view-header">
        <div>
          <h1 className="view-title">Transactions</h1>
          <p className="view-subtitle">Execution history and trade settlements recorded in MongoDB</p>
        </div>
      </div>

      {/* Filter Tabs & Search */}
      <div className="transactions-toolbar">
        <div className="category-tabs-group">
          {['All', 'Buy', 'Sell', 'Dividends'].map((ft) => (
            <button
              key={ft}
              type="button"
              className={`cat-pill ${filterType === ft ? 'active' : ''}`}
              onClick={() => setFilterType(ft)}
            >
              {ft}
            </button>
          ))}
        </div>

        <div className="search-input-wrapper" style={{ maxWidth: '280px' }}>
          <Search size={15} className="search-icon" />
          <input
            type="text"
            className="topbar-search-input"
            placeholder="Search transactions..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {/* Transactions Table Card */}
      <div className="ts-card table-card-wrapper">
        <div className="table-responsive">
          <table className="ts-market-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Type</th>
                <th>Symbol</th>
                <th>Shares</th>
                <th>Price</th>
                <th>Total</th>
                <th style={{ textAlign: 'right' }}>Status</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan="7" className="text-center py-8 text-muted">
                    No transactions match your current filter.
                  </td>
                </tr>
              ) : (
                filtered.map((t, idx) => (
                  <tr key={idx} className="market-row-hover">
                    <td className="text-slate-300">{t.date}</td>
                    <td>
                      <span className={`trade-badge ${t.type.toLowerCase() === 'buy' ? 'badge-buy' : 'badge-sell'}`}>
                        {t.type}
                      </span>
                    </td>
                    <td>
                      <strong className="stock-primary-name">{t.symbol}</strong>
                      <div className="text-muted text-xs">Ref: {t.id}</div>
                    </td>
                    <td>{t.shares}</td>
                    <td>${Number(t.price).toFixed(2)}</td>
                    <td>
                      <strong>${Number(t.total).toLocaleString('en-US', { minimumFractionDigits: 2 })}</strong>
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      {t.status === 'COMPLETED' ? (
                        <span className="status-badge status-completed">
                          <CheckCircle2 size={12} /> Settled
                        </span>
                      ) : t.status === 'RESERVED' ? (
                        <span className="status-badge status-reserved">
                          <Clock size={12} /> Pending Hold
                        </span>
                      ) : (
                        <span className="status-badge status-cancelled">
                          <XCircle size={12} /> {t.status}
                        </span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
