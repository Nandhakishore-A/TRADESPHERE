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
  Lock
} from 'lucide-react';

export default function SettingsView({ user, onUpdateUser, showToast }) {
  const [activeSubTab, setActiveSubTab] = useState('Profile');
  const [formData, setFormData] = useState({
    name: user?.name || 'John Doe',
    email: user?.email || 'john.doe@example.com',
    phone: '+91 98765 43210',
    currency: 'USD',
    twoFactor: true,
    emailAlerts: true,
  });

  const [isSaved, setIsSaved] = useState(false);

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
    if (showToast) showToast('Profile settings updated successfully!', 'success');
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
                  <button type="button" className="btn-change-photo">
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

          {activeSubTab === 'Security' && (
            <div className="settings-pane">
              <div className="pane-header">
                <h3 className="pane-heading">Security Credentials</h3>
                <p className="text-muted text-sm">Protect your TradeSphere portfolio and multi-factor authorization</p>
              </div>

              <div className="security-item-card mb-4">
                <div className="flex-between">
                  <div>
                    <strong>Two-Factor Authentication (2FA)</strong>
                    <p className="text-muted text-xs">Verify trades via TOTP authenticator app</p>
                  </div>
                  <input
                    type="checkbox"
                    className="ts-toggle-checkbox"
                    checked={formData.twoFactor}
                    onChange={(e) => setFormData({ ...formData, twoFactor: e.target.checked })}
                  />
                </div>
              </div>

              <div className="security-item-card">
                <div className="flex-between">
                  <div>
                    <strong>Change Password</strong>
                    <p className="text-muted text-xs">Last changed 42 days ago</p>
                  </div>
                  <button type="button" className="btn-secondary-sm">
                    <Lock size={13} /> Update
                  </button>
                </div>
              </div>
            </div>
          )}

          {activeSubTab === 'Preferences' && (
            <div className="settings-pane">
              <div className="pane-header">
                <h3 className="pane-heading">Display Preferences</h3>
                <p className="text-muted text-sm">Customize currency symbol and market session views</p>
              </div>

              <div className="form-group mb-4">
                <label className="input-label">Primary Portfolio Currency</label>
                <select
                  className="form-select-field"
                  value={formData.currency}
                  onChange={(e) => setFormData({ ...formData, currency: e.target.value })}
                >
                  <option value="USD">USD ($) — United States Dollar</option>
                  <option value="INR">INR (₹) — Indian Rupee</option>
                  <option value="EUR">EUR (€) — Euro</option>
                  <option value="GBP">GBP (£) — British Pound</option>
                </select>
              </div>
            </div>
          )}

          {activeSubTab !== 'Profile' && activeSubTab !== 'Security' && activeSubTab !== 'Preferences' && (
            <div className="text-center py-10 text-muted">
              {activeSubTab} configuration available under TradeSphere Pro subscription.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
