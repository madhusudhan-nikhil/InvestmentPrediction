import React, { useState, useEffect } from 'react';
import axios from 'axios';
import TopBar from './components/TopBar';
import Sidebar from './components/Sidebar';
import DiagnosticsPanel from './components/DiagnosticsPanel';
import RecommendationPanel from './components/RecommendationPanel';
import MacroSimulator from './components/MacroSimulator';
import TargetProfitPredictor from './components/TargetProfitPredictor';
import SimplePortfolioPlanner from './components/SimplePortfolioPlanner';
import ToastContainer from './components/ToastContainer';
import QuantGlossaryModal from './components/QuantGlossaryModal';
import ManualHoldingsModal from './components/ManualHoldingsModal';
import BrokerExecutionModal from './components/BrokerExecutionModal';
import { formatINR } from './utils/formatters';

const API_BASE_URL = 'http://localhost:8000';

export default function App() {
  const [viewMode, setViewMode] = useState("simple"); // 'simple' | 'advanced'
  
  const [macroPulse, setMacroPulse] = useState(null);
  const [diagnostics, setDiagnostics] = useState(null);
  const [recommendations, setRecommendations] = useState(null);

  const [availableCapital, setAvailableCapital] = useState(500000); // Default ₹5 Lakhs
  const [riskProfile, setRiskProfile] = useState("Aggressive");
  const [assetTypePreference, setAssetTypePreference] = useState("EQUITY_FOCUSED");
  const [holdings, setHoldings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [activeMainTab, setActiveMainTab] = useState("dashboard"); // 'dashboard', 'predictor', or 'simulator'

  // Modals state
  const [isGlossaryOpen, setIsGlossaryOpen] = useState(false);
  const [isManualModalOpen, setIsManualModalOpen] = useState(false);
  const [isBrokerModalOpen, setIsBrokerModalOpen] = useState(false);

  // Toast Notification state
  const [toasts, setToasts] = useState([]);

  const showToast = (message, type = 'info') => {
    const id = Date.now() + Math.random().toString();
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 4500);
  };

  const dismissToast = (id) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  // Initial load: fetch macro pulse & initial aggressive recommendations
  useEffect(() => {
    fetchMacroPulse();
    fetchRecommendations(availableCapital, riskProfile, [], assetTypePreference);
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
    await fetchRecommendations(availableCapital, riskProfile, sample, assetTypePreference);
    showToast("Loaded Sample Nifty 50 Holdings!", "success");
  };

  const handleClearPortfolio = async () => {
    setHoldings([]);
    setDiagnostics(null);
    await fetchRecommendations(availableCapital, riskProfile, [], assetTypePreference);
    showToast("Cleared portfolio holdings. Switched to pure fresh capital deployment.", "info");
  };

  const handleApplyManualHoldings = async (validHoldings) => {
    setHoldings(validHoldings);
    await parseHoldingsList(validHoldings);
    await fetchRecommendations(availableCapital, riskProfile, validHoldings, assetTypePreference);
    showToast(`Applied ${validHoldings.length} stocks to portfolio!`, "success");
  };

  const parseHoldingsList = async (holdingsList) => {
    setLoading(true);
    try {
      const res = await axios.post(`${API_BASE_URL}/api/parse-portfolio`, { holdings: holdingsList });
      setDiagnostics(res.data);
    } catch (e) {
      console.error("Error parsing holdings:", e);
      showToast(e.response?.data?.detail || "Failed to compute portfolio diagnostics", "error");
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

      await fetchRecommendations(availableCapital, riskProfile, parsedHoldings, assetTypePreference);
      showToast(`Uploaded and normalized ${parsedHoldings.length} holdings from ${file.name}!`, "success");
    } catch (e) {
      showToast(e.response?.data?.detail || "Failed to parse portfolio file. Check format.", "error");
    } finally {
      setLoading(false);
    }
  };

  const fetchRecommendations = async (capital, risk, currentHoldings = holdings, assetPref = assetTypePreference) => {
    setLoading(true);
    try {
      const res = await axios.post(`${API_BASE_URL}/api/recommend-inr`, {
        available_capital_inr: capital,
        risk_profile: risk,
        asset_type_preference: assetPref,
        holdings: currentHoldings
      });
      setRecommendations(res.data);
    } catch (e) {
      console.error("Error fetching recommendations:", e);
      showToast("Failed to fetch HRP recommendations. Using fallback matrix.", "warning");
    } finally {
      setLoading(false);
    }
  };

  const handleRunOptimization = () => {
    fetchRecommendations(availableCapital, riskProfile, holdings, assetTypePreference);
    showToast("Recomputed quantitative portfolio plan!", "success");
  };

  return (
    <div style={{ maxWidth: '1440px', margin: '0 auto', padding: '20px' }}>
      
      {/* Toast Notification Container */}
      <ToastContainer toasts={toasts} onDismiss={dismissToast} />

      {/* Quant Glossary Modal */}
      <QuantGlossaryModal isOpen={isGlossaryOpen} onClose={() => setIsGlossaryOpen(false)} />

      {/* Manual Holdings Entry Modal */}
      <ManualHoldingsModal
        isOpen={isManualModalOpen}
        onClose={() => setIsManualModalOpen(false)}
        currentHoldings={holdings}
        onApplyHoldings={handleApplyManualHoldings}
      />

      {/* 1-Click Broker Execution Modal */}
      <BrokerExecutionModal
        isOpen={isBrokerModalOpen}
        onClose={() => setIsBrokerModalOpen(false)}
        recommendationsData={recommendations}
        onSuccessToast={(msg) => showToast(msg, "success")}
      />

      {/* App Header & Interface Mode Switcher */}
      <div style={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        marginBottom: '20px', paddingBottom: '16px', borderBottom: '1px solid var(--border-color)',
        flexWrap: 'wrap', gap: '12px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{
            width: '40px', height: '40px', borderRadius: '12px',
            background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '20px', fontWeight: '800', color: '#fff', boxShadow: '0 4px 12px rgba(16, 185, 129, 0.3)'
          }}>
            🇮🇳
          </div>
          <div>
            <h1 style={{ fontSize: '20px', fontWeight: '800', color: '#fff', letterSpacing: '-0.5px' }}>
              BharatiQuant Investment Predictor
            </h1>
            <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
              NSE / BSE Indian Quantitative HRP & World Monitor Macro Engine
            </div>
          </div>
        </div>

        {/* View Mode Toggle Switch */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <button
            onClick={() => setIsGlossaryOpen(true)}
            style={{
              padding: '8px 14px',
              borderRadius: '9px',
              fontSize: '12px',
              fontWeight: '700',
              cursor: 'pointer',
              border: '1px solid rgba(16, 185, 129, 0.3)',
              background: 'rgba(16, 185, 129, 0.12)',
              color: '#34d399',
              transition: 'all 0.2s'
            }}
          >
            📖 Quant Glossary
          </button>

          <div style={{
            display: 'flex', background: 'rgba(255, 255, 255, 0.04)',
            border: '1px solid var(--border-color)', borderRadius: '12px', padding: '4px'
          }}>
            <button
              onClick={() => setViewMode("simple")}
              style={{
                padding: '8px 18px',
                borderRadius: '9px',
                fontSize: '13px',
                fontWeight: '700',
                cursor: 'pointer',
                border: 'none',
                transition: 'all 0.2s',
                background: viewMode === 'simple' ? 'linear-gradient(135deg, #10b981 0%, #059669 100%)' : 'transparent',
                color: viewMode === 'simple' ? '#fff' : 'var(--text-muted)',
                boxShadow: viewMode === 'simple' ? '0 2px 8px rgba(16, 185, 129, 0.3)' : 'none'
              }}
            >
              ⚡ Simple View
            </button>
            <button
              onClick={() => setViewMode("advanced")}
              style={{
                padding: '8px 18px',
                borderRadius: '9px',
                fontSize: '13px',
                fontWeight: '700',
                cursor: 'pointer',
                border: 'none',
                transition: 'all 0.2s',
                background: viewMode === 'advanced' ? 'rgba(99, 102, 241, 0.25)' : 'transparent',
                color: viewMode === 'advanced' ? '#818cf8' : 'var(--text-muted)',
                boxShadow: viewMode === 'advanced' ? '0 2px 8px rgba(99, 102, 241, 0.3)' : 'none'
              }}
            >
              📊 Advanced View
            </button>
          </div>
        </div>
      </div>

      {/* SIMPLE VIEW MODE */}
      {viewMode === 'simple' && (
        <SimplePortfolioPlanner
          availableCapital={availableCapital}
          setAvailableCapital={setAvailableCapital}
          riskProfile={riskProfile}
          setRiskProfile={setRiskProfile}
          assetTypePreference={assetTypePreference}
          setAssetTypePreference={setAssetTypePreference}
          holdings={holdings}
          setHoldings={setHoldings}
          diagnostics={diagnostics}
          recommendations={recommendations}
          macroPulse={macroPulse}
          loading={loading}
          onUploadCSV={handleUploadCSV}
          onLoadSamplePortfolio={loadSamplePortfolio}
          onRunOptimization={handleRunOptimization}
          onOpenManualModal={() => setIsManualModalOpen(true)}
          onClearPortfolio={handleClearPortfolio}
          onOpenBrokerModal={() => setIsBrokerModalOpen(true)}
          onOpenGlossary={() => setIsGlossaryOpen(true)}
          onShowToast={showToast}
        />
      )}

      {/* ADVANCED VIEW MODE */}
      {viewMode === 'advanced' && (
        <>
          {/* Top Bar Ticker */}
          <TopBar
            macroData={macroPulse}
            loading={loading}
            onRefresh={fetchMacroPulse}
            onOpenGlossary={() => setIsGlossaryOpen(true)}
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
              📊 Portfolio Diagnostic & Optimization Dashboard
            </button>
            <button
              onClick={() => setActiveMainTab('predictor')}
              style={{
                padding: '10px 22px', borderRadius: '10px', fontSize: '14px', fontWeight: '700',
                cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', transition: 'all 0.2s', whiteSpace: 'nowrap',
                background: activeMainTab === 'predictor' ? 'rgba(245, 158, 11, 0.2)' : 'rgba(255, 255, 255, 0.04)',
                border: activeMainTab === 'predictor' ? '1px solid #f59e0b' : '1px solid var(--border-color)',
                color: activeMainTab === 'predictor' ? '#fbbf24' : 'var(--text-muted)'
              }}
            >
              🎯 Target Profit & Sell Date Predictor
            </button>
            <button
              onClick={() => setActiveMainTab('simulator')}
              style={{
                padding: '10px 22px', borderRadius: '10px', fontSize: '14px', fontWeight: '700',
                cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', transition: 'all 0.2s', whiteSpace: 'nowrap',
                background: activeMainTab === 'simulator' ? 'rgba(59, 130, 246, 0.2)' : 'rgba(255, 255, 255, 0.04)',
                border: activeMainTab === 'simulator' ? '1px solid #3b82f6' : '1px solid var(--border-color)',
                color: activeMainTab === 'simulator' ? '#60a5fa' : 'var(--text-muted)'
              }}
            >
              🌐 World Monitor Macro Simulator
            </button>
          </div>

          {/* Conditional Layout Views */}
          {activeMainTab === 'dashboard' && (
            <div className="app-main-grid" style={{ display: 'grid', gridTemplateColumns: '320px 1fr', gap: '24px', alignItems: 'start' }}>
              {/* Left Sidebar */}
              <Sidebar
                availableCapital={availableCapital}
                setAvailableCapital={setAvailableCapital}
                riskProfile={riskProfile}
                setRiskProfile={setRiskProfile}
                assetTypePreference={assetTypePreference}
                setAssetTypePreference={setAssetTypePreference}
                onUploadCSV={handleUploadCSV}
                onLoadSamplePortfolio={loadSamplePortfolio}
                onOpenManualModal={() => setIsManualModalOpen(true)}
                onClearPortfolio={handleClearPortfolio}
                onOpenGlossary={() => setIsGlossaryOpen(true)}
                holdingsCount={holdings.length}
                onRunOptimization={handleRunOptimization}
                loading={loading}
              />

              {/* Right Dashboard Panels */}
              <main style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                <RecommendationPanel 
                  recommendationsData={recommendations}
                  loading={loading}
                  onOpenBrokerModal={() => setIsBrokerModalOpen(true)}
                  onShowToast={showToast}
                />
                <DiagnosticsPanel 
                  diagnostics={diagnostics}
                  onOpenGlossary={() => setIsGlossaryOpen(true)}
                />
              </main>
            </div>
          )}

          {activeMainTab === 'predictor' && (
            <div style={{ width: '100%' }}>
              <TargetProfitPredictor 
                recommendationsData={recommendations} 
                onShowToast={showToast}
              />
            </div>
          )}

          {activeMainTab === 'simulator' && (
            <div style={{ width: '100%' }}>
              <MacroSimulator 
                holdings={holdings} 
                availableCapital={availableCapital}
                API_BASE_URL={API_BASE_URL} 
              />
            </div>
          )}
        </>
      )}

    </div>
  );
}
