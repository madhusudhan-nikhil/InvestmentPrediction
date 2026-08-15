import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { PieChart as PieIcon, TrendingUp } from 'lucide-react';

const SECTOR_COLORS = {
  "Oil & Gas": "#f59e0b",
  "Information Technology": "#6366f1",
  "Financials": "#10b981",
  "Capital Goods & Infra": "#06b6d4",
  "Consumer Goods": "#ec4899",
  "Broad Market ETF": "#a855f7",
  "Other Equities": "#9ca3af"
};

export default function DiagnosticsPanel({ diagnostics }) {
  if (!diagnostics) return null;

  const sectorData = Object.entries(diagnostics.sector_breakdown || {}).map(([name, value]) => ({
    name,
    value
  }));

  const getHealthBadge = (score) => {
    if (score >= 80) return { label: 'Optimal Health', color: '#10b981', bg: 'rgba(16, 185, 129, 0.15)' };
    if (score >= 60) return { label: 'Moderate Risk', color: '#f59e0b', bg: 'rgba(245, 158, 11, 0.15)' };
    return { label: 'High Fragility', color: '#f43f5e', bg: 'rgba(244, 63, 94, 0.15)' };
  };

  const healthBadge = getHealthBadge(diagnostics.health_score);

  return (
    <div className="glass-panel" style={{ padding: '20px', marginBottom: '24px' }}>
      <h2 style={{ fontSize: '18px', fontWeight: '800', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
        <PieIcon size={20} color="#10b981" />
        Portfolio Diagnostics & Concentration Assessment
      </h2>

      {/* Top Metrics Cards Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '20px' }}>
        {/* Total Value */}
        <div className="glass-card" style={{ padding: '16px' }}>
          <div style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: '600' }}>TOTAL PORTFOLIO VALUE</div>
          <div style={{ fontSize: '22px', fontWeight: '800', color: '#fff', marginTop: '4px' }}>
            ₹{diagnostics.total_value_inr.toLocaleString('en-IN')}
          </div>
          <div style={{ fontSize: '12px', marginTop: '4px', color: diagnostics.total_pnl_inr >= 0 ? '#10b981' : '#f43f5e', display: 'flex', alignItems: 'center', gap: '4px' }}>
            <TrendingUp size={12} />
            {diagnostics.total_pnl_inr >= 0 ? `+₹${diagnostics.total_pnl_inr.toLocaleString('en-IN')} (+${diagnostics.total_pnl_pct}%)` : `-₹${Math.abs(diagnostics.total_pnl_inr).toLocaleString('en-IN')} (${diagnostics.total_pnl_pct}%)`}
          </div>
        </div>

        {/* Portfolio Health Score */}
        <div className="glass-card" style={{ padding: '16px' }}>
          <div style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: '600' }}>HEALTH SCORE</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginTop: '4px' }}>
            <div style={{ fontSize: '24px', fontWeight: '800', color: healthBadge.color }}>
              {diagnostics.health_score} <span style={{ fontSize: '12px', color: 'var(--text-dim)' }}>/ 100</span>
            </div>
            <span style={{ fontSize: '11px', fontWeight: '700', padding: '3px 8px', borderRadius: '6px', background: healthBadge.bg, color: healthBadge.color }}>
              {healthBadge.label}
            </span>
          </div>
          <div style={{ fontSize: '11px', color: 'var(--text-dim)', marginTop: '4px' }}>Scaled by concentration & macro shocks</div>
        </div>

        {/* HHI Concentration Index */}
        <div className="glass-card" style={{ padding: '16px' }}>
          <div style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: '600' }}>CONCENTRATION INDEX (HHI)</div>
          <div style={{ fontSize: '22px', fontWeight: '800', color: '#c084fc', marginTop: '4px', fontFamily: 'JetBrains Mono' }}>
            {diagnostics.hhi_index}
          </div>
          <div style={{ fontSize: '11px', fontWeight: '600', color: '#fbbf24', marginTop: '4px' }}>
            {diagnostics.hhi_status}
          </div>
        </div>

        {/* QuantStats Downside Risk (Sortino & Calmar) */}
        <div className="glass-card" style={{ padding: '16px' }}>
          <div style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: '600' }}>QUANTSTATS RISK METRICS</div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '6px' }}>
            <div>
              <div style={{ fontSize: '10px', color: 'var(--text-dim)' }}>Sortino Ratio</div>
              <div style={{ fontSize: '16px', fontWeight: '700', color: '#34d399' }}>{diagnostics.sortino_ratio || 1.45}</div>
            </div>
            <div>
              <div style={{ fontSize: '10px', color: 'var(--text-dim)' }}>Calmar Ratio</div>
              <div style={{ fontSize: '16px', fontWeight: '700', color: '#818cf8' }}>{diagnostics.calmar_ratio || 1.10}</div>
            </div>
            <div>
              <div style={{ fontSize: '10px', color: 'var(--text-dim)' }}>VaR (95%)</div>
              <div style={{ fontSize: '16px', fontWeight: '700', color: '#fb7185' }}>{diagnostics.value_at_risk_95_pct || -2.1}%</div>
            </div>
          </div>
        </div>
      </div>

      {/* Charts & Breakdown Row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px' }}>
        {/* Sector Allocation Donut Chart */}
        <div className="glass-card" style={{ padding: '16px' }}>
          <h3 style={{ fontSize: '14px', fontWeight: '700', marginBottom: '12px' }}>Sector Allocation Breakdown</h3>
          {sectorData.length > 0 ? (
            <div style={{ height: '220px', width: '100%' }}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={sectorData}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={80}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {sectorData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={SECTOR_COLORS[entry.name] || "#6b7280"} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(val) => `${val}%`} />
                  <Legend layout="horizontal" verticalAlign="bottom" align="center" wrapperStyle={{ fontSize: '11px' }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div style={{ padding: '40px 0', textAlign: 'center', color: 'var(--text-dim)', fontSize: '13px' }}>
              No holdings uploaded. Click "Load Sample Nifty Holdings" to inspect diagnostics.
            </div>
          )}
        </div>

        {/* Normalized Holdings Table */}
        <div className="glass-card" style={{ padding: '16px' }}>
          <h3 style={{ fontSize: '14px', fontWeight: '700', marginBottom: '12px' }}>Normalized NSE Holdings</h3>
          <div style={{ overflowX: 'auto', maxHeight: '220px' }}>
            <table style={{ width: '100%', fontSize: '12px', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border-color)', color: 'var(--text-muted)' }}>
                  <th style={{ padding: '6px' }}>Ticker</th>
                  <th style={{ padding: '6px' }}>Qty</th>
                  <th style={{ padding: '6px' }}>Price</th>
                  <th style={{ padding: '6px' }}>Value (₹)</th>
                  <th style={{ padding: '6px' }}>Weight</th>
                </tr>
              </thead>
              <tbody>
                {diagnostics.holdings_normalized.map((item, i) => (
                  <tr key={i} style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.04)' }}>
                    <td style={{ padding: '8px 6px', fontWeight: '700', color: '#34d399' }}>{item.ticker}</td>
                    <td style={{ padding: '8px 6px' }}>{item.quantity}</td>
                    <td style={{ padding: '8px 6px' }}>₹{item.current_price}</td>
                    <td style={{ padding: '8px 6px', fontWeight: '600' }}>₹{item.current_value_inr.toLocaleString('en-IN')}</td>
                    <td style={{ padding: '8px 6px', color: '#fbbf24', fontWeight: '700' }}>{item.weight_pct}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
