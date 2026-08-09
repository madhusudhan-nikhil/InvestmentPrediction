import React, { useState, useEffect } from 'react';
import { Layers, ShieldCheck, ArrowUpRight, CheckCircle2, Flame, BarChart3, Download, Target, Calendar, TrendingUp, DollarSign, Clock } from 'lucide-react';

export default function RecommendationPanel({ recommendationsData }) {
  const [activeCategory, setActiveCategory] = useState("ALL");
  const [assetFilter, setAssetFilter] = useState("ALL"); // ALL | EQUITY | MUTUAL_FUND_ETF
  const [actionFilter, setActionFilter] = useState("ALL"); // ALL | SELL | KEEP | TOP_UP | BUY

  if (!recommendationsData || !recommendationsData.recommendations) return null;

  const recs = recommendationsData.recommendations;
  const actionCounts = recommendationsData.action_counts || {};

  const categories = [
    { id: "ALL", label: `All Categories (${recs.length})` },
    { id: "Category A", label: "Category A: Rebalance" },
    { id: "Category B", label: "Category B: Diversifiers" },
    { id: "Category C", label: "Category C: Systematic Alpha" },
    { id: "Category D", label: "Category D: Macro Hedges" }
  ];

  const equityCount = recs.filter(r => (r.asset_type || "EQUITY") === "EQUITY").length;
  const mfEtfCount = recs.filter(r => r.asset_type === "MUTUAL_FUND_ETF").length;

  const filteredRecs = recs.filter(r => {
    const matchesCat = activeCategory === "ALL" || r.category === activeCategory;
    const matchesAsset = assetFilter === "ALL" || (r.asset_type || "EQUITY") === assetFilter;
    const matchesAction = actionFilter === "ALL" || (r.action_type || "BUY") === actionFilter;
    return matchesCat && matchesAsset && matchesAction;
  });

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

  const handleExportCSV = () => {
    const headers = "Action Type,Ticker,Instrument Name,Category,Current Rate (INR),Target Sell Rate (INR),Profit Per Share (INR),Total Stock Profit (INR),Action Qty,Freed Cash (INR),Allocation (INR),Allocation (%),Expected Return (%),Action Summary\n";
    const dataRows = recs.map(r => `"${r.action_type || 'BUY'}","${r.ticker}","${r.instrument_name}","${r.category}",${r.unit_price},${r.target_selling_price || (r.unit_price * (1 + r.expected_return_pct / 100)).toFixed(2)},${r.profit_per_share_inr || 0},${r.total_expected_stock_profit_inr || 0},${r.suggested_quantity || 0},${r.freed_cash_inr || 0},${r.allocation_inr || 0},${r.allocation_pct || 0},${r.expected_return_pct || 0},"${(r.action_summary || '').replace(/"/g, '""')}"`);
    
    const freshCap = recommendationsData.fresh_capital_inr || recommendationsData.total_capital_inr || 0;
    const freedCashTotal = recommendationsData.cash_generated_from_sales_inr || 0;
    const totalRebalanceCap = recommendationsData.total_rebalancing_capital_inr || recommendationsData.total_capital_inr || 0;
    const totalAllocatedInr = recs.reduce((sum, r) => sum + (r.allocation_inr || 0), 0);

    const totalRow = `"SUMMARY","REBALANCING PORTFOLIO TOTALS","ALL CATEGORIES","-","-","-","-","-","-",${freedCashTotal.toFixed(2)},${totalAllocatedInr.toFixed(2)},"100%","-","Fresh Capital: ₹${freshCap.toFixed(2)} + Freed Cash: ₹${freedCashTotal.toFixed(2)} = Total Rebalance: ₹${totalRebalanceCap.toFixed(2)}"`;

    const blob = new Blob([headers + dataRows.join("\n") + "\n" + totalRow], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "BharatiQuant_Actionable_Rebalance_Execution_Plan.csv";
    a.click();
  };

  const topAllocations = [...recs].filter(r => (r.allocation_inr || 0) > 0).sort((a, b) => b.allocation_inr - a.allocation_inr).slice(0, 3);

  const freshCapital = recommendationsData.fresh_capital_inr || recommendationsData.total_capital_inr || 0;
  const cashFromSales = recommendationsData.cash_generated_from_sales_inr || 0;
  const totalRebalanceCapital = recommendationsData.total_rebalancing_capital_inr || recommendationsData.total_capital_inr || 0;

  const totalAllocatedInr = recs.reduce((sum, r) => sum + (r.allocation_inr || 0), 0);
  const totalAllocatedPct = totalRebalanceCapital > 0 ? (totalAllocatedInr / totalRebalanceCapital) * 100 : 0;
  const totalSuggestedUnits = recs.reduce((sum, r) => sum + (r.suggested_quantity || 0), 0);
  const weightedExpReturnPct = totalAllocatedInr > 0 ? recs.reduce((sum, r) => sum + ((r.allocation_inr || 0) * (r.expected_return_pct || 0)), 0) / totalAllocatedInr : 0;

  return (
    <div className="glass-panel" style={{ padding: '20px', marginBottom: '24px' }}>
      {/* Executive Decision Banner with Rebalancing Math */}
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

          <div style={{ display: 'flex', gap: '12px', marginTop: '10px', flexWrap: 'wrap', alignItems: 'center' }}>
            <div style={{ padding: '4px 10px', borderRadius: '8px', background: 'rgba(0,0,0,0.4)', border: '1px solid rgba(255,255,255,0.1)', fontSize: '11px' }}>
              <span style={{ color: 'var(--text-dim)' }}>Fresh Capital:</span> <strong style={{ color: '#fff' }}>₹{freshCapital.toLocaleString('en-IN')}</strong>
            </div>
            {cashFromSales > 0 && (
              <div style={{ padding: '4px 10px', borderRadius: '8px', background: 'rgba(244,63,94,0.15)', border: '1px solid rgba(244,63,94,0.3)', fontSize: '11px' }}>
                <span style={{ color: '#fb7185' }}>+ Freed Cash (Sales):</span> <strong style={{ color: '#fb7185' }}>+₹{cashFromSales.toLocaleString('en-IN')}</strong>
              </div>
            )}
            <div style={{ padding: '4px 10px', borderRadius: '8px', background: 'rgba(16,185,129,0.2)', border: '1px solid #10b981', fontSize: '11px' }}>
              <span style={{ color: '#34d399' }}>Total Rebalancing Capital:</span> <strong style={{ color: '#34d399' }}>₹{totalRebalanceCapital.toLocaleString('en-IN')}</strong>
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: '600' }}>HEALTH IMPROVEMENT</div>
            <div style={{ fontSize: '16px', fontWeight: '800', color: '#34d399' }}>
              +{((recommendationsData.portfolio_health_after - recommendationsData.portfolio_health_before)).toFixed(1)} pts
              <span style={{ fontSize: '11px', color: 'var(--text-dim)', fontWeight: '500', marginLeft: '4px' }}>
                ({recommendationsData.portfolio_health_after}/100)
              </span>
            </div>
          </div>

          <button
            onClick={handleExportCSV}
            style={{
              padding: '10px 16px', borderRadius: '10px',
              background: '#10b981', color: '#000', border: 'none',
              fontSize: '13px', fontWeight: '700', cursor: 'pointer',
              display: 'flex', alignItems: 'center', gap: '6px',
              boxShadow: '0 4px 14px rgba(16, 185, 129, 0.4)'
            }}
          >
            <Download size={15} /> Export Execution CSV
          </button>
        </div>
      </div>

      {/* Filter Control Bars */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '16px' }}>
        {/* Action Filter Pills Bar */}
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', alignItems: 'center' }}>
          <span style={{ fontSize: '11px', color: 'var(--text-dim)', fontWeight: '700', marginRight: '4px' }}>ACTION FILTER:</span>
          {[
            { id: "ALL", label: `All Actions (${recs.length})` },
            { id: "SELL", label: `🔴 SELL / Exit (${actionCounts.SELL || 0})` },
            { id: "KEEP", label: `🟢 KEEP / Hold (${actionCounts.KEEP || 0})` },
            { id: "TOP_UP", label: `🔵 TOP-UP (${actionCounts.TOP_UP || 0})` },
            { id: "BUY", label: `🚀 BUY / New (${actionCounts.BUY || 0})` }
          ].map((act) => (
            <button
              key={act.id}
              onClick={() => setActionFilter(act.id)}
              style={{
                padding: '5px 12px', borderRadius: '8px', fontSize: '11px', fontWeight: '800',
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

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
          {/* Category Filter Pills */}
          <div style={{ display: 'flex', gap: '6px', overflowX: 'auto', paddingBottom: '4px' }}>
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                style={{
                  padding: '6px 12px', borderRadius: '8px', fontSize: '12px', fontWeight: '600',
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

          {/* Asset Type Filter Pills */}
          <div style={{ display: 'flex', gap: '6px', overflowX: 'auto', paddingBottom: '4px' }}>
            {[
              { id: "ALL", label: "All Types" },
              { id: "EQUITY", label: `🚀 Direct Stocks (${equityCount})` },
              { id: "MUTUAL_FUND_ETF", label: `🛡️ Funds & ETFs (${mfEtfCount})` }
            ].map((atype) => (
              <button
                key={atype.id}
                onClick={() => setAssetFilter(atype.id)}
                style={{
                  padding: '5px 10px', borderRadius: '6px', fontSize: '11px', fontWeight: '700',
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

      {/* Cards Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(290px, 1fr))', gap: '16px' }}>
        {filteredRecs.map((rec) => {
          const badgeStyle = getBadgeStyle(rec.category_badge_color);
          const actionBadgeStyle = getActionBadgeStyle(rec.action_type || 'BUY');
          const isEquity = (rec.asset_type || "EQUITY") === "EQUITY";
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
                    
                    {/* Action Badge */}
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
                  <div style={{ fontSize: '14px', fontWeight: '800', color: '#34d399' }}>₹{(rec.unit_price || 0).toLocaleString('en-IN')}</div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '10px', color: 'var(--text-dim)', fontWeight: '600' }}>TARGET SELL RATE</div>
                  <div style={{ fontSize: '14px', fontWeight: '800', color: '#fbbf24' }}>
                    ₹{(rec.target_selling_price || (rec.unit_price * (1 + rec.expected_return_pct / 100))).toLocaleString('en-IN')}
                    {rec.action_type !== 'SELL' && (
                      <span style={{ fontSize: '9px', color: '#34d399', fontWeight: '700', marginLeft: '3px' }}>
                        (+₹{(rec.profit_per_share_inr || 0).toLocaleString('en-IN')})
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
                      ? `+₹${(rec.freed_cash_inr || 0).toLocaleString('en-IN')}`
                      : `₹${(rec.allocation_inr || 0).toLocaleString('en-IN')}`
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
              ₹{totalRebalanceCapital.toLocaleString('en-IN')}
            </div>
          </div>
          <div>
            <div style={{ fontSize: '10px', color: 'var(--text-dim)', fontWeight: '600' }}>TOTAL ALLOCATED</div>
            <div style={{ fontSize: '15px', fontWeight: '800', color: '#f59e0b' }}>
              ₹{totalAllocatedInr.toLocaleString('en-IN')} <span style={{ fontSize: '11px', color: 'var(--text-dim)', fontWeight: '500' }}>({totalAllocatedPct.toFixed(1)}%)</span>
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
