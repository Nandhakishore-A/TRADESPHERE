import React, { useState } from 'react';
import { X, ShieldCheck } from 'lucide-react';

function TradeModalForm({
  stock,
  initialSide,
  onClose,
  onExecuteTrade,
  isProcessing
}) {
  const [side, setSide] = useState(initialSide || 'BUY');
  const [orderType, setOrderType] = useState('Market');
  const [quantity, setQuantity] = useState(10);
  const [limitPrice, setLimitPrice] = useState(stock ? stock.price : 100);
  const [stopLoss, setStopLoss] = useState(
    stock ? Number((stock.price * (initialSide === 'SELL' ? 1.05 : 0.95)).toFixed(2)) : 90
  );
  const [error, setError] = useState('');

  const currentPrice = stock ? stock.price : 100;
  const executionPrice = orderType === 'Market' ? currentPrice : Number(limitPrice);
  const totalValue = Number((quantity * executionPrice).toFixed(2));

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');

    if (!stock) return;

    if (quantity <= 0) {
      setError('Quantity must be at least 1 share.');
      return;
    }

    if (orderType === 'Limit' && (!limitPrice || limitPrice <= 0)) {
      setError('Please provide a valid Limit Price.');
      return;
    }

    if (orderType === 'Stop-Loss' && (!stopLoss || stopLoss <= 0)) {
      setError('Please provide a valid Stop-Loss trigger price.');
      return;
    }

    onExecuteTrade({
      stock,
      side,
      orderType,
      quantity: Number(quantity),
      price: executionPrice,
      limitPrice: orderType === 'Limit' ? Number(limitPrice) : undefined,
      stopLoss: orderType === 'Stop-Loss' ? Number(stopLoss) : undefined,
      totalValue,
    });
  };

  return (
    <div className="modal-content trade-modal-box" onClick={(e) => e.stopPropagation()}>
      {/* Header */}
      <div className="modal-header">
        <div>
          <h3 className="trade-modal-title">
            Execute Order — {stock ? (stock.sku || stock.symbol) : 'EQUITY'}
          </h3>
          <p className="text-muted text-xs">{stock ? stock.name : 'Select Asset'}</p>
        </div>
        <button type="button" className="btn-close-modal" onClick={onClose}>
          <X size={18} />
        </button>
      </div>

      {/* Buy / Sell Toggle Buttons */}
      <div className="trade-side-selector">
        <button
          type="button"
          className={`side-btn side-buy ${side === 'BUY' ? 'active' : ''}`}
          onClick={() => {
            setSide('BUY');
            setError('');
          }}
        >
          Buy {stock?.sku || stock?.symbol}
        </button>
        <button
          type="button"
          className={`side-btn side-sell ${side === 'SELL' ? 'active' : ''}`}
          onClick={() => {
            setSide('SELL');
            setError('');
          }}
        >
          Sell {stock?.sku || stock?.symbol}
        </button>
      </div>

      {error && <div className="auth-alert-error mb-3">{error}</div>}

      <form onSubmit={handleSubmit} className="trade-form-body">
        {/* Order Type Toggle */}
        <div className="form-group mb-3">
          <label className="input-label">Order Type</label>
          <div className="order-type-chips">
            {['Market', 'Limit', 'Stop-Loss'].map((type) => (
              <button
                key={type}
                type="button"
                className={`type-chip ${orderType === type ? 'active' : ''}`}
                onClick={() => setOrderType(type)}
              >
                {type}
              </button>
            ))}
          </div>
        </div>

        {/* Quantity Stepper */}
        <div className="form-group mb-3">
          <div className="flex-between">
            <label className="input-label">Quantity (Shares)</label>
            <span className="text-muted text-xs">
              Available Float: {stock?.stock || 500} shares
            </span>
          </div>
          <div className="trade-qty-input-row">
            <button
              type="button"
              className="btn-qty-step"
              onClick={() => setQuantity(Math.max(1, quantity - 5))}
            >
              -5
            </button>
            <button
              type="button"
              className="btn-qty-step"
              onClick={() => setQuantity(Math.max(1, quantity - 1))}
            >
              -1
            </button>
            <input
              type="number"
              min="1"
              max={stock?.stock || 9999}
              className="trade-qty-input"
              value={quantity}
              onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
              required
            />
            <button
              type="button"
              className="btn-qty-step"
              onClick={() => setQuantity(quantity + 1)}
            >
              +1
            </button>
            <button
              type="button"
              className="btn-qty-step"
              onClick={() => setQuantity(quantity + 5)}
            >
              +5
            </button>
          </div>
        </div>

        {/* Price per share */}
        <div className="form-group mb-3">
          <div className="flex-between">
            <label className="input-label">
              {orderType === 'Market' ? 'Execution Price (LTP)' : 'Limit Price ($)'}
            </label>
            <span className="text-muted text-xs">Market LTP: ${currentPrice.toFixed(2)}</span>
          </div>
          <input
            type="number"
            step="0.01"
            className="trade-price-input"
            value={orderType === 'Market' ? currentPrice.toFixed(2) : limitPrice}
            disabled={orderType === 'Market'}
            onChange={(e) => setLimitPrice(e.target.value)}
          />
        </div>

        {/* Stop Loss Input if Stop-Loss selected */}
        {orderType === 'Stop-Loss' && (
          <div className="form-group mb-3">
            <div className="flex-between">
              <label className="input-label">Stop-Loss Trigger Price ($)</label>
              <span className="text-muted text-xs">Risk Guard</span>
            </div>
            <input
              type="number"
              step="0.01"
              className="trade-price-input"
              value={stopLoss}
              onChange={(e) => setStopLoss(e.target.value)}
              placeholder="Trigger Price"
              required
            />
          </div>
        )}

        {/* Summary Details */}
        <div className="trade-summary-card mb-4">
          <div className="summary-line">
            <span className="text-muted">Order Value:</span>
            <strong>${totalValue.toLocaleString('en-US', { minimumFractionDigits: 2 })}</strong>
          </div>
          <div className="summary-line">
            <span className="text-muted">Brokerage &amp; Exchange Taxes:</span>
            <span className="text-emerald font-medium">$0.00 (Zero Comm.)</span>
          </div>
          <div className="summary-line total-line">
            <span>Total {side === 'BUY' ? 'Payable' : 'Receivable'}:</span>
            <strong className={side === 'BUY' ? 'text-emerald' : 'text-danger'}>
              ${totalValue.toLocaleString('en-US', { minimumFractionDigits: 2 })}
            </strong>
          </div>
        </div>

        {/* Atomic Concurrency Guarantee Notice */}
        <div className="concurrency-notice mb-4">
          <ShieldCheck size={14} className="text-cyan" />
          <span>5-minute atomic reservation lock with automated stock restitution.</span>
        </div>

        {/* Action Button */}
        <button
          type="submit"
          className={`btn-execute-trade ${side === 'BUY' ? 'btn-execute-buy' : 'btn-execute-sell'}`}
          disabled={isProcessing}
        >
          {isProcessing ? (
            'Securing Concurrency Lock...'
          ) : (
            <>
              Confirm {side} {quantity} Shares of {stock?.sku || stock?.symbol || 'Equity'}
            </>
          )}
        </button>
      </form>
    </div>
  );
}

export default function TradeModal({
  isOpen,
  stock,
  initialSide = 'BUY',
  onClose,
  onExecuteTrade,
  isProcessing
}) {
  if (!isOpen) return null;

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <TradeModalForm
        key={`${stock?.sku || stock?.symbol || 'equity'}-${initialSide}`}
        stock={stock}
        initialSide={initialSide}
        onClose={onClose}
        onExecuteTrade={onExecuteTrade}
        isProcessing={isProcessing}
      />
    </div>
  );
}
