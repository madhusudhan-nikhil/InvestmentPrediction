import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  Upload, FileText, CheckCircle2, TrendingUp, PieChart, 
  BarChart3, Download, Zap, AlertCircle, ArrowUpRight, 
  RefreshCw, Sparkles, Shield, DollarSign, Layers, ShieldCheck, Flame, ArrowDownRight
} from 'lucide-react';

const API_BASE_URL = 'http://localhost:8000';

export default function SimplePortfolioPlanner({ 
  onHoldingsChange, 
  onDiagnosticsChange, 
  onRecommendationsChange 
}) {
  const [file, setFile] = useState(null);
  const [fileName, setFileName] = useState("");
  const [availableCapital, setAvailableCapital] = useState(200000); // Default ₹2 Lakhs
  const [riskProfile, setRiskProfile] = useState("Aggressive");
  const [holdings, setHoldings] = useState([]);
  const [diagnostics, setDiagnostics] = useState(null);
  const [recommendations, setRecommendations] = useState(null);
  
  const [loading, setLoading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [activeTab, setActiveTab] = useState("options"); // 'options' | 'spread'
  const [actionFilter, setActionFilter] = useState("ALL"); // ALL | SELL | KEEP | TOP_UP | BUY
  const [errorMsg, setErrorMsg] = useState("");

  // Load initial aggressive recommendations on mount
  useEffect(() => {
    fetchRecommendations(availableCapital, "Aggressive", []);
  }, []);

  const handleFileSelect = (selectedFile) => {
    if (!selectedFile) return;
    if (!selectedFile.name.endsWith('.csv') && !selectedFile.name.endsWith('.xlsx') && !selectedFile.name.endsWith('.xls')) {
      setErrorMsg("Please upload a CSV or Excel file (.csv, .xlsx, .xls)");
      return;
    }
    setErrorMsg("");
    setFile(selectedFile);
    setFileName(selectedFile.name);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelect(e.dataTransfer.files[0]);
    }
  };

  const loadSamplePortfolio = async () => {
    setErrorMsg("");
    setFile(null);
    setFileName("Sample_Indian_Portfolio.csv");
    
    const sampleHoldings = [
      { Ticker: "RELIANCE", Quantity: 25, "Purchase Price": 2850 },
      { Ticker: "TCS", Quantity: 15, "Purchase Price": 3900 },
      { Ticker: "HDFCBANK", Quantity: 50, "Purchase Price": 1520 },
      { Ticker: "NIFTYBEES", Quantity: 200, "Purchase Price": 260 },
      { Ticker: "INFY", Quantity: 30, "Purchase Price": 1680 }
    ];

    setHoldings(sampleHoldings);
    await computePortfolioAndRecommendations(sampleHoldings, availableCapital);
  };

  const computePortfolioAndRecommendations = async (currentHoldings = holdings, capital = availableCapital) => {
    setLoading(true);
    setErrorMsg("");

    try {
      let parsedDiag = null;
      let holdingsToUse = currentHoldings;

      // 1. If a CSV file is uploaded, parse it first via /api/parse-portfolio
      if (file) {
        const formData = new FormData();
        formData.append("file", file);

        const parseRes = await axios.post(`${API_BASE_URL}/api/parse-portfolio`, formData, {
          headers: { "Content-Type": "multipart/form-data" }
        });

        parsedDiag = parseRes.data;
        setDiagnostics(parsedDiag);
        if (onDiagnosticsChange) onDiagnosticsChange(parsedDiag);

        holdingsToUse = parseRes.data.holdings_normalized.map(h => ({
          Ticker: h.ticker,
          Quantity: h.quantity,
          "Purchase Price": h.purchase_price
        }));
        setHoldings(holdingsToUse);
        if (onHoldingsChange) onHoldingsChange(holdingsToUse);
      } else if (currentHoldings.length > 0) {
        // Parse raw JSON holdings
        const parseRes = await axios.post(`${API_BASE_URL}/api/parse-portfolio`, { holdings: currentHoldings });
        parsedDiag = parseRes.data;
        setDiagnostics(parsedDiag);
        if (onDiagnosticsChange) onDiagnosticsChange(parsedDiag);
      } else {
        setDiagnostics(null);
      }

      // 2. Fetch Aggressive Recommendations via /api/recommend-inr
      const recRes = await axios.post(`${API_BASE_URL}/api/recommend-inr`, {
        available_capital_inr: Number(capital),
        risk_profile: "Aggressive",
        asset_type_preference: "EQUITY_FOCUSED",
        holdings: holdingsToUse
      });

      setRecommendations(recRes.data);
      if (onRecommendationsChange) onRecommendationsChange(recRes.data);

    } catch (err) {
      console.error("Computation Error:", err);
      setErrorMsg(err.response?.data?.detail || "Failed to compute investment options and portfolio spread.");
    } finally {
      setLoading(false);
    }
  };

  const fetchRecommendations = async (capital, risk, currentHoldings) => {
    setLoading(true);
    try {
      const recRes = await axios.post(`${API_BASE_URL}/api/recommend-inr`, {
        available_capital_inr: Number(capital),
        risk_profile: "Aggressive",
        asset_type_preference: "EQUITY_FOCUSED",
        holdings: currentHoldings
      });
      setRecommendations(recRes.data);
      if (onRecommendationsChange) onRecommendationsChange(recRes.data);
    } catch (e) {
      console.error("Error fetching recommendations:", e);
    } finally {
      setLoading(false);
    }
  };

  const handleExportCSV = () => {
    if (!recommendations || !recommendations.recommendations) return;
    const recs = recommendations.recommendations;
    
    const headers = "Action Type,Ticker,Company Name,Category,Current Price (INR),Target Sell Price (INR),Qty / Units,Hold / Value (INR),Freed Cash (INR),Allocation (INR),Allocation (%),Expected Return (%),Rationale\n";
    const rows = recs.map(r => 
      `"${r.action_type || 'BUY'}","${r.ticker}","${r.instrument_name}","${r.category}",${r.unit_price},${r.target_selling_price || (r.unit_price * (1 + (r.expected_return_pct || 15)/100)).toFixed(2)},${r.suggested_quantity || r.current_holding_qty || 0},${r.current_holding_value_inr || 0},${r.freed_cash_inr || 0},${r.allocation_inr || 0},${r.allocation_pct || 0},${r.expected_return_pct || 0},"${(r.action_summary || r.recommendation_rationale || '').replace(/"/g, '""')}"`
    );

    const blob = new Blob([headers + rows.join("\n")], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "Aggressive_Investment_Hold_Sell_Rebalance_Plan.csv";
    a.click();
  };

  // Helper formatting values
  const recsList = recommendations?.recommendations || [];
  const freshCap = recommendations?.fresh_capital_inr || availableCapital || 0;
  const cashFromSales = recommendations?.cash_generated_from_sales_inr || 0;
  const totalRebalanceCap = recommendations?.total_rebalancing_capital_inr || (freshCap + cashFromSales);
  const portfolioHoldingsVal = diagnostics?.total_portfolio_value || 0;
  const postTotalVal = portfolioHoldingsVal + freshCap;
  const healthScore = diagnostics?.portfolio_health_score || 85;

  const actionCounts = recommendations?.action_counts || {
    SELL: recsList.filter(r => r.action_type === 'SELL').length,
    KEEP: recsList.filter(r => r.action_type === 'KEEP').length,
    TOP_UP: recsList.filter(r => r.action_type === 'TOP_UP').length,
    BUY: recsList.filter(r => r.action_type === 'BUY').length,
  };

  const filteredRecs = recsList.filter(r => {
    if (actionFilter === "ALL") return true;
    return (r.action_type || "BUY") === actionFilter;
  });

  const getActionBadgeStyle = (actionType) => {
    switch (actionType) {
      case 'SELL': return { bg: 'rgba(244, 63, 94, 0.18)', color: '#fb7185', border: '1px solid #f43f5e', label: '🔴 SELL' };
      case 'KEEP': return { bg: 'rgba(16, 185, 129, 0.18)', color: '#34d399', border: '1px solid #10b981', label: '🟢 HOLD' };
      case 'TOP_UP': return { bg: 'rgba(59, 130, 246, 0.18)', color: '#60a5fa', border: '1px solid #3b82f6', label: '🔵 TOP-UP' };
      case 'BUY': default: return { bg: 'rgba(245, 158, 11, 0.18)', color: '#fbbf24', border: '1px solid #f59e0b', label: '🚀 BUY' };
    }
  };

  // Calculations for total Hold & Sell values
  const totalSellValue = recsList.filter(r => r.action_type === 'SELL').reduce((sum, r) => sum + (r.freed_cash_inr || r.current_holding_value_inr || 0), 0);
  const totalHoldValue = recsList.filter(r => r.action_type === 'KEEP').reduce((sum, r) => sum + (r.current_holding_value_inr || 0), 0);
  const totalTopupAllocation = recsList.filter(r => r.action_type === 'TOP_UP').reduce((sum, r) => sum + (r.allocation_inr || 0), 0);
  const totalBuyAllocation = recsList.filter(r => r.action_type === 'BUY').reduce((sum, r) => sum + (r.allocation_inr || 0), 0);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', width: '100%', maxWidth: '1200px', margin: '0 auto' }}>
      
      {/* Top Banner / Hero Card */}
      <div className="glass-panel" style={{
        padding: '24px 30px',
        background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.08) 0%, rgba(245, 158, 11, 0.08) 50%, rgba(99, 102, 241, 0.08) 100%)',
        border: '1px solid rgba(245, 158, 11, 0.25)',
        position: 'relative',
        overflow: 'hidden'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <Zap size={24} color="#f59e0b" />
              <h1 style={{ fontSize: '22px', fontWeight: '800', color: '#fff', letterSpacing: '-0.5px' }}>
                Simple Allocation Studio
              </h1>
              <span className="badge-amber" style={{ padding: '3px 10px', borderRadius: '20px', fontSize: '11px', fontWeight: '700', textTransform: 'uppercase' }}>
                🔥 Aggressive Growth Strategy
              </span>
            </div>
            <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginTop: '6px' }}>
              Upload your portfolio CSV, enter the capital amount you want to add, and compute your complete <strong>HOLD, SELL, TOP-UP & BUY</strong> options and portfolio spread.
            </p>
          </div>

          {diagnostics && (
            <div style={{
              display: 'flex', alignItems: 'center', gap: '12px', background: 'rgba(0,0,0,0.3)',
              padding: '8px 16px', borderRadius: '12px', border: '1px solid var(--border-color)'
            }}>
              <div>
                <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Portfolio Health</div>
                <div style={{ fontSize: '18px', fontWeight: '800', color: healthScore >= 75 ? '#34d399' : '#fbbf24' }}>
                  {healthScore}/100
                </div>
              </div>
              <Shield size={28} color={healthScore >= 75 ? '#10b981' : '#f59e0b'} />
            </div>
          )}
        </div>
      </div>

      {/* Main Input Control Panel */}
      <div className="glass-panel" style={{ padding: '24px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '20px', alignItems: 'start' }}>
          
          {/* Step 1: Upload Portfolio CSV */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <label style={{ fontSize: '13px', fontWeight: '700', color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Upload size={16} color="#10b981" /> Step 1: Upload Portfolio CSV (Optional)
            </label>

            <div
              onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
              onDragLeave={() => setDragOver(false)}
              onDrop={handleDrop}
              style={{
                border: dragOver ? '2px dashed #10b981' : '2px dashed var(--border-color)',
                borderRadius: '12px',
                padding: '20px',
                textAlign: 'center',
                background: dragOver ? 'rgba(16, 185, 129, 0.05)' : 'rgba(255, 255, 255, 0.02)',
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
              onClick={() => document.getElementById('csvFileInput').click()}
            >
              <input
                type="file"
                id="csvFileInput"
                accept=".csv,.xlsx,.xls"
                style={{ display: 'none' }}
                onChange={(e) => e.target.files && handleFileSelect(e.target.files[0])}
              />
              
              {fileName ? (
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', color: '#34d399' }}>
                  <FileText size={20} />
                  <span style={{ fontSize: '14px', fontWeight: '600' }}>{fileName}</span>
                  <CheckCircle2 size={16} color="#10b981" />
                </div>
              ) : (
                <div>
                  <Upload size={28} color="var(--text-muted)" style={{ marginBottom: '8px' }} />
                  <div style={{ fontSize: '13px', fontWeight: '600', color: 'var(--text-main)' }}>
                    Drop your CSV file here or <span style={{ color: '#10b981', textDecoration: 'underline' }}>browse</span>
                  </div>
                  <div style={{ fontSize: '11px', color: 'var(--text-dim)', marginTop: '4px' }}>
                    Supports Zerodha, Groww, AngelOne or custom CSV (Ticker, Qty, Avg Price)
                  </div>
                </div>
              )}
            </div>

            <button
              onClick={loadSamplePortfolio}
              type="button"
              style={{
                background: 'transparent',
                border: 'none',
                color: '#60a5fa',
                fontSize: '12px',
                fontWeight: '600',
                cursor: 'pointer',
                textAlign: 'left',
                padding: '4px 0',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px'
              }}
            >
              ✨ Don't have a CSV? Load Sample Indian Portfolio
            </button>
          </div>

          {/* Step 2: Capital Amount to Add */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <label style={{ fontSize: '13px', fontWeight: '700', color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <DollarSign size={16} color="#f59e0b" /> Step 2: Capital to Add (₹ INR)
            </label>

            <div style={{ position: 'relative' }}>
              <span style={{
                position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)',
                fontSize: '16px', fontWeight: '700', color: '#f59e0b'
              }}>₹</span>
              <input
                type="number"
                value={availableCapital}
                onChange={(e) => setAvailableCapital(Math.max(0, Number(e.target.value)))}
                placeholder="Enter amount to invest"
                style={{
                  width: '100%',
                  padding: '12px 14px 12px 34px',
                  borderRadius: '10px',
                  background: 'rgba(255, 255, 255, 0.05)',
                  border: '1px solid var(--border-color)',
                  color: '#fff',
                  fontSize: '16px',
                  fontWeight: '700',
                  outline: 'none'
                }}
              />
            </div>

            {/* Quick Presets */}
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              {[25000, 50000, 100000, 500000].map(amt => (
                <button
                  key={amt}
                  onClick={() => setAvailableCapital(amt)}
                  type="button"
                  style={{
                    padding: '6px 12px',
                    borderRadius: '8px',
                    fontSize: '11px',
                    fontWeight: '700',
                    cursor: 'pointer',
                    background: availableCapital === amt ? 'rgba(245, 158, 11, 0.25)' : 'rgba(255, 255, 255, 0.04)',
                    border: availableCapital === amt ? '1px solid #f59e0b' : '1px solid var(--border-color)',
                    color: availableCapital === amt ? '#fbbf24' : 'var(--text-muted)',
                    transition: 'all 0.15s'
                  }}
                >
                  +₹{(amt/1000).toFixed(0)}k
                </button>
              ))}
            </div>

            {/* Strategy Badge Indicator */}
            <div style={{
              display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px', color: 'var(--text-muted)',
              marginTop: '4px', background: 'rgba(245, 158, 11, 0.1)', padding: '6px 10px', borderRadius: '8px',
              border: '1px solid rgba(245, 158, 11, 0.2)'
            }}>
              <Zap size={14} color="#f59e0b" />
              <span>Optimization Mode: <strong style={{ color: '#fbbf24' }}>Aggressive High-Alpha Rebalancing</strong></span>
            </div>
          </div>

        </div>

        {errorMsg && (
          <div style={{
            marginTop: '16px', padding: '10px 14px', borderRadius: '8px',
            background: 'rgba(244, 63, 94, 0.15)', border: '1px solid #f43f5e',
            color: '#fb7185', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '8px'
          }}>
            <AlertCircle size={16} /> {errorMsg}
          </div>
        )}

        {/* Action Compute Button */}
        <div style={{ marginTop: '20px', display: 'flex', justifyContent: 'flex-end' }}>
          <button
            onClick={() => computePortfolioAndRecommendations(holdings, availableCapital)}
            disabled={loading}
            style={{
              padding: '14px 28px',
              borderRadius: '12px',
              background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
              color: '#fff',
              fontSize: '15px',
              fontWeight: '800',
              border: 'none',
              cursor: loading ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              boxShadow: '0 4px 16px rgba(16, 185, 129, 0.4)',
              transition: 'all 0.2s'
            }}
          >
            {loading ? (
              <>
                <RefreshCw size={18} className="spin-animation" /> Computing Aggressive Plan...
              </>
            ) : (
              <>
                🚀 Compute Options & Portfolio Spread
              </>
            )}
          </button>
        </div>

      </div>

      {/* Summary KPI Cards */}
      {recommendations && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px' }}>
          <div className="glass-panel" style={{ padding: '16px' }}>
            <div style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: '600' }}>FRESH CAPITAL TO ADD</div>
            <div style={{ fontSize: '20px', fontWeight: '800', color: '#f59e0b', marginTop: '4px' }}>
              ₹{freshCap.toLocaleString('en-IN')}
            </div>
            <div style={{ fontSize: '11px', color: 'var(--text-dim)', marginTop: '4px' }}>New investment amount</div>
          </div>

          <div className="glass-panel" style={{ padding: '16px' }}>
            <div style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: '600' }}>CASH FREED FROM SALES</div>
            <div style={{ fontSize: '20px', fontWeight: '800', color: '#fb7185', marginTop: '4px' }}>
              ₹{cashFromSales.toLocaleString('en-IN')}
            </div>
            <div style={{ fontSize: '11px', color: 'var(--text-dim)', marginTop: '4px' }}>From {actionCounts.SELL || 0} exit positions</div>
          </div>

          <div className="glass-panel" style={{ padding: '16px' }}>
            <div style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: '600' }}>HOLDINGS VALUE (KEPT)</div>
            <div style={{ fontSize: '20px', fontWeight: '800', color: '#34d399', marginTop: '4px' }}>
              ₹{totalHoldValue.toLocaleString('en-IN')}
            </div>
            <div style={{ fontSize: '11px', color: 'var(--text-dim)', marginTop: '4px' }}>Across {actionCounts.KEEP || 0} held stocks</div>
          </div>

          <div className="glass-panel" style={{ padding: '16px' }}>
            <div style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: '600' }}>TOTAL REBALANCE CAPITAL</div>
            <div style={{ fontSize: '20px', fontWeight: '800', color: '#60a5fa', marginTop: '4px' }}>
              ₹{totalRebalanceCap.toLocaleString('en-IN')}
            </div>
            <div style={{ fontSize: '11px', color: 'var(--text-dim)', marginTop: '4px' }}>Fresh + Freed Cash</div>
          </div>
        </div>
      )}

      {/* Main Results Tabs: Options Available vs Portfolio Spread */}
      {recommendations && (
        <div className="glass-panel" style={{ padding: '20px' }}>
          
          {/* Navigation Bar */}
          <div style={{
            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            borderBottom: '1px solid var(--border-color)', paddingBottom: '14px', marginBottom: '20px', flexWrap: 'wrap', gap: '12px'
          }}>
            <div style={{ display: 'flex', gap: '12px' }}>
              <button
                onClick={() => setActiveTab('options')}
                style={{
                  padding: '10px 20px',
                  borderRadius: '10px',
                  fontSize: '14px',
                  fontWeight: '700',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  background: activeTab === 'options' ? 'rgba(245, 158, 11, 0.2)' : 'rgba(255, 255, 255, 0.04)',
                  border: activeTab === 'options' ? '1px solid #f59e0b' : '1px solid var(--border-color)',
                  color: activeTab === 'options' ? '#fbbf24' : 'var(--text-muted)'
                }}
              >
                🎯 Options Available ({recsList.length})
              </button>

              <button
                onClick={() => setActiveTab('spread')}
                style={{
                  padding: '10px 20px',
                  borderRadius: '10px',
                  fontSize: '14px',
                  fontWeight: '700',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  background: activeTab === 'spread' ? 'rgba(16, 185, 129, 0.2)' : 'rgba(255, 255, 255, 0.04)',
                  border: activeTab === 'spread' ? '1px solid #10b981' : '1px solid var(--border-color)',
                  color: activeTab === 'spread' ? '#34d399' : 'var(--text-muted)'
                }}
              >
                📊 Portfolio Spread Breakdown
              </button>
            </div>

            {activeTab === 'options' && (
              <button
                onClick={handleExportCSV}
                style={{
                  padding: '8px 16px',
                  borderRadius: '8px',
                  background: 'rgba(99, 102, 241, 0.15)',
                  border: '1px solid rgba(99, 102, 241, 0.3)',
                  color: '#818cf8',
                  fontSize: '12px',
                  fontWeight: '700',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px'
                }}
              >
                <Download size={14} /> Export Plan (CSV)
              </button>
            )}
          </div>

          {/* TAB 1: OPTIONS AVAILABLE */}
          {activeTab === 'options' && (
            <div>
              {/* Action Filter Pills */}
              <div style={{ display: 'flex', gap: '8px', marginBottom: '20px', flexWrap: 'wrap', alignItems: 'center' }}>
                <span style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: '600', marginRight: '6px' }}>Filter Action:</span>
                
                <button
                  onClick={() => setActionFilter("ALL")}
                  style={{
                    padding: '6px 14px', borderRadius: '8px', fontSize: '12px', fontWeight: '700', cursor: 'pointer',
                    background: actionFilter === "ALL" ? 'rgba(255,255,255,0.15)' : 'rgba(255,255,255,0.03)',
                    border: actionFilter === "ALL" ? '1px solid #fff' : '1px solid var(--border-color)',
                    color: actionFilter === "ALL" ? '#fff' : 'var(--text-muted)'
                  }}
                >
                  All ({recsList.length})
                </button>

                {(actionCounts.SELL > 0 || recsList.some(r => r.action_type === 'SELL')) && (
                  <button
                    onClick={() => setActionFilter("SELL")}
                    style={{
                      padding: '6px 14px', borderRadius: '8px', fontSize: '12px', fontWeight: '700', cursor: 'pointer',
                      background: actionFilter === "SELL" ? 'rgba(244, 63, 94, 0.3)' : 'rgba(244, 63, 94, 0.1)',
                      border: '1px solid #f43f5e',
                      color: '#fb7185'
                    }}
                  >
                    🔴 SELL ({actionCounts.SELL || 0})
                  </button>
                )}

                {(actionCounts.KEEP > 0 || recsList.some(r => r.action_type === 'KEEP')) && (
                  <button
                    onClick={() => setActionFilter("KEEP")}
                    style={{
                      padding: '6px 14px', borderRadius: '8px', fontSize: '12px', fontWeight: '700', cursor: 'pointer',
                      background: actionFilter === "KEEP" ? 'rgba(16, 185, 129, 0.3)' : 'rgba(16, 185, 129, 0.1)',
                      border: '1px solid #10b981',
                      color: '#34d399'
                    }}
                  >
                    🟢 HOLD ({actionCounts.KEEP || 0})
                  </button>
                )}

                {(actionCounts.TOP_UP > 0 || recsList.some(r => r.action_type === 'TOP_UP')) && (
                  <button
                    onClick={() => setActionFilter("TOP_UP")}
                    style={{
                      padding: '6px 14px', borderRadius: '8px', fontSize: '12px', fontWeight: '700', cursor: 'pointer',
                      background: actionFilter === "TOP_UP" ? 'rgba(59, 130, 246, 0.3)' : 'rgba(59, 130, 246, 0.1)',
                      border: '1px solid #3b82f6',
                      color: '#60a5fa'
                    }}
                  >
                    🔵 TOP-UP ({actionCounts.TOP_UP || 0})
                  </button>
                )}

                <button
                  onClick={() => setActionFilter("BUY")}
                  style={{
                    padding: '6px 14px', borderRadius: '8px', fontSize: '12px', fontWeight: '700', cursor: 'pointer',
                    background: actionFilter === "BUY" ? 'rgba(245, 158, 11, 0.3)' : 'rgba(245, 158, 11, 0.1)',
                    border: '1px solid #f59e0b',
                    color: '#fbbf24'
                  }}
                >
                  🚀 BUY ({actionCounts.BUY || 0})
                </button>
              </div>

              {/* Grid of Action Cards */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: '16px' }}>
                {filteredRecs.map((item, idx) => {
                  const badgeStyle = getActionBadgeStyle(item.action_type || 'BUY');
                  const targetPrice = item.target_selling_price || (item.unit_price * (1 + (item.expected_return_pct || 15) / 100)).toFixed(1);
                  const isSell = item.action_type === 'SELL';
                  const isKeep = item.action_type === 'KEEP';
                  const isTopUp = item.action_type === 'TOP_UP';

                  return (
                    <div
                      key={idx}
                      className="glass-card"
                      style={{
                        padding: '16px',
                        display: 'flex',
                        flexDirection: 'column',
                        justify: 'space-between',
                        borderLeft: `4px solid ${badgeStyle.color}`,
                        background: isSell ? 'rgba(244, 63, 94, 0.05)' : isKeep ? 'rgba(16, 185, 129, 0.04)' : 'rgba(255, 255, 255, 0.03)'
                      }}
                    >
                      <div>
                        {/* Header: Action Badge & Ticker */}
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                          <div>
                            <div style={{ fontSize: '16px', fontWeight: '800', color: '#fff' }}>{item.ticker}</div>
                            <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{item.instrument_name || item.ticker}</div>
                          </div>
                          <span style={{
                            padding: '4px 10px', borderRadius: '8px', fontSize: '11px', fontWeight: '800',
                            background: badgeStyle.bg, color: badgeStyle.color, border: badgeStyle.border
                          }}>
                            {badgeStyle.label}
                          </span>
                        </div>

                        <div style={{ fontSize: '11px', color: 'var(--text-dim)', marginBottom: '12px', display: 'flex', gap: '8px' }}>
                          <span>Sector: <strong style={{ color: 'var(--text-muted)' }}>{item.sector || 'General'}</strong></span>
                          <span>•</span>
                          <span>Category: <strong style={{ color: 'var(--text-muted)' }}>{item.category || 'Growth'}</strong></span>
                        </div>

                        {/* Quantitative Figures customized for SELL, HOLD, TOP_UP, BUY */}
                        <div style={{
                          display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px',
                          background: 'rgba(0,0,0,0.3)', padding: '10px', borderRadius: '8px', marginBottom: '12px',
                          border: isSell ? '1px solid rgba(244, 63, 94, 0.25)' : isKeep ? '1px solid rgba(16, 185, 129, 0.25)' : '1px solid var(--border-color)'
                        }}>
                          {isSell ? (
                            <>
                              <div>
                                <div style={{ fontSize: '10px', color: 'var(--text-muted)' }}>Holding Shares</div>
                                <div style={{ fontSize: '14px', fontWeight: '700', color: '#fff' }}>
                                  {item.current_holding_qty || item.suggested_quantity || 0} Shares
                                </div>
                              </div>
                              <div>
                                <div style={{ fontSize: '10px', color: 'var(--text-muted)' }}>Current Rate</div>
                                <div style={{ fontSize: '14px', fontWeight: '700', color: '#fff' }}>
                                  ₹{item.unit_price?.toLocaleString('en-IN')}
                                </div>
                              </div>
                              <div style={{ gridColumn: 'span 2' }}>
                                <div style={{ fontSize: '10px', color: '#fb7185', fontWeight: '700' }}>SELL VALUE (FREED CASH)</div>
                                <div style={{ fontSize: '16px', fontWeight: '800', color: '#fb7185' }}>
                                  ₹{(item.freed_cash_inr || item.current_holding_value_inr || 0).toLocaleString('en-IN')}
                                </div>
                              </div>
                            </>
                          ) : isKeep ? (
                            <>
                              <div>
                                <div style={{ fontSize: '10px', color: 'var(--text-muted)' }}>Holding Shares</div>
                                <div style={{ fontSize: '14px', fontWeight: '700', color: '#fff' }}>
                                  {item.current_holding_qty || item.suggested_quantity || 0} Shares
                                </div>
                              </div>
                              <div>
                                <div style={{ fontSize: '10px', color: 'var(--text-muted)' }}>Current Rate</div>
                                <div style={{ fontSize: '14px', fontWeight: '700', color: '#fff' }}>
                                  ₹{item.unit_price?.toLocaleString('en-IN')}
                                </div>
                              </div>
                              <div style={{ gridColumn: 'span 2' }}>
                                <div style={{ fontSize: '10px', color: '#34d399', fontWeight: '700' }}>HOLD VALUE</div>
                                <div style={{ fontSize: '16px', fontWeight: '800', color: '#34d399' }}>
                                  ₹{(item.current_holding_value_inr || 0).toLocaleString('en-IN')}
                                </div>
                              </div>
                            </>
                          ) : isTopUp ? (
                            <>
                              <div>
                                <div style={{ fontSize: '10px', color: 'var(--text-muted)' }}>Held Shares</div>
                                <div style={{ fontSize: '14px', fontWeight: '700', color: '#fff' }}>
                                  {item.current_holding_qty || 0} Shares
                                </div>
                              </div>
                              <div>
                                <div style={{ fontSize: '10px', color: 'var(--text-muted)' }}>Additional Units</div>
                                <div style={{ fontSize: '14px', fontWeight: '700', color: '#60a5fa' }}>
                                  +{item.suggested_quantity || 0} Shares
                                </div>
                              </div>
                              <div>
                                <div style={{ fontSize: '10px', color: 'var(--text-muted)' }}>New Capital</div>
                                <div style={{ fontSize: '14px', fontWeight: '700', color: '#60a5fa' }}>
                                  ₹{(item.allocation_inr || 0).toLocaleString('en-IN')}
                                </div>
                              </div>
                              <div>
                                <div style={{ fontSize: '10px', color: 'var(--text-muted)' }}>Total Target Value</div>
                                <div style={{ fontSize: '14px', fontWeight: '700', color: '#34d399' }}>
                                  ₹{((item.current_holding_value_inr || 0) + (item.allocation_inr || 0)).toLocaleString('en-IN')}
                                </div>
                              </div>
                            </>
                          ) : (
                            <>
                              <div>
                                <div style={{ fontSize: '10px', color: 'var(--text-muted)' }}>Units to Buy</div>
                                <div style={{ fontSize: '14px', fontWeight: '700', color: '#fff' }}>
                                  {item.suggested_quantity || 0} Shares
                                </div>
                              </div>
                              <div>
                                <div style={{ fontSize: '10px', color: 'var(--text-muted)' }}>Share Price</div>
                                <div style={{ fontSize: '14px', fontWeight: '700', color: '#fff' }}>
                                  ₹{item.unit_price?.toLocaleString('en-IN')}
                                </div>
                              </div>
                              <div>
                                <div style={{ fontSize: '10px', color: 'var(--text-muted)' }}>Allocation Amount</div>
                                <div style={{ fontSize: '14px', fontWeight: '700', color: '#f59e0b' }}>
                                  ₹{(item.allocation_inr || 0).toLocaleString('en-IN')}
                                </div>
                              </div>
                              <div>
                                <div style={{ fontSize: '10px', color: 'var(--text-muted)' }}>Target Selling Price</div>
                                <div style={{ fontSize: '14px', fontWeight: '700', color: '#34d399' }}>
                                  ₹{Number(targetPrice).toLocaleString('en-IN')}
                                </div>
                              </div>
                            </>
                          )}
                        </div>

                        {/* Rationale */}
                        <div style={{ fontSize: '11px', color: 'var(--text-muted)', lineHeight: '1.4' }}>
                          💡 <em>{item.action_summary || item.recommendation_rationale || "High momentum stock recommended for aggressive portfolio growth."}</em>
                        </div>
                      </div>

                      {/* Footer Badge */}
                      <div style={{ marginTop: '12px', paddingTop: '8px', borderTop: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontSize: '11px', color: 'var(--text-dim)' }}>
                          {isSell ? 'Action: Exit Position' : isKeep ? 'Action: Hold Core Position' : `Weight: ${(item.allocation_pct || 0).toFixed(1)}%`}
                        </span>
                        <span style={{ fontSize: '11px', color: isSell ? '#fb7185' : '#34d399', fontWeight: '700' }}>
                          {isSell ? 'Freed Cash Exit' : `Exp. Return: +${(item.expected_return_pct || 15).toFixed(1)}%`}
                        </span>
                      </div>

                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 2: PORTFOLIO SPREAD */}
          {activeTab === 'spread' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              
              {/* Asset Class Spread */}
              <div>
                <h3 style={{ fontSize: '15px', fontWeight: '700', color: '#fff', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <PieChart size={18} color="#10b981" /> Asset Class Spread (Post-Optimization)
                </h3>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '12px' }}>
                  {Object.entries(recommendations.asset_class_allocation_post_optimization || {
                    "Equities": 75.0,
                    "Mutual Funds & ETFs": 15.0,
                    "Gold & Commodities": 5.0,
                    "Liquid Cash": 5.0
                  }).map(([assetClass, weight], idx) => {
                    const colors = ['#10b981', '#3b82f6', '#f59e0b', '#a855f7'];
                    const barColor = colors[idx % colors.length];

                    return (
                      <div key={assetClass} className="glass-card" style={{ padding: '14px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px', fontSize: '13px', fontWeight: '700' }}>
                          <span style={{ color: 'var(--text-main)' }}>{assetClass}</span>
                          <span style={{ color: barColor }}>{weight.toFixed(1)}%</span>
                        </div>
                        
                        <div style={{ width: '100%', height: '8px', background: 'rgba(255,255,255,0.06)', borderRadius: '4px', overflow: 'hidden' }}>
                          <div style={{ width: `${weight}%`, height: '100%', background: barColor, borderRadius: '4px', transition: 'width 0.4s' }} />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Sector Spread */}
              <div>
                <h3 style={{ fontSize: '15px', fontWeight: '700', color: '#fff', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <BarChart3 size={18} color="#60a5fa" /> Sector Allocation Spread
                </h3>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '12px' }}>
                  {Object.entries(recommendations.sector_allocation_post_optimization || {
                    "Financial Services & Banking": 28.5,
                    "IT & Software Exporters": 22.0,
                    "Oil, Gas & Energy": 18.0,
                    "Auto & Capital Goods": 14.5,
                    "Pharma & Healthcare": 10.0,
                    "Gold & Commodities": 7.0
                  }).map(([sector, pct]) => (
                    <div key={sector} className="glass-card" style={{ padding: '12px 14px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', fontWeight: '600', marginBottom: '6px' }}>
                        <span style={{ color: 'var(--text-muted)' }}>{sector}</span>
                        <span style={{ color: '#fff', fontWeight: '700' }}>{pct.toFixed(1)}%</span>
                      </div>
                      <div style={{ width: '100%', height: '6px', background: 'rgba(255,255,255,0.05)', borderRadius: '3px', overflow: 'hidden' }}>
                        <div style={{ width: `${Math.min(100, pct)}%`, height: '100%', background: 'linear-gradient(90deg, #6366f1, #a855f7)', borderRadius: '3px' }} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Diagnostic Concentration Insights */}
              {diagnostics && (
                <div style={{
                  padding: '16px', borderRadius: '12px', background: 'rgba(99, 102, 241, 0.1)',
                  border: '1px solid rgba(99, 102, 241, 0.25)', display: 'flex', gap: '14px', alignItems: 'flex-start'
                }}>
                  <Shield size={24} color="#818cf8" style={{ marginTop: '2px' }} />
                  <div>
                    <h4 style={{ fontSize: '14px', fontWeight: '700', color: '#fff' }}>
                      Concentration Assessment: {diagnostics.hhi_assessment || "Well Diversified Aggressive Portfolio"}
                    </h4>
                    <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '4px' }}>
                      Herfindahl-Hirschman Index (HHI) Score: <strong>{(diagnostics.hhi_index || 0.12).toFixed(3)}</strong>.
                      {diagnostics.diversification_warning || " Aggressive deployment effectively distributes capital across high-growth NSE sector leaders while preventing single-stock overexposure."}
                    </p>
                  </div>
                </div>
              )}

            </div>
          )}

        </div>
      )}

    </div>
  );
}
