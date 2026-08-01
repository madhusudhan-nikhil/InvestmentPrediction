import React, { useState, useEffect } from 'react';
import axios from 'axios';
import TopBar from './components/TopBar';
import Sidebar from './components/Sidebar';
import DiagnosticsPanel from './components/DiagnosticsPanel';
import RecommendationPanel from './components/RecommendationPanel';
import MacroSimulator from './components/MacroSimulator';
import TickerManager from './components/TickerManager';

const API_BASE_URL = 'http://localhost:8000';

export default function App() {
  const [macroPulse, setMacroPulse] = useState(null);
  const [diagnostics, setDiagnostics] = useState(null);
  const [recommendations, setRecommendations] = useState(null);

  const [availableCapital, setAvailableCapital] = useState(500000); // Default ₹5 Lakhs
  const [riskProfile, setRiskProfile] = useState("Moderate");
  const [holdings, setHoldings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [activeMainTab, setActiveMainTab] = useState("dashboard"); // 'dashboard', 'simulator', or 'tickers'

  // Initial load: fetch macro pulse and generate recommendations directly
  useEffect(() => {
    fetchMacroPulse();
    fetchRecommendations(500000, "Moderate", []);
  }, []);

  const fetchMacroPulse = async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/api/macro-pulse`);
      setMacroPulse(res.data);
    } catch (e) {
      console.warn("API macro-pulse fetch error, using resilient state:", e);
      setMacroPulse({
        threat_score: 38.5,
        active_regime: "BULLISH_DOMESTIC_GROWTH",
        regime_description: "Robust domestic DII inflows and strong Indian corporate earnings guidance.",
        brent_crude_usd: 84.50,
        brent_crude_change_pct: +2.4,
        usd_inr: 83.45,
        usd_inr_change_pct: +0.15,
        india_vix: 14.8,
        india_vix_change_pct: -1.2,
        fii_net_flow_cr: -1250.0,
        dii_net_flow_cr: +1820.0,
        rbi_repo_rate: 6.50
      });
    }
  };

  const loadSamplePortfolio = async () => {
    const sample = [
      { Ticker: "RELIANCE", Quantity: 25, "Purchase Price": 2850 },
      { Ticker: "TCS", Quantity: 15, "Purchase Price": 3900 },
      { Ticker: "HDFCBANK", Quantity: 50, "Purchase Price": 1520 },
      { Ticker: "NIFTYBEES", Quantity: 200, "Purchase Price": 260 },
      { Ticker: "INFY", Quantity: 30, "Purchase Price": 1680 }
    ];
    setHoldings(sample);
    await parseHoldingsList(sample);
    await fetchRecommendations(availableCapital, riskProfile, sample);
  };

  const loadFreshCapitalRecommendations = async () => {
    setHoldings([]);
    setDiagnostics(null);
    await fetchRecommendations(availableCapital, riskProfile, []);
  };

  const parseHoldingsList = async (holdingsList) => {
    setLoading(true);
    try {
      const res = await axios.post(`${API_BASE_URL}/api/parse-portfolio`, { holdings: holdingsList });
      setDiagnostics(res.data);
    } catch (e) {
      console.error("Error parsing holdings:", e);
    } finally {
      setLoading(false);
    }
  };

  const handleUploadCSV = async (file) => {
    setLoading(true);
    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await axios.post(`${API_BASE_URL}/api/parse-portfolio`, formData, {
        headers: { "Content-Type": "multipart/form-data" }
      });
      setDiagnostics(res.data);

      const parsedHoldings = res.data.holdings_normalized.map(h => ({
        Ticker: h.ticker,
        Quantity: h.quantity,
        "Purchase Price": h.purchase_price
      }));
      setHoldings(parsedHoldings);

      await fetchRecommendations(availableCapital, riskProfile, parsedHoldings);
    } catch (e) {
      alert(e.response?.data?.detail || "Failed to parse portfolio file");
    } finally {
      setLoading(false);
    }
  };

  const fetchRecommendations = async (capital, risk, currentHoldings = holdings) => {
    setLoading(true);
    try {
      const res = await axios.post(`${API_BASE_URL}/api/recommend-inr`, {
        available_capital_inr: capital,
        risk_profile: risk,
        holdings: currentHoldings
      });
      setRecommendations(res.data);
    } catch (e) {
      console.error("Error fetching recommendations:", e);
    } finally {
      setLoading(false);
    }
  };

  const handleRunOptimization = () => {
    fetchRecommendations(availableCapital, riskProfile, holdings);
  };

  return (
    <div style={{ maxWidth: '1440px', margin: '0 auto', padding: '20px' }}>
      {/* Top Bar Ticker */}
      <TopBar
        macroData={macroPulse}
        loading={loading}
        onRefresh={fetchMacroPulse}
      />

      {/* Main Navigation Tabs Bar */}
      <div style={{
        display: 'flex', gap: '12px', marginTop: '16px', marginBottom: '24px',
        borderBottom: '1px solid var(--border-color)', paddingBottom: '14px', overflowX: 'auto'
      }}>
        <button
          onClick={() => setActiveMainTab('dashboard')}
          style={{
            padding: '10px 22px', borderRadius: '10px', fontSize: '14px', fontWeight: '700',
            cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', transition: 'all 0.2s', whiteSpace: 'nowrap',
            background: activeMainTab === 'dashboard' ? 'rgba(16, 185, 129, 0.2)' : 'rgba(255, 255, 255, 0.04)',
            border: activeMainTab === 'dashboard' ? '1px solid #10b981' : '1px solid var(--border-color)',
            color: activeMainTab === 'dashboard' ? '#34d399' : 'var(--text-muted)'
          }}
        >
          📊 Investment Recommendations & Diagnostics
        </button>
        <button
          onClick={() => setActiveMainTab('simulator')}
          style={{
            padding: '10px 22px', borderRadius: '10px', fontSize: '14px', fontWeight: '700',
            cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', transition: 'all 0.2s', whiteSpace: 'nowrap',
            background: activeMainTab === 'simulator' ? 'rgba(245, 158, 11, 0.2)' : 'rgba(255, 255, 255, 0.04)',
            border: activeMainTab === 'simulator' ? '1px solid #f59e0b' : '1px solid var(--border-color)',
            color: activeMainTab === 'simulator' ? '#fbbf24' : 'var(--text-muted)'
          }}
        >
          ⚡ Geopolitical Macro Stress Simulator
        </button>
        <button
          onClick={() => setActiveMainTab('tickers')}
          style={{
            padding: '10px 22px', borderRadius: '10px', fontSize: '14px', fontWeight: '700',
            cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', transition: 'all 0.2s', whiteSpace: 'nowrap',
            background: activeMainTab === 'tickers' ? 'rgba(139, 92, 246, 0.2)' : 'rgba(255, 255, 255, 0.04)',
            border: activeMainTab === 'tickers' ? '1px solid #8b5cf6' : '1px solid var(--border-color)',
            color: activeMainTab === 'tickers' ? '#c084fc' : 'var(--text-muted)'
          }}
        >
          ⚙️ Ticker Universe Manager
        </button>
      </div>

      {/* Conditional Layout Views */}
      {activeMainTab === 'dashboard' && (
        <div className="app-main-grid" style={{ display: 'grid', gridTemplateColumns: '320px 1fr', gap: '24px' }}>
          {/* Left Sidebar */}
          <Sidebar
            availableCapital={availableCapital}
            setAvailableCapital={setAvailableCapital}
            riskProfile={riskProfile}
            setRiskProfile={setRiskProfile}
            onUploadCSV={handleUploadCSV}
            onLoadSamplePortfolio={loadSamplePortfolio}
            onGenerateFreshCapital={loadFreshCapitalRecommendations}
            onRunOptimization={handleRunOptimization}
            loading={loading}
          />

          {/* Right Dashboard Panels */}
          <main style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            <RecommendationPanel recommendationsData={recommendations} />
            <DiagnosticsPanel diagnostics={diagnostics} />
          </main>
        </div>
      )}

      {activeMainTab === 'simulator' && (
        <div style={{ width: '100%' }}>
          <MacroSimulator holdings={holdings} API_BASE_URL={API_BASE_URL} />
        </div>
      )}

      {activeMainTab === 'tickers' && (
        <div style={{ width: '100%' }}>
          <TickerManager />
        </div>
      )}
    </div>
  );
}
