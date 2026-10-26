import React, { useState, useRef, useEffect } from 'react';
import {
  Search,
  Bell,
  RefreshCw,
  PlusCircle,
  Menu,
  TrendingUp,
  User,
  ShieldCheck,
  CheckCircle2,
  Clock
} from 'lucide-react';

export default function Topbar({
  onToggleSidebar,
  searchQuery,
  onSearchChange,
  stocks = [],
  onSelectStock,
  onOpenTradeModal,
  onOpenAddStock,
  onRefresh,
  isRefreshing,
  user,
  onOpenAuth,
  onLogout,
  onSelectView,
  notifications = []
}) {
  const [showSearchDropdown, setShowSearchDropdown] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const searchRef = useRef(null);
  const notifRef = useRef(null);
  const userRef = useRef(null);

  // Close dropdowns on outside click
  useEffect(() => {
    function handleClickOutside(e) {
      if (searchRef.current && !searchRef.current.contains(e.target)) {
        setShowSearchDropdown(false);
      }
      if (notifRef.current && !notifRef.current.contains(e.target)) {
        setShowNotifications(false);
      }
      if (userRef.current && !userRef.current.contains(e.target)) {
        setShowUserMenu(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const searchResults = searchQuery.trim()
    ? stocks.filter(
        (s) =>
          s.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          s.sku?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          s.category?.toLowerCase().includes(searchQuery.toLowerCase())
      ).slice(0, 6)
    : [];

  return (
    <header className="ts-topbar">
      {/* Mobile Menu Toggle */}
      <button
        type="button"
        className="btn-menu-mobile"
        onClick={onToggleSidebar}
        aria-label="Toggle navigation"
      >
        <Menu size={22} />
      </button>

      {/* Universal Search Bar */}
      <div className="topbar-search-container" ref={searchRef}>
        <div className="search-input-wrapper">
          <Search size={18} className="search-icon" />
          <input
            type="text"
            className="topbar-search-input"
            placeholder="Search for stocks, ETFs, or indices... (Press '/' to focus)"
            value={searchQuery}
            onChange={(e) => {
              onSearchChange(e.target.value);
              setShowSearchDropdown(true);
            }}
            onFocus={() => setShowSearchDropdown(true)}
          />
          <kbd className="search-kbd">⌘K</kbd>
        </div>

        {/* Live Search Popup */}
        {showSearchDropdown && searchResults.length > 0 && (
          <div className="search-dropdown-menu">
            <div className="dropdown-section-title">EQUITIES &amp; INDICES</div>
            {searchResults.map((stock) => (
              <div
                key={stock._id || stock.sku}
                className="search-dropdown-item"
                onClick={() => {
                  onSelectStock(stock);
                  setShowSearchDropdown(false);
                  onSearchChange('');
                }}
              >
                <div className="item-symbol-col">
                  <span className="item-symbol">{stock.sku}</span>
                  <span className="item-name">{stock.name}</span>
                </div>
                <div className="item-price-col">
                  <span className="item-price">${Number(stock.price).toFixed(2)}</span>
                  <span className="item-badge">{stock.category || 'Equity'}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Topbar Right Actions */}
      <div className="topbar-right-actions">
        {/* Quick Trade Button */}
        <button
          type="button"
          className="btn-trade-primary"
          onClick={() => onOpenTradeModal()}
          title="Open Trade Execution Terminal"
        >
          <TrendingUp size={16} />
          <span>Trade</span>
        </button>

        {/* Add Asset Button */}
        <button
          type="button"
          className="btn-topbar-secondary"
          onClick={onOpenAddStock}
          title="List New Stock/Asset"
        >
          <PlusCircle size={16} />
          <span className="desktop-only">Add Asset</span>
        </button>

        {/* Refresh Button */}
        <button
          type="button"
          className={`btn-icon-topbar ${isRefreshing ? 'spin' : ''}`}
          onClick={onRefresh}
          title="Refresh Real-time Market Data"
        >
          <RefreshCw size={17} />
        </button>

        {/* Notifications Dropdown */}
        <div className="notif-wrapper" ref={notifRef}>
          <button
            type="button"
            className="btn-icon-topbar has-badge"
            onClick={() => setShowNotifications(!showNotifications)}
            title="Notifications"
          >
            <Bell size={18} />
            <span className="notif-dot" />
          </button>

          {showNotifications && (
            <div className="notif-dropdown">
              <div className="notif-header">
                <h4>System &amp; Market Alerts</h4>
                <span className="text-muted text-xs">Live Feed</span>
              </div>
              <div className="notif-list">
                {notifications.length > 0 ? (
                  notifications.map((n, i) => (
                    <div key={i} className="notif-item">
                      <div className="notif-icon-circle bg-emerald-dim">
                        <CheckCircle2 size={14} className="text-emerald" />
                      </div>
                      <div className="notif-content">
                        <p className="notif-text">{n.text}</p>
                        <span className="notif-time">{n.time}</span>
                      </div>
                    </div>
                  ))
                ) : (
                  <>
                    <div className="notif-item">
                      <div className="notif-icon-circle bg-emerald-dim">
                        <TrendingUp size={14} className="text-emerald" />
                      </div>
                      <div className="notif-content">
                        <p className="notif-text">RELIANCE surged +5.23% in intraday session</p>
                        <span className="notif-time">10m ago</span>
                      </div>
                    </div>
                    <div className="notif-item">
                      <div className="notif-icon-circle bg-blue-dim">
                        <Clock size={14} className="text-blue" />
                      </div>
                      <div className="notif-content">
                        <p className="notif-text">Concurrency auto-release worker active (30s interval)</p>
                        <span className="notif-time">25m ago</span>
                      </div>
                    </div>
                    <div className="notif-item">
                      <div className="notif-icon-circle bg-emerald-dim">
                        <ShieldCheck size={14} className="text-emerald" />
                      </div>
                      <div className="notif-content">
                        <p className="notif-text">TradeSphere portfolio sync verified with MongoDB Atlas</p>
                        <span className="notif-time">1h ago</span>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>
          )}
        </div>

        {/* User Profile Pill */}
        <div className="user-profile-wrapper" ref={userRef}>
          {user ? (
            <div
              className="user-profile-pill"
              onClick={() => setShowUserMenu(!showUserMenu)}
            >
              <div className="user-avatar-small">
                {user.name ? user.name.slice(0, 2).toUpperCase() : 'JD'}
              </div>
              <div className="user-info-text desktop-only">
                <span className="user-title">{user.name || 'John Doe'}</span>
                <span className="user-badge-role">{user.role || 'Premium'}</span>
              </div>
            </div>
          ) : (
            <button
              type="button"
              className="btn-signin-pill"
              onClick={() => onOpenAuth('login')}
            >
              <User size={15} />
              <span>Sign In</span>
            </button>
          )}

          {showUserMenu && user && (
            <div className="user-dropdown-menu">
              <div className="user-dropdown-header">
                <strong>{user.name}</strong>
                <small className="text-muted">{user.email}</small>
              </div>
              <div className="dropdown-divider" />
              <button
                type="button"
                className="dropdown-menu-link"
                onClick={() => {
                  onSelectView('settings');
                  setShowUserMenu(false);
                }}
              >
                Profile &amp; Settings
              </button>
              <button
                type="button"
                className="dropdown-menu-link"
                onClick={() => {
                  onSelectView('portfolio');
                  setShowUserMenu(false);
                }}
              >
                My Portfolio
              </button>
              <button
                type="button"
                className="dropdown-menu-link"
                onClick={() => {
                  onSelectView('transactions');
                  setShowUserMenu(false);
                }}
              >
                Order History
              </button>
              <div className="dropdown-divider" />
              <button
                type="button"
                className="dropdown-menu-link text-danger"
                onClick={() => {
                  onLogout();
                  setShowUserMenu(false);
                }}
              >
                Sign Out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
