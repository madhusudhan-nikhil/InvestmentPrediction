import React, { useState, useMemo } from 'react';
import { 
  Upload, FileText, CheckCircle2, TrendingUp, PieChart, 
  BarChart3, Download, Zap, AlertCircle, ArrowUpRight, 
  RefreshCw, Sparkles, Shield, DollarSign, Layers, ShieldCheck, Flame, 
  ArrowDownRight, Plus, Trash2, HelpCircle, Activity, Globe, LayoutGrid, Table
} from 'lucide-react';
import { formatINR, formatINRDenomination } from '../utils/formatters';

export default function SimplePortfolioPlanner({
  availableCapital, setAvailableCapital,
  riskProfile, setRiskProfile,
  assetTypePreference, setAssetTypePreference,
  holdings, setHoldings,
  diagnostics,
  recommendations,
  macroPulse,
  loading,
  onUploadCSV,
  onLoadSamplePortfolio,
  onRunOptimization,
  onOpenManualModal,
  onClearPortfolio,
  onOpenBrokerModal,
  onOpenGlossary,
  onShowToast
}) {
  const [dragOver, setDragOver] = useState(false);
  const [activeTab, setActiveTab] = useState("options"); // 'options' | 'spread'
  const [viewStyle, setViewStyle] = useState("card"); // 'card' | 'table'
  const [actionFilter, setActionFilter] = useState("ALL"); // ALL | SELL | KEEP | TOP_UP | BUY
  const [sortField, setSortField] = useState("allocation_inr");
  const [sortAsc, setSortAsc] = useState(false);

  const presets = [
    { label: '₹50K', value: 50000 },
    { label: '₹1 Lakh', value: 100000 },
    { label: '₹2 Lakhs', value: 200000 },
    { label: '₹5 Lakhs', value: 500000 },
    { label: '₹10 Lakhs', value: 1000000 },
    { label: '₹25 Lakhs', value: 2500000 }
  ];

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      if (file.name.endsWith('.csv') || file.name.endsWith('.xlsx') || file.name.endsWith('.xls')) {
        onUploadCSV(file);
      } else if (onShowToast) {
        onShowToast("Please upload a CSV or Excel file (.csv, .xlsx, .xls)", "warning");
      }
    }
  };

  const handleFileSelect = (e) => {
    if (e.target.files && e.target.files[0]) {
      onUploadCSV(e.target.files[0]);
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
    a.download = "BharatiQuant_Simple_Allocation_Plan.csv";
    a.click();
    if (onShowToast) onShowToast("Exported allocation plan to CSV!");
  };

  // ⚡ Bolt Optimization: Memoize the inline fallback array reference to prevent
  // triggering downstream useEffects/useMemos on every render if the parent passes undefined.
  // Helper formatting values
  const recsList = useMemo(() => recommendations?.recommendations || [], [recommendations?.recommendations]);
  const freshCap = recommendations?.fresh_capital_inr || availableCapital || 0;
  const cashFromSales = recommendations?.cash_generated_from_sales_inr || 0;
  const totalRebalanceCap = recommendations?.total_rebalancing_capital_inr || (freshCap + cashFromSales);
  const healthScore = diagnostics?.portfolio_health_score || 85;

  const actionCounts = useMemo(() => recommendations?.action_counts || {
    SELL: recsList.filter(r => r.action_type === 'SELL').length,
    KEEP: recsList.filter(r => r.action_type === 'KEEP').length,
    TOP_UP: recsList.filter(r => r.action_type === 'TOP_UP').length,
    BUY: recsList.filter(r => r.action_type === 'BUY').length,
  }, [recommendations?.action_counts, recsList]);

  const filteredRecs = useMemo(() => {
    return [...recsList].filter(r => {
      if (actionFilter === "ALL") return true;
      return (r.action_type || "BUY") === actionFilter;
    }).sort((a, b) => {
      let valA = a[sortField] ?? 0;
      let valB = b[sortField] ?? 0;
      if (typeof valA === 'string') valA = valA.toLowerCase();
      if (typeof valB === 'string') valB = valB.toLowerCase();
      if (valA < valB) return sortAsc ? -1 : 1;
      if (valA > valB) return sortAsc ? 1 : -1;
      return 0;
    });
  }, [recsList, actionFilter, sortField, sortAsc]);

  const getActionBadgeStyle = (actionType) => {
    switch (actionType) {
      case 'SELL': return { bg: 'rgba(244, 63, 94, 0.18)', color: '#fb7185', border: '1px solid #f43f5e', label: '🔴 SELL' };
      case 'KEEP': return { bg: 'rgba(16, 185, 129, 0.18)', color: '#34d399', border: '1px solid #10b981', label: '🟢 HOLD' };
      case 'TOP_UP': return { bg: 'rgba(59, 130, 246, 0.18)', color: '#60a5fa', border: '1px solid #3b82f6', label: '🔵 TOP-UP' };
      case 'BUY': default: return { bg: 'rgba(245, 158, 11, 0.18)', color: '#fbbf24', border: '1px solid #f59e0b', label: '🚀 BUY' };
    }
  };

  const totalHoldValue = recsList.filter(r => r.action_type === 'KEEP').reduce((sum, r) => sum + (r.current_holding_value_inr || 0), 0);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', width: '100%', maxWidth: '1200px', margin: '0 auto' }}>
      
      {/* 1. Live Indian Macro Pulse Banner in Simple View */}
      {macroPulse && (
        <div className="glass-panel" style={{
          padding: '12px 20px',
          background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.08) 0%, rgba(99, 102, 241, 0.08) 100%)',
          display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px', flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Flame size={18} color={macroPulse.threat_score < 45 ? "#10b981" : "#f59e0b"} />
              <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Market Threat Score:</span>
              <strong style={{ fontSize: '13px', color: macroPulse.threat_score < 45 ? "#34d399" : "#fbbf24" }}>
                {macroPulse.threat_score}/100
              </strong>
            </div>

            <div style={{ height: '16px', width: '1px', background: 'var(--border-color)' }} />

            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Globe size={16} color="#06b6d4" />
              <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Regime:</span>
              <strong style={{ fontSize: '12px', color: '#fff' }}>{macroPulse.active_regime}</strong>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', fontSize: '11px', color: 'var(--text-muted)', flexWrap: 'wrap' }}>
            <span>Crude: <strong style={{ color: '#fff' }}>${macroPulse.brent_crude_usd}</strong></span>
            <span>USD/INR: <strong style={{ color: '#fff' }}>₹{macroPulse.usd_inr}</strong></span>
            <span>India VIX: <strong style={{ color: '#fff' }}>{macroPulse.india_vix}</strong></span>
            {onOpenGlossary && (
              <button
                onClick={onOpenGlossary}
                type="button"
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: '#818cf8',
                  fontSize: '11px',
                  fontWeight: '700',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px'
                }}
              >
                <HelpCircle size={13} /> Quant Terms Guide
              </button>
            )}
          </div>
        </div>
      )}

      {/* 2. Main Input Control Panel */}
      <div className="glass-panel" style={{ padding: '24px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '24px', alignItems: 'start' }}>
          
          {/* Step 1: Upload or Enter Portfolio */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <label style={{ fontSize: '13px', fontWeight: '700', color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Upload size={16} color="#10b981" /> Step 1: Portfolio Holdings (Optional)
              </label>
              {holdings.length > 0 && (
                <span style={{ fontSize: '11px', padding: '2px 8px', borderRadius: '6px', background: 'rgba(16, 185, 129, 0.2)', color: '#34d399', fontWeight: '700' }}>
                  {holdings.length} stocks loaded
                </span>
              )}
            </div>

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
              onClick={() => document.getElementById('simpleCsvFileInput').click()}
            >
              <input
                type="file"
                id="simpleCsvFileInput"
                accept=".csv,.xlsx,.xls"
                style={{ display: 'none' }}
                onChange={handleFileSelect}
              />
              
              {holdings.length > 0 ? (
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', color: '#34d399' }}>
                  <FileText size={20} />
                  <span style={{ fontSize: '13px', fontWeight: '600' }}>{holdings.length} Holdings Configured</span>
                  <CheckCircle2 size={16} color="#10b981" />
                </div>
              ) : (
                <div>
                  <Upload size={26} color="var(--text-muted)" style={{ marginBottom: '6px' }} />
                  <div style={{ fontSize: '13px', fontWeight: '600', color: 'var(--text-main)' }}>
                    Drop your CSV file here or <span style={{ color: '#10b981', textDecoration: 'underline' }}>browse</span>
                  </div>
                  <div style={{ fontSize: '11px', color: 'var(--text-dim)', marginTop: '3px' }}>
                    Zerodha, Groww, AngelOne CSV or Custom format
                  </div>
                </div>
              )}
            </div>

            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              <button
                onClick={onOpenManualModal}
                type="button"
                style={{
                  padding: '6px 12px',
                  borderRadius: '8px',
                  background: 'rgba(16, 185, 129, 0.12)',
                  border: '1px solid rgba(16, 185, 129, 0.3)',
                  color: '#34d399',
                  fontSize: '11px',
                  fontWeight: '700',
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '4px'
                }}
              >
                <Plus size={13} /> Add Stock Manually
              </button>

              <button
                onClick={onLoadSamplePortfolio}
                type="button"
                style={{
                  padding: '6px 12px',
                  borderRadius: '8px',
                  background: 'rgba(99, 102, 241, 0.1)',
                  border: '1px solid rgba(99, 102, 241, 0.25)',
                  color: '#818cf8',
                  fontSize: '11px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '4px'
                }}
              >
                ⚡ Load Sample Nifty 50
              </button>

              {holdings.length > 0 && (
                <button
                  onClick={onClearPortfolio}
                  type="button"
                  style={{
                    padding: '6px 10px',
                    borderRadius: '8px',
                    background: 'transparent',
                    border: '1px solid rgba(244, 63, 94, 0.25)',
                    color: '#fb7185',
                    fontSize: '11px',
                    fontWeight: '600',
                    cursor: 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '4px'
                  }}
                >
                  <Trash2 size={12} /> Clear
                </button>
              )}
            </div>
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

            {/* Indian Denomination Preview */}
            <div style={{ fontSize: '11px', color: '#fbbf24', fontWeight: '700', paddingLeft: '2px' }}>
              Amount: {formatINRDenomination(availableCapital)}
            </div>

            {/* Quick Presets */}
            <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
              {presets.map(p => (
                <button
                  key={p.value}
                  onClick={() => setAvailableCapital(p.value)}
                  type="button"
                  style={{
                    padding: '5px 10px',
                    borderRadius: '8px',
                    fontSize: '11px',
                    fontWeight: '700',
                    cursor: 'pointer',
                    background: availableCapital === p.value ? 'rgba(245, 158, 11, 0.25)' : 'rgba(255, 255, 255, 0.04)',
                    border: availableCapital === p.value ? '1px solid #f59e0b' : '1px solid var(--border-color)',
                    color: availableCapital === p.value ? '#fbbf24' : 'var(--text-muted)',
                    transition: 'all 0.15s'
                  }}
                >
                  {p.label}
                </button>
              ))}
            </div>

            {/* Strategy & Risk Selector Pills */}
            <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginTop: '4px' }}>
              <span style={{ fontSize: '11px', color: 'var(--text-dim)', fontWeight: '600' }}>Risk:</span>
              {['Conservative', 'Moderate', 'Aggressive'].map(r => (
                <button
                  key={r}
                  onClick={() => setRiskProfile(r)}
                  type="button"
                  style={{
                    padding: '3px 8px',
                    borderRadius: '6px',
                    fontSize: '11px',
                    fontWeight: '700',
                    cursor: 'pointer',
                    background: riskProfile === r ? 'rgba(168, 85, 247, 0.25)' : 'rgba(255, 255, 255, 0.04)',
                    border: riskProfile === r ? '1px solid #a855f7' : '1px solid var(--border-color)',
                    color: riskProfile === r ? '#c084fc' : 'var(--text-muted)'
                  }}
                >
                  {r}
                </button>
              ))}
            </div>
          </div>

        </div>

        {/* Action Compute Button */}
        <div style={{ marginTop: '20px', display: 'flex', justifyContent: 'flex-end' }}>
          <button
            onClick={onRunOptimization}
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
                <RefreshCw size={18} className="spin-animation" /> Computing Plan...
              </>
            ) : (
              <>
                🚀 Compute Options & Portfolio Spread
              </>
            )}
          </button>
        </div>

      </div>

      {/* 3. Summary KPI Cards */}
      {recommendations && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px' }}>
          <div className="glass-panel" style={{ padding: '16px' }}>
            <div style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: '600' }}>FRESH CAPITAL TO ADD</div>
            <div style={{ fontSize: '20px', fontWeight: '800', color: '#f59e0b', marginTop: '4px' }}>
              ₹{formatINR(freshCap)}
            </div>
            <div style={{ fontSize: '11px', color: 'var(--text-dim)', marginTop: '4px' }}>{formatINRDenomination(freshCap)} deployment</div>
          </div>

          <div className="glass-panel" style={{ padding: '16px' }}>
            <div style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: '600' }}>CASH FREED FROM SALES</div>
            <div style={{ fontSize: '20px', fontWeight: '800', color: '#fb7185', marginTop: '4px' }}>
              ₹{formatINR(cashFromSales)}
            </div>
            <div style={{ fontSize: '11px', color: 'var(--text-dim)', marginTop: '4px' }}>From {actionCounts.SELL || 0} exit positions</div>
          </div>

          <div className="glass-panel" style={{ padding: '16px' }}>
            <div style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: '600' }}>HOLDINGS VALUE (KEPT)</div>
            <div style={{ fontSize: '20px', fontWeight: '800', color: '#34d399', marginTop: '4px' }}>
              ₹{formatINR(totalHoldValue)}
            </div>
            <div style={{ fontSize: '11px', color: 'var(--text-dim)', marginTop: '4px' }}>Across {actionCounts.KEEP || 0} held stocks</div>
          </div>

          <div className="glass-panel" style={{ padding: '16px' }}>
            <div style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: '600' }}>TOTAL REBALANCE CAPITAL</div>
            <div style={{ fontSize: '20px', fontWeight: '800', color: '#60a5fa', marginTop: '4px' }}>
              ₹{formatINR(totalRebalanceCap)}
            </div>
            <div style={{ fontSize: '11px', color: 'var(--text-dim)', marginTop: '4px' }}>Fresh + Freed Cash</div>
          </div>
        </div>
      )}

      {/* 4. Main Results Tabs: Options vs Portfolio Spread */}
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

            {/* Action Buttons: 1-Click Broker & Export CSV */}
            <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
              {onOpenBrokerModal && (
                <button
                  onClick={onOpenBrokerModal}
                  style={{
                    padding: '8px 16px',
                    borderRadius: '8px',
                    background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
                    color: '#000',
                    fontSize: '12px',
                    fontWeight: '800',
                    cursor: 'pointer',
                    border: 'none',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    boxShadow: '0 2px 10px rgba(245, 158, 11, 0.3)'
                  }}
                >
                  <Zap size={14} /> ⚡ 1-Click Broker Execution
                </button>
              )}

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
            </div>
          </div>

          {/* TAB 1: OPTIONS AVAILABLE */}
          {activeTab === 'options' && (
            <div>
              {/* Filter Pills & View Switcher */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '12px' }}>
                {/* Action Filter Pills */}
                <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', alignItems: 'center' }}>
                  <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: '700', marginRight: '4px' }}>FILTER:</span>
                  
                  <button
                    onClick={() => setActionFilter("ALL")}
                    style={{
                      padding: '5px 12px', borderRadius: '6px', fontSize: '11px', fontWeight: '700', cursor: 'pointer',
                      background: actionFilter === "ALL" ? 'rgba(255,255,255,0.15)' : 'rgba(255,255,255,0.03)',
                      border: actionFilter === "ALL" ? '1px solid #fff' : '1px solid var(--border-color)',
                      color: actionFilter === "ALL" ? '#fff' : 'var(--text-muted)'
                    }}
                  >
                    All ({recsList.length})
                  </button>

                  {actionCounts.SELL > 0 && (
                    <button
                      onClick={() => setActionFilter("SELL")}
                      style={{
                        padding: '5px 12px', borderRadius: '6px', fontSize: '11px', fontWeight: '700', cursor: 'pointer',
                        background: actionFilter === "SELL" ? 'rgba(244, 63, 94, 0.3)' : 'rgba(244, 63, 94, 0.1)',
                        border: '1px solid #f43f5e',
                        color: '#fb7185'
                      }}
                    >
                      🔴 SELL ({actionCounts.SELL || 0})
                    </button>
                  )}

                  {actionCounts.KEEP > 0 && (
                    <button
                      onClick={() => setActionFilter("KEEP")}
                      style={{
                        padding: '5px 12px', borderRadius: '6px', fontSize: '11px', fontWeight: '700', cursor: 'pointer',
                        background: actionFilter === "KEEP" ? 'rgba(16, 185, 129, 0.3)' : 'rgba(16, 185, 129, 0.1)',
                        border: '1px solid #10b981',
                        color: '#34d399'
                      }}
                    >
                      🟢 HOLD ({actionCounts.KEEP || 0})
                    </button>
                  )}

                  {actionCounts.TOP_UP > 0 && (
                    <button
                      onClick={() => setActionFilter("TOP_UP")}
                      style={{
                        padding: '5px 12px', borderRadius: '6px', fontSize: '11px', fontWeight: '700', cursor: 'pointer',
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
                      padding: '5px 12px', borderRadius: '6px', fontSize: '11px', fontWeight: '700', cursor: 'pointer',
                      background: actionFilter === "BUY" ? 'rgba(245, 158, 11, 0.3)' : 'rgba(245, 158, 11, 0.1)',
                      border: '1px solid #f59e0b',
                      color: '#fbbf24'
                    }}
                  >
                    🚀 BUY ({actionCounts.BUY || 0})
                  </button>
                </div>

                {/* Card vs Table View Toggle Switcher */}
                <div style={{
                  display: 'flex', background: 'rgba(0,0,0,0.3)', borderRadius: '8px',
                  border: '1px solid var(--border-color)', padding: '2px'
                }}>
                  <button
                    onClick={() => setViewStyle('card')}
                    style={{
                      padding: '4px 10px', borderRadius: '6px', border: 'none', cursor: 'pointer',
                      background: viewStyle === 'card' ? 'rgba(255,255,255,0.12)' : 'transparent',
                      color: viewStyle === 'card' ? '#fff' : 'var(--text-dim)',
                      fontSize: '11px', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '4px'
                    }}
                  >
                    <LayoutGrid size={13} /> Cards
                  </button>
                  <button
                    onClick={() => setViewStyle('table')}
                    style={{
                      padding: '4px 10px', borderRadius: '6px', border: 'none', cursor: 'pointer',
                      background: viewStyle === 'table' ? 'rgba(255,255,255,0.12)' : 'transparent',
                      color: viewStyle === 'table' ? '#fff' : 'var(--text-dim)',
                      fontSize: '11px', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '4px'
                    }}
                  >
                    <Table size={13} /> Table
                  </button>
                </div>
              </div>

              {/* CARD VIEW MODE */}
              {viewStyle === 'card' ? (
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
                          justifyContent: 'space-between',
                          borderLeft: `4px solid ${badgeStyle.color}`,
                          background: isSell ? 'rgba(244, 63, 94, 0.05)' : isKeep ? 'rgba(16, 185, 129, 0.04)' : 'rgba(255, 255, 255, 0.03)'
                        }}
                      >
                        <div>
                          {/* Header */}
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

                          {/* Quant Figures */}
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
                                    ₹{formatINR(item.unit_price)}
                                  </div>
                                </div>
                                <div style={{ gridColumn: 'span 2' }}>
                                  <div style={{ fontSize: '10px', color: '#fb7185', fontWeight: '700' }}>SELL VALUE (FREED CASH)</div>
                                  <div style={{ fontSize: '16px', fontWeight: '800', color: '#fb7185' }}>
                                    ₹{formatINR(item.freed_cash_inr || item.current_holding_value_inr || 0)}
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
                                    ₹{formatINR(item.unit_price)}
                                  </div>
                                </div>
                                <div style={{ gridColumn: 'span 2' }}>
                                  <div style={{ fontSize: '10px', color: '#34d399', fontWeight: '700' }}>HOLD VALUE</div>
                                  <div style={{ fontSize: '16px', fontWeight: '800', color: '#34d399' }}>
                                    ₹{formatINR(item.current_holding_value_inr || 0)}
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
                                    ₹{formatINR(item.allocation_inr || 0)}
                                  </div>
                                </div>
                                <div>
                                  <div style={{ fontSize: '10px', color: 'var(--text-muted)' }}>Total Target Value</div>
                                  <div style={{ fontSize: '14px', fontWeight: '700', color: '#34d399' }}>
                                    ₹{formatINR((item.current_holding_value_inr || 0) + (item.allocation_inr || 0))}
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
                                    ₹{formatINR(item.unit_price)}
                                  </div>
                                </div>
                                <div>
                                  <div style={{ fontSize: '10px', color: 'var(--text-muted)' }}>Allocation Amount</div>
                                  <div style={{ fontSize: '14px', fontWeight: '700', color: '#f59e0b' }}>
                                    ₹{formatINR(item.allocation_inr || 0)}
                                  </div>
                                </div>
                                <div>
                                  <div style={{ fontSize: '10px', color: 'var(--text-muted)' }}>Target Sell Price</div>
                                  <div style={{ fontSize: '14px', fontWeight: '700', color: '#34d399' }}>
                                    ₹{formatINR(targetPrice)}
                                  </div>
                                </div>
                              </>
                            )}
                          </div>

                          {/* Rationale */}
                          <div style={{ fontSize: '11px', color: 'var(--text-muted)', lineHeight: '1.4' }}>
                            💡 <em>{item.action_summary || item.recommendation_rationale || "High momentum stock recommended for portfolio optimization."}</em>
                          </div>
                        </div>

                        {/* Footer */}
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
              ) : (
                /* TABLE VIEW MODE */
                <div style={{ overflowX: 'auto', borderRadius: '10px', border: '1px solid var(--border-color)', background: 'rgba(0,0,0,0.2)' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px' }}>
                    <thead>
                      <tr style={{ borderBottom: '1px solid var(--border-color)', color: 'var(--text-muted)', background: 'rgba(255,255,255,0.02)' }}>
                        <th style={{ padding: '10px', textAlign: 'left' }}>Action</th>
                        <th style={{ padding: '10px', textAlign: 'left' }}>Ticker</th>
                        <th style={{ padding: '10px', textAlign: 'left' }}>Instrument</th>
                        <th style={{ padding: '10px', textAlign: 'right' }}>Current Price</th>
                        <th style={{ padding: '10px', textAlign: 'right' }}>Target Price</th>
                        <th style={{ padding: '10px', textAlign: 'right' }}>Qty</th>
                        <th style={{ padding: '10px', textAlign: 'right' }}>Allocation (₹)</th>
                        <th style={{ padding: '10px', textAlign: 'right' }}>Weight %</th>
                        <th style={{ padding: '10px', textAlign: 'right' }}>Exp. Return</th>
                        <th style={{ padding: '10px', textAlign: 'left' }}>Category</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredRecs.map((r, i) => {
                        const badge = getActionBadgeStyle(r.action_type || 'BUY');
                        const isSell = r.action_type === 'SELL';
                        return (
                          <tr key={i} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                            <td style={{ padding: '10px' }}>
                              <span style={{ padding: '2px 6px', borderRadius: '4px', background: badge.bg, color: badge.color, border: badge.border, fontSize: '10px', fontWeight: '800' }}>
                                {r.action_type || 'BUY'}
                              </span>
                            </td>
                            <td style={{ padding: '10px', fontWeight: '800', color: '#fff' }}>{r.ticker}</td>
                            <td style={{ padding: '10px', color: 'var(--text-muted)' }}>{r.instrument_name || r.ticker}</td>
                            <td style={{ padding: '10px', textAlign: 'right' }}>₹{formatINR(r.unit_price)}</td>
                            <td style={{ padding: '10px', textAlign: 'right', color: '#34d399', fontWeight: '700' }}>
                              ₹{formatINR(r.target_selling_price || (r.unit_price * 1.15).toFixed(1))}
                            </td>
                            <td style={{ padding: '10px', textAlign: 'right', fontWeight: '700' }}>{r.suggested_quantity || r.current_holding_qty || 0}</td>
                            <td style={{ padding: '10px', textAlign: 'right', fontWeight: '800', color: isSell ? '#fb7185' : '#fbbf24' }}>
                              ₹{formatINR(r.allocation_inr || r.freed_cash_inr || r.current_holding_value_inr || 0)}
                            </td>
                            <td style={{ padding: '10px', textAlign: 'right' }}>{(r.allocation_pct || 0).toFixed(1)}%</td>
                            <td style={{ padding: '10px', textAlign: 'right', color: isSell ? '#fb7185' : '#34d399', fontWeight: '700' }}>
                              +{r.expected_return_pct || 15}%
                            </td>
                            <td style={{ padding: '10px', color: 'var(--text-dim)' }}>{r.category}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
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

            </div>
          )}

        </div>
      )}

    </div>
  );
}
