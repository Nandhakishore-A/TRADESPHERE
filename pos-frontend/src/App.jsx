import React, { useState, useEffect, useCallback } from 'react';
import Sidebar from './components/Sidebar';
import Topbar from './components/Topbar';
import DashboardView from './components/DashboardView';
import MarketsView from './components/MarketsView';
import WatchlistView from './components/WatchlistView';
import StockDetailsView from './components/StockDetailsView';
import PortfolioView from './components/PortfolioView';
import AnalyticsView from './components/AnalyticsView';
import TransactionsView from './components/TransactionsView';
import NewsView from './components/NewsView';
import SettingsView from './components/SettingsView';
import AuthModal from './components/AuthModal';
import TradeModal from './components/TradeModal';
import AddStockModal from './components/AddStockModal';
import AuditLogModal from './components/AuditLogModal';
import './App.css';

const rawApiUrl = import.meta.env.VITE_API_BASE_URL || (
  window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
    ? 'http://localhost:5000'
    : ''
);
const API_BASE_URL = rawApiUrl ? rawApiUrl.replace(/\/+$/, '') : '';

export default function App() {
  // Navigation State
  const [currentView, setCurrentView] = useState('dashboard');
  const [selectedStock, setSelectedStock] = useState(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Data State
  const [stocks, setStocks] = useState([]);
  const [orders, setOrders] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [auditLogs, setAuditLogs] = useState([]);
  const [watchlist, setWatchlist] = useState(() => {
    try {
      const saved = localStorage.getItem('tradesphere_watchlist');
      return saved ? JSON.parse(saved) : ['RELIANCE', 'TCS', 'HDFCBANK', 'INFY', 'ICICIBANK', 'SBIN', 'BAJFINANCE', 'HINDUNILVR'];
    } catch {
      return ['RELIANCE', 'TCS', 'HDFCBANK', 'INFY', 'ICICIBANK', 'SBIN', 'BAJFINANCE', 'HINDUNILVR'];
    }
  });

  // User Authentication State
  const [user, setUser] = useState(() => {
    try {
      const saved = localStorage.getItem('tradesphere_user');
      return saved ? JSON.parse(saved) : { name: 'John Doe', email: 'admin@tradesphere.io', role: 'Premium' };
    } catch {
      return { name: 'John Doe', email: 'admin@tradesphere.io', role: 'Premium' };
    }
  });
  const [token, setToken] = useState(() => localStorage.getItem('tradesphere_token') || '');

  // UI Modals & Notifications
  const [searchQuery, setSearchQuery] = useState('');
  const [isTradeModalOpen, setIsTradeModalOpen] = useState(false);
  const [tradeModalStock, setTradeModalStock] = useState(null);
  const [tradeModalSide, setTradeModalSide] = useState('BUY');
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authModalMode, setAuthModalMode] = useState('login');
  const [isAddStockOpen, setIsAddStockOpen] = useState(false);
  const [isAuditModalOpen, setIsAuditModalOpen] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isProcessingTrade, setIsProcessingTrade] = useState(false);
  const [toastMessage, setToastMessage] = useState(null);

  const showToast = (message, type = 'info') => {
    setToastMessage({ message, type });
    setTimeout(() => setToastMessage(null), 4000);
  };

  // Sync watchlist to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('tradesphere_watchlist', JSON.stringify(watchlist));
    } catch (e) {
      console.error(e);
    }
  }, [watchlist]);

  // 1. Fetch Stocks / Catalog
  const fetchStocks = useCallback(async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/products`);
      if (res.ok) {
        const data = await res.json();
        setStocks(Array.isArray(data) ? data : []);
      }
    } catch (err) {
      console.error('Failed to fetch stocks:', err);
    }
  }, []);

  // 2. Fetch Orders / Transactions
  const fetchOrders = useCallback(async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/orders`);
      if (res.ok) {
        const data = await res.json();
        setOrders(Array.isArray(data) ? data : []);
      }
    } catch (err) {
      console.error('Failed to fetch orders:', err);
    }
  }, []);

  // 3. Fetch Analytics
  const fetchAnalytics = useCallback(async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/analytics/summary`);
      if (res.ok) {
        const data = await res.json();
        setAnalytics(data);
      }
    } catch (err) {
      console.error('Failed to fetch analytics:', err);
    }
  }, []);

  // 4. Fetch Audit Logs
  const fetchAuditLogs = useCallback(async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/orders/audit-logs`);
      if (res.ok) {
        const data = await res.json();
        setAuditLogs(Array.isArray(data) ? data : []);
      }
    } catch (err) {
      console.error('Failed to fetch audit logs:', err);
    }
  }, []);

  // Global Refresh Trigger
  const handleRefresh = async () => {
    setIsRefreshing(true);
    await Promise.all([fetchStocks(), fetchOrders(), fetchAnalytics()]);
    setIsRefreshing(false);
  };

  // Background Auto-sync (30s)
  useEffect(() => {
    handleRefresh();
    const interval = setInterval(() => {
      fetchStocks();
      fetchOrders();
      fetchAnalytics();
    }, 30000);
    return () => clearInterval(interval);
  }, [fetchStocks, fetchOrders, fetchAnalytics]);

  // 1-Click Seed Market Equities & Accounts
  const handleSeedDemoData = async () => {
    try {
      setIsRefreshing(true);
      const resProducts = await fetch(`${API_BASE_URL}/api/products/seed`, { method: 'POST' });
      await fetch(`${API_BASE_URL}/api/auth/seed`, { method: 'POST' });
      const data = await resProducts.json();
      showToast(data.message || 'TradeSphere market stocks seeded!', 'success');
      handleRefresh();
    } catch (err) {
      showToast('Failed to seed market data: ' + err.message, 'error');
    } finally {
      setIsRefreshing(false);
    }
  };

  // Trade Execution Workflow (Connects to /api/orders/reserve and /api/orders/complete)
  const handleExecuteTrade = async (tradePayload) => {
    const { stock, side, quantity, price } = tradePayload;
    try {
      setIsProcessingTrade(true);
      const idempotencyKey = `TRADE-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;

      // Resolve valid product identifier from catalog or SKU
      const matched = stocks.find((s) => s.sku === (stock.sku || stock.symbol)) || stock;
      const targetProductId = matched._id || matched.stockId || stock._id || stock.stockId || stock.sku || stock.symbol || 'stock-rel-01';

      // 1. Reserve Order
      const reserveRes = await fetch(`${API_BASE_URL}/api/orders/reserve`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Idempotency-Key': idempotencyKey,
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          productId: targetProductId,
          sku: stock.sku || stock.symbol,
          name: stock.name,
          price,
          quantity,
          idempotencyKey,
        }),
      });

      const reserveData = await reserveRes.json();
      if (!reserveRes.ok) {
        throw new Error(reserveData.error || 'Failed to place trade order reservation');
      }

      // 2. Complete Order (Instant Trade Settlement)
      const completeRes = await fetch(`${API_BASE_URL}/api/orders/complete`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ orderId: reserveData.order._id }),
      });

      const completeData = await completeRes.json();
      if (!completeRes.ok) {
        throw new Error(completeData.error || 'Trade settlement confirmation failed');
      }

      showToast(`Order Executed! ${side} ${quantity} ${stock.sku} @ $${price.toFixed(2)} (Ref: ${completeData.order.orderNumber})`, 'success');
      setIsTradeModalOpen(false);
      handleRefresh();
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setIsProcessingTrade(false);
    }
  };

  // Add new stock to catalog
  const handleAddStock = async (stockData) => {
    const res = await fetch(`${API_BASE_URL}/api/products`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify(stockData),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to list asset');

    showToast(`Asset "${data.name}" (${data.sku}) listed on TradeSphere!`, 'success');
    handleRefresh();
  };

  // Toggle stock in watchlist
  const handleToggleWatchlist = (symbol) => {
    setWatchlist((prev) => {
      const exists = prev.includes(symbol);
      if (exists) {
        showToast(`Removed ${symbol} from Watchlist`, 'info');
        return prev.filter((s) => s !== symbol);
      } else {
        showToast(`Added ${symbol} to Watchlist`, 'success');
        return [...prev, symbol];
      }
    });
  };

  // Open trade modal for specific stock
  const handleOpenTradeForStock = (stockToTrade, side = 'BUY') => {
    // If no stock provided, fallback to first stock or default
    const target = stockToTrade || (stocks.length > 0 ? stocks[0] : { name: 'Reliance Industries', sku: 'RELIANCE', price: 2892.45 });
    setTradeModalStock(target);
    setTradeModalSide(side);
    setIsTradeModalOpen(true);
  };

  // Select stock to view in depth
  const handleSelectStock = (stock) => {
    setSelectedStock(stock);
    setCurrentView('stock-details');
  };

  // Auth management
  const handleAuthSuccess = (authenticatedUser, authToken) => {
    setUser(authenticatedUser);
    setToken(authToken);
  };

  const handleLogout = () => {
    localStorage.removeItem('tradesphere_token');
    localStorage.removeItem('tradesphere_user');
    setUser(null);
    setToken('');
    showToast('Signed out of TradeSphere', 'info');
  };

  return (
    <div className="tradesphere-layout">
      {/* Toast Notification Banner */}
      {toastMessage && (
        <div className={`ts-toast-banner toast-${toastMessage.type}`}>
          {toastMessage.message}
        </div>
      )}

      {/* Main Sidebar Navigation */}
      <Sidebar
        currentView={currentView}
        onSelectView={(v) => {
          setCurrentView(v);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        onOpenAuditLogs={() => {
          fetchAuditLogs();
          setIsAuditModalOpen(true);
        }}
        onSeedDemoData={handleSeedDemoData}
        user={user}
        onLogout={handleLogout}
        onOpenAuth={(mode) => {
          setAuthModalMode(mode);
          setIsAuthModalOpen(true);
        }}
        isOpen={isSidebarOpen}
        onCloseMobile={() => setIsSidebarOpen(false)}
      />

      {/* Main App Container */}
      <div className="tradesphere-main-wrapper">
        {/* Topbar Header */}
        <Topbar
          onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          stocks={stocks}
          onSelectStock={handleSelectStock}
          onOpenTradeModal={handleOpenTradeForStock}
          onOpenAddStock={() => setIsAddStockOpen(true)}
          onRefresh={handleRefresh}
          isRefreshing={isRefreshing}
          user={user}
          onOpenAuth={(mode) => {
            setAuthModalMode(mode);
            setIsAuthModalOpen(true);
          }}
          onLogout={handleLogout}
          onSelectView={setCurrentView}
        />

        {/* View Switcher Container */}
        <main className="ts-page-container">
          {currentView === 'dashboard' && (
            <DashboardView
              portfolioData={analytics}
              stocks={stocks}
              orders={orders}
              onSelectStock={handleSelectStock}
              onOpenTradeModal={handleOpenTradeForStock}
              onSelectView={setCurrentView}
            />
          )}

          {currentView === 'markets' && (
            <MarketsView
              stocks={stocks}
              onSelectStock={handleSelectStock}
              onOpenTradeModal={handleOpenTradeForStock}
              watchlist={watchlist}
              onToggleWatchlist={handleToggleWatchlist}
            />
          )}

          {currentView === 'watchlist' && (
            <WatchlistView
              watchlist={watchlist}
              stocks={stocks}
              onSelectStock={handleSelectStock}
              onOpenTradeModal={handleOpenTradeForStock}
              onToggleWatchlist={handleToggleWatchlist}
              onOpenAddStock={() => setIsAddStockOpen(true)}
            />
          )}

          {currentView === 'stock-details' && (
            <StockDetailsView
              stock={selectedStock}
              onBack={() => setCurrentView('markets')}
              onOpenTradeModal={handleOpenTradeForStock}
              watchlist={watchlist}
              onToggleWatchlist={handleToggleWatchlist}
            />
          )}

          {currentView === 'portfolio' && (
            <PortfolioView
              stocks={stocks}
              orders={orders}
              onSelectStock={handleSelectStock}
              onOpenTradeModal={handleOpenTradeForStock}
            />
          )}

          {currentView === 'analytics' && (
            <AnalyticsView analyticsData={analytics} />
          )}

          {currentView === 'transactions' && (
            <TransactionsView orders={orders} />
          )}

          {currentView === 'news' && (
            <NewsView />
          )}

          {currentView === 'settings' && (
            <SettingsView
              user={user}
              onUpdateUser={(updated) => setUser(updated)}
              showToast={showToast}
            />
          )}
        </main>
      </div>

      {/* Global Modals */}
      <TradeModal
        isOpen={isTradeModalOpen}
        stock={tradeModalStock}
        initialSide={tradeModalSide}
        onClose={() => setIsTradeModalOpen(false)}
        onExecuteTrade={handleExecuteTrade}
        isProcessing={isProcessingTrade}
      />

      <AuthModal
        isOpen={isAuthModalOpen}
        initialMode={authModalMode}
        onClose={() => setIsAuthModalOpen(false)}
        onAuthSuccess={handleAuthSuccess}
        apiBaseUrl={API_BASE_URL}
        showToast={showToast}
      />

      <AddStockModal
        isOpen={isAddStockOpen}
        onClose={() => setIsAddStockOpen(false)}
        onAddStock={handleAddStock}
      />

      {isAuditModalOpen && (
        <AuditLogModal
          logs={auditLogs}
          onClose={() => setIsAuditModalOpen(false)}
        />
      )}
    </div>
  );
}
