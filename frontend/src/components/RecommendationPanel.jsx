import React, { useState, useMemo } from 'react';
import { 
  Layers, ShieldCheck, ArrowUpRight, CheckCircle2, Flame, 
  BarChart3, Download, Target, Calendar, TrendingUp, DollarSign, 
  Clock, Zap, LayoutGrid, Table, ArrowUpDown
} from 'lucide-react';
import { formatINR, formatINRDenomination } from '../utils/formatters';

export default function RecommendationPanel({ 
  recommendationsData, 
  loading,
  onOpenBrokerModal,
  onShowToast
}) {
  const [activeCategory, setActiveCategory] = useState("ALL");
  const [assetFilter, setAssetFilter] = useState("ALL"); // ALL | EQUITY | MUTUAL_FUND_ETF
  const [actionFilter, setActionFilter] = useState("ALL"); // ALL | SELL | KEEP | TOP_UP | BUY
  const [viewStyle, setViewStyle] = useState("card"); // 'card' | 'table'
  const [sortField, setSortField] = useState("allocation_inr");
  const [sortAsc, setSortAsc] = useState(false);

  if (loading) {
    return (
      <div className="glass-panel" style={{ padding: '24px', marginBottom: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
          <div className="skeleton-box" style={{ width: '24px', height: '24px', borderRadius: '6px' }} />
          <div className="skeleton-box" style={{ width: '220px', height: '22px' }} />
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(290px, 1fr))', gap: '16px' }}>
          {[1, 2, 3, 4, 5, 6].map(i => (
            <div key={i} className="glass-card" style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div className="skeleton-box" style={{ width: '120px', height: '20px' }} />
              <div className="skeleton-box" style={{ width: '100%', height: '50px' }} />
              <div className="skeleton-box" style={{ width: '80%', height: '16px' }} />
            </div>
          ))}
        </div>
      </div>
    );
  }

  // ⚡ Bolt Optimization: Memoize the inline fallback array/object references to prevent
  // triggering downstream useEffects/useMemos on every render if the parent passes undefined.
  const recs = useMemo(() => recommendationsData?.recommendations || [], [recommendationsData?.recommendations]);
  const actionCounts = useMemo(() => recommendationsData?.action_counts || {}, [recommendationsData?.action_counts]);

  const categories = [
    { id: "ALL", label: `All Categories (${recs.length})` },
    { id: "Category A", label: "Category A: Rebalance" },
    { id: "Category B", label: "Category B: Diversifiers" },
    { id: "Category C", label: "Category C: Systematic Alpha" },
    { id: "Category D", label: "Category D: Macro Hedges" }
  ];

  const equityCount = useMemo(() => recs.filter(r => (r.asset_type || "EQUITY") === "EQUITY").length, [recs]);
  const mfEtfCount = useMemo(() => recs.filter(r => r.asset_type === "MUTUAL_FUND_ETF").length, [recs]);

  const filteredRecs = useMemo(() => {
    return [...recs].filter(r => {
      const matchesCat = activeCategory === "ALL" || r.category === activeCategory;
      const matchesAsset = assetFilter === "ALL" || (r.asset_type || "EQUITY") === assetFilter;
      const matchesAction = actionFilter === "ALL" || (r.action_type || "BUY") === actionFilter;
      return matchesCat && matchesAsset && matchesAction;
    }).sort((a, b) => {
      let valA = a[sortField] ?? 0;
      let valB = b[sortField] ?? 0;
      if (typeof valA === 'string') valA = valA.toLowerCase();
      if (typeof valB === 'string') valB = valB.toLowerCase();
      if (valA < valB) return sortAsc ? -1 : 1;
      if (valA > valB) return sortAsc ? 1 : -1;
      return 0;
    });
  }, [recs, activeCategory, assetFilter, actionFilter, sortField, sortAsc]);

  const getBadgeStyle = (badgeColor) => {
    switch (badgeColor) {
      case 'emerald': return { bg: 'rgba(16, 185, 129, 0.15)', color: '#34d399', border: 'rgba(16, 185, 129, 0.3)' };
      case 'amber': return { bg: 'rgba(245, 158, 11, 0.15)', color: '#fbbf24', border: 'rgba(245, 158, 11, 0.3)' };
      case 'purple': return { bg: 'rgba(168, 85, 247, 0.15)', color: '#c084fc', border: 'rgba(168, 85, 247, 0.3)' };
      case 'rose': return { bg: 'rgba(244, 63, 94, 0.15)', color: '#fb7185', border: 'rgba(244, 63, 94, 0.3)' };
      default: return { bg: 'rgba(99, 102, 241, 0.15)', color: '#818cf8', border: 'rgba(99, 102, 241, 0.3)' };
    }
  };

  const getActionBadgeStyle = (actionType) => {
    switch (actionType) {
      case 'SELL': return { bg: 'rgba(244, 63, 94, 0.2)', color: '#fb7185', border: '1px solid #f43f5e' };
      case 'KEEP': return { bg: 'rgba(16, 185, 129, 0.2)', color: '#34d399', border: '1px solid #10b981' };
      case 'TOP_UP': return { bg: 'rgba(59, 130, 246, 0.2)', color: '#60a5fa', border: '1px solid #3b82f6' };
      case 'BUY': default: return { bg: 'rgba(245, 158, 11, 0.2)', color: '#fbbf24', border: '1px solid #f59e0b' };
    }
  };

  const freshCapital = recommendationsData?.fresh_capital_inr || recommendationsData?.total_capital_inr || 0;
  const cashFromSales = recommendationsData?.cash_generated_from_sales_inr || 0;
  const totalRebalanceCapital = recommendationsData?.total_rebalancing_capital_inr || recommendationsData?.total_capital_inr || 0;

  const totalAllocatedInr = useMemo(() => recs.reduce((sum, r) => sum + (r.allocation_inr || 0), 0), [recs]);
  const totalAllocatedPct = totalRebalanceCapital > 0 ? (totalAllocatedInr / totalRebalanceCapital) * 100 : 0;
  // eslint-disable-next-line no-unused-vars
  const totalSuggestedUnits = useMemo(() => recs.reduce((sum, r) => sum + (r.suggested_quantity || 0), 0), [recs]);
  const weightedExpReturnPct = useMemo(() => totalAllocatedInr > 0 ? recs.reduce((sum, r) => sum + ((r.allocation_inr || 0) * (r.expected_return_pct || 0)), 0) / totalAllocatedInr : 0, [recs, totalAllocatedInr]);

  if (!recommendationsData || !recommendationsData.recommendations) return null;

  const handleExportCSV = () => {
    const headers = "Action Type,Ticker,Instrument Name,Category,Current Rate (INR),Target Sell Rate (INR),Profit Per Share (INR),Total Stock Profit (INR),Action Qty,Freed Cash (INR),Allocation (INR),Allocation (%),Expected Return (%),Action Summary\n";
    const dataRows = recs.map(r => `"${r.action_type || 'BUY'}","${r.ticker}","${r.instrument_name}","${r.category}",${r.unit_price},${r.target_selling_price || (r.unit_price * (1 + r.expected_return_pct / 100)).toFixed(2)},${r.profit_per_share_inr || 0},${r.total_expected_stock_profit_inr || 0},${r.suggested_quantity || 0},${r.freed_cash_inr || 0},${r.allocation_inr || 0},${r.allocation_pct || 0},${r.expected_return_pct || 0},"${(r.action_summary || '').replace(/"/g, '""')}"`);
    
    const freshCap = recommendationsData.fresh_capital_inr || recommendationsData.total_capital_inr || 0;
    const freedCashTotal = recommendationsData.cash_generated_from_sales_inr || 0;
    const totalRebalanceCap = recommendationsData.total_rebalancing_capital_inr || recommendationsData.total_capital_inr || 0;

    const totalRow = `"SUMMARY","REBALANCING PORTFOLIO TOTALS","ALL CATEGORIES","-","-","-","-","-","-",${freedCashTotal.toFixed(2)},${totalAllocatedInr.toFixed(2)},"100%","-","Fresh Capital: ₹${freshCap.toFixed(2)} + Freed Cash: ₹${freedCashTotal.toFixed(2)} = Total Rebalance: ₹${totalRebalanceCap.toFixed(2)}"`;

    const blob = new Blob([headers + dataRows.join("\n") + "\n" + totalRow], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "BharatiQuant_Actionable_Rebalance_Execution_Plan.csv";
    a.click();
    if (onShowToast) onShowToast("Exported execution plan to CSV!");
  };

  return (
    <div className="glass-panel" style={{ padding: '20px', marginBottom: '24px' }}>
      {/* Executive Action Banner */}
      <div style={{
        padding: '16px 20px', borderRadius: '12px', marginBottom: '20px',
        background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.12) 0%, rgba(99, 102, 241, 0.12) 100%)',
        border: '1px solid rgba(16, 185, 129, 0.25)',
        display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px'
      }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <CheckCircle2 size={20} color="#34d399" />
            <h2 style={{ fontSize: '18px', fontWeight: '800', color: '#fff' }}>Executive Action Summary</h2>
            <span style={{ fontSize: '11px', background: '#10b981', color: '#000', padding: '2px 8px', borderRadius: '12px', fontWeight: '700' }}>READY TO EXECUTE</span>
          </div>
          <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '4px' }}>
            Actionable rebalancing plan across uploaded portfolio holdings & fresh capital deployment.
          </p>

          <div style={{ display: 'flex', gap: '10px', marginTop: '10px', flexWrap: 'wrap', alignItems: 'center' }}>
            <div style={{ padding: '4px 10px', borderRadius: '8px', background: 'rgba(0,0,0,0.4)', border: '1px solid rgba(255,255,255,0.1)', fontSize: '11px' }}>
              <span style={{ color: 'var(--text-dim)' }}>Fresh Capital:</span> <strong style={{ color: '#fff' }}>₹{formatINR(freshCapital)}</strong>
            </div>
            {cashFromSales > 0 && (
              <div style={{ padding: '4px 10px', borderRadius: '8px', background: 'rgba(244,63,94,0.15)', border: '1px solid rgba(244,63,94,0.3)', fontSize: '11px' }}>
                <span style={{ color: '#fb7185' }}>+ Freed Cash (Sales):</span> <strong style={{ color: '#fb7185' }}>+₹{formatINR(cashFromSales)}</strong>
              </div>
            )}
            <div style={{ padding: '4px 10px', borderRadius: '8px', background: 'rgba(16,185,129,0.2)', border: '1px solid #10b981', fontSize: '11px' }}>
              <span style={{ color: '#34d399' }}>Total Rebalancing Capital:</span> <strong style={{ color: '#34d399' }}>₹{formatINR(totalRebalanceCapital)}</strong>
            </div>
          </div>
        </div>

        {/* Top Right Action Controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: '600' }}>HEALTH IMPROVEMENT</div>
            <div style={{ fontSize: '16px', fontWeight: '800', color: '#34d399' }}>
              +{((recommendationsData.portfolio_health_after - recommendationsData.portfolio_health_before)).toFixed(1)} pts
              <span style={{ fontSize: '11px', color: 'var(--text-dim)', fontWeight: '500', marginLeft: '4px' }}>
                ({recommendationsData.portfolio_health_after}/100)
              </span>
            </div>
          </div>

          {onOpenBrokerModal && (
            <button
              onClick={onOpenBrokerModal}
              style={{
                padding: '9px 15px', borderRadius: '10px',
                background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
                color: '#000', border: 'none',
                fontSize: '12px', fontWeight: '800', cursor: 'pointer',
                display: 'flex', alignItems: 'center', gap: '6px',
                boxShadow: '0 4px 14px rgba(245, 158, 11, 0.4)'
              }}
            >
              <Zap size={15} /> 1-Click Execution
            </button>
          )}

          <button
            onClick={handleExportCSV}
            style={{
              padding: '9px 14px', borderRadius: '10px',
              background: '#10b981', color: '#000', border: 'none',
              fontSize: '12px', fontWeight: '700', cursor: 'pointer',
              display: 'flex', alignItems: 'center', gap: '6px',
              boxShadow: '0 4px 14px rgba(16, 185, 129, 0.3)'
            }}
          >
            <Download size={14} /> Export CSV
          </button>
        </div>
      </div>

      {/* Filter Control Bars */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '16px' }}>
        {/* Action Filter Pills Bar + Card/Table Toggle */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
          <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', alignItems: 'center' }}>
            <span style={{ fontSize: '11px', color: 'var(--text-dim)', fontWeight: '700', marginRight: '4px' }}>ACTION:</span>
            {[
              { id: "ALL", label: `All (${recs.length})` },
              { id: "SELL", label: `🔴 SELL (${actionCounts.SELL || 0})` },
              { id: "KEEP", label: `🟢 KEEP (${actionCounts.KEEP || 0})` },
              { id: "TOP_UP", label: `🔵 TOP-UP (${actionCounts.TOP_UP || 0})` },
              { id: "BUY", label: `🚀 BUY (${actionCounts.BUY || 0})` }
            ].map((act) => (
              <button
                key={act.id}
                onClick={() => setActionFilter(act.id)}
                style={{
                  padding: '4px 10px', borderRadius: '6px', fontSize: '11px', fontWeight: '800',
                  whiteSpace: 'nowrap', cursor: 'pointer', transition: 'all 0.2s',
                  background: actionFilter === act.id ? 'rgba(16, 185, 129, 0.25)' : 'rgba(255, 255, 255, 0.04)',
                  border: actionFilter === act.id ? '1px solid #10b981' : '1px solid var(--border-color)',
                  color: actionFilter === act.id ? '#34d399' : 'var(--text-muted)'
                }}
              >
                {act.label}
              </button>
            ))}
          </div>

          {/* Card vs Table View Toggle */}
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

        {/* Category & Asset Type Pills */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
          <div style={{ display: 'flex', gap: '6px', overflowX: 'auto', paddingBottom: '4px' }}>
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                style={{
                  padding: '5px 10px', borderRadius: '6px', fontSize: '11px', fontWeight: '600',
                  whiteSpace: 'nowrap', cursor: 'pointer', transition: 'all 0.2s',
                  background: activeCategory === cat.id ? 'rgba(16, 185, 129, 0.2)' : 'rgba(255, 255, 255, 0.04)',
                  border: activeCategory === cat.id ? '1px solid #10b981' : '1px solid var(--border-color)',
                  color: activeCategory === cat.id ? '#34d399' : 'var(--text-muted)'
                }}
              >
                {cat.label}
              </button>
            ))}
          </div>

          <div style={{ display: 'flex', gap: '6px', overflowX: 'auto', paddingBottom: '4px' }}>
            {[
              { id: "ALL", label: "All Types" },
              { id: "EQUITY", label: `🚀 Stocks (${equityCount})` },
              { id: "MUTUAL_FUND_ETF", label: `🛡️ Funds & ETFs (${mfEtfCount})` }
            ].map((atype) => (
              <button
                key={atype.id}
                onClick={() => setAssetFilter(atype.id)}
                style={{
                  padding: '4px 8px', borderRadius: '6px', fontSize: '11px', fontWeight: '700',
                  whiteSpace: 'nowrap', cursor: 'pointer', transition: 'all 0.2s',
                  background: assetFilter === atype.id ? 'rgba(59, 130, 246, 0.25)' : 'rgba(255, 255, 255, 0.03)',
                  border: assetFilter === atype.id ? '1px solid #3b82f6' : '1px solid var(--border-color)',
                  color: assetFilter === atype.id ? '#60a5fa' : 'var(--text-dim)'
                }}
              >
                {atype.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* CARD VIEW MODE */}
      {viewStyle === 'card' ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(290px, 1fr))', gap: '16px' }}>
          {filteredRecs.map((rec) => {
            const badgeStyle = getBadgeStyle(rec.category_badge_color);
            const actionBadgeStyle = getActionBadgeStyle(rec.action_type || 'BUY');
            return (
              <div key={rec.id} style={{
                  padding: '16px', borderRadius: '12px',
                  background: 'rgba(255, 255, 255, 0.02)',
                  border: '1px solid var(--border-color)',
                  display: 'flex', flexDirection: 'column', gap: '10px'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
                      <span style={{ fontSize: '16px', fontWeight: '800', color: '#fff', fontFamily: 'monospace' }}>{rec.ticker}</span>
                      
                      <span style={{
                        fontSize: '11px', padding: '2px 8px', borderRadius: '6px', fontWeight: '800',
                        background: actionBadgeStyle.bg, color: actionBadgeStyle.color, border: actionBadgeStyle.border
                      }}>
                        {rec.action_label || (rec.action_type ? `ACTION: ${rec.action_type}` : '🚀 BUY')}
                      </span>

                      <span style={{ fontSize: '10px', padding: '1px 6px', borderRadius: '4px', background: badgeStyle.bg, color: badgeStyle.color, border: `1px solid ${badgeStyle.border}`, fontWeight: '700' }}>
                        {rec.category}
                      </span>
                    </div>
                    <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '2px' }}>{rec.instrument_name}</div>
                  </div>
                </div>

                {/* Action Instruction Callout Box */}
                <div style={{
                  fontSize: '11px', fontWeight: '700', padding: '8px 10px', borderRadius: '8px',
                  background: actionBadgeStyle.bg, border: actionBadgeStyle.border, color: actionBadgeStyle.color, lineHeight: '1.4'
                }}>
                  {rec.action_summary || `Suggested action: ${rec.action_type || 'BUY'} ${rec.suggested_quantity} units.`}
                </div>

                <div style={{
                  display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px',
                  padding: '10px 12px', borderRadius: '8px', background: 'rgba(0, 0, 0, 0.3)',
                  border: '1px solid rgba(255, 255, 255, 0.05)'
                }}>
                  <div>
                    <div style={{ fontSize: '10px', color: 'var(--text-dim)', fontWeight: '600' }}>CURRENT RATE</div>
                    <div style={{ fontSize: '14px', fontWeight: '800', color: '#34d399' }}>₹{formatINR(rec.unit_price)}</div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '10px', color: 'var(--text-dim)', fontWeight: '600' }}>TARGET SELL RATE</div>
                    <div style={{ fontSize: '14px', fontWeight: '800', color: '#fbbf24' }}>
                      ₹{formatINR(rec.target_selling_price || (rec.unit_price * (1 + rec.expected_return_pct / 100)))}
                      {rec.action_type !== 'SELL' && (
                        <span style={{ fontSize: '9px', color: '#34d399', fontWeight: '700', marginLeft: '3px' }}>
                          (+₹{formatINR(rec.profit_per_share_inr || 0)})
                        </span>
                      )}
                    </div>
                  </div>

                  <div>
                    <div style={{ fontSize: '10px', color: 'var(--text-dim)', fontWeight: '600' }}>
                      {rec.action_type === 'SELL' ? 'SELL QTY' : rec.action_type === 'KEEP' ? 'HOLD QTY' : 'BUY QTY'}
                    </div>
                    <div style={{ fontSize: '13px', fontWeight: '700', color: '#fff' }}>{rec.suggested_quantity} units</div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '10px', color: 'var(--text-dim)', fontWeight: '600' }}>
                      {rec.action_type === 'SELL' ? 'FREED CASH' : 'ALLOCATION'}
                    </div>
                    <div style={{ fontSize: '13px', fontWeight: '800', color: rec.action_type === 'SELL' ? '#fb7185' : '#f59e0b' }}>
                      {rec.action_type === 'SELL'
                        ? `+₹${formatINR(rec.freed_cash_inr || 0)}`
                        : `₹${formatINR(rec.allocation_inr || 0)}`
                      }
                    </div>
                  </div>
                </div>

                {rec.target_price_analytical_rationale && (
                  <div style={{ fontSize: '10px', color: '#fbbf24', background: 'rgba(245, 158, 11, 0.08)', padding: '6px 8px', borderRadius: '6px', border: '1px solid rgba(245, 158, 11, 0.2)' }}>
                    <strong>Price Model: </strong>{rec.target_price_analytical_rationale}
                  </div>
                )}

                <div style={{ fontSize: '11px', color: '#d1d5db', lineHeight: '1.3' }}>
                  <strong style={{ color: '#818cf8' }}>Rationale: </strong>{rec.quantitative_rationale}
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 'auto', paddingTop: '6px', borderTop: '1px solid rgba(255, 255, 255, 0.05)' }}>
                  <span style={{ fontSize: '10px', color: 'var(--text-dim)' }}>Risk Reduction: -{rec.hrp_risk_reduction_pct}%</span>
                  <span style={{ fontSize: '12px', fontWeight: '700', color: '#10b981', display: 'flex', alignItems: 'center', gap: '2px' }}><ArrowUpRight size={13} /> {rec.expected_return_pct}% p.a.</span>
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
                <th style={{ padding: '10px', textAlign: 'right' }}>Target Sell Rate</th>
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
                    <td style={{ padding: '10px', textAlign: 'right', fontWeight: '700' }}>{r.suggested_quantity || 0}</td>
                    <td style={{ padding: '10px', textAlign: 'right', fontWeight: '800', color: isSell ? '#fb7185' : '#fbbf24' }}>
                      ₹{formatINR(r.allocation_inr || r.freed_cash_inr || 0)}
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

      {/* Footer Total Summary */}
      <div style={{
        marginTop: '20px', padding: '16px 20px', borderRadius: '12px',
        background: 'rgba(15, 23, 42, 0.8)', border: '1px solid rgba(255, 255, 255, 0.1)',
        display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <BarChart3 size={18} color="#10b981" />
          <div>
            <div style={{ fontSize: '13px', fontWeight: '700', color: '#ffffff' }}>Total Portfolio Deployment Summary</div>
            <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Aggregated capital, total unit quantities, and expected portfolio return</div>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '24px', flexWrap: 'wrap' }}>
          <div>
            <div style={{ fontSize: '10px', color: 'var(--text-dim)', fontWeight: '600' }}>TOTAL REBALANCING CAPITAL</div>
            <div style={{ fontSize: '15px', fontWeight: '800', color: '#34d399' }}>
              ₹{formatINR(totalRebalanceCapital)}
            </div>
          </div>
          <div>
            <div style={{ fontSize: '10px', color: 'var(--text-dim)', fontWeight: '600' }}>TOTAL ALLOCATED</div>
            <div style={{ fontSize: '15px', fontWeight: '800', color: '#f59e0b' }}>
              ₹{formatINR(totalAllocatedInr)} <span style={{ fontSize: '11px', color: 'var(--text-dim)', fontWeight: '500' }}>({totalAllocatedPct.toFixed(1)}%)</span>
            </div>
          </div>
          <div>
            <div style={{ fontSize: '10px', color: 'var(--text-dim)', fontWeight: '600' }}>WEIGHTED EXP. RETURN</div>
            <div style={{ fontSize: '15px', fontWeight: '800', color: '#c084fc' }}>
              {weightedExpReturnPct.toFixed(2)}% p.a.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
