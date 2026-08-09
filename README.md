# 🇮🇳 BharatiQuant — Indian Investment Planning & World Monitor Macro Engine

> **Your personal AI-powered investment co-pilot for the Indian stock market (NSE / BSE).**
> BharatiQuant helps you decide *what* to buy, *how much* to invest, *when* to sell, and *what could go wrong* — all in plain ₹ Rupees with live market data.

---

## 📖 Table of Contents

- [What Is BharatiQuant?](#what-is-bharatiquant)
- [Quick Start](#-quick-start)
- [The 4 Main Views (Tabs)](#-the-4-main-views-tabs)
  - [📊 Tab 1: Portfolio Diagnostic & Optimization Dashboard](#-tab-1-portfolio-diagnostic--optimization-dashboard)
  - [🎯 Tab 2: Target Profit & Sell Date Predictor](#-tab-2-target-profit--sell-date-predictor)
  - [🌐 Tab 3: World Monitor Macro Simulator](#-tab-3-world-monitor-macro-simulator)
  - [⚙️ Tab 4: Ticker Universe Manager](#️-tab-4-ticker-universe-manager)
- [The Top Bar — Live Market Pulse](#-the-top-bar--live-market-pulse)
- [Glossary of Terms](#-glossary-of-terms-for-beginners)
- [Tech Stack](#-tech-stack)
- [Project Structure](#-project-structure)
- [License](#-license)

---

## What Is BharatiQuant?

Imagine you have ₹5 Lakhs to invest in Indian stocks. You're probably asking yourself:

1. **"Which stocks should I buy?"** — BharatiQuant recommends 10–20 stocks/ETFs tailored to your budget and risk comfort.
2. **"How much should I put into each?"** — It calculates exact ₹ amounts and share quantities for each recommendation.
3. **"At what price should I sell to make a profit?"** — It tells you the *target selling price* per share and the *probable date* you can sell.
4. **"What if oil prices spike or the Rupee crashes?"** — It lets you simulate real-world economic shocks and see how your investments would be affected.

**BharatiQuant** does all of this using quantitative finance methods (like Hierarchical Risk Parity) combined with live macro data (oil prices, VIX volatility, FII/DII flows, RBI rates) — but presents everything in simple cards, tables, and sliders that any investor can understand.

---

## 🚀 Quick Start

### Prerequisites

| Requirement | Version |
|---|---|
| Python | 3.10+ |
| Node.js | 18+ |
| npm | 9+ |

### 1. Start the Backend (API Server)

```bash
cd backend
pip install -r requirements.txt
python main.py
```

The API server starts at **http://localhost:8000**. Visit http://localhost:8000/docs for the interactive API documentation.

### 2. Start the Frontend (Web UI)

```bash
cd frontend
npm install
npm run dev
```

The web UI starts at **http://localhost:5173**. Open it in your browser — you're ready to go!

---

## 🖥️ The 4 Main Views (Tabs)

When you open BharatiQuant, you see **4 tabs** across the top. Each tab is a different tool for a different question you might have as an investor.

---

### 📊 Tab 1: Portfolio Diagnostic & Optimization Dashboard

> **The Question It Answers:** *"I have some money to invest (or already have stocks). What's the smartest way to allocate my capital?"*

This is your main dashboard and it has two parts: a **Sidebar** (left) where you set your preferences, and a **Main Panel** (right) where you see results.

#### Sidebar — Your Investment Preferences

The sidebar walks you through 4 steps:

| Step | Parameter | What It Means | Your Options |
|---|---|---|---|
| **1** | **Portfolio Holdings File** | If you already own stocks, upload a CSV/Excel file listing them. The app understands columns like `Ticker`, `Symbol`, `Quantity`, `Purchase Price`, etc. | Upload a `.csv` or `.xlsx` file, or click **"Load Sample Nifty 50 Holdings"** to try with demo data |
| **2** | **Deployment Capital (₹ INR)** | How much fresh money do you want to invest right now? | Type any amount, or click presets: **₹50K**, **₹1 Lakh**, **₹5 Lakhs**, **₹10 Lakhs**, **₹25 Lakhs** |
| **3** | **Risk Profile** | How comfortable are you with your investments going up and down in value? | **Conservative** — "Protect my money first" (safer picks, more bonds/gold). **Moderate** — "Balance between safety and growth" (mix of stable & growth stocks). **Aggressive** — "I want maximum returns, I can handle drops" (high-growth, momentum stocks) |
| **4** | **Asset Class Focus** | What *type* of investments do you prefer? | **🚀 Direct Equity / Stocks** — Mostly individual company shares (~90% stocks). **💎 100% Direct Equities Only** — Only individual stocks, zero mutual funds/ETFs. **⚖️ Balanced Mix** — A mix of stocks + ETFs + mutual funds. **🛡️ Mutual Funds & ETFs** — Mostly index funds and ETFs (less risky, more diversified) |

After setting your preferences, click the green **"Generate Optimized Portfolio"** button.

#### Main Panel — What You Get Back

##### 🃏 Recommendation Cards

You'll see **10–20 stock/ETF recommendation cards**, each showing:

| Field | What It Tells You |
|---|---|
| **Ticker** | The stock symbol, e.g., `RELIANCE.NS` (Reliance Industries on NSE) |
| **Category Badge** | **A** = Core holdings to rebalance, **B** = Diversifiers, **C** = High-alpha momentum plays, **D** = Macro hedges (defensive) |
| **Asset Type** | Whether it's a 🚀 *Direct Stock* or 🛡️ *Mutual Fund / ETF* |
| **Current Rate** | Today's live share price in ₹ |
| **Target Sell Rate** | The price at which you should consider selling for profit |
| **Profit / Share** | How much profit (₹) you'd make per share if it hits the target |
| **Suggested Qty** | How many shares to buy |
| **Target Allocation** | How much ₹ to spend on this particular stock |
| **Risk Reduction** | How much this stock reduces your overall portfolio risk (%) |
| **Expected Return** | The estimated annual return percentage |
| **Macro & HRP Rationale** | A plain-English explanation of *why* this stock was recommended |

You can **filter** the cards by:
- **Category** (A / B / C / D or All)
- **Asset Type** (Stocks only, Funds only, or All)

##### 📋 Executive Action Summary

At the top of the recommendations, you'll see a summary banner with:
- **Top 3 allocations** (your biggest recommended bets)
- **Health Improvement** — How much better your portfolio becomes after following the advice
- **Export Execution CSV** button — Download the full plan as a spreadsheet you can take to your broker

##### 📊 Portfolio Diagnostics (appears when you upload holdings)

If you uploaded your existing portfolio, you'll also see a diagnostics section:

| Metric | What It Means (In Plain English) |
|---|---|
| **Total Portfolio Value** | What your current stocks are worth today at live prices |
| **Unrealized P&L** | How much profit/loss you're sitting on (haven't sold yet) |
| **Health Score (0–100)** | An overall grade for your portfolio. Above 80 = healthy, below 60 = fragile |
| **HHI Concentration Index** | Measures if you're putting too many eggs in one basket. Low = well-diversified, High = concentrated risk |
| **Sortino Ratio** | How well your portfolio returns compensate for *downside* risk (higher is better) |
| **Calmar Ratio** | Returns relative to the worst historical drop (higher is better) |
| **VaR (95%)** | "Value at Risk" — The maximum you could lose on a bad day, 95% of the time |
| **Sector Allocation Pie Chart** | Visual breakdown showing what % of your money is in IT, Banking, Oil & Gas, etc. |
| **Normalized Holdings Table** | Your stocks cleaned up with live prices, current values, and portfolio weights |

---

### 🎯 Tab 2: Target Profit & Sell Date Predictor

> **The Question It Answers:** *"I want to make ₹X profit from ₹Y capital within Z months. Which stocks should I buy, at what price, and when should I sell?"*

This is the **goal-based investing** tool. You tell it your financial goal, and it figures out the plan.

#### Input Parameters

| Parameter | What It Means | Example |
|---|---|---|
| **Capital (₹)** | How much money you're investing | ₹1,00,000 |
| **Target Profit (₹)** | How much profit you want to earn | ₹5,000 (i.e. 5% return) |
| **Horizon (Months)** | How long you're willing to wait | 1 month, 3 months, 6 months, 1 year, 2 years, or 3 years |

Click **"Calculate Exit Points"** to get your plan.

#### What You Get Back

##### Summary Cards

| Card | What It Shows |
|---|---|
| **Required Gain Target** | The % return your money needs to achieve (auto-calculated from your capital & profit inputs) |
| **Total Portfolio Profit** | The estimated total ₹ profit across all recommended stocks |
| **Horizon Strategy Regime** | The strategy style: ⚡ *Short-Term High Velocity Alpha* (1–2 months), ⚖️ *Medium-Term Balanced Growth* (3–6 months), or 🛡️ *Long-Term Wealth Compounder* (12+ months) |
| **Probable Exit Window** | The expected date range when you should sell |

##### Target Selling Table

For each recommended stock, you see:

| Column | What It Tells You |
|---|---|
| **Suggested Ticker** | The stock to buy |
| **Current Rate** | Today's price per share |
| **Target Sell Rate** | The price to sell at (highlighted in gold ₹) |
| **Profit / Share** | Your profit per share in ₹ |
| **Total Stock Profit** | Total ₹ profit from this stock position |
| **Qty to Buy Today** | How many shares to purchase right now |
| **Est. Hold Period** | How long you'll likely hold (e.g., "0.9 months, 27 days") |
| **Probable Sell Date** | The calendar date to plan your exit (e.g., "Aug 25, 2026") |
| **Target Realization Risk** | A difficulty rating — **LOW** (easy target), **MODERATE**, **HIGH**, or **VERY HIGH** (ambitious target) |
| **History Backtest** | Click "Backtest" to see how this stock performed historically against this target |

You can also click **"Export Exit Plan CSV"** to download the full plan as a spreadsheet.

##### 📈 Stock Price History & Historical Backtest Simulator

Below the table, there's a **historical performance chart** and **scenario simulation cards**:

- **Price Chart**: A line chart showing the stock's actual price over 1 month / 3 months / 6 months / 1 year. A dashed gold line shows where your target selling price sits.
- **Historical Scenario Cards**: These simulate *"What if I had bought this stock at various points in the past?"* — showing whether the target price was hit, how many days it took, and the peak gain achieved.

You can select any recommended stock from the dropdown and choose the historical period to analyze.

---

### 🌐 Tab 3: World Monitor Macro Simulator

> **The Question It Answers:** *"What happens to my investments if oil prices spike, the Rupee crashes, or a geopolitical crisis erupts?"*

This is your **"what-if" stress testing** tool. It's divided into two sections.

#### Section 1: 5 Probable Day-to-Day Scenarios

At the top, you see **5 scenario cards** dynamically generated from live global data. These represent real-world risks that could happen soon:

| Example Scenario | Category | What It Simulates |
|---|---|---|
| "Middle East Escalation & Strait of Hormuz Supply Crisis" | Energy & Geopolitical Conflict | Oil supply disruption sending crude prices surging |
| "US Fed Hawkish Stance & Global DXY Dollar Surge" | Monetary Policy & FX Pressure | Strong US dollar crushing emerging market currencies |
| "Indo-Pacific Semiconductor & Hardware Trade Embargo" | Technology & Supply Chain | Tech component supply chains getting disrupted |
| "Southwest Monsoon Deficit & Domestic Food Inflation Surge" | Domestic Macro & RBI Tightening | Bad monsoon forcing RBI to raise interest rates |
| "Red Sea Freight Rate Multiplier & Global Export Logistics Crunch" | Global Trade & Logistics | Shipping disruptions tripling freight costs |

Each card shows:
- **Severity Badge**: CRITICAL / HIGH / MODERATE
- **Probability %**: How likely this scenario is (calculated from live data)
- **Shock Tags**: Quick view of the key impact parameters (e.g., "Crude +35%", "VIX +55%")

**Click any scenario card** to instantly simulate it.

#### Section 2: Shock Control Sliders (Manual Mode)

If you want to create your own custom "what-if" scenario, use the **7 sliders**:

| Slider | What It Controls | Range | Real-World Meaning |
|---|---|---|---|
| 🛢️ **Brent Crude Spike** | Oil price increase | 0% – 60% | Higher oil = higher petrol/diesel prices, inflation, hurts airlines & auto companies |
| 💵 **USD/INR Depreciation** | Rupee weakening against Dollar | 0% – 15% | Weaker Rupee = imports become expensive, FIIs pull money out |
| 📈 **India VIX Volatility** | Market fear/panic level | 0% – 100% | Higher VIX = more uncertainty, stock prices swing wildly |
| 💸 **FII Net Sell Outflow** | Foreign investors pulling money out | ₹0 – ₹15,000 Cr | Large FII selling = heavy selling pressure on Indian stocks |
| 🏦 **RBI Repo Rate Shift** | Central bank interest rate increase | 0 – 150 bps | Higher rates = borrowing becomes expensive, slows growth, hurts banks |
| 🌐 **GDELT Conflict Escalation** | Global geopolitical tensions | 0% – 100% | Wars, sanctions, trade disputes = supply chain disruptions |
| 💲 **DXY Dollar Index Rally** | US Dollar strength globally | 0% – 12% | Strong Dollar = capital flows away from India to US |

After adjusting sliders, click **"Recalculate Stress Test"**.

#### Simulation Results

| Result | What It Shows |
|---|---|
| **Simulated Threat Score** | New macro threat level out of 100 (color-coded: green = safe, amber = caution, red = danger) |
| **Estimated Portfolio Impact** | How much your equity holdings would drop (e.g., "-8.5%") |
| **VaR Risk Increase** | How much additional risk your portfolio takes on |
| **Active Macro Regime** | The market state under this scenario (e.g., "High Crude Oil Inflation & Geopolitical Risk") |
| **Scenario Narrative** | A human-readable paragraph explaining exactly what happens and why |
| **Asset Class Breakdown** | Impact on Equities, Bonds, Gold, and Cash — some go down, some go up |
| **Vulnerable Sectors** | Industries that would be hit hardest (e.g., Airlines, Auto, Paints) |
| **Resilient Sectors** | Industries that would hold up or benefit (e.g., IT Exporters, Gold, Pharma) |
| **Defensive Hedges** | Specific tickers to buy as protection (e.g., GOLDBEES.NS, BHARATBOND.NS) |

---

### ⚙️ Tab 4: Ticker Universe Manager

> **The Question It Answers:** *"What's in the stock database, and can I customize it?"*

This is the **admin panel** for the underlying stock database that powers all recommendations. Think of it as the "ingredients list" that BharatiQuant picks from when suggesting stocks.

#### What You Can Do

| Action | How | What Happens |
|---|---|---|
| **Browse the database** | Scroll through the table | See all ~500+ Indian securities (NSE & BSE) with their properties |
| **Search** | Type in the search box | Filter by stock symbol, company name, or sector |
| **Filter by Category** | Click A / B / C / D pills | See only stocks in a specific recommendation category |
| **Filter by Exchange** | Click NSE / BSE toggle | See only NSE-listed or BSE-listed stocks |
| **Edit any field** | Click on any cell in the table | Modify the name, sector, price, weight, Sharpe ratio, risk reduction %, or technical signal |
| **Delete a stock** | Click the 🗑️ button | Remove a security from the universe |
| **Add a new stock** | Click "➕ Add Security" | Opens a form to add any custom stock to the database |
| **Sync live data** | Click "🔄 Sync Top 500 BSE & 100 NSE" | Refreshes the database with the latest top securities from Indian exchanges |
| **Save changes** | Click "💾 Save All Changes" | Persists your edits to the backend JSON database |

#### Column Explanations

| Column | What It Means |
|---|---|
| **Symbol** | NSE ticker (`.NS`) or BSE ticker (`.BO`) |
| **Instrument Name** | Full company/fund name |
| **Sector** | Industry classification (e.g., "Financials", "Oil & Gas", "Information Technology") |
| **Category** | The recommendation bucket: **A** (core rebalance), **B** (diversifiers), **C** (high-alpha), **D** (macro hedges) |
| **Default Price (₹)** | Benchmark reference price used when live data is unavailable |
| **Base Weight** | How much portfolio weight this stock gets by default (e.g., 0.02 = 2%) |
| **Sharpe Ratio** | Risk-adjusted return metric (higher = better reward for the risk taken) |
| **Risk Reduction %** | How much adding this stock reduces overall portfolio risk |
| **Technical Signal** | Current price trend indicator (e.g., "EMA 20 > EMA 50 Bullish Trend") |

---

## 🔝 The Top Bar — Live Market Pulse

The top bar is always visible across all tabs. It shows:

| Indicator | What It Tells You |
|---|---|
| **India Macro Threat Score (0–100)** | An overall danger rating for the Indian market. Green (< 40) = safe to invest, Amber (40–65) = proceed with caution, Red (> 65) = defensive mode |
| **Active Market Regime** | The current market state (e.g., "BULLISH_DOMESTIC_GROWTH" = good times, "FII_OUTFLOW_VOLATILITY" = turbulence) |
| **Brent Crude Oil** | Global oil price per barrel in USD — high oil hurts India (we import 80%+ of our oil) |
| **USD / INR** | Exchange rate — a rising number means the Rupee is weakening |
| **India VIX** | Market volatility ("fear gauge") — below 15 is calm, above 20 is nervous |
| **FII Net Flow** | Whether foreign institutional investors are buying (+green) or selling (-red) Indian stocks, in ₹ Crore |

Click **"Sync Pulse"** to refresh all indicators with the latest data.

---

## 📚 Glossary of Terms (For Beginners)

| Term | Simple Explanation |
|---|---|
| **NSE / BSE** | India's two main stock exchanges — National Stock Exchange and Bombay Stock Exchange |
| **Ticker** | A short code for a stock, e.g., `RELIANCE.NS` means Reliance Industries on NSE |
| **ETF** | Exchange-Traded Fund — a basket of stocks you can buy as one unit (like NIFTYBEES tracks the Nifty 50 index) |
| **Portfolio** | Your collection of investments |
| **HRP (Hierarchical Risk Parity)** | A mathematical method to spread your money across stocks so no single stock can blow up your portfolio |
| **HHI (Herfindahl-Hirschman Index)** | Measures concentration — are you too heavily invested in just 1–2 stocks? |
| **Sharpe Ratio** | How much return you get for each unit of risk. Higher = better |
| **Sortino Ratio** | Like Sharpe, but only penalizes *downside* risk (ignores upside volatility) |
| **VaR (Value at Risk)** | The maximum loss you could face on a bad day (95% confidence) |
| **FII / DII** | Foreign Institutional Investors / Domestic Institutional Investors — large funds that move markets |
| **India VIX** | Volatility Index — measures expected market turbulence over 30 days |
| **Brent Crude** | The global benchmark for oil prices. India imports most of its oil, so this directly affects inflation |
| **USD / INR** | The exchange rate between US Dollar and Indian Rupee |
| **RBI Repo Rate** | The interest rate at which RBI lends to banks. Higher rate = costlier loans = slower growth |
| **GDELT** | Global Database of Events, Language, and Tone — tracks geopolitical tensions worldwide |
| **DXY** | US Dollar Index — measures the Dollar's strength against a basket of currencies |
| **bps (basis points)** | 1 bps = 0.01%. So "50 bps" = 0.50% interest rate change |

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| **Frontend** | React 19 + Vite 8, Recharts (charts), Lucide Icons, Axios |
| **Backend** | Python FastAPI, Uvicorn |
| **Data & Finance** | yfinance (live market data), pandas, numpy, scipy, PyPortfolioOpt |
| **Styling** | Vanilla CSS with glassmorphism dark theme |

---

## 📁 Project Structure

```
InvestmentPredictor/
├── backend/
│   ├── main.py                              # FastAPI server & all API endpoints
│   ├── schemas.py                           # Pydantic data models
│   ├── requirements.txt                     # Python dependencies
│   ├── data/
│   │   └── nse_tickers.json                 # Local JSON database of ~500+ securities
│   └── services/
│       ├── mcp_client.py                    # World Monitor macro data service
│       ├── quant_engine_india.py            # Core quantitative engine (HRP, recommendations, targets)
│       └── ticker_sync_service.py           # NSE/BSE ticker synchronization
│
├── frontend/
│   ├── index.html                           # Entry point
│   ├── package.json                         # Node.js dependencies
│   ├── vite.config.js                       # Vite bundler configuration
│   └── src/
│       ├── App.jsx                          # Main app layout & state management
│       ├── App.css                          # Application styles
│       ├── index.css                        # Global CSS with design tokens
│       ├── main.jsx                         # React entry point
│       └── components/
│           ├── TopBar.jsx                   # Live market pulse header
│           ├── Sidebar.jsx                  # Investment preferences panel
│           ├── RecommendationPanel.jsx      # Stock recommendation cards
│           ├── DiagnosticsPanel.jsx         # Portfolio health & concentration analysis
│           ├── TargetProfitPredictor.jsx    # Goal-based profit & sell-date calculator
│           ├── MacroSimulator.jsx           # Stress testing & scenario simulator
│           └── TickerManager.jsx            # Stock database admin panel
│
├── docs/
│   └── images/                              # Documentation images
│
└── README.md                                # This file
```

---

## API Endpoints Reference

| Method | Endpoint | Purpose |
|---|---|---|
| `GET` | `/api/macro-pulse` | Fetch live macro threat score, regime, and indicators |
| `GET` | `/api/probable-scenarios` | Get 5 dynamically generated risk scenarios |
| `POST` | `/api/parse-portfolio` | Upload & analyze an existing portfolio (CSV/Excel/JSON) |
| `POST` | `/api/recommend-inr` | Generate optimized investment recommendations |
| `POST` | `/api/target-selling-point` | Calculate target sell prices and exit dates |
| `GET` | `/api/ticker-history` | Fetch historical prices and run backtests |
| `POST` | `/api/stress-test` | Run macro shock simulation |
| `POST` | `/api/broker-execute` | Queue orders for broker execution (Zerodha/Angel One/Upstox) |
| `GET` | `/api/tickers` | Retrieve full ticker database |
| `POST` | `/api/tickers` | Save modified ticker database |
| `POST` | `/api/tickers/sync` | Sync latest NSE/BSE securities |

---

## ⚡ Quick Start & Execution

### Prerequisites
- **Python 3.10+**
- **Node.js v18+ & npm**

### 1. Backend Setup & Execution (FastAPI)

Using `uv` to manage the local virtual environment (`.venv`) is recommended for fast, isolated, and reliable installation across all operating systems.

```bash
# 1. Navigate to backend directory
cd backend

# 2. Install uv (if not already installed)
python -m pip install uv

# 3. Create a local virtual environment (.venv)
python -m uv venv .venv

# 4. Install backend dependencies inside .venv
python -m uv pip install -r requirements.txt --python .venv

# 5. Run the FastAPI backend server
.\.venv\Scripts\python.exe -m uvicorn main:app --host 0.0.0.0 --port 8000 --reload
# (On macOS/Linux, use: ./.venv/bin/python -m uvicorn main:app --host 0.0.0.0 --port 8000 --reload)
```
- **Backend API**: [http://localhost:8000](http://localhost:8000)
- **Interactive API Docs**: [http://localhost:8000/docs](http://localhost:8000/docs)

#### Running Backend Tests
```bash
cd backend
.\.venv\Scripts\python.exe -m pytest tests/ -v
```

---

### 2. Frontend Setup & Execution (React + Vite)

```bash
# 1. Navigate to frontend directory
cd frontend

# 2. Install Node dependencies (if not already installed)
npm install

# 3. Run the Vite React dev server
npm run dev
```

> 💡 **Windows PowerShell Execution Policy Note:**
> If PowerShell blocks `npm run dev` with a script execution error (`npm.ps1 cannot be loaded because running scripts is disabled`), run the command using `cmd`:
> ```cmd
> cmd /c npm run dev
> ```
> Or temporarily allow script execution in your PowerShell session:
> ```powershell
> Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass
> npm run dev
> ```

- **Frontend Dashboard**: [http://localhost:5173](http://localhost:5173)

---

## 📜 License

This project is for educational and personal use. Not financial advice. Always consult a SEBI-registered advisor before investing.
