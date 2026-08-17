import React, { useState, useEffect } from 'react';
import { Sliders, AlertTriangle, ShieldCheck, Flame, RefreshCw, Globe, Zap, ArrowUpRight, TrendingDown, Layers, Activity, RotateCcw } from 'lucide-react';
import axios from 'axios';
import { formatINR, formatINRDenomination } from '../utils/formatters';

const HISTORICAL_CRISIS_PRESETS = [
  {
    id: 'lehman_2008',
    title: '💥 2008 Lehman Crash',
    desc: 'Severe liquidity crunch & foreign institutional dumping',
    shocks: {
      crude_oil_spike_pct: -35,
      usd_inr_depreciation_pct: 12,
      vix_spike_pct: 120,
      fii_outflow_spike_cr: -8000,
      rbi_rate_hike_bps: 0,
      gdelt_escalation_pct: 40,
      dxy_rally_pct: 10
    }
  },
  {
    id: 'covid_2020',
    title: '🦠 2020 COVID Flash Crash',
    desc: 'Record volatility spike & global lockdown shock',
    shocks: {
      crude_oil_spike_pct: -40,
      usd_inr_depreciation_pct: 5,
      vix_spike_pct: 180,
      fii_outflow_spike_cr: -12000,
      rbi_rate_hike_bps: -75,
      gdelt_escalation_pct: 70,
      dxy_rally_pct: 4
    }
  },
  {
    id: 'ukraine_2022',
    title: '🛢️ 2022 Russia-Ukraine Spike',
    desc: 'Brent crude spike & import inflation pressure',
    shocks: {
      crude_oil_spike_pct: 60,
      usd_inr_depreciation_pct: 6,
      vix_spike_pct: 40,
      fii_outflow_spike_cr: -4500,
      rbi_rate_hike_bps: 50,
      gdelt_escalation_pct: 85,
      dxy_rally_pct: 6
    }
  },
  {
    id: 'fed_tightening_2024',
    title: '⚡ 2024 Fed Tightening & Middle East',
    desc: 'High dollar index & elevated bond yields',
    shocks: {
      crude_oil_spike_pct: 25,
      usd_inr_depreciation_pct: 3,
      vix_spike_pct: 35,
      fii_outflow_spike_cr: -4000,
      rbi_rate_hike_bps: 25,
      gdelt_escalation_pct: 50,
      dxy_rally_pct: 5
    }
  }
];

