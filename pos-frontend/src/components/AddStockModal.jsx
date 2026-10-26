import React, { useState } from 'react';
import { PlusCircle, X } from 'lucide-react';

export default function AddStockModal({ isOpen, onClose, onAddStock }) {
  const [formData, setFormData] = useState({
    name: '',
    sku: '',
    category: 'Technology',
    price: '',
    stock: '500',
    lowStockThreshold: '25',
  });
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!formData.name.trim() || formData.price === '' || formData.stock === '') {
      setError('Please provide Asset Name, Ticker Symbol, Price, and Shares Float.');
      return;
    }

    const priceNum = parseFloat(formData.price);
    const stockNum = parseInt(formData.stock, 10);
    const threshNum = parseInt(formData.lowStockThreshold, 10) || 10;

    if (isNaN(priceNum) || priceNum <= 0) {
      setError('Price must be a valid positive number.');
      return;
    }
    if (isNaN(stockNum) || stockNum <= 0) {
      setError('Total shares float must be a positive integer.');
      return;
    }

    try {
      setIsSubmitting(true);
      await onAddStock({
        name: formData.name.trim(),
        sku: (formData.sku.trim() || `STK-${Date.now().toString().slice(-4)}`).toUpperCase(),
        category: formData.category,
        price: priceNum,
        stock: stockNum,
        lowStockThreshold: threshNum,
      });
      onClose();
    } catch (err) {
      setError(err.message || 'Failed to list asset');
    } finally {
      setIsSubmitting(false);
    }
  };

  const sectors = [
    'Technology',
    'Banking',
    'Energy & Retail',
    'Financial Services',
    'Consumer Goods',
    'Automotive',
    'Semiconductors',
    'Healthcare',
  ];

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '480px' }}>
        <div className="modal-header">
          <div className="modal-title">
            <PlusCircle size={20} className="text-emerald" />
            <h3>List New Stock / Asset</h3>
          </div>
          <button type="button" className="btn-close-modal" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="modal-form">
          {error && <div className="auth-alert-error mb-3">{error}</div>}

          <div className="form-group mb-3">
            <label className="input-label">Company / Asset Name *</label>
            <input
              type="text"
              className="auth-input-field"
              placeholder="e.g. Tata Motors Ltd"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
            />
          </div>

          <div className="form-row-2 mb-3">
            <div className="form-group">
              <label className="input-label">Ticker Symbol *</label>
              <input
                type="text"
                className="auth-input-field"
                placeholder="e.g. TATAMOTORS"
                value={formData.sku}
                onChange={(e) => setFormData({ ...formData, sku: e.target.value.toUpperCase() })}
                required
              />
            </div>

            <div className="form-group">
              <label className="input-label">Sector / Category</label>
              <select
                className="auth-select-field"
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              >
                {sectors.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="form-row-2 mb-4">
            <div className="form-group">
              <label className="input-label">Initial Market Price ($) *</label>
              <input
                type="number"
                step="0.01"
                min="0.01"
                className="auth-input-field"
                placeholder="e.g. 780.50"
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                required
              />
            </div>

            <div className="form-group">
              <label className="input-label">Initial Share Float *</label>
              <input
                type="number"
                min="1"
                className="auth-input-field"
                placeholder="e.g. 500"
                value={formData.stock}
                onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                required
              />
            </div>
          </div>

          <div className="form-actions-row">
            <button type="button" className="btn-cancel" onClick={onClose}>
              Cancel
            </button>
            <button
              type="submit"
              className="btn-trade-primary"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Listing Asset...' : 'List on TradeSphere'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
