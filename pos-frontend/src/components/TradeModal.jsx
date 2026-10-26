import React, { useState } from 'react';
import {
  X,
  ShieldCheck
} from 'lucide-react';

export default function TradeModal({
  isOpen,
  stock,
  initialSide = 'BUY',
  onClose,
  onExecuteTrade,
  isProcessing
}) {
  const [side, setSide] = useState(initialSide);
  const [orderType, setOrderType] = useState('Market');
  const [quantity, setQuantity] = useState(10);
  const [customPrice, setCustomPrice] = useState(stock ? stock.price : 100);

  if (!isOpen) return null;

  const currentPrice = stock ? stock.price : 100;
  const executionPrice = orderType === 'Market' ? currentPrice : Number(customPrice);
  const totalValue = Number((quantity * executionPrice).toFixed(2));

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!stock) return;
    onExecuteTrade({
      stock,
      side,
      orderType,
      quantity: Number(quantity),
      price: executionPrice,
      totalValue,
    });
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-content trade-modal-box" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="modal-header">
          <div>
            <h3 className="trade-modal-title">
              Execute Order — {stock ? stock.sku : 'EQUITY'}
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
            onClick={() => setSide('BUY')}
          >
            Buy {stock?.sku}
          </button>
          <button
            type="button"
            className={`side-btn side-sell ${side === 'SELL' ? 'active' : ''}`}
            onClick={() => setSide('SELL')}
          >
            Sell {stock?.sku}
          </button>
        </div>

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
                Available: {stock?.stock || 500} shares
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
          <div className="form-group mb-4">
            <div className="flex-between">
              <label className="input-label">Execution Price</label>
              <span className="text-muted text-xs">Market LTP: ${currentPrice.toFixed(2)}</span>
            </div>
            <input
              type="number"
              step="0.01"
              className="trade-price-input"
              value={orderType === 'Market' ? currentPrice.toFixed(2) : customPrice}
              disabled={orderType === 'Market'}
              onChange={(e) => setCustomPrice(e.target.value)}
            />
          </div>

          {/* Summary Details */}
          <div className="trade-summary-card mb-4">
            <div className="summary-line">
              <span className="text-muted">Order Value:</span>
              <strong>${totalValue.toLocaleString('en-US', { minimumFractionDigits: 2 })}</strong>
            </div>
            <div className="summary-line">
              <span className="text-muted">Estimated Brokerage &amp; Taxes:</span>
              <span className="text-emerald font-medium">$0.00 (Zero Comm.)</span>
            </div>
            <div className="summary-line total-line">
              <span>Total Payable / Receivable:</span>
              <strong className={side === 'BUY' ? 'text-emerald' : 'text-danger'}>
                ${totalValue.toLocaleString('en-US', { minimumFractionDigits: 2 })}
              </strong>
            </div>
          </div>

          {/* Atomic Concurrency Guarantee Notice */}
          <div className="concurrency-notice mb-4">
            <ShieldCheck size={14} className="text-cyan" />
            <span>5-minute atomic reservation window with automated stock restitution.</span>
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
                Confirm {side} {quantity} Shares of {stock?.sku || 'Equity'}
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