export default function MacroSimulator({ holdings, availableCapital = 500000, API_BASE_URL }) {
  // Shock sliders state
  const [crudeSpike, setCrudeSpike] = useState(15);
  const [usdInrDep, setUsdInrDep] = useState(3);
  const [vixSpike, setVixSpike] = useState(25);
  const [fiiOutflow, setFiiOutflow] = useState(-3500);
  const [rbiRateHike, setRbiRateHike] = useState(25);
  const [gdeltEscalation, setGdeltEscalation] = useState(30);
  const [dxyRally, setDxyRally] = useState(3.5);

  // Scenarios and Simulation state
  const [probableScenarios, setProbableScenarios] = useState([]);
  const [selectedScenarioId, setSelectedScenarioId] = useState(null);
  const [scenariosLoading, setScenariosLoading] = useState(false);
  const [simLoading, setSimLoading] = useState(false);
  const [simResult, setSimResult] = useState(null);

  // Fetch dynamic day-to-day scenarios from World Monitor on mount
  useEffect(() => {
    fetchProbableScenarios();
  }, []);

  const fetchProbableScenarios = async () => {
    setScenariosLoading(true);
    try {
      const res = await axios.get(`${API_BASE_URL}/api/probable-scenarios`);
      if (res.data && res.data.scenarios) {
        setProbableScenarios(res.data.scenarios);
        if (res.data.scenarios.length > 0) {
          applyScenario(res.data.scenarios[0]);
        }
      }
    } catch (e) {
      console.warn("Failed to fetch dynamic scenarios, using fallback baseline:", e);
    } finally {
      setScenariosLoading(false);
    }
  };

  const applyScenario = (scenario) => {
    setSelectedScenarioId(scenario.id);
    const shocks = scenario.shocks || {};
    setCrudeSpike(shocks.crude_oil_spike_pct || 0);
    setUsdInrDep(shocks.usd_inr_depreciation_pct || 0);
    setVixSpike(shocks.vix_spike_pct || 0);
    setFiiOutflow(shocks.fii_outflow_spike_cr || -2500);
    setRbiRateHike(shocks.rbi_rate_hike_bps || 0);
    setGdeltEscalation(shocks.gdelt_escalation_pct || 0);
    setDxyRally(shocks.dxy_rally_pct || 0);

    runSimulationWithShocks({
      crude_oil_spike_pct: shocks.crude_oil_spike_pct || 0,
      usd_inr_depreciation_pct: shocks.usd_inr_depreciation_pct || 0,
      vix_spike_pct: shocks.vix_spike_pct || 0,
      fii_outflow_spike_cr: shocks.fii_outflow_spike_cr || -2500,
      rbi_rate_hike_bps: shocks.rbi_rate_hike_bps || 0,
      gdelt_escalation_pct: shocks.gdelt_escalation_pct || 0,
      dxy_rally_pct: shocks.dxy_rally_pct || 0,
      scenario_id: scenario.id
    });
  };

  const applyHistoricalPreset = (preset) => {
    setSelectedScenarioId(preset.id);
    const s = preset.shocks;
    setCrudeSpike(s.crude_oil_spike_pct);
    setUsdInrDep(s.usd_inr_depreciation_pct);
    setVixSpike(s.vix_spike_pct);
    setFiiOutflow(s.fii_outflow_spike_cr);
    setRbiRateHike(s.rbi_rate_hike_bps);
    setGdeltEscalation(s.gdelt_escalation_pct);
    setDxyRally(s.dxy_rally_pct);

    runSimulationWithShocks(s);
  };

  const runCustomSimulation = () => {
    setSelectedScenarioId(null);
    runSimulationWithShocks({
      crude_oil_spike_pct: crudeSpike,
      usd_inr_depreciation_pct: usdInrDep,
      vix_spike_pct: vixSpike,
      fii_outflow_spike_cr: fiiOutflow,
      rbi_rate_hike_bps: rbiRateHike,
      gdelt_escalation_pct: gdeltEscalation,
      dxy_rally_pct: dxyRally
    });
  };

  const runSimulationWithShocks = async (payload) => {
    setSimLoading(true);
    try {
      const res = await axios.post(`${API_BASE_URL}/api/stress-test`, {
        ...payload,
        holdings: holdings || []
      });
      setSimResult(res.data);
    } catch (e) {
      console.error("Stress test simulation error:", e);
    } finally {
      setSimLoading(false);
    }
  };

  const resetAllSliders = () => {
    setSelectedScenarioId(null);
    setCrudeSpike(0);
    setUsdInrDep(0);
    setVixSpike(0);
    setFiiOutflow(0);
    setRbiRateHike(0);
    setGdeltEscalation(0);
    setDxyRally(0);
    runSimulationWithShocks({
      crude_oil_spike_pct: 0,
      usd_inr_depreciation_pct: 0,
      vix_spike_pct: 0,
      fii_outflow_spike_cr: 0,
      rbi_rate_hike_bps: 0,
      gdelt_escalation_pct: 0,
      dxy_rally_pct: 0
    });
  };

  const getThreatColor = (score) => {
    if (score >= 75) return '#f43f5e';
    if (score >= 60) return '#f59e0b';
    if (score >= 45) return '#eab308';
    return '#10b981';
  };

  const getSeverityBadgeStyle = (badge) => {
    if (badge === 'CRITICAL') return { background: 'rgba(244, 63, 94, 0.2)', border: '1px solid #f43f5e', color: '#fb7185' };
    if (badge === 'HIGH') return { background: 'rgba(245, 158, 11, 0.2)', border: '1px solid #f59e0b', color: '#fbbf24' };
    return { background: 'rgba(59, 130, 246, 0.2)', border: '1px solid #3b82f6', color: '#60a5fa' };
  };

  // Absolute Rupee Impact Math
  const baselineCap = Number(availableCapital) || 500000;
  const pctImpact = simResult?.estimated_portfolio_impact_pct || 0;
  const simulatedPortfolioVal = baselineCap * (1 + pctImpact / 100);
  const rupeeDelta = simulatedPortfolioVal - baselineCap;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>

      {/* 1. Historical Crisis Shock Presets Banner */}
      <div className="glass-panel" style={{ padding: '20px', border: '1px solid rgba(245, 158, 11, 0.3)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px', flexWrap: 'wrap', gap: '8px' }}>
          <div>
            <h3 style={{ fontSize: '15px', fontWeight: '800', color: '#fff', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Flame size={18} color="#f59e0b" />
              Historical Crisis Stress Test Presets
            </h3>
            <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '2px' }}>
              Simulate your portfolio's performance against actual historical black-swan crisis market shocks.
            </p>
          </div>
          <button
            onClick={resetAllSliders}
            style={{
              padding: '6px 12px', borderRadius: '8px',
              background: 'rgba(255, 255, 255, 0.05)', border: '1px solid var(--border-color)',
              color: 'var(--text-muted)', fontSize: '12px', fontWeight: '600', cursor: 'pointer',
              display: 'flex', alignItems: 'center', gap: '6px'
            }}
          >
            <RotateCcw size={13} /> Reset Sliders to Neutral (0)
          </button>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '10px' }}>
          {HISTORICAL_CRISIS_PRESETS.map(preset => {
            const isSelected = selectedScenarioId === preset.id;
            return (
              <div
                key={preset.id}
                onClick={() => applyHistoricalPreset(preset)}
                style={{
                  padding: '12px 14px', borderRadius: '10px', cursor: 'pointer',
                  background: isSelected ? 'rgba(245, 158, 11, 0.18)' : 'rgba(255, 255, 255, 0.03)',
                  border: isSelected ? '1px solid #f59e0b' : '1px solid var(--border-color)',
                  transition: 'all 0.2s'
                }}
              >
                <div style={{ fontSize: '13px', fontWeight: '700', color: isSelected ? '#fbbf24' : '#fff' }}>
                  {preset.title}
                </div>
                <div style={{ fontSize: '11px', color: 'var(--text-dim)', marginTop: '3px' }}>
                  {preset.desc}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 2. World Monitor 5 Dynamic Day-to-Day Probable Scenarios Section */}
      <div className="glass-panel" style={{ padding: '24px', background: 'linear-gradient(135deg, rgba(15, 23, 42, 0.95), rgba(30, 41, 59, 0.85))' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '12px' }}>
          <div>
            <h2 style={{ fontSize: '18px', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '10px', color: '#fff' }}>
              <Globe size={22} color="#06b6d4" />
              World Monitor MCP — 5 Dynamic Day-to-Day Probable Scenarios
            </h2>
            <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '4px' }}>
              Synthesized live from GDELT geopolitical threat feeds, crude oil shifts, FX pressure, and institutional capital flows.
            </p>
          </div>
          <button
            onClick={fetchProbableScenarios}
            disabled={scenariosLoading}
            style={{
              padding: '8px 14px', borderRadius: '8px',
              background: 'rgba(6, 182, 212, 0.15)', border: '1px solid #06b6d4',
              color: '#22d3ee', fontSize: '12px', fontWeight: '700', cursor: 'pointer',
              display: 'flex', alignItems: 'center', gap: '6px'
            }}
          >
            <RefreshCw size={13} className={scenariosLoading ? "animate-spin" : ""} />
            Refresh Daily Signals
          </button>
        </div>

        {/* 5 Scenario Cards Carousel / Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '14px' }}>
          {probableScenarios.map((sc, idx) => {
            const isSelected = selectedScenarioId === sc.id;
            const badgeStyle = getSeverityBadgeStyle(sc.severity_badge);
            return (
              <div
                key={sc.id || idx}
                onClick={() => applyScenario(sc)}
                style={{
                  padding: '14px', borderRadius: '12px', cursor: 'pointer', transition: 'all 0.25s ease',
                  background: isSelected ? 'rgba(6, 182, 212, 0.12)' : 'rgba(255, 255, 255, 0.03)',
                  border: isSelected ? '2px solid #06b6d4' : '1px solid var(--border-color)',
                  boxShadow: isSelected ? '0 0 15px rgba(6, 182, 212, 0.25)' : 'none',
                  display: 'flex', flexDirection: 'column', justifyContent: 'space-between'
                }}
              >
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                    <span style={{ fontSize: '10px', fontWeight: '800', padding: '2px 8px', borderRadius: '4px', ...badgeStyle }}>
                      {sc.severity_badge} • {sc.probability_pct}% PROBABILITY
                    </span>
                    <span style={{ fontSize: '11px', color: '#94a3b8', fontWeight: '600' }}>#{idx + 1}</span>
                  </div>

                  <h3 style={{ fontSize: '13px', fontWeight: '700', color: isSelected ? '#38bdf8' : '#f8fafc', marginBottom: '6px', lineHeight: '1.3' }}>
                    {sc.title}
                  </h3>

                  <p style={{ fontSize: '11px', color: 'var(--text-muted)', lineHeight: '1.4', marginBottom: '12px', display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                    {sc.summary}
                  </p>
                </div>

                <div>
                  <div style={{ fontSize: '10px', color: '#94a3b8', marginBottom: '8px', display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                    {sc.shocks?.crude_oil_spike_pct > 0 && <span style={{ background: 'rgba(245, 158, 11, 0.15)', padding: '2px 6px', borderRadius: '4px', color: '#fbbf24' }}>Crude +{sc.shocks.crude_oil_spike_pct}%</span>}
                    {sc.shocks?.vix_spike_pct > 0 && <span style={{ background: 'rgba(168, 85, 247, 0.15)', padding: '2px 6px', borderRadius: '4px', color: '#c084fc' }}>VIX +{sc.shocks.vix_spike_pct}%</span>}
                    {sc.shocks?.usd_inr_depreciation_pct > 0 && <span style={{ background: 'rgba(6, 182, 212, 0.15)', padding: '2px 6px', borderRadius: '4px', color: '#22d3ee' }}>FX +{sc.shocks.usd_inr_depreciation_pct}%</span>}
                  </div>

                  <button
                    style={{
                      width: '100%', padding: '6px 10px', borderRadius: '6px', fontSize: '11px', fontWeight: '700',
                      background: isSelected ? '#06b6d4' : 'rgba(255, 255, 255, 0.06)',
                      color: isSelected ? '#0f172a' : 'var(--text-muted)',
                      border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px'
                    }}
                  >
                    <Zap size={12} />
                    {isSelected ? 'Active Scenario' : 'Simulate Scenario'}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 3. Main Grid: Multi-Slider Control Panel + Dynamic Simulation Dashboard */}
      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(320px, 380px) 1fr', gap: '24px' }}>

        {/* Multi-Parameter Shock Controls */}
        <div className="glass-panel" style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 style={{ fontSize: '15px', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '8px', color: '#fff' }}>
              <Sliders size={18} color="#f59e0b" />
              Custom Shock Sliders
            </h3>
            <button
              onClick={resetAllSliders}
              style={{ fontSize: '11px', color: 'var(--text-muted)', background: 'none', border: 'none', cursor: 'pointer', textDecoration: 'underline' }}
            >
              Reset All
            </button>
          </div>

          {/* 1. Brent Crude Oil Spike */}
          <div className="glass-card" style={{ padding: '10px 12px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', fontWeight: '600', marginBottom: '4px' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>🛢️ Brent Crude:</span>
              <span style={{ color: crudeSpike >= 0 ? '#f59e0b' : '#34d399', fontWeight: '800' }}>{crudeSpike > 0 ? `+${crudeSpike}%` : `${crudeSpike}%`}</span>
            </div>
            <input
              type="range" min="-50" max="60" value={crudeSpike}
              onChange={(e) => { setSelectedScenarioId(null); setCrudeSpike(Number(e.target.value)); }}
              style={{ width: '100%', accentColor: '#f59e0b' }}
            />
          </div>

          {/* 2. USD / INR Depreciation */}
          <div className="glass-card" style={{ padding: '10px 12px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', fontWeight: '600', marginBottom: '4px' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>💵 USD / INR Depreciation:</span>
              <span style={{ color: '#06b6d4', fontWeight: '800' }}>+{usdInrDep}%</span>
            </div>
            <input
              type="range" min="0" max="15" step="0.5" value={usdInrDep}
              onChange={(e) => { setSelectedScenarioId(null); setUsdInrDep(Number(e.target.value)); }}
              style={{ width: '100%', accentColor: '#06b6d4' }}
            />
          </div>

          {/* 3. India VIX Volatility Spike */}
          <div className="glass-card" style={{ padding: '10px 12px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', fontWeight: '600', marginBottom: '4px' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>📈 India VIX Volatility:</span>
              <span style={{ color: '#a855f7', fontWeight: '800' }}>+{vixSpike}%</span>
            </div>
            <input
              type="range" min="0" max="180" value={vixSpike}
              onChange={(e) => { setSelectedScenarioId(null); setVixSpike(Number(e.target.value)); }}
              style={{ width: '100%', accentColor: '#a855f7' }}
            />
          </div>

          {/* 4. FII Net Sell Outflow */}
          <div className="glass-card" style={{ padding: '10px 12px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', fontWeight: '600', marginBottom: '4px' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>💸 FII Net Sell Outflow:</span>
              <span style={{ color: '#f43f5e', fontWeight: '800' }}>-₹{Math.abs(fiiOutflow).toLocaleString('en-IN')} Cr</span>
            </div>
            <input
              type="range" min="-15000" max="0" step="500" value={fiiOutflow}
              onChange={(e) => { setSelectedScenarioId(null); setFiiOutflow(Number(e.target.value)); }}
              style={{ width: '100%', accentColor: '#f43f5e' }}
            />
          </div>

          {/* 5. RBI Repo Rate Shift */}
          <div className="glass-card" style={{ padding: '10px 12px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', fontWeight: '600', marginBottom: '4px' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>🏦 RBI Repo Rate Shift:</span>
              <span style={{ color: '#eab308', fontWeight: '800' }}>{rbiRateHike >= 0 ? `+${rbiRateHike}` : rbiRateHike} bps</span>
            </div>
            <input
              type="range" min="-75" max="150" step="25" value={rbiRateHike}
              onChange={(e) => { setSelectedScenarioId(null); setRbiRateHike(Number(e.target.value)); }}
              style={{ width: '100%', accentColor: '#eab308' }}
            />
          </div>

          {/* 6. GDELT Geopolitical Conflict */}
          <div className="glass-card" style={{ padding: '10px 12px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', fontWeight: '600', marginBottom: '4px' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>🌐 GDELT Conflict Escalation:</span>
              <span style={{ color: '#ef4444', fontWeight: '800' }}>+{gdeltEscalation}%</span>
            </div>
            <input
              type="range" min="0" max="100" value={gdeltEscalation}
              onChange={(e) => { setSelectedScenarioId(null); setGdeltEscalation(Number(e.target.value)); }}
              style={{ width: '100%', accentColor: '#ef4444' }}
            />
          </div>

          {/* 7. DXY Dollar Index Rally */}
          <div className="glass-card" style={{ padding: '10px 12px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', fontWeight: '600', marginBottom: '4px' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>💲 DXY Dollar Index:</span>
              <span style={{ color: '#3b82f6', fontWeight: '800' }}>+{dxyRally}%</span>
            </div>
            <input
              type="range" min="0" max="12" step="0.5" value={dxyRally}
              onChange={(e) => { setSelectedScenarioId(null); setDxyRally(Number(e.target.value)); }}
              style={{ width: '100%', accentColor: '#3b82f6' }}
            />
          </div>

          <button
            onClick={runCustomSimulation}
            disabled={simLoading}
            style={{
              padding: '12px', borderRadius: '10px',
              background: 'linear-gradient(135deg, #f59e0b, #d97706)',
              color: '#0f172a', fontSize: '14px', fontWeight: '800', cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
              border: 'none', boxShadow: '0 4px 14px rgba(245, 158, 11, 0.3)'
            }}
          >
            <RefreshCw size={16} className={simLoading ? "animate-spin" : ""} />
            {simLoading ? 'Simulating Shocks...' : 'Recalculate Stress Test'}
          </button>
        </div>

        {/* Dynamic Simulation Results Dashboard */}
        <div className="glass-panel" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {simResult ? (
            <>
              {/* Header Threat Gauge & Regime Bar */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>

                {/* Threat Score Card */}
                <div className="glass-card" style={{ padding: '16px', borderLeft: `4px solid ${getThreatColor(simResult.simulated_threat_score)}` }}>
                  <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: '600', textTransform: 'uppercase' }}>
                    Simulated Threat Score
                  </span>
                  <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px', marginTop: '6px' }}>
                    <span style={{ fontSize: '28px', fontWeight: '900', color: getThreatColor(simResult.simulated_threat_score) }}>
                      {simResult.simulated_threat_score}
                    </span>
                    <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>/ 100</span>
                  </div>
                </div>

                {/* Estimated Portfolio Impact Card (Percentage + Absolute ₹) */}
                <div className="glass-card" style={{ padding: '16px', borderLeft: `4px solid ${pctImpact < 0 ? '#f43f5e' : '#10b981'}` }}>
                  <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: '600', textTransform: 'uppercase' }}>
                    Simulated Rupee Impact
                  </span>
                  <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px', marginTop: '6px' }}>
                    <span style={{ fontSize: '24px', fontWeight: '900', color: pctImpact < 0 ? '#f43f5e' : '#10b981' }}>
                      {rupeeDelta >= 0 ? `+₹${formatINR(Math.round(rupeeDelta))}` : `-₹${formatINR(Math.round(Math.abs(rupeeDelta)))}`}
                    </span>
                    <span style={{ fontSize: '12px', fontWeight: '700', color: pctImpact < 0 ? '#fb7185' : '#34d399' }}>
                      ({pctImpact > 0 ? `+${pctImpact}%` : `${pctImpact}%`})
                    </span>
                  </div>
                  <div style={{ fontSize: '11px', color: 'var(--text-dim)', marginTop: '4px' }}>
                    Portfolio: ₹{formatINR(baselineCap)} → ₹{formatINR(Math.round(simulatedPortfolioVal))}
                  </div>
                </div>

                {/* Simulated Regime Card */}
                <div className="glass-card" style={{ padding: '16px', borderLeft: '4px solid #06b6d4' }}>
                  <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: '600', textTransform: 'uppercase' }}>
                    Active Macro Regime
                  </span>
                  <div style={{ fontSize: '13px', fontWeight: '800', color: '#38bdf8', marginTop: '8px', lineHeight: '1.3' }}>
                    {simResult.simulated_regime_label || simResult.simulated_regime}
                  </div>
                </div>
              </div>

              {/* Scenario Narrative Box */}
              <div className="glass-card" style={{ padding: '16px', background: 'rgba(245, 158, 11, 0.05)', border: '1px solid rgba(245, 158, 11, 0.2)' }}>
                <div style={{ fontSize: '12px', fontWeight: '700', color: '#fbbf24', marginBottom: '6px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Flame size={15} />
                  Quantitative Shock Rationale & Narrative
                </div>
                <p style={{ fontSize: '12px', color: 'var(--text-main)', lineHeight: '1.5' }}>
                  {simResult.scenario_narrative}
                </p>
              </div>

              {/* Asset Class Impact Heatmap */}
              {simResult.asset_class_impact_breakdown && (
                <div>
                  <h4 style={{ fontSize: '13px', fontWeight: '700', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '6px', color: '#fff' }}>
                    <Layers size={15} color="#a855f7" />
                    Asset Class Estimated Performance Under Shock
                  </h4>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '10px' }}>
                    {Object.entries(simResult.asset_class_impact_breakdown).map(([asset, val]) => (
                      <div key={asset} className="glass-card" style={{ padding: '10px', textAlign: 'center' }}>
                        <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{asset}</div>
                        <div style={{ fontSize: '15px', fontWeight: '800', marginTop: '4px', color: val < 0 ? '#f43f5e' : val > 0 ? '#10b981' : '#94a3b8' }}>
                          {val > 0 ? `+${val}%` : `${val}%`}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Sector Breakdown: Vulnerable vs Resilient */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                {/* Vulnerable Sectors */}
                <div className="glass-card" style={{ padding: '14px', background: 'rgba(244, 63, 94, 0.04)', border: '1px solid rgba(244, 63, 94, 0.15)' }}>
                  <div style={{ fontSize: '12px', fontWeight: '700', color: '#fb7185', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <AlertTriangle size={14} />
                    High Vulnerability Sectors
                  </div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                    {simResult.high_vulnerability_sectors?.length > 0 ? (
                      simResult.high_vulnerability_sectors.map((sec, i) => (
                        <span key={i} style={{ fontSize: '11px', padding: '3px 8px', borderRadius: '4px', background: 'rgba(244, 63, 94, 0.15)', color: '#fca5a5' }}>
                          {sec}
                        </span>
                      ))
                    ) : (
                      <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>No critical vulnerabilities detected.</span>
                    )}
                  </div>
                </div>

                {/* Resilient Sectors */}
                <div className="glass-card" style={{ padding: '14px', background: 'rgba(16, 185, 129, 0.04)', border: '1px solid rgba(16, 185, 129, 0.15)' }}>
                  <div style={{ fontSize: '12px', fontWeight: '700', color: '#34d399', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <ShieldCheck size={14} />
                    Resilient / Outperforming Sectors
                  </div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                    {simResult.resilient_sectors?.length > 0 ? (
                      simResult.resilient_sectors.map((sec, i) => (
                        <span key={i} style={{ fontSize: '11px', padding: '3px 8px', borderRadius: '4px', background: 'rgba(16, 185, 129, 0.15)', color: '#6ee7b7' }}>
                          {sec}
                        </span>
                      ))
                    ) : (
                      <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>General market benchmark resilience.</span>
                    )}
                  </div>
                </div>
              </div>

              {/* Strategic Defensive Hedges */}
              <div className="glass-card" style={{ padding: '16px', background: 'rgba(6, 182, 212, 0.04)', border: '1px solid rgba(6, 182, 212, 0.2)' }}>
                <div style={{ fontSize: '13px', fontWeight: '700', color: '#38bdf8', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <ShieldCheck size={16} />
                  Recommended Strategic Defensive Hedges
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                  {simResult.defensive_recommendations?.map((ticker, i) => (
                    <span key={i} style={{
                      fontSize: '12px', fontWeight: '700', padding: '6px 12px', borderRadius: '6px',
                      background: 'rgba(6, 182, 212, 0.15)', border: '1px solid #06b6d4', color: '#22d3ee'
                    }}>
                      ⚡ {ticker}
                    </span>
                  ))}
                </div>
              </div>
            </>
          ) : (
            <div style={{ textAlign: 'center', color: 'var(--text-dim)', padding: '60px 0', fontSize: '14px' }}>
              Select a World Monitor scenario above or adjust shock sliders to compute portfolio stress test impacts.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
