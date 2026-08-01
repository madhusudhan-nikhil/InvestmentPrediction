# BharatiQuant | Indian Investment Planning Platform

[![Python](https://img.shields.io/badge/Python-3.14-blue.svg)](https://python.org)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.141-green.svg)](https://fastapi.tiangolo.com)
[![React](https://img.shields.io/badge/React-18-cyan.svg)](https://react.dev)
[![Vite](https://img.shields.io/badge/Vite-8.2-purple.svg)](https://vitejs.dev)
[![Awesome Systematic Trading](https://img.shields.io/badge/Awesome-Systematic%20Trading-gold.svg)](https://github.com/paperswithbacktest/awesome-systematic-trading)
[![Dataset](https://img.shields.io/badge/Dataset-NSE%20Tickers%20JSON-orange.svg)](backend/data/nse_tickers.json)
[![License](https://img.shields.io/badge/License-MIT-brightgreen.svg)](LICENSE)

**BharatiQuant** is a full-stack Investment Planning & Portfolio Optimization Platform specialized for Indian Financial Markets (NSE & BSE). It combines quantitative portfolio optimization algorithms (Hierarchical Risk Parity, Herfindahl-Hirschman Concentration Index, Black-Litterman Macro Tilt, PyPortfolioOpt, vectorbt, QuantStats) with real-time World Monitor geopolitical threat feeds and Indian macroeconomic drivers.

---

## 🌟 Core System Pillars

### 1. Dynamic JSON Ticker Database (`backend/data/nse_tickers.json`)
- **Expanded Universe**: Reads securities from an extensible JSON dataset containing 80+ top liquid Indian equities (Nifty 50, Next 50, Midcaps), sector ETFs (Bank, IT, Auto, Pharma, CPSE, Infra, Consumption), international ETFs (Nasdaq 100, S&P 500, FANG+), debt & G-Sec instruments, and commodity hedges (Gold, Silver).
- **Automatic Fallback Formatting**: Gracefully parses and displays user-uploaded holdings outside the dataset while maintaining accurate sector classification and live price fetching via `yfinance`.

### 2. Advanced Quantitative Analytics (Awesome Systematic Trading Integration)
- **Herfindahl-Hirschman Index ($HHI = \sum w_i^2$)**: Computes asset concentration and classifies portfolio risk (Low, Moderate, High Concentration).
- **QuantStats Downside Risk Metrics**: Computes **Sortino Ratio** (downside risk-adjusted return), **Calmar Ratio** (return vs max drawdown), **Value at Risk ($VaR_{95\%}$)**, **Conditional VaR ($CVaR_{95\%}$)**, and **Max Drawdown %**.
- **Hierarchical Risk Parity (HRP)**: Decomposes covariance matrices using distance-based single-linkage hierarchical clustering and recursive bisection variance allocation.
- **Black-Litterman Macro Tilt**: Blends market benchmark returns with World Monitor geopolitical threat views (Brent crude inflation tilt, USD/INR FX tilt, FII net outflow tilt).

### 3. Dynamic Merit-Based Portfolio Recommendations
- Dynamically ranks candidate securities by composite Black-Litterman HRP risk-adjusted return & macro threat alignment.
- Ensures guaranteed diversification across 4 categories:
  - **Category A (Rebalance & Top-up)**
  - **Category B (Uncorrelated Diversifiers)**
  - **Category C (Systematic Alpha)**
  - **Category D (Macro & Geopolitical Hedges)**

### 4. Indian Broker Connectivity API Layer
Exposes direct API connectivity endpoints (`POST /api/broker-execute`) supporting:
- **Zerodha KiteConnect API**
- **Angel One SmartAPI**
- **Upstox API**

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

## 🧪 Testing & Diagnostics

### Run Backend Unit & E2E Integration Tests
```bash
python -m pytest backend/tests/ -v
```
Output: `43 PASSED (100% pass rate)`

### Run Production Frontend Build
```bash
cd frontend
npm run build
```
Output: `✓ built in 347ms (0 errors)`
