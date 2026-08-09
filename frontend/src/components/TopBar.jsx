import React from 'react';
import { Activity, ShieldAlert, TrendingDown, TrendingUp, RefreshCw, Flame, Globe, Database } from 'lucide-react';

export default function TopBar({ macroData, loading, onRefresh, onSyncTickers, syncingTickers }) {
  if (!macroData) return null;

  const getThreatColor = (score) => {
    if (score < 40) return { text: '#10b981', bg: 'rgba(16, 185, 129, 0.15)', border: 'rgba(16, 185, 129, 0.3)' };
    if (score < 65) return { text: '#f59e0b', bg: 'rgba(245, 158, 11, 0.15)', border: 'rgba(245, 158, 11, 0.3)' };
    return { text: '#f43f5e', bg: 'rgba(244, 63, 94, 0.15)', border: 'rgba(244, 63, 94, 0.3)' };
  };

  const threatStyle = getThreatColor(macroData.threat_score);

  return (
    <header className="glass-panel" style={{ padding: '14px 24px', marginBottom: '24px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
      {/* Top row: Brand + Threat Gauge + Regime */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{
            width: '42px', height: '42px', borderRadius: '12px',
            background: 'linear-gradient(135deg, #10b981 0%, #6366f1 100%)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 4px 12px rgba(16, 185, 129, 0.3)'
          }}>
            <Globe size={24} color="#fff" />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <h1 style={{ fontSize: '20px', fontWeight: '800', letterSpacing: '-0.5px' }}>BHARATI<span style={{ color: '#10b981' }}>QUANT</span></h1>
              <span style={{ fontSize: '11px', background: 'rgba(99, 102, 241, 0.2)', color: '#818cf8', padding: '2px 8px', borderRadius: '12px', fontWeight: '600' }}>NSE / BSE MACRO v1.0</span>
            </div>
            <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Indian Portfolio Optimization & World Monitor Threat Intelligence</p>
          </div>
        </div>

        {/* Dynamic Threat Score Gauge */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px', flexWrap: 'wrap' }}>
          <div style={{
            display: 'flex', alignItems: 'center', gap: '12px',
            padding: '8px 16px', borderRadius: '12px',
            background: threatStyle.bg, border: `1px solid ${threatStyle.border}`
          }}>
            <Flame size={22} color={threatStyle.text} />
            <div>
              <div style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.5px', color: 'var(--text-muted)', fontWeight: '600' }}>India Macro Threat Score</div>
              <div style={{ fontSize: '20px', fontWeight: '800', color: threatStyle.text, lineHeight: '1.1' }}>
                {macroData.threat_score} <span style={{ fontSize: '12px', fontWeight: '500', color: 'var(--text-muted)' }}>/ 100</span>
              </div>
            </div>
          </div>

          {/* Active Regime Badge */}
          <div style={{
            padding: '8px 14px', borderRadius: '12px',
            background: 'rgba(255, 255, 255, 0.04)', border: '1px solid var(--border-color)'
          }}>
            <div style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: '600' }}>ACTIVE MARKET REGIME</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '2px' }}>
              <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: threatStyle.text, boxShadow: `0 0 8px ${threatStyle.text}` }}></span>
              <span style={{ fontSize: '13px', fontWeight: '700', color: '#f3f4f6' }}>{macroData.active_regime}</span>
            </div>
          </div>

          <button
            onClick={onRefresh}
            disabled={loading}
            style={{
              background: 'rgba(255, 255, 255, 0.06)', border: '1px solid var(--border-color)',
              color: 'var(--text-main)', padding: '10px 14px', borderRadius: '10px',
              cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px',
              fontSize: '13px', fontWeight: '500', transition: 'all 0.2s'
            }}
          >
            <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
            Sync Pulse
          </button>

          <button
            onClick={onSyncTickers}
            disabled={syncingTickers}
            style={{
              background: 'rgba(139, 92, 246, 0.1)', border: '1px solid rgba(139, 92, 246, 0.3)',
              color: '#c084fc', padding: '10px 14px', borderRadius: '10px',
              cursor: syncingTickers ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', gap: '6px',
              fontSize: '13px', fontWeight: '500', transition: 'all 0.2s'
            }}
          >
            <Database size={14} className={syncingTickers ? "animate-spin" : ""} />
            {syncingTickers ? 'Syncing...' : 'Sync Tickers'}
          </button>
        </div>
      </div>

      {/* Bottom Ticker Bar */}
      <div style={{
        display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '12px',
        paddingTop: '10px', borderTop: '1px solid var(--border-color)'
      }}>
        {/* Brent Crude */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <Activity size={16} color="#f59e0b" />
          <div>
            <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Brent Crude Oil: </span>
            <span style={{ fontSize: '13px', fontWeight: '700' }}>${macroData.brent_crude_usd}/bbl</span>
            <span style={{ fontSize: '11px', color: macroData.brent_crude_change_pct >= 0 ? '#f43f5e' : '#10b981', marginLeft: '6px' }}>
              {macroData.brent_crude_change_pct >= 0 ? `+${macroData.brent_crude_change_pct}%` : `${macroData.brent_crude_change_pct}%`}
            </span>
          </div>
        </div>

        {/* USD / INR */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <TrendingUp size={16} color="#06b6d4" />
          <div>
            <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>USD / INR: </span>
            <span style={{ fontSize: '13px', fontWeight: '700' }}>₹{macroData.usd_inr}</span>
            <span style={{ fontSize: '11px', color: '#f59e0b', marginLeft: '6px' }}>
              +{macroData.usd_inr_change_pct}%
            </span>
          </div>
        </div>

        {/* India VIX */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <ShieldAlert size={16} color="#a855f7" />
          <div>
            <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>India VIX: </span>
            <span style={{ fontSize: '13px', fontWeight: '700' }}>{macroData.india_vix}</span>
            <span style={{ fontSize: '11px', color: macroData.india_vix_change_pct <= 0 ? '#10b981' : '#f43f5e', marginLeft: '6px' }}>
              {macroData.india_vix_change_pct <= 0 ? `${macroData.india_vix_change_pct}%` : `+${macroData.india_vix_change_pct}%`}
            </span>
          </div>
        </div>

        {/* FII / DII Flow */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <TrendingDown size={16} color={macroData.fii_net_flow_cr < 0 ? '#f43f5e' : '#10b981'} />
          <div>
            <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>FII Net Flow: </span>
            <span style={{ fontSize: '13px', fontWeight: '700', color: macroData.fii_net_flow_cr < 0 ? '#f43f5e' : '#10b981' }}>
              {macroData.fii_net_flow_cr < 0 ? `-₹${Math.abs(macroData.fii_net_flow_cr)} Cr` : `+₹${macroData.fii_net_flow_cr} Cr`}
            </span>
          </div>
        </div>
      </div>
    </header>
  );
}
