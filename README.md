# BharatiQuant | Indian Investment Planning Platform

[![Python](https://img.shields.io/badge/Python-3.14-blue.svg)](https://python.org)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.141-green.svg)](https://fastapi.tiangolo.com)
[![React](https://img.shields.io/badge/React-18-cyan.svg)](https://react.dev)
[![Vite](https://img.shields.io/badge/Vite-8.2-purple.svg)](https://vitejs.dev)
[![Awesome Systematic Trading](https://img.shields.io/badge/Awesome-Systematic%20Trading-gold.svg)](https://github.com/paperswithbacktest/awesome-systematic-trading)
[![Dataset](https://img.shields.io/badge/Dataset-Top%20100%20NSE%20%2B%20500%20BSE-orange.svg)](backend/data/nse_tickers.json)
[![License](https://img.shields.io/badge/License-MIT-brightgreen.svg)](LICENSE)

**BharatiQuant** is a full-stack Investment Planning & Quantitative Portfolio Optimization Platform tailored specifically for Indian Financial Markets (NSE & BSE). It combines quantitative portfolio optimization frameworks (*Hierarchical Risk Parity*, *Herfindahl-Hirschman Concentration Index*, *Black-Litterman Macro Tilt*, *PyPortfolioOpt*, *vectorbt*, *QuantStats*) with real-time World Monitor geopolitical threat feeds and Indian domestic macroeconomic drivers.

---

## 📂 Comprehensive Codebase & File Structure Explanation

```
InvestmentPredictor/
│
├── backend/
│   ├── data/
│   │   └── nse_tickers.json             # Expanded Top 100 NSE & Top 500 BSE securities database with sectors, prices, and signals
│   ├── services/
│   │   ├── mcp_client.py               # World Monitor MCP Client & Indian domestic macro pulse fetcher (Brent, USD/INR, VIX, FII/DII)
│   │   ├── quant_engine_india.py       # Core Quantitative Engine: HRP optimization, HHI concentration, QuantStats downside risk, BL Macro Tilt
│   │   └── ticker_sync_service.py      # Market Security Synchronizer & Dataset Builder for Top 100 NSE & Top 500 BSE universe
│   ├── tests/
│   │   ├── test_e2e_integration.py     # End-to-end API route tests for portfolio parse, recommendations, stress test, broker, and tickers
│   │   ├── test_mcp_client.py          # Unit tests for World Monitor MCP client & fallback mechanisms
│   │   └── test_quant_engine.py        # Unit tests for ticker normalization, price fetching, HHI, HRP, and Black-Litterman models
│   ├── main.py                         # FastAPI REST application setup, CORS, multi-alias CSV parser, and route controllers
│   ├── schemas.py                      # Pydantic data validation schemas for API requests and responses
│   └── requirements.txt                # Python dependencies (FastAPI, uvicorn, yfinance, pandas, numpy, scipy, pytest)
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── TopBar.jsx              # Live World Monitor & Indian domestic macro ticker bar with threat score gauge
│   │   │   ├── Sidebar.jsx             # Portfolio uploader (CSV/Excel), preset capital selectors (₹50K - ₹25L), risk profile inputs
│   │   │   ├── DiagnosticsPanel.jsx    # Health Score (/100), HHI index badge, QuantStats downside risk metrics, sector breakdown donut
│   │   │   ├── RecommendationPanel.jsx # Actionable recommendations grid with technical momentum & macro rationale cards, 1-click CSV export
│   │   │   ├── MacroSimulator.jsx      # Interactive geopolitical macro stress simulator tab with shock sliders
│   │   │   └── TickerManager.jsx       # Ticker Universe Manager tab: editable data grid, add security modal, and on-demand sync trigger
│   │   ├── App.jsx                     # Root React application: main navigation tabs, global state management, API orchestrator
│   │   ├── index.css                   # Glassmorphic dark design system tokens, keyframe animations, glowing badges
│   │   └── main.jsx                    # Vite React entry point
│   ├── index.html                      # HTML document entry point
│   ├── package.json                    # Node.js dependencies (React, Vite, Recharts, Lucide Icons, Axios)
│   └── vite.config.js                  # Vite bundler configuration
│
└── README.md                           # System architecture, function dataflows, API references, and quick start guide
```

---

## 🔄 Function-to-Function Dataflow Architecture

### 1. Portfolio Parse & Diagnostics Workflow
```
[User Uploads CSV / JSON] 
       │
       ▼
[frontend/Sidebar.jsx: handleUploadCSV()]
       │  (FormData: file or raw JSON string)
       ▼
[backend/main.py: parse_portfolio()]
       │  1. Parses CSV via pandas with multi-alias column matching
       │  2. Extracts Ticker, Quantity, Purchase Price
       ▼
[backend/services/quant_engine_india.py: normalize_ticker()]
       │  Converts tickers to .NS format (e.g. RELIANCE -> RELIANCE.NS, INFY.BO -> INFY.NS)
       ▼
[backend/services/mcp_client.py: get_macro_pulse()]
       │  Fetches real-time World Monitor threat score & Indian macro parameters
       ▼
[backend/services/quant_engine_india.py: calculate_portfolio_diagnostics()]
       │  1. fetch_current_prices(): live prices via yfinance with JSON benchmark fallback
       │  2. Computes Total Invested (₹), Current Value (₹), Unrealized PnL (%)
       │  3. Computes Herfindahl-Hirschman Index (HHI = sum w_i^2) & HHI status
       │  4. Computes QuantStats downside metrics: Sortino, Calmar, VaR (95%), CVaR (95%), Max Drawdown %
       │  5. Computes Sector Breakdown & Correlation Matrix
       │  6. Evaluates Portfolio Health Score (1 to 100)
       ▼
[backend/schemas.py: PortfolioDiagnostics] ➔ [frontend/DiagnosticsPanel.jsx]
```

---

### 2. World Monitor & Domestic Macro Intelligence Workflow
```
[Timer / Refresh Trigger] ➔ [frontend/TopBar.jsx: onRefresh()]
       │
       ▼
[backend/main.py: get_macro_pulse()]
       │
       ▼
[backend/services/mcp_client.py: get_macro_pulse()]
       │
       ├─► [yfinance API]: Fetches Brent Crude ($/bbl), USD/INR, India VIX
       ├─► [Domestic Overlay]: Fetches FII/DII Net Flows (₹ Cr), RBI Repo Rate (6.50%)
       ├─► [World Monitor Overlay]: GDELT Geopolitical Tension Index & DXY Dollar Index
       │
       ▼
[mcp_client.py: _calculate_threat_score()]
       │  Computes Dynamic Threat Score (0–100) & assigns Active Regime:
       │  - HIGH_CRUDE_INFLATION_RISK (Threat > 70)
       │  - FII_OUTFLOW_VOLATILITY (Threat 50-70)
       │  - BULLISH_DOMESTIC_GROWTH (Threat < 50)
       │  - RISK_OFF_GOLD_FLIGHT
       ▼
[backend/schemas.py: MacroPulseResponse] ➔ [frontend/TopBar.jsx]
```

---

### 3. Black-Litterman HRP Portfolio Optimization & Recommendation Workflow
```
[User Clicks "Generate Optimized Portfolio"] ➔ [frontend/Sidebar.jsx: onRunOptimization()]
       │
       ▼
[backend/main.py: get_recommendations()]
       │  Payload: available_capital_inr, risk_profile, existing_holdings
       ▼
[backend/services/quant_engine_india.py: generate_recommendations()]
       │
       ├─► [quant_engine_india.py: load_ticker_dataset()]
       │      Loads expanded candidate universe from backend/data/nse_tickers.json
       │
       ├─► [Black-Litterman Macro Tilt Multiplier]:
       │      Adjusts base candidate weights based on active macro regime & threat score
       │
       ├─► [Hierarchical Risk Parity (HRP) Linkage Clustering]:
       │      Distance matrix D(i,j) = sqrt(0.5 * (1 - rho_ij))
       │      Applies single-linkage tree clustering & recursive bisection variance allocation
       │
       ├─► [Merit Scoring & Category Representation Guarantee]:
       │      Scores candidates by Sharpe ratio, risk reduction %, and macro alignment
       │      Guarantees top items from Category A (Rebalance), B (Diversifiers), C (Alpha), D (Hedges)
       │
       ├─► [quant_engine_india.py: fetch_current_prices()]
       │      Fetches live prices & computes suggested allocation ₹ INR and quantity
       │
       ▼
[backend/schemas.py: RecommendationResponse] ➔ [frontend/RecommendationPanel.jsx]
```

---

### 4. Geopolitical Macro Stress Simulator Workflow
```
[User Adjusts Shock Sliders] ➔ [frontend/MacroSimulator.jsx: handleRunSim()]
       │  Inputs: Crude Oil Spike (%), USD/INR Depreciation (%), FII Outflow (Cr), VIX Spike (%)
       ▼
[backend/main.py: run_stress_test()]
       │
       ▼
[main.py: Stress Engine]
       │  1. Simulates shock impact on base macro threat score
       │  2. Evaluates simulated market regime
       │  3. Identifies high-vulnerability sectors (e.g. Auto, Paints, Aviation)
       │  4. Recommends defensive hedges (e.g. GOLDBEES.NS, BHARATBOND.NS)
       ▼
[backend/schemas.py: StressTestResponse] ➔ [frontend/MacroSimulator.jsx]
```

---

### 5. Ticker Universe Management & On-Demand Market Sync Workflow
```
[User Edits Grid or Clicks "Sync"] ➔ [frontend/TickerManager.jsx]
       │
       ├─► [GET /api/tickers] ➔ [quant_engine_india.py: get_all_tickers()]
       │      Reads raw JSON dataset from backend/data/nse_tickers.json
       │
       ├─► [POST /api/tickers] ➔ [quant_engine_india.py: save_ticker_dataset()]
       │      Saves modified ticker entries & calls reload_ticker_dataset() to update in-memory maps
       │
       └─► [POST /api/tickers/sync] ➔ [quant_engine_india.py: sync_top_tickers_dataset()]
              Calls [services/ticker_sync_service.py: build_top_tickers_dataset()]
              Regenerates Top 100 NSE & Top 500 BSE securities universe, updates nse_tickers.json & reloads engine
```

---

## 📡 API Endpoints Reference Table

| Method | Endpoint | Description | Request Payload | Response Schema |
|---|---|---|---|---|
| `GET` | `/` | API Root & Metadata | None | Health JSON |
| `GET` | `/api/macro-pulse` | Real-time Macro & Threat Feeds | None | `MacroPulseResponse` |
| `POST` | `/api/parse-portfolio` | Normalize & Analyze Holdings | `PortfolioParseRequest` / File | `PortfolioDiagnostics` |
| `POST` | `/api/recommend-inr` | Generate HRP Recommendations | `RecommendationRequest` | `RecommendationResponse` |
| `POST` | `/api/stress-test` | Geopolitical Macro Shock Test | `StressTestRequest` | `StressTestResponse` |
| `POST` | `/api/broker-execute` | Indian Broker Order Execution | `BrokerExecuteRequest` | `BrokerExecuteResponse` |
| `GET` | `/api/tickers` | Fetch Raw JSON Ticker Dataset | None | Tickers JSON |
| `POST` | `/api/tickers` | Save Modified Ticker Dataset | `TickerSaveRequest` | Status JSON |
| `POST` | `/api/tickers/sync` | On-Demand Market Universe Sync | None | `TickerSyncResponse` |

---

## ⚡ Quick Start & Execution

### Prerequisites
- Python 3.10+
- Node.js v18+ & npm

### 1. Backend Setup (FastAPI)
```bash
cd backend
pip install -r requirements.txt
python -m uvicorn main:app --host 0.0.0.0 --port 8000 --reload
```
API Documentation available at: [http://localhost:8000/docs](http://localhost:8000/docs)

### 2. Frontend Setup (React + Vite)
```bash
cd frontend
npm install
npm run dev
```
Web Dashboard available at: [http://localhost:5173](http://localhost:5173)

---

## 🧪 Automated Testing & Verification

```bash
python -m pytest backend/tests/ -v
```
Output: `45 PASSED (100% pass rate)`

```bash
cd frontend
npm run build
```
Output: `✓ built in 334ms (0 errors)`
