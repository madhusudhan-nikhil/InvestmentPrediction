import React, { useState } from 'react';
import { Layers, ShieldCheck, ArrowUpRight, CheckCircle2, Flame, BarChart3, Download } from 'lucide-react';

export default function RecommendationPanel({ recommendationsData }) {
  const [activeCategory, setActiveCategory] = useState("ALL");

  if (!recommendationsData || !recommendationsData.recommendations) return null;

  const recs = recommendationsData.recommendations;

  const categories = [
    { id: "ALL", label: `All (${recs.length})` },
    { id: "Category A", label: "Category A: Rebalance" },
    { id: "Category B", label: "Category B: Diversifiers" },
    { id: "Category C", label: "Category C: Systematic Alpha" },
    { id: "Category D", label: "Category D: Macro Hedges" }
  ];

  const filteredRecs = activeCategory === "ALL"
    ? recs
    : recs.filter(r => r.category === activeCategory);

  const getBadgeStyle = (badgeColor) => {
    switch (badgeColor) {
      case 'emerald': return { bg: 'rgba(16, 185, 129, 0.15)', color: '#34d399', border: 'rgba(16, 185, 129, 0.3)' };
      case 'amber': return { bg: 'rgba(245, 158, 11, 0.15)', color: '#fbbf24', border: 'rgba(245, 158, 11, 0.3)' };
      case 'purple': return { bg: 'rgba(168, 85, 247, 0.15)', color: '#c084fc', border: 'rgba(168, 85, 247, 0.3)' };
      case 'rose': return { bg: 'rgba(244, 63, 94, 0.15)', color: '#fb7185', border: 'rgba(244, 63, 94, 0.3)' };
      default: return { bg: 'rgba(99, 102, 241, 0.15)', color: '#818cf8', border: 'rgba(99, 102, 241, 0.3)' };
    }
  };

  const handleExportCSV = () => {
    const headers = "Ticker,Instrument Name,Category,Allocation (INR),Allocation (%),Suggested Quantity,Expected Return (%)\n";
    const rows = recs.map(r => `"${r.ticker}","${r.instrument_name}","${r.category}",${r.allocation_inr},${r.allocation_pct},${r.suggested_quantity},${r.expected_return_pct}`).join("\n");
    const blob = new Blob([headers + rows], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "BharatiQuant_Execution_Plan.csv";
    a.click();
  };

  // Top 3 allocations for quick decision summary
  const topAllocations = [...recs].sort((a, b) => b.allocation_inr - a.allocation_inr).slice(0, 3);

  return (
    <div className="glass-panel" style={{ padding: '20px', marginBottom: '24px' }}>
      {/* Executive Decision Banner */}
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
            Top priority allocation strategy for <strong style={{ color: '#f59e0b' }}>₹{recommendationsData.total_capital_inr.toLocaleString('en-IN')}</strong> target deployment.
          </p>

          {/* Top 3 Quick Summary Strip */}
          <div style={{ display: 'flex', gap: '12px', marginTop: '10px', flexWrap: 'wrap' }}>
            {topAllocations.map((item, idx) => (
              <div key={idx} style={{
                padding: '4px 10px', borderRadius: '8px', background: 'rgba(0, 0, 0, 0.3)',
                border: '1px solid rgba(255, 255, 255, 0.1)', fontSize: '11px'
              }}>
                <span style={{ color: '#34d399', fontWeight: '700' }}>{item.ticker}</span>: ₹{item.allocation_inr.toLocaleString('en-IN')} ({item.allocation_pct}%)
              </div>
            ))}
          </div>
        </div>

        {/* Action Button & Health Metric */}
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

      {/* Category Tabs Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '10px' }}>
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

        <span style={{ fontSize: '12px', color: 'var(--text-dim)', fontWeight: '500' }}>
          Showing {filteredRecs.length} of {recs.length} instruments
        </span>
      </div>

      {/* Grid of Recommendation Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '14px' }}>
        {filteredRecs.map((rec) => {
          const badge = getBadgeStyle(rec.category_badge_color);
          return (
            <div key={rec.id} className="glass-card" style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {/* Ticker & Category */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <span style={{ fontSize: '16px', fontWeight: '800', color: '#34d399', fontFamily: 'JetBrains Mono' }}>
                    {rec.ticker}
                  </span>
                  <div style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: '500' }}>
                    {rec.instrument_name}
                  </div>
                </div>
                <span style={{
                  padding: '3px 8px', borderRadius: '10px', fontSize: '10px', fontWeight: '700',
                  background: badge.bg, color: badge.color, border: `1px solid ${badge.border}`
                }}>
                  {rec.category}
                </span>
              </div>

              {/* Allocation & Quantity Box */}
              <div style={{
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                padding: '8px 12px', borderRadius: '8px', background: 'rgba(0, 0, 0, 0.3)',
                border: '1px solid rgba(255, 255, 255, 0.05)'
              }}>
                <div>
                  <div style={{ fontSize: '10px', color: 'var(--text-dim)', fontWeight: '600' }}>TARGET ALLOCATION</div>
                  <div style={{ fontSize: '16px', fontWeight: '800', color: '#f59e0b' }}>
                    ₹{rec.allocation_inr.toLocaleString('en-IN')}
                    <span style={{ fontSize: '11px', color: 'var(--text-dim)', fontWeight: '500', marginLeft: '4px' }}>
                      ({rec.allocation_pct}%)
                    </span>
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '10px', color: 'var(--text-dim)', fontWeight: '600' }}>SUGGESTED QTY</div>
                  <div style={{ fontSize: '14px', fontWeight: '700', color: '#fff' }}>
                    ~{rec.suggested_quantity} units
                  </div>
                </div>
              </div>

              {/* Compact Decision Rationale */}
              <div style={{ fontSize: '11px', color: '#d1d5db', lineHeight: '1.3' }}>
                <strong style={{ color: '#818cf8' }}>Macro & HRP: </strong>
                {rec.macro_rationale}
              </div>

              {/* Return Footer */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 'auto', paddingTop: '6px', borderTop: '1px solid rgba(255, 255, 255, 0.05)' }}>
                <span style={{ fontSize: '10px', color: 'var(--text-dim)' }}>HRP Volatility Reduction: -{rec.hrp_risk_reduction_pct}%</span>
                <span style={{ fontSize: '12px', fontWeight: '700', color: '#10b981', display: 'flex', alignItems: 'center', gap: '2px' }}>
                  <ArrowUpRight size={13} /> {rec.expected_return_pct}% p.a.
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
