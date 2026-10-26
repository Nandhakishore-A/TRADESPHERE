import React, { useState } from 'react';
import {
  TrendingUp,
  X,
  Mail,
  Lock,
  User,
  ShieldCheck,
  Sparkles
} from 'lucide-react';

export default function AuthModal({
  isOpen,
  initialMode = 'login',
  onClose,
  onAuthSuccess,
  apiBaseUrl,
  showToast
}) {
  const [mode, setMode] = useState(initialMode); // 'login' or 'register'
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'cashier',
    rememberMe: true,
  });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    const endpoint = mode === 'login' ? '/api/auth/login' : '/api/auth/register';
    const payload = mode === 'login'
      ? { email: formData.email, password: formData.password }
      : { name: formData.name, email: formData.email, password: formData.password, role: formData.role };

    try {
      const res = await fetch(`${apiBaseUrl}${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Authentication request failed');
      }

      if (data.token && data.user) {
        localStorage.setItem('tradesphere_token', data.token);
        localStorage.setItem('tradesphere_user', JSON.stringify(data.user));
        if (showToast) showToast(`Welcome back, ${data.user.name}!`, 'success');
        onAuthSuccess(data.user, data.token);
        onClose();
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  // Quick 1-click Demo Account Login
  const handleDemoLogin = async (demoEmail, demoPassword) => {
    setFormData((prev) => ({ ...prev, email: demoEmail, password: demoPassword }));
    setError('');
    setIsLoading(true);

    try {
      const res = await fetch(`${apiBaseUrl}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: demoEmail, password: demoPassword }),
      });

      const data = await res.json();
      if (!res.ok) {
        // If users not seeded yet, seed them first
        await fetch(`${apiBaseUrl}/api/auth/seed`, { method: 'POST' });
        // Retry login
        const retryRes = await fetch(`${apiBaseUrl}/api/auth/login`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: demoEmail, password: demoPassword }),
        });
        const retryData = await retryRes.json();
        if (!retryRes.ok) throw new Error(retryData.error || 'Demo login failed');
        localStorage.setItem('tradesphere_token', retryData.token);
        localStorage.setItem('tradesphere_user', JSON.stringify(retryData.user));
        if (showToast) showToast(`Logged in as ${retryData.user.name}`, 'success');
        onAuthSuccess(retryData.user, retryData.token);
        onClose();
        return;
      }

      localStorage.setItem('tradesphere_token', data.token);
      localStorage.setItem('tradesphere_user', JSON.stringify(data.user));
      if (showToast) showToast(`Logged in as ${data.user.name}`, 'success');
      onAuthSuccess(data.user, data.token);
      onClose();
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-content auth-modal-box" onClick={(e) => e.stopPropagation()}>
        {/* Brand Header */}
        <div className="auth-brand-center">
          <div className="brand-logo-icon">
            <TrendingUp size={22} className="text-emerald" />
          </div>
          <span className="brand-title">TradeSphere</span>
        </div>

        <button type="button" className="btn-close-modal" onClick={onClose}>
          <X size={18} />
        </button>

        <div className="auth-header-text">
          <h2>{mode === 'login' ? 'Welcome Back!' : 'Create Account'}</h2>
          <p className="text-muted text-sm">
            {mode === 'login'
              ? 'Sign in to access your TradeSphere portfolio'
              : 'Join TradeSphere and start investing'}
          </p>
        </div>

        {error && <div className="auth-alert-error">{error}</div>}

        <form onSubmit={handleSubmit} className="auth-form-body">
          {mode === 'register' && (
            <div className="form-group mb-3">
              <label className="input-label">Full Name</label>
              <div className="input-with-icon">
                <User size={16} className="input-lead-icon" />
                <input
                  type="text"
                  placeholder="John Doe"
                  className="auth-input-field"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>
            </div>
          )}

          <div className="form-group mb-3">
            <label className="input-label">Email Address</label>
            <div className="input-with-icon">
              <Mail size={16} className="input-lead-icon" />
              <input
                type="email"
                placeholder="john.doe@example.com"
                className="auth-input-field"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required
              />
            </div>
          </div>

          <div className="form-group mb-3">
            <div className="flex-between">
              <label className="input-label">Password</label>
              {mode === 'login' && (
                <a href="#forgot" className="auth-link-forgot" onClick={(e) => e.preventDefault()}>
                  Forgot Password?
                </a>
              )}
            </div>
            <div className="input-with-icon">
              <Lock size={16} className="input-lead-icon" />
              <input
                type="password"
                placeholder="••••••••"
                className="auth-input-field"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                required
                minLength={6}
              />
            </div>
          </div>

          {mode === 'register' && (
            <div className="form-group mb-3">
              <label className="input-label">Trading Role</label>
              <select
                className="auth-select-field"
                value={formData.role}
                onChange={(e) => setFormData({ ...formData, role: e.target.value })}
              >
                <option value="cashier">Retail Trader</option>
                <option value="manager">Portfolio Manager</option>
                <option value="admin">System Administrator</option>
              </select>
            </div>
          )}

          {mode === 'login' && (
            <div className="form-checkbox-row mb-4">
              <label className="checkbox-container">
                <input
                  type="checkbox"
                  checked={formData.rememberMe}
                  onChange={(e) => setFormData({ ...formData, rememberMe: e.target.checked })}
                />
                <span className="checkbox-label-text">Remember me</span>
              </label>
            </div>
          )}

          <button
            type="submit"
            className="btn-auth-submit"
            disabled={isLoading}
          >
            {isLoading ? 'Processing...' : mode === 'login' ? 'Sign In' : 'Create Account'}
          </button>
        </form>

        {/* 1-Click Quick Demo Access */}
        <div className="demo-accounts-pill-box">
          <span className="text-muted text-xs">Quick Demo Access:</span>
          <div className="demo-buttons-row">
            <button
              type="button"
              className="btn-demo-pill"
              onClick={() => handleDemoLogin('admin@tradesphere.io', 'Password123!')}
            >
              <Sparkles size={12} /> Admin (Karthikeyan)
            </button>
            <button
              type="button"
              className="btn-demo-pill"
              onClick={() => handleDemoLogin('manager@tradesphere.io', 'Password123!')}
            >
              <ShieldCheck size={12} /> Portfolio Manager
            </button>
          </div>
        </div>

        {/* Footer Toggle */}
        <div className="auth-footer-toggle">
          {mode === 'login' ? (
            <p>
              Don't have an account?{' '}
              <button
                type="button"
                className="btn-text-link"
                onClick={() => {
                  setMode('register');
                  setError('');
                }}
              >
                Sign Up
              </button>
            </p>
          ) : (
            <p>
              Already have an account?{' '}
              <button
                type="button"
                className="btn-text-link"
                onClick={() => {
                  setMode('login');
                  setError('');
                }}
              >
                Sign In
              </button>
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
