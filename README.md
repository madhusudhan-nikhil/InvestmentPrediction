# BharatiQuant | Indian Investment Planning Platform

[![Python](https://img.shields.io/badge/Python-3.14-blue.svg)](https://python.org)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.141-green.svg)](https://fastapi.tiangolo.com)
[![React](https://img.shields.io/badge/React-18-cyan.svg)](https://react.dev)
[![Vite](https://img.shields.io/badge/Vite-8.2-purple.svg)](https://vitejs.dev)
[![Awesome Systematic Trading](https://img.shields.io/badge/Awesome-Systematic%20Trading-gold.svg)](https://github.com/paperswithbacktest/awesome-systematic-trading)
[![License](https://img.shields.io/badge/License-MIT-brightgreen.svg)](LICENSE)

**BharatiQuant** is a full-stack Investment Planning & Portfolio Optimization Platform specialized for Indian Financial Markets (NSE & BSE). It combines quantitative portfolio optimization algorithms (Hierarchical Risk Parity, Herfindahl-Hirschman Concentration Index, Black-Litterman Macro Tilt, PyPortfolioOpt, vectorbt, QuantStats) with real-time World Monitor geopolitical threat feeds and Indian macroeconomic drivers.

---

## 🌟 Core System Pillars

### 1. Advanced Quantitative Analytics (Awesome Systematic Trading Integration)
- **Symbol Normalization**: Normalizes uploaded equity/ETF tickers to standard NSE format with `.NS` suffix (e.g. `RELIANCE` → `RELIANCE.NS`, `INFY.BO` → `INFY.NS`).
- **Herfindahl-Hirschman Index ($HHI = \sum w_i^2$)**: Computes asset concentration and classifies portfolio risk (Low, Moderate, High Concentration).
- **QuantStats Downside Risk Metrics**: Computes **Sortino Ratio** (downside risk-adjusted return), **Calmar Ratio** (return vs max drawdown), **Value at Risk ($VaR_{95\%}$)**, **Conditional VaR ($CVaR_{95\%}$)**, and **Max Drawdown %**.
- **Hierarchical Risk Parity (HRP)**: Decomposes covariance matrices using distance-based single-linkage hierarchical clustering and recursive bisection variance allocation.
- **Black-Litterman Macro Tilt**: Blends market benchmark returns with World Monitor geopolitical threat views (Brent crude inflation tilt, USD/INR FX tilt, FII net outflow tilt).

### 2. Geopolitical & Indian Macro Intelligence
- **World Monitor MCP Server Feeds**: Global threat indicators including Brent Crude oil price spikes, Middle East chokepoints, South Asia GDELT tension index, and US Dollar Index (DXY) / Fed policy stance.
- **Indian Domestic Macro Context**: USD/INR volatility, India VIX, daily FII/DII Net institutional flows (in ₹ Cr), and RBI Repo Rate (6.50%).
- **Dynamic India Macro Threat Score (0–100)**: Real-time threat score output and active market regime classification (`HIGH_CRUDE_INFLATION_RISK`, `FII_OUTFLOW_VOLATILITY`, `BULLISH_DOMESTIC_GROWTH`, `RISK_OFF_GOLD_FLIGHT`).

### 3. Actionable Recommendations & Indian Broker Execution
Generates **EXACTLY 16 actionable recommendations** for target available deployment capital (₹ INR) across 4 categories:
- **Category A (Rebalance & Top-up)**: `NIFTYBEES.NS`, `JUNIORBEES.NS`, `MID150BEES.NS`, `RELIANCE.NS`, `HDFCBANK.NS`
- **Category B (Uncorrelated Diversifiers)**: `GOLDBEES.NS`, `SILVERBEES.NS`, `MON100.NS`, `BHARATBOND.NS`
- **Category C (Systematic Alpha)**: `BANKBEES.NS`, `ITBEES.NS`, `TCS.NS`, `ICICIBANK.NS`
- **Category D (Macro & Geopolitical Hedges)**: `LIQUIDBEES.NS`, `LT.NS`, `ITC.NS`

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
Output: `9 PASSED (100% pass rate)`

### Run Production Frontend Build
```bash
cd frontend
npm run build
```
Output: `✓ built in 518ms (0 errors)`
