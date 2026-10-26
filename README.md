# TradeSphere — Smart Stock Market & Portfolio Management Platform

**TradeSphere** is an industry-grade, full-stack MERN (MongoDB Atlas, Express, React 19, Node.js) platform designed for stock market analytics, equity tracking, and multi-asset portfolio management. Featuring a dark obsidian fintech design system, concurrency-safe atomic trade executions, 5-minute reservation hold windows with automated stock restitution, operational audit trails, and live database aggregation analytics.

**Repository:** [https://github.com/Nandhakishore-A/TRADESPHERE](https://github.com/Nandhakishore-A/TRADESPHERE)

---

## 🛠 Tech Stack

- **Frontend:** React 19, Vite 8, Lucide React, Custom Dark Obsidian Fintech Design System
- **Backend:** Node.js (v20+ / Node v24 active), Express 5, Mongoose 9, Node-Cron, JWT, Bcryptjs
- **Database:** MongoDB Atlas (Cloud Database)
- **Quality & Testing:** Node Test Runner (`node --test`), Vite production build verification, E2E test runner
- **Deployment Ready:** Vercel (Frontend & Serverless API), Render / Railway (Backend Service), MongoDB Atlas (Database)

---

## 📁 Repository Architecture

```text
TRADESPHERE/
├── .gitignore                          # Excludes node_modules, .env, build outputs
├── README.md                           # Master project documentation
│
├── pos-backend/                        # Express API Microservice
│   ├── .env.example                    # Template with MONGO_URI, JWT_SECRET
│   ├── vercel.json                     # Vercel Serverless configuration
│   ├── package.json                    # tradesphere-backend metadata & scripts
│   ├── server.js                       # Express bootstrap, route mounting, DB middleware
│   ├── config/
│   │   └── db.js                       # Cached Mongoose connection pooling for Atlas
│   ├── controllers/
│   │   ├── authController.js           # Register, login, current user, demo seeder
│   │   ├── productController.js        # Equities CRUD, search/filtering, stock seeder
│   │   ├── orderController.js          # Atomic reservations, trade settlement, audit logs
│   │   └── analyticsController.js      # Live aggregation pipelines (revenue, valuation, best-sellers)
│   ├── middleware/
│   │   └── auth.js                     # JWT bearer verification & RBAC guards
│   ├── models/
│   │   ├── User.js                     # Credentials & roles (admin, manager, trader)
│   │   ├── Product.js                  # Equities, tickers, prices, available shares float
│   │   ├── Order.js                    # Trade orders, idempotency index, lifecycle states
│   │   └── AuditLog.js                 # Immutable operational audit trail
│   ├── routes/
│   │   ├── authRoutes.js               # /api/auth
│   │   ├── productRoutes.js            # /api/products
│   │   ├── orderRoutes.js              # /api/orders
│   │   └── analyticsRoutes.js          # /api/analytics
│   ├── services/
│   │   └── expirationService.js        # Background worker auto-releasing expired trade holds
│   └── test/
│       ├── api.test.js                 # Automated unit tests (`node --test`)
│       └── e2e-runner.js               # Full-stack automated integration test suite
│
└── pos-frontend/                       # React 19 + Vite 8 SPA
    ├── index.html                      # Title, meta, and TradeSphere SVG favicon
    ├── vercel.json                     # SPA client-side routing rewrites
    ├── package.json                    # tradesphere-frontend dependencies & scripts
    ├── public/
    │   └── favicon.svg                 # TradeSphere geometric fintech logo
    └── src/
        ├── App.jsx                     # Top-level state orchestrator & view router
        ├── App.css                     # Master dark obsidian fintech stylesheet
        ├── index.css                   # Global reset, Inter typography, custom scrollbars
        ├── main.jsx                    # React 19 DOM entrypoint
        └── components/
            ├── Sidebar.jsx             # Left navigation menu & active indicator
            ├── Topbar.jsx              # Universal search, live dropdown, quick trade, user pill
            ├── DashboardView.jsx       # 4 KPI cards, interactive SVG performance chart, market indices
            ├── MarketsView.jsx         # Global equities table, category tabs, sparklines
            ├── WatchlistView.jsx       # Personal watchlist tracker with day sparklines
            ├── StockDetailsView.jsx    # Stock trading terminal, technical metrics, Buy/Sell buttons
            ├── PortfolioView.jsx       # Holdings table, P&L calculations, Asset Allocation donut chart
            ├── AnalyticsView.jsx       # Benchmark comparison vs NIFTY 50/S&P 500, Sharpe Ratio
            ├── TransactionsView.jsx    # Settlement history table with Buy/Sell filters
            ├── NewsView.jsx            # Curated market news feed with category tabs
            ├── SettingsView.jsx        # Profile, security credentials, preferences, 2FA
            ├── AuthModal.jsx           # Sign In & Create Account modal with demo logins
            ├── TradeModal.jsx          # Instant Buy & Sell trade execution modal
            ├── AddStockModal.jsx       # List new equity asset to TradeSphere catalog
            └── AuditLogModal.jsx       # Real-time immutable operational audit log viewer
```

---

## 🚀 Quickstart & Local Setup Guide

### 1. Prerequisites
- [Node.js](https://nodejs.org/) (v18 or higher; tested on v24)
- [MongoDB Atlas](https://www.mongodb.com/atlas) cluster connection string

### 2. Backend Setup
In a terminal:
```powershell
cd pos-backend
Copy-Item .env.example .env
# Edit .env with your MongoDB Atlas connection string (MONGO_URI)
npm install
npm run dev
```
*Backend runs by default at `http://localhost:5000`.*  
*Health Check: `http://localhost:5000/api/health`*

### 3. Frontend Setup
In a second terminal:
```powershell
cd pos-frontend
Copy-Item .env.example .env
npm install
npm run dev
```
*Frontend runs by default at `http://localhost:5173`.*

---

## ☁️ Deployment on Vercel

TradeSphere is architected for seamless multi-project deployment on [Vercel](https://vercel.com):

### Step 1: Deploy Backend API
1. On Vercel, click **Add New Project** and import `Nandhakishore-A/TRADESPHERE`.
2. Under **Root Directory**, click **Edit** and select `pos-backend`.
3. Add the following **Environment Variables**:
   - `MONGO_URI`: your MongoDB Atlas connection string
   - `JWT_SECRET`: your preferred secret key
   - `NODE_ENV`: `production`
4. Click **Deploy**. Note your backend production URL (e.g., `https://tradesphere-backend.vercel.app`).

### Step 2: Deploy Frontend Client
1. On Vercel, click **Add New Project** and import `Nandhakishore-A/TRADESPHERE` again.
2. Under **Root Directory**, click **Edit** and select `pos-frontend`.
3. Framework Preset: **Vite**.
4. Add the following **Environment Variable**:
   - `VITE_API_BASE_URL`: `https://tradesphere-backend.vercel.app` (your backend URL from Step 1)
5. Click **Deploy**. Your TradeSphere platform is live!

---

## 🧪 Automated Verification & Testing

Execute backend automated test suite:
```powershell
cd pos-backend
npm test
```

Execute frontend production build verification:
```powershell
cd pos-frontend
npm run build
```

---

## 🛡 Concurrency & Trade Execution Engine Explained

1. **Atomic Trade Reservation:** When a buy order is initiated, TradeSphere atomically locks and reserves available share float:
   ```javascript
   Product.findOneAndUpdate(
     { _id: productId, stock: { $gte: quantity } },
     { $inc: { stock: -quantity, reservedStock: quantity } }
   );
   ```
2. **Rollback Safety:** If any order exceeds available shares, the transaction fails gracefully with zero stock leakage.
3. **5-Minute Expiration Window:** Orders carry a 5-minute hold timestamp. A background worker periodically inspects active holds:
   - Orders remaining pending beyond 5 minutes transition to `EXPIRED`.
   - The worker executes `$inc: { stock: quantity, reservedStock: -quantity }` to atomically restore shares to the market.
   - The restitution event is permanently recorded in the immutable operational audit log.

---

## 📜 License

Distributed under the MIT License.
