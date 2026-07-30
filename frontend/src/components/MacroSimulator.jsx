import React, { useState } from 'react';
import { Sliders, AlertTriangle, ShieldCheck, Flame, RefreshCw } from 'lucide-react';
import axios from 'axios';

export default function MacroSimulator({ holdings, API_BASE_URL }) {
  const [crudeSpike, setCrudeSpike] = useState(15);
  const [usdInrDep, setUsdInrDep] = useState(3);
  const [vixSpike, setVixSpike] = useState(25);
  const [loading, setLoading] = useState(false);
  const [simResult, setSimResult] = useState(null);

  const runSimulation = async () => {
    setLoading(true);
    try {
      const res = await axios.post(`${API_BASE_URL}/api/stress-test`, {
        crude_oil_spike_pct: crudeSpike,
        usd_inr_depreciation_pct: usdInrDep,
        fii_outflow_spike_cr: -2500,
        vix_spike_pct: vixSpike,
        holdings: holdings || []
      });
      setSimResult(res.data);
    } catch (e) {
      console.error("Stress test error:", e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="glass-panel" style={{ padding: '24px', marginBottom: '24px' }}>
      <h2 style={{ fontSize: '18px', fontWeight: '800', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '10px' }}>
        <Sliders size={20} color="#f59e0b" />
        Geopolitical Macro Stress Simulator & Shock Testing
      </h2>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px', marginBottom: '20px' }}>
        {/* Sliders Control Panel */}
        <div className="glass-card" style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {/* Brent Crude Spike */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', fontWeight: '600', marginBottom: '6px' }}>
              <span>Brent Crude Oil Spike:</span>
              <span style={{ color: '#f59e0b', fontWeight: '700' }}>+{crudeSpike}%</span>
            </div>
            <input
              type="range" min="0" max="50" value={crudeSpike}
              onChange={(e) => setCrudeSpike(Number(e.target.value))}
              style={{ width: '100%', accentColor: '#f59e0b' }}
            />
          </div>

          {/* USD / INR Depreciation */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', fontWeight: '600', marginBottom: '6px' }}>
              <span>USD / INR FX Depreciation:</span>
              <span style={{ color: '#06b6d4', fontWeight: '700' }}>+{usdInrDep}%</span>
            </div>
            <input
              type="range" min="0" max="15" value={usdInrDep}
              onChange={(e) => setUsdInrDep(Number(e.target.value))}
              style={{ width: '100%', accentColor: '#06b6d4' }}
            />
          </div>

          {/* India VIX Volatility Shock */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', fontWeight: '600', marginBottom: '6px' }}>
              <span>India VIX Volatility Spike:</span>
              <span style={{ color: '#a855f7', fontWeight: '700' }}>+{vixSpike}%</span>
            </div>
            <input
              type="range" min="0" max="100" value={vixSpike}
              onChange={(e) => setVixSpike(Number(e.target.value))}
              style={{ width: '100%', accentColor: '#a855f7' }}
            />
          </div>

          <button
            onClick={runSimulation}
            disabled={loading}
            style={{
              padding: '10px', borderRadius: '8px',
              background: 'rgba(245, 158, 11, 0.15)', border: '1px solid #f59e0b',
              color: '#fbbf24', fontSize: '13px', fontWeight: '700', cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px'
            }}
          >
            <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
            Simulate Macro Shock Scenario
          </button>
        </div>

        {/* Shock Impact Display Panel */}
        <div className="glass-card" style={{ padding: '16px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
          {simResult ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Simulated Macro Threat Score:</span>
                <span style={{ fontSize: '18px', fontWeight: '800', color: simResult.simulated_threat_score > 60 ? '#f43f5e' : '#f59e0b' }}>
                  {simResult.simulated_threat_score} / 100
                </span>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Simulated Active Regime:</span>
                <span style={{ fontSize: '12px', fontWeight: '700', padding: '3px 8px', borderRadius: '6px', background: 'rgba(244, 63, 94, 0.15)', color: '#fb7185' }}>
                  {simResult.simulated_regime}
                </span>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Estimated Portfolio Impact:</span>
                <span style={{ fontSize: '16px', fontWeight: '800', color: simResult.estimated_portfolio_impact_pct < 0 ? '#f43f5e' : '#10b981' }}>
                  {simResult.estimated_portfolio_impact_pct}%
                </span>
              </div>

              <div style={{ fontSize: '11px', marginTop: '6px' }}>
                <div style={{ color: '#fbbf24', fontWeight: '600', marginBottom: '2px' }}>High Vulnerability Sectors:</div>
                <div style={{ color: 'var(--text-muted)' }}>{simResult.high_vulnerability_sectors.join(', ')}</div>
              </div>

              <div style={{ fontSize: '11px' }}>
                <div style={{ color: '#34d399', fontWeight: '600', marginBottom: '2px' }}>Recommended Defensive Hedges:</div>
                <div style={{ color: 'var(--text-muted)' }}>{simResult.defensive_recommendations.join(', ')}</div>
              </div>
            </div>
          ) : (
            <div style={{ textAlign: 'center', color: 'var(--text-dim)', padding: '20px 0', fontSize: '13px' }}>
              Adjust macro sliders above and click <strong>Simulate Macro Shock Scenario</strong> to stress test your portfolio.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
