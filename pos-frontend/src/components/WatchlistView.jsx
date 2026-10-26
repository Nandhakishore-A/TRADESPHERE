import React, { useState } from 'react';
import {
  Star,
  Plus,
  ArrowUpRight,
  ArrowDownRight,
  Trash2,
  Search
} from 'lucide-react';

export default function WatchlistView({
  watchlist = [],
  stocks = [],
  onSelectStock,
  onOpenTradeModal,
  onToggleWatchlist
}) {
  const [showAddModal, setShowAddModal] = useState(false);
  const [searchFilter, setSearchFilter] = useState('');

  // Default watchlist stock definitions if empty
  const defaultWatchlistItems = [
    { symbol: 'RELIANCE', name: 'Reliance Industries Ltd', price: 2892.45, change: '+5.23%', isUp: true, path: 'M0,19 Q20,15 40,8 T80,2' },
    { symbol: 'TCS', name: 'Tata Consultancy Services', price: 4123.80, change: '+4.56%', isUp: true, path: 'M0,18 Q20,14 40,9 T80,3' },
    { symbol: 'HDFCBANK', name: 'HDFC Bank Ltd', price: 1678.90, change: '+3.45%', isUp: true, path: 'M0,17 Q20,13 40,10 T80,4' },
    { symbol: 'INFY', name: 'Infosys Ltd', price: 1456.20, change: '+3.12%', isUp: true, path: 'M0,16 Q20,12 40,9 T80,4' },
    { symbol: 'ICICIBANK', name: 'ICICI Bank Ltd', price: 1234.50, change: '+2.89%', isUp: true, path: 'M0,15 Q20,11 40,8 T80,5' },
    { symbol: 'SBIN', name: 'State Bank of India', price: 612.40, change: '-1.89%', isUp: false, path: 'M0,8 Q20,12 40,15 T80,20' },
    { symbol: 'BAJFINANCE', name: 'Bajaj Finance Ltd', price: 6789.20, change: '-1.23%', isUp: false, path: 'M0,7 Q20,10 40,16 T80,21' },
    { symbol: 'HINDUNILVR', name: 'Hindustan Unilever Ltd', price: 2456.90, change: '-0.98%', isUp: false, path: 'M0,10 Q20,13 40,15 T80,19' },
  ];

  // Resolve watchlist items from custom symbols or defaults
  const activeItems = watchlist.length > 0
    ? watchlist.map((sym) => {
        const found = defaultWatchlistItems.find((d) => d.symbol === sym);
        const live = stocks.find((s) => s.sku === sym);
        if (live) {
          return {
            symbol: live.sku,
            name: live.name,
            price: live.price,
            change: found ? found.change : '+1.50%',
            isUp: found ? found.isUp : true,
            path: found ? found.path : 'M0,15 Q20,12 40,8 T80,3',
            rawProduct: live,
          };
        }
        return found || {
          symbol: sym,
          name: sym,
          price: 150.00,
          change: '+0.50%',
          isUp: true,
          path: 'M0,15 Q20,12 40,8 T80,3',
        };
      })
    : defaultWatchlistItems;

  const filtered = activeItems.filter((i) =>
    i.symbol.toLowerCase().includes(searchFilter.toLowerCase()) ||
    i.name.toLowerCase().includes(searchFilter.toLowerCase())
  );

  return (
    <div className="ts-watchlist-view">
      {/* View Header */}
      <div className="view-header flex-between">
        <div>
          <h1 className="view-title">Watchlist</h1>
          <p className="view-subtitle">Track your favorite stocks and execute trades instantly</p>
        </div>

        <button
          type="button"
          className="btn-primary-purple"
          onClick={() => setShowAddModal(true)}
        >
          <Plus size={16} />
          <span>Add Stock</span>
        </button>
      </div>

      {/* Filter / Search Bar */}
      <div className="watchlist-toolbar">
        <div className="search-input-wrapper" style={{ maxWidth: '320px' }}>
          <Search size={16} className="search-icon" />
          <input
            type="text"
            className="topbar-search-input"
            placeholder="Search in watchlist..."
            value={searchFilter}
            onChange={(e) => setSearchFilter(e.target.value)}
          />
        </div>
        <span className="text-muted text-sm">{filtered.length} Equities Tracked</span>
      </div>

      {/* Watchlist Table */}
      <div className="ts-card table-card-wrapper">
        <div className="table-responsive">
          <table className="ts-market-table">
            <thead>
              <tr>
                <th>Symbol &amp; Company</th>
                <th>Price</th>
                <th>Change</th>
                <th>Day Chart</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan="5" className="text-center py-8 text-muted">
                    No stocks in this watchlist. Click "+ Add Stock" to begin tracking.
                  </td>
                </tr>
              ) : (
                filtered.map((stock) => (
                  <tr
                    key={stock.symbol}
                    className="market-row-hover"
                    onClick={() => onSelectStock(stock.rawProduct || { name: stock.name, sku: stock.symbol, price: stock.price })}
                  >
                    <td>
                      <div className="market-symbol-cell">
                        <div className="stock-logo-circle bg-indigo-dim">
                          <Star size={14} className="text-amber" fill="#F59E0B" />
                        </div>
                        <div>
                          <div className="stock-primary-name">{stock.symbol}</div>
                          <div className="stock-secondary-ticker">{stock.name}</div>
                        </div>
                      </div>
                    </td>

                    <td>
                      <strong className="stock-price-tabular">
                        ${stock.price.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                      </strong>
                    </td>

                    <td>
                      <span className={`trend-badge-pill ${stock.isUp ? 'trend-badge-up' : 'trend-badge-down'}`}>
                        {stock.isUp ? <ArrowUpRight size={13} /> : <ArrowDownRight size={13} />}
                        {stock.change}
                      </span>
                    </td>

                    <td>
                      <svg width="120" height="24" viewBox="0 0 80 24" fill="none">
                        <path
                          d={stock.path}
                          stroke={stock.isUp ? '#10B981' : '#EF4444'}
                          strokeWidth="2.4"
                          strokeLinecap="round"
                        />
                      </svg>
                    </td>

                    <td style={{ textAlign: 'right' }} onClick={(e) => e.stopPropagation()}>
                      <div className="row-action-group">
                        <button
                          type="button"
                          className="btn-table-trade"
                          onClick={() => onOpenTradeModal(stock.rawProduct || { name: stock.name, sku: stock.symbol, price: stock.price })}
                        >
                          Trade
                        </button>
                        <button
                          type="button"
                          className="btn-icon-danger"
                          onClick={() => onToggleWatchlist(stock.symbol)}
                          title="Remove from Watchlist"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Stock to Watchlist Modal */}
      {showAddModal && (
        <div className="modal-backdrop" onClick={() => setShowAddModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '440px' }}>
            <div className="modal-header">
              <h3>Add Stock to Watchlist</h3>
              <button type="button" className="btn-close" onClick={() => setShowAddModal(false)}>×</button>
            </div>
            <div className="modal-body">
              <p className="text-muted text-sm mb-4">Select an equity from the catalog to add to your personal watchlist tracker:</p>
              <div className="stock-selection-scroll">
                {stocks.map((s) => (
                  <div
                    key={s._id || s.sku}
                    className="stock-select-item"
                    onClick={() => {
                      onToggleWatchlist(s.sku);
                      setShowAddModal(false);
                    }}
                  >
                    <div>
                      <strong>{s.sku}</strong>
                      <div className="text-muted text-xs">{s.name}</div>
                    </div>
                    <span className="text-emerald font-semibold">${s.price.toFixed(2)}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
