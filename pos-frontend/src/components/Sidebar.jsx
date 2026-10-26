import React from 'react';
import {
  LayoutDashboard,
  Globe,
  Briefcase,
  Star,
  BarChart3,
  ArrowLeftRight,
  Newspaper,
  Settings,
  Shield,
  TrendingUp,
  LogOut,
  User,
  Sparkles
} from 'lucide-react';

export default function Sidebar({
  currentView,
  onSelectView,
  onOpenAuditLogs,
  onSeedDemoData,
  user,
  onLogout,
  onOpenAuth,
  isOpen,
  onCloseMobile
}) {
  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'markets', label: 'Markets', icon: Globe },
    { id: 'portfolio', label: 'Portfolio', icon: Briefcase },
    { id: 'watchlist', label: 'Watchlist', icon: Star },
    { id: 'analytics', label: 'Analytics', icon: BarChart3 },
    { id: 'transactions', label: 'Transactions', icon: ArrowLeftRight },
    { id: 'news', label: 'News', icon: Newspaper },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && <div className="sidebar-mobile-backdrop" onClick={onCloseMobile} />}
      
      <aside className={`ts-sidebar ${isOpen ? 'open' : ''}`}>
        {/* Brand Logo Header */}
        <div className="sidebar-brand" onClick={() => onSelectView('dashboard')}>
          <div className="brand-logo-icon">
            <TrendingUp size={22} className="text-emerald" />
          </div>
          <div className="brand-text">
            <span className="brand-title">TradeSphere</span>
            <span className="brand-tag">v1.0 Pro</span>
          </div>
        </div>

        {/* Navigation Menu */}
        <nav className="sidebar-nav">
          <div className="nav-group-label">MAIN MENU</div>
          <ul className="nav-list">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentView === item.id;
              return (
                <li key={item.id}>
                  <button
                    type="button"
                    className={`nav-item ${isActive ? 'active' : ''}`}
                    onClick={() => {
                      onSelectView(item.id);
                      if (onCloseMobile) onCloseMobile();
                    }}
                  >
                    <Icon size={19} className="nav-icon" />
                    <span className="nav-label">{item.label}</span>
                    {isActive && <span className="active-indicator" />}
                  </button>
                </li>
              );
            })}
          </ul>

          <div className="nav-group-label" style={{ marginTop: '24px' }}>SYSTEM & AUDIT</div>
          <ul className="nav-list">
            <li>
              <button
                type="button"
                className="nav-item"
                onClick={() => {
                  onOpenAuditLogs();
                  if (onCloseMobile) onCloseMobile();
                }}
              >
                <Shield size={19} className="nav-icon text-cyan" />
                <span className="nav-label">Audit Logs</span>
                <span className="badge-live">LIVE</span>
              </button>
            </li>
            <li>
              <button
                type="button"
                className="nav-item"
                onClick={onSeedDemoData}
                title="Populate demo stocks and sample orders"
              >
                <Sparkles size={19} className="nav-icon text-amber" />
                <span className="nav-label">Seed Market Data</span>
              </button>
            </li>
          </ul>
        </nav>

        {/* User Card & Authentication status */}
        <div className="sidebar-footer">
          {user ? (
            <div className="sidebar-user-card">
              <div className="user-avatar-circle">
                {user.name ? user.name.slice(0, 2).toUpperCase() : 'JD'}
              </div>
              <div className="user-details" onClick={() => onSelectView('settings')}>
                <span className="user-name">{user.name || 'John Doe'}</span>
                <span className="user-role-badge">{user.role || 'Premium'}</span>
              </div>
              <button
                type="button"
                className="btn-logout-icon"
                onClick={onLogout}
                title="Sign Out"
              >
                <LogOut size={16} />
              </button>
            </div>
          ) : (
            <div className="sidebar-guest-card">
              <button
                type="button"
                className="btn-sidebar-auth"
                onClick={() => onOpenAuth('login')}
              >
                <User size={16} />
                <span>Sign In / Register</span>
              </button>
            </div>
          )}
        </div>
      </aside>
    </>
  );
}
