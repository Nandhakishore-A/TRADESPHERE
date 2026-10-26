import React, { useState } from 'react';
import {
  User,
  Shield,
  Bell,
  Sliders,
  Key,
  CreditCard,
  Save,
  Camera,
  CheckCircle2,
  Lock,
  Copy,
  Plus
} from 'lucide-react';

export default function SettingsView({ user, onUpdateUser, showToast }) {
  const [activeSubTab, setActiveSubTab] = useState('Profile');
  const [formData, setFormData] = useState({
    name: user?.name || 'Nandhakishore A',
    email: user?.email || 'admin@tradesphere.io',
    phone: '+91 98765 43210',
    currency: 'USD',
    twoFactor: true,
    emailAlerts: true,
    smsAlerts: false,
    tradeConfirmations: true,
    marketOpenClose: true,
  });

  const [isSaved, setIsSaved] = useState(false);
  const [apiKey, setApiKey] = useState('ts_live_9f83a2c091e4b882f019');

  const handleSave = (e) => {
    e.preventDefault();
    if (onUpdateUser) {
      onUpdateUser({
        ...user,
        name: formData.name,
        email: formData.email,
      });
    }
    setIsSaved(true);
    if (showToast) showToast('Settings updated successfully!', 'success');
    setTimeout(() => setIsSaved(false), 3000);
  };

  const navItems = [
    { id: 'Profile', label: 'Profile', icon: User },
    { id: 'Security', label: 'Security', icon: Shield },
    { id: 'Notifications', label: 'Notifications', icon: Bell },
    { id: 'Preferences', label: 'Preferences', icon: Sliders },
    { id: 'API Keys', label: 'API Keys', icon: Key },
    { id: 'Billing', label: 'Billing', icon: CreditCard },
  ];

  return (
    <div className="ts-settings-view">
      <div className="view-header">
        <div>
          <h1 className="view-title">Settings</h1>
          <p className="view-subtitle">Manage your account information, security credentials, and preferences</p>
        </div>
      </div>

      <div className="settings-layout-grid">
        {/* Left Sub-nav Column */}
        <aside className="ts-card settings-nav-card">
          <ul className="settings-nav-list">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <li key={item.id}>
                  <button
                    type="button"
                    className={`settings-nav-btn ${activeSubTab === item.id ? 'active' : ''}`}
                    onClick={() => setActiveSubTab(item.id)}
                  >
                    <Icon size={17} />
                    <span>{item.label}</span>
                  </button>
                </li>
              );
            })}
          </ul>
        </aside>

        {/* Right Settings Form Content */}
        <div className="ts-card settings-content-card">
          {/* 1. Profile */}
          {activeSubTab === 'Profile' && (
            <div className="settings-pane">
              <div className="pane-header">
                <h3 className="pane-heading">Profile Settings</h3>
                <p className="text-muted text-sm">Update your public profile details and contact information</p>
              </div>

              {/* Avatar Section */}
              <div className="avatar-upload-row">
                <div className="avatar-circle-large">
                  {formData.name.slice(0, 2).toUpperCase()}
                </div>
                <div>
                  <button type="button" className="btn-change-photo" onClick={() => showToast && showToast('Profile avatar uploaded!', 'info')}>
                    <Camera size={14} />
                    <span>Change Photo</span>
                  </button>
                  <p className="text-muted text-xs mt-1">Recommended: JPG or PNG, max 2MB</p>
                </div>
              </div>

              <form onSubmit={handleSave} className="settings-form">
                <div className="form-group mb-4">
                  <label className="input-label">Full Name</label>
                  <input
                    type="text"
                    className="form-input-field"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                  />
                </div>

                <div className="form-group mb-4">
                  <label className="input-label">Email Address</label>
                  <input
                    type="email"
                    className="form-input-field"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    required
                  />
                </div>

                <div className="form-group mb-6">
                  <label className="input-label">Phone Number</label>
                  <input
                    type="text"
                    className="form-input-field"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  />
                </div>

                <div className="form-actions-row">
                  <button type="submit" className="btn-save-settings">
                    {isSaved ? <CheckCircle2 size={16} /> : <Save size={16} />}
                    <span>{isSaved ? 'Changes Saved!' : 'Save Changes'}</span>
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* 2. Security */}
          {activeSubTab === 'Security' && (
            <div className="settings-pane">
              <div className="pane-header">
                <h3 className="pane-heading">Security Credentials</h3>
                <p className="text-muted text-sm">Protect your TradeSphere portfolio with multi-factor authorization</p>
              </div>

              <div className="security-item-card mb-4">
                <div className="flex-between">
                  <div>
                    <strong>Two-Factor Authentication (2FA)</strong>
                    <p className="text-muted text-xs">Verify orders via TOTP authenticator app</p>
                  </div>
                  <input
                    type="checkbox"
                    className="ts-toggle-checkbox"
                    checked={formData.twoFactor}
                    onChange={(e) => {
                      setFormData({ ...formData, twoFactor: e.target.checked });
                      if (showToast) showToast(`2FA ${e.target.checked ? 'Enabled' : 'Disabled'}`, 'info');
                    }}
                  />
                </div>
              </div>

              <div className="security-item-card mb-4">
                <div className="flex-between">
                  <div>
                    <strong>Change Password</strong>
                    <p className="text-muted text-xs">Strong cryptographic hashing enforced</p>
                  </div>
                  <button type="button" className="btn-secondary-sm" onClick={() => showToast && showToast('Password reset link sent to your email', 'info')}>
                    <Lock size={13} /> Update
                  </button>
                </div>
              </div>

              <div className="security-item-card">
                <div className="flex-between">
                  <div>
                    <strong>Active Trading Sessions</strong>
                    <p className="text-muted text-xs">Chrome on Windows 11 • Current Session (Active)</p>
                  </div>
                  <button type="button" className="btn-secondary-sm" onClick={() => showToast && showToast('All other sessions terminated', 'success')}>
                    Terminate Other Sessions
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* 3. Notifications */}
          {activeSubTab === 'Notifications' && (
            <div className="settings-pane">
              <div className="pane-header">
                <h3 className="pane-heading">Notification Alerts</h3>
                <p className="text-muted text-sm">Configure how and when you receive market alerts</p>
              </div>

              <div className="security-item-card mb-3">
                <div className="flex-between">
                  <div>
                    <strong>Trade Confirmations</strong>
                    <p className="text-muted text-xs">Instant alerts when orders transition from RESERVED to COMPLETED</p>
                  </div>
                  <input
                    type="checkbox"
                    className="ts-toggle-checkbox"
                    checked={formData.tradeConfirmations}
                    onChange={(e) => setFormData({ ...formData, tradeConfirmations: e.target.checked })}
                  />
                </div>
              </div>

              <div className="security-item-card mb-3">
                <div className="flex-between">
                  <div>
                    <strong>Market Open &amp; Close Updates</strong>
                    <p className="text-muted text-xs">Pre-market sentiment and daily index summary</p>
                  </div>
                  <input
                    type="checkbox"
                    className="ts-toggle-checkbox"
                    checked={formData.marketOpenClose}
                    onChange={(e) => setFormData({ ...formData, marketOpenClose: e.target.checked })}
                  />
                </div>
              </div>

              <div className="security-item-card mb-4">
                <div className="flex-between">
                  <div>
                    <strong>Email Weekly Digest</strong>
                    <p className="text-muted text-xs">Portfolio net returns summary and benchmark comparison</p>
                  </div>
                  <input
                    type="checkbox"
                    className="ts-toggle-checkbox"
                    checked={formData.emailAlerts}
                    onChange={(e) => setFormData({ ...formData, emailAlerts: e.target.checked })}
                  />
                </div>
              </div>

              <button type="button" className="btn-save-settings" onClick={() => showToast && showToast('Notification preferences saved!', 'success')}>
                <Save size={16} /> Save Preferences
              </button>
            </div>
          )}

          {/* 4. Preferences */}
          {activeSubTab === 'Preferences' && (
            <div className="settings-pane">
              <div className="pane-header">
                <h3 className="pane-heading">Display Preferences</h3>
                <p className="text-muted text-sm">Customize currency symbol, session timezone, and layout</p>
              </div>

              <div className="form-group mb-4">
                <label className="input-label">Primary Portfolio Currency</label>
                <select
                  className="form-select-field"
                  value={formData.currency}
                  onChange={(e) => {
                    setFormData({ ...formData, currency: e.target.value });
                    if (showToast) showToast(`Default currency updated to ${e.target.value}`, 'success');
                  }}
                >
                  <option value="USD">USD ($) — United States Dollar</option>
                  <option value="INR">INR (₹) — Indian Rupee</option>
                  <option value="EUR">EUR (€) — Euro</option>
                  <option value="GBP">GBP (£) — British Pound</option>
                </select>
              </div>

              <div className="form-group mb-4">
                <label className="input-label">Market Timezone</label>
                <select className="form-select-field" defaultValue="IST">
                  <option value="IST">Asia/Kolkata (IST — UTC+5:30)</option>
                  <option value="EST">America/New_York (EST — UTC-5:00)</option>
                  <option value="UTC">Coordinated Universal Time (UTC)</option>
                </select>
              </div>

              <div className="form-group mb-4">
                <label className="input-label">Interface Theme</label>
                <div className="flex gap-2">
                  <span className="cat-pill active">Obsidian Dark (Default)</span>
                  <span className="cat-pill" onClick={() => showToast && showToast('High-contrast fintech mode active', 'info')}>High Contrast</span>
                </div>
              </div>
            </div>
          )}

          {/* 5. API Keys */}
          {activeSubTab === 'API Keys' && (
            <div className="settings-pane">
              <div className="pane-header">
                <h3 className="pane-heading">Algorithmic Trading API Keys</h3>
                <p className="text-muted text-sm">Connect programmatic trading bots and WebSockets to your portfolio</p>
              </div>

              <div className="ts-card mb-4" style={{ padding: '16px' }}>
                <span className="text-muted text-xs">Production API Token</span>
                <div className="flex items-center gap-2 mt-2">
                  <input
                    type="password"
                    readOnly
                    className="form-input-field"
                    value={apiKey}
                    style={{ fontFamily: 'monospace' }}
                  />
                  <button
                    type="button"
                    className="btn-secondary-sm"
                    onClick={() => {
                      navigator.clipboard.writeText(apiKey);
                      if (showToast) showToast('API Key copied to clipboard!', 'success');
                    }}
                  >
                    <Copy size={14} /> Copy
                  </button>
                </div>
              </div>

              <button
                type="button"
                className="btn-primary-purple"
                onClick={() => {
                  const newKey = `ts_live_${Math.random().toString(36).slice(2, 10)}${Date.now().toString(36)}`;
                  setApiKey(newKey);
                  if (showToast) showToast('New API Key generated successfully!', 'success');
                }}
              >
                <Plus size={16} /> Generate New Key
              </button>
            </div>
          )}

          {/* 6. Billing */}
          {activeSubTab === 'Billing' && (
            <div className="settings-pane">
              <div className="pane-header">
                <h3 className="pane-heading">Subscription &amp; Brokerage Tier</h3>
                <p className="text-muted text-sm">Your TradeSphere account level and settlement limits</p>
              </div>

              <div className="ts-card mb-4" style={{ padding: '20px', border: '1px solid rgba(16, 185, 129, 0.3)' }}>
                <div className="flex-between mb-2">
                  <strong className="text-white text-base">TradeSphere Professional Trader</strong>
                  <span className="trend-pill trend-up">Active Plan</span>
                </div>
                <p className="text-muted text-xs mb-3">Unlimited atomic trade executions, 0% brokerage on equities, and real-time MongoDB Atlas synchronization.</p>
                <div className="text-emerald font-bold text-lg">$0.00 / month <span className="text-muted text-xs font-normal">(Free for Developer / Student tier)</span></div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
