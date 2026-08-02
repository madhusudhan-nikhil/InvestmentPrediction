import React, { useState, useEffect, useRef } from 'react';
import { Target, Calendar, TrendingUp, DollarSign, Clock, Download, LineChart, CheckCircle2, History, AlertCircle, ArrowUpRight, ShieldAlert, Zap } from 'lucide-react';

export default function TargetProfitPredictor({ recommendationsData }) {
  const [targetCapital, setTargetCapital] = useState(100000);
  const [targetProfit, setTargetProfit] = useState(5000);
  const [targetMonths, setTargetMonths] = useState(1.0); // Time Horizon in MONTHS
  const [riskProfile, setRiskProfile] = useState("Moderate");
  const [targetSellingData, setTargetSellingData] = useState(null);
  const [loadingTargetData, setLoadingTargetData] = useState(false);

  // Price History & Scenario Simulator State
  const [selectedTicker, setSelectedTicker] = useState("ICICIBANK.NS");
  const [historyPeriod, setHistoryPeriod] = useState("6mo");
  const [historyData, setHistoryData] = useState(null);
  const [loadingHistory, setLoadingHistory] = useState(false);

  const historySectionRef = useRef(null);

  useEffect(() => {
    if (recommendationsData?.total_capital_inr) {
      setTargetCapital(recommendationsData.total_capital_inr);
      setTargetProfit(Math.round(recommendationsData.total_capital_inr * 0.05));
    }
  }, [recommendationsData]);

  const fetchTargetSellingPoints = async () => {
    setLoadingTargetData(true);
    try {
      const res = await fetch("http://localhost:8000/api/target-selling-point", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          capital_inr: parseFloat(targetCapital) || 100000,
          target_profit_inr: parseFloat(targetProfit) || 5000,
          time_horizon_months: parseFloat(targetMonths) || 1.0,
          risk_profile: riskProfile
        })
      });
      if (res.ok) {
        const data = await res.json();
        setTargetSellingData(data);
        if (data.recommendations && data.recommendations.length > 0) {
          // Auto-select the first suggested stock from horizon recommendations
          setSelectedTicker(data.recommendations[0].ticker);
        }
      }
    } catch (e) {
      console.error("Target selling point fetch error:", e);
    } finally {
      setLoadingTargetData(false);
    }
  };

  const fetchTickerHistory = async (tickerSymbol, pd) => {
    setLoadingHistory(true);
    try {
      const targetPct = targetCapital > 0 ? ((targetProfit / targetCapital) * 100).toFixed(1) : 5.0;
      const res = await fetch(`http://localhost:8000/api/ticker-history?ticker=${tickerSymbol}&period=${pd}&target_profit_pct=${targetPct}`);
      if (res.ok) {
        const data = await res.json();
        setHistoryData(data);
      }
    } catch (e) {
      console.error("Ticker history fetch error:", e);
    } finally {
      setLoadingHistory(false);
    }
  };

  useEffect(() => {
    fetchTargetSellingPoints();
  }, []);

  useEffect(() => {
    if (selectedTicker) {
      fetchTickerHistory(selectedTicker, historyPeriod);
    }
  }, [selectedTicker, historyPeriod]);

  // Dynamically derive suggested tickers directly from Target Profit Predictor recommendations
  const suggestedTickers = (targetSellingData?.recommendations && targetSellingData.recommendations.length > 0)
    ? targetSellingData.recommendations.map(r => ({
        ticker: r.ticker,
        name: r.instrument_name,
        targetPrice: r.target_selling_price,
        currentPrice: r.current_unit_price,
        holdingMonths: r.estimated_holding_months,
        category: r.category
      }))
    : [
        { ticker: "ICICIBANK.NS", name: "ICICI Bank Ltd", targetPrice: 1507.17, currentPrice: 1435.40, holdingMonths: 0.7, category: "Category C" },
        { ticker: "RELIANCE.NS", name: "Reliance Industries Ltd", targetPrice: 1373.19, currentPrice: 1307.80, holdingMonths: 0.9, category: "Category A" },
        { ticker: "NIFTYBEES.NS", name: "Nippon India ETF Nifty BeES", targetPrice: 291.29, currentPrice: 277.42, holdingMonths: 0.9, category: "Category A" },
        { ticker: "HDFCBANK.NS", name: "HDFC Bank Ltd", targetPrice: 785.56, currentPrice: 748.15, holdingMonths: 0.9, category: "Category A" },
        { ticker: "GOLDBEES.NS", name: "Nippon India ETF Gold BeES", targetPrice: 122.97, currentPrice: 117.11, holdingMonths: 1.2, category: "Category B" }
      ];

  const handleSelectSuggestedTickerForBacktest = (tickerSymbol) => {
    setSelectedTicker(tickerSymbol);
    if (historySectionRef.current) {
      historySectionRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleExportTargetSellingCSV = () => {
    if (!targetSellingData || !targetSellingData.recommendations) return;
    const headers = "Ticker,Instrument Name,Category,Current Unit Price (INR),Target Sell Rate (INR),Profit Per Share (INR),Total Expected Profit (INR),Qty to Buy,Allocated Capital (INR),Est Holding Months,Est Holding Days,Probable Exit Date,Difficulty & Risk Grade\n";
    const dataRows = targetSellingData.recommendations.map(item =>
      `"${item.ticker}","${item.instrument_name}","${item.category}",${item.current_unit_price},${item.target_selling_price},${item.profit_per_share_inr},${item.total_expected_profit_inr},${item.suggested_quantity},${item.total_allocated_inr},${item.estimated_holding_months},${item.estimated_holding_days},"${item.probable_exit_date}","${item.target_difficulty_rating}"`
    );
    const totalQty = targetSellingData.recommendations.reduce((sum, i) => sum + i.suggested_quantity, 0);
    const totalRow = `"TOTAL","OVERALL PORTFOLIO TARGET TOTALS","ALL CATEGORIES","-","-","-",${targetSellingData.total_expected_profit_inr},${totalQty},${targetSellingData.total_invested_inr},"${targetSellingData.time_horizon_months} Months Target","${targetSellingData.portfolio_probable_exit_window}","${targetSellingData.strategy_regime_name}"`;

    const blob = new Blob([headers + dataRows.join("\n") + "\n" + totalRow], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "BharatiQuant_Target_Selling_Plan.csv";
    a.click();
  };

  const renderPriceChart = () => {
    if (!historyData || !historyData.history || historyData.history.length === 0) return null;
    const pts = historyData.history;
    const prices = pts.map(p => p.close);
    const minP = Math.min(...prices) * 0.98;
    const maxP = Math.max(...prices, historyData.target_selling_price) * 1.02;

    const width = 700;
    const height = 180;

    const points = pts.map((p, idx) => {
      const x = (idx / (pts.length - 1)) * width;
      const y = height - ((p.close - minP) / (maxP - minP)) * height;
      return `${x},${y}`;
    }).join(' ');

    const targetY = height - ((historyData.target_selling_price - minP) / (maxP - minP)) * height;

    return (
      <div style={{ position: 'relative', marginTop: '16px', background: 'rgba(0,0,0,0.4)', borderRadius: '12px', padding: '16px', border: '1px solid rgba(255,255,255,0.08)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '11px', color: 'var(--text-muted)' }}>
          <span>High: <strong style={{ color: '#34d399' }}>₹{Math.max(...prices).toFixed(2)}</strong></span>
          <span>Target Selling Price Line: <strong style={{ color: '#fbbf24' }}>₹{historyData.target_selling_price.toFixed(2)} (+{historyData.target_profit_pct}%)</strong></span>
          <span>Low: <strong style={{ color: '#fb7185' }}>₹{Math.min(...prices).toFixed(2)}</strong></span>
        </div>
        <svg viewBox={`0 0 ${width} ${height}`} style={{ width: '100%', height: '180px', overflow: 'visible' }}>
          <line x1="0" y1={height / 2} x2={width} y2={height / 2} stroke="rgba(255,255,255,0.05)" strokeDasharray="4 4" />
          
          {targetY >= 0 && targetY <= height && (
            <line x1="0" y1={targetY} x2={width} y2={targetY} stroke="#f59e0b" strokeWidth="2" strokeDasharray="6 4" />
          )}

          <polyline
            fill="none"
            stroke="#34d399"
            strokeWidth="2.5"
            points={points}
          />
        </svg>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10px', color: 'var(--text-dim)', marginTop: '6px' }}>
          <span>{pts[0]?.date}</span>
          <span>{pts[Math.floor(pts.length / 2)]?.date}</span>
          <span>{pts[pts.length - 1]?.date} (Latest: ₹{historyData.current_price})</span>
        </div>
      </div>
    );
  };

  const selectedStockObj = suggestedTickers.find(t => t.ticker === selectedTicker) || suggestedTickers[0];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* 1. Target Profit & Selling Point Predictor Panel */}
      <div className="glass-panel" style={{ padding: '20px' }}>
        <div style={{
          padding: '16px 20px', borderRadius: '12px', marginBottom: '20px',
          background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.15) 0%, rgba(99, 102, 241, 0.15) 100%)',
          border: '1px solid rgba(245, 158, 11, 0.3)',
          display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px'
        }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Target size={22} color="#fbbf24" />
              <h2 style={{ fontSize: '20px', fontWeight: '800', color: '#fff' }}>Target Profit & Probable Selling Point Predictor</h2>
            </div>
            <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '4px' }}>
              Dynamic horizon-aware profit target calculator & stock selection engine tailored specifically to your capital, target profit, and timeframe in months.
            </p>
          </div>

          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', alignItems: 'center' }}>
            <div>
              <label style={{ fontSize: '10px', color: 'var(--text-dim)', display: 'block', marginBottom: '2px', fontWeight: '700' }}>CAPITAL (₹)</label>
              <input
                type="number"
                value={targetCapital}
                onChange={(e) => setTargetCapital(e.target.value)}
                style={{
                  padding: '8px 12px', borderRadius: '8px', background: 'rgba(0,0,0,0.5)',
                  border: '1px solid rgba(255,255,255,0.2)', color: '#fff', fontSize: '14px', width: '130px', fontWeight: '700'
                }}
              />
            </div>

            <div>
              <label style={{ fontSize: '10px', color: 'var(--text-dim)', display: 'block', marginBottom: '2px', fontWeight: '700' }}>TARGET PROFIT (₹)</label>
              <input
                type="number"
                value={targetProfit}
                onChange={(e) => setTargetProfit(e.target.value)}
                style={{
                  padding: '8px 12px', borderRadius: '8px', background: 'rgba(0,0,0,0.5)',
                  border: '1px solid rgba(255,255,255,0.2)', color: '#34d399', fontSize: '14px', width: '120px', fontWeight: '700'
                }}
              />
            </div>

            <div>
              <label style={{ fontSize: '10px', color: 'var(--text-dim)', display: 'block', marginBottom: '2px', fontWeight: '700' }}>HORIZON (MONTHS)</label>
              <div style={{ display: 'flex', gap: '4px', alignItems: 'center' }}>
                <input
                  type="number"
                  step="0.5"
                  value={targetMonths}
                  onChange={(e) => setTargetMonths(e.target.value)}
                  style={{
                    padding: '8px 12px', borderRadius: '8px', background: 'rgba(0,0,0,0.5)',
                    border: '1px solid rgba(245, 158, 11, 0.5)', color: '#fbbf24', fontSize: '14px', width: '90px', fontWeight: '800'
                  }}
                />
                <select
                  value={targetMonths}
                  onChange={(e) => setTargetMonths(parseFloat(e.target.value))}
                  style={{
                    padding: '8px 8px', borderRadius: '8px', background: 'rgba(0,0,0,0.5)',
                    border: '1px solid rgba(255,255,255,0.2)', color: '#94a3b8', fontSize: '12px', cursor: 'pointer'
                  }}
                >
                  <option value={1.0} style={{ background: '#0f172a' }}>1 Month</option>
                  <option value={2.0} style={{ background: '#0f172a' }}>2 Months</option>
                  <option value={3.0} style={{ background: '#0f172a' }}>3 Months</option>
                  <option value={6.0} style={{ background: '#0f172a' }}>6 Months</option>
                  <option value={12.0} style={{ background: '#0f172a' }}>12 Months (1 Yr)</option>
                  <option value={24.0} style={{ background: '#0f172a' }}>24 Months (2 Yrs)</option>
                  <option value={36.0} style={{ background: '#0f172a' }}>36 Months (3 Yrs)</option>
                </select>
              </div>
            </div>

            <button
              onClick={fetchTargetSellingPoints}
              disabled={loadingTargetData}
              style={{
                marginTop: '16px', padding: '10px 18px', borderRadius: '8px',
                background: '#f59e0b', color: '#000', border: 'none',
                fontSize: '13px', fontWeight: '800', cursor: 'pointer',
                display: 'flex', alignItems: 'center', gap: '6px',
                boxShadow: '0 4px 14px rgba(245, 158, 11, 0.4)'
              }}
            >
              {loadingTargetData ? "Calculating..." : "Calculate Exit Points"}
            </button>
          </div>
        </div>

        {targetSellingData && (
          <div>
            <div style={{
              display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '12px', marginBottom: '20px'
            }}>
              <div style={{ padding: '14px 18px', borderRadius: '10px', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.08)' }}>
                <div style={{ fontSize: '10px', color: 'var(--text-dim)', fontWeight: '600' }}>REQUIRED GAIN TARGET</div>
                <div style={{ fontSize: '20px', fontWeight: '800', color: '#fbbf24' }}>{targetSellingData.target_return_pct}%</div>
                <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>₹{targetSellingData.target_profit_inr.toLocaleString('en-IN')} profit on ₹{targetSellingData.capital_inr.toLocaleString('en-IN')}</div>
              </div>

              <div style={{ padding: '14px 18px', borderRadius: '10px', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.08)' }}>
                <div style={{ fontSize: '10px', color: 'var(--text-dim)', fontWeight: '600' }}>TOTAL PORTFOLIO PROFIT</div>
                <div style={{ fontSize: '20px', fontWeight: '800', color: '#34d399' }}>₹{targetSellingData.total_expected_profit_inr.toLocaleString('en-IN')}</div>
                <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Invested Capital: ₹{targetSellingData.total_invested_inr.toLocaleString('en-IN')}</div>
              </div>

              <div style={{ padding: '14px 18px', borderRadius: '10px', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.08)' }}>
                <div style={{ fontSize: '10px', color: 'var(--text-dim)', fontWeight: '600' }}>HORIZON STRATEGY REGIME</div>
                <div style={{ fontSize: '13px', fontWeight: '800', color: '#38bdf8', marginTop: '4px' }}>
                  {targetSellingData.strategy_regime_name === 'SHORT_HORIZON_HIGH_VELOCITY_ALPHA' && '⚡ Short-Term High Velocity Alpha Focus'}
                  {targetSellingData.strategy_regime_name === 'MEDIUM_HORIZON_BALANCED_GROWTH' && '⚖️ Medium-Term Balanced Growth'}
                  {targetSellingData.strategy_regime_name === 'LONG_HORIZON_COMPOUNDING_SAFE_HAVEN' && '🛡️ Long-Term Wealth Compounder & Safe Haven'}
                </div>
                <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '2px' }}>Tailored for {targetSellingData.time_horizon_months} Months horizon</div>
              </div>

              <div style={{ padding: '14px 18px', borderRadius: '10px', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.08)' }}>
                <div style={{ fontSize: '10px', color: 'var(--text-dim)', fontWeight: '600' }}>PROBABLE EXIT WINDOW</div>
                <div style={{ fontSize: '13px', fontWeight: '800', color: '#c084fc', marginTop: '4px' }}>{targetSellingData.portfolio_probable_exit_window}</div>
                <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Exit range across positions</div>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px', flexWrap: 'wrap', gap: '10px' }}>
              <span style={{ fontSize: '13px', color: 'var(--text-muted)', fontWeight: '600' }}>
                Suggested Stock Purchase Rates, Target Selling Points & Exit Schedule ({targetSellingData.time_horizon_months} Months Horizon):
              </span>
              <button
                onClick={handleExportTargetSellingCSV}
                style={{
                  padding: '8px 14px', borderRadius: '8px',
                  background: '#f59e0b', color: '#000', border: 'none',
                  fontSize: '12px', fontWeight: '700', cursor: 'pointer',
                  display: 'flex', alignItems: 'center', gap: '6px'
                }}
              >
                <Download size={14} /> Export Exit Plan CSV
              </button>
            </div>

            {/* Target Selling Table */}
            <div style={{ overflowX: 'auto', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px', textAlign: 'left' }}>
                <thead>
                  <tr style={{ background: 'rgba(255, 255, 255, 0.04)', borderBottom: '1px solid var(--border-color)', color: 'var(--text-muted)' }}>
                    <th style={{ padding: '12px' }}>Suggested Ticker</th>
                    <th style={{ padding: '12px' }}>Current Rate</th>
                    <th style={{ padding: '12px', color: '#fbbf24' }}>Target Sell Rate</th>
                    <th style={{ padding: '12px', color: '#34d399' }}>Profit / Share</th>
                    <th style={{ padding: '12px', color: '#34d399' }}>Total Stock Profit</th>
                    <th style={{ padding: '12px' }}>Qty to Buy Today</th>
                    <th style={{ padding: '12px' }}>Est. Hold Period</th>
                    <th style={{ padding: '12px', color: '#c084fc' }}>Probable Sell Date</th>
                    <th style={{ padding: '12px' }}>Target Realization Risk</th>
                    <th style={{ padding: '12px', textAlign: 'center' }}>History Backtest</th>
                  </tr>
                </thead>
                <tbody>
                  {targetSellingData.recommendations.map((item, idx) => (
                    <tr
                      key={idx}
                      style={{
                        borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
                        background: selectedTicker === item.ticker ? 'rgba(52, 211, 153, 0.08)' : (idx % 2 === 0 ? 'transparent' : 'rgba(255, 255, 255, 0.01)')
                      }}
                    >
                      <td style={{ padding: '12px', fontWeight: '700', color: '#fff', fontFamily: 'monospace' }}>
                        {item.ticker}
                        <div style={{ fontSize: '10px', color: 'var(--text-dim)', fontWeight: '400' }}>{item.instrument_name}</div>
                      </td>
                      <td style={{ padding: '12px', fontWeight: '700', color: '#34d399' }}>₹{item.current_unit_price.toLocaleString('en-IN')}</td>
                      <td style={{ padding: '12px', fontWeight: '800', color: '#fbbf24', background: 'rgba(245, 158, 11, 0.1)' }}>
                        ₹{item.target_selling_price.toLocaleString('en-IN')}
                      </td>
                      <td style={{ padding: '12px', fontWeight: '700', color: '#34d399' }}>+₹{item.profit_per_share_inr.toLocaleString('en-IN')}</td>
                      <td style={{ padding: '12px', fontWeight: '800', color: '#34d399' }}>+₹{item.total_expected_profit_inr.toLocaleString('en-IN')}</td>
                      <td style={{ padding: '12px', fontWeight: '700', color: '#fff' }}>{item.suggested_quantity} units</td>
                      <td style={{ padding: '12px', color: 'var(--text-muted)' }}>
                        <strong>{item.estimated_holding_months} mo</strong> ({item.estimated_holding_days} days)
                      </td>
                      <td style={{ padding: '12px', fontWeight: '700', color: '#c084fc' }}>{item.probable_exit_date}</td>
                      <td style={{ padding: '12px' }}>
                        <span style={{
                          fontSize: '10px', padding: '3px 8px', borderRadius: '6px', fontWeight: '700',
                          background: item.target_difficulty_rating.includes('VERY HIGH') ? 'rgba(239, 68, 68, 0.2)' :
                                      item.target_difficulty_rating.includes('HIGH') ? 'rgba(245, 158, 11, 0.2)' :
                                      item.target_difficulty_rating.includes('MODERATE') ? 'rgba(59, 130, 246, 0.2)' : 'rgba(16, 185, 129, 0.2)',
                          color: item.target_difficulty_rating.includes('VERY HIGH') ? '#f87171' :
                                 item.target_difficulty_rating.includes('HIGH') ? '#fbbf24' :
                                 item.target_difficulty_rating.includes('MODERATE') ? '#60a5fa' : '#34d399',
                          border: item.target_difficulty_rating.includes('VERY HIGH') ? '1px solid #ef4444' :
                                  item.target_difficulty_rating.includes('HIGH') ? '1px solid #f59e0b' :
                                  item.target_difficulty_rating.includes('MODERATE') ? '1px solid #3b82f6' : '1px solid #10b981'
                        }}>
                          {item.target_difficulty_rating}
                        </span>
                      </td>
                      <td style={{ padding: '12px', textAlign: 'center' }}>
                        <button
                          onClick={() => handleSelectSuggestedTickerForBacktest(item.ticker)}
                          style={{
                            padding: '4px 10px', borderRadius: '6px', fontSize: '11px', fontWeight: '700',
                            background: selectedTicker === item.ticker ? '#10b981' : 'rgba(99, 102, 241, 0.2)',
                            color: selectedTicker === item.ticker ? '#000' : '#818cf8',
                            border: 'none', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '4px'
                          }}
                        >
                          <LineChart size={12} /> {selectedTicker === item.ticker ? 'Simulating' : 'Backtest'}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot style={{ background: 'rgba(15, 23, 42, 0.95)', borderTop: '2px solid var(--border-color)', fontWeight: '800' }}>
                  <tr>
                    <td style={{ padding: '14px 12px', color: '#ffffff' }}>
                      OVERALL TARGET TOTALS
                      <div style={{ fontSize: '10px', color: '#94a3b8', fontWeight: '400' }}>All {targetSellingData.recommendations.length} positions combined</div>
                    </td>
                    <td style={{ padding: '14px 12px', color: '#94a3b8' }}>-</td>
                    <td style={{ padding: '14px 12px', color: '#94a3b8' }}>-</td>
                    <td style={{ padding: '14px 12px', color: '#94a3b8' }}>-</td>
                    <td style={{ padding: '14px 12px', color: '#34d399', fontSize: '14px' }}>
                      +₹{targetSellingData.total_expected_profit_inr.toLocaleString('en-IN')}
                    </td>
                    <td style={{ padding: '14px 12px', color: '#ffffff', fontSize: '13px' }}>
                      {targetSellingData.recommendations.reduce((sum, i) => sum + i.suggested_quantity, 0).toLocaleString('en-IN')} units
                    </td>
                    <td style={{ padding: '14px 12px', color: '#fbbf24', fontSize: '13px' }}>
                      {targetSellingData.time_horizon_months} Months Target
                    </td>
                    <td style={{ padding: '14px 12px', color: '#c084fc', fontSize: '11px' }}>
                      {targetSellingData.portfolio_probable_exit_window}
                    </td>
                    <td style={{ padding: '14px 12px', color: '#38bdf8', fontSize: '11px' }}>
                      {targetSellingData.strategy_regime_name}
                    </td>
                    <td style={{ padding: '14px 12px' }}>-</td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* 2. Stock Price History & Historical Scenario Backtest Simulator (Dynamically linked to suggested stocks) */}
      <div ref={historySectionRef} className="glass-panel" style={{ padding: '20px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px', marginBottom: '16px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <h2 style={{ fontSize: '18px', fontWeight: '800', color: '#fff', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <History size={20} color="#34d399" />
                Stock Price History & Historical Scenario Backtest Simulator
              </h2>
              <span style={{ fontSize: '11px', background: 'rgba(52, 211, 153, 0.15)', color: '#34d399', padding: '2px 8px', borderRadius: '10px', border: '1px solid rgba(52, 211, 153, 0.3)', fontWeight: '700' }}>
                SUGGESTED PORTFOLIO STOCKS
              </span>
            </div>
            <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '4px' }}>
              Simulating past historical performance for recommended stock <strong style={{ color: '#fbbf24' }}>{selectedStockObj?.name || selectedTicker}</strong> against its target selling rate (₹{selectedStockObj?.targetPrice || historyData?.target_selling_price}).
            </p>
          </div>

          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', alignItems: 'center' }}>
            <div>
              <label style={{ fontSize: '10px', color: 'var(--text-dim)', display: 'block', marginBottom: '2px', fontWeight: '700' }}>SELECT SUGGESTED STOCK</label>
              <select
                value={selectedTicker}
                onChange={(e) => setSelectedTicker(e.target.value)}
                style={{
                  padding: '8px 12px', borderRadius: '8px', background: 'rgba(0,0,0,0.5)',
                  border: '1px solid rgba(52,211,153,0.4)', color: '#34d399', fontSize: '13px', fontWeight: '800'
                }}
              >
                {suggestedTickers.map(t => (
                  <option key={t.ticker} value={t.ticker} style={{ background: '#0f172a' }}>
                    {t.ticker} - {t.name} (Target: ₹{t.targetPrice})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label style={{ fontSize: '10px', color: 'var(--text-dim)', display: 'block', marginBottom: '2px', fontWeight: '700' }}>HISTORICAL PERIOD</label>
              <select
                value={historyPeriod}
                onChange={(e) => setHistoryPeriod(e.target.value)}
                style={{
                  padding: '8px 12px', borderRadius: '8px', background: 'rgba(0,0,0,0.5)',
                  border: '1px solid rgba(255,255,255,0.2)', color: '#fbbf24', fontSize: '13px', fontWeight: '700'
                }}
              >
                <option value="1mo" style={{ background: '#0f172a' }}>1 Month</option>
                <option value="3mo" style={{ background: '#0f172a' }}>3 Months</option>
                <option value="6mo" style={{ background: '#0f172a' }}>6 Months</option>
                <option value="1y" style={{ background: '#0f172a' }}>1 Year</option>
                <option value="ytd" style={{ background: '#0f172a' }}>YTD 2026</option>
              </select>
            </div>
          </div>
        </div>

        {loadingHistory ? (
          <div style={{ padding: '30px', textAlign: 'center', color: 'var(--text-muted)' }}>Loading historical price data & backtesting scenarios for {selectedTicker}...</div>
        ) : historyData ? (
          <div>
            {/* Price Chart */}
            {renderPriceChart()}

            {/* Historical Scenario Simulations Cards */}
            <h3 style={{ fontSize: '15px', fontWeight: '700', color: '#fff', marginTop: '24px', marginBottom: '12px' }}>
              ⚡ Historical Scenario Backtest Simulations ({selectedTicker} - {historyData.instrument_name})
            </h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '14px' }}>
              {historyData.historical_scenarios.map((sim, idx) => (
                <div key={idx} style={{
                  padding: '16px', borderRadius: '12px', background: 'rgba(255,255,255,0.02)',
                  border: '1px solid var(--border-color)', display: 'flex', flexDirection: 'column', gap: '8px'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div>
                      <div style={{ fontSize: '14px', fontWeight: '800', color: '#fff' }}>{sim.scenario_name}</div>
                      <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{sim.period_description}</div>
                    </div>
                    <span style={{
                      fontSize: '10px', padding: '2px 8px', borderRadius: '6px', fontWeight: '800',
                      background: sim.target_status === 'TARGET_HIT' ? 'rgba(16, 185, 129, 0.2)' : 'rgba(245, 158, 11, 0.2)',
                      color: sim.target_status === 'TARGET_HIT' ? '#34d399' : '#fbbf24',
                      border: sim.target_status === 'TARGET_HIT' ? '1px solid #10b981' : '1px solid #f59e0b'
                    }}>
                      {sim.target_status === 'TARGET_HIT' ? 'TARGET HIT' : 'IN PROGRESS'}
                    </span>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', padding: '8px 10px', borderRadius: '8px', background: 'rgba(0,0,0,0.3)', marginTop: '4px' }}>
                    <div>
                      <div style={{ fontSize: '10px', color: 'var(--text-dim)' }}>ENTRY PRICE</div>
                      <div style={{ fontSize: '13px', fontWeight: '700', color: '#fff' }}>₹{sim.entry_price.toFixed(2)}</div>
                      <div style={{ fontSize: '9px', color: 'var(--text-muted)' }}>Date: {sim.entry_date}</div>
                    </div>
                    <div>
                      <div style={{ fontSize: '10px', color: 'var(--text-dim)' }}>TARGET PRICE</div>
                      <div style={{ fontSize: '13px', fontWeight: '700', color: '#fbbf24' }}>₹{sim.target_selling_price.toFixed(2)}</div>
                      <div style={{ fontSize: '9px', color: '#34d399' }}>Hit: {sim.target_hit_date}</div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 'auto', paddingTop: '6px', borderTop: '1px solid rgba(255,255,255,0.05)', fontSize: '11px' }}>
                    <span style={{ color: 'var(--text-muted)' }}>Days Taken: <strong style={{ color: '#fff' }}>{sim.days_to_target} days</strong></span>
                    <span style={{ color: '#34d399', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '2px' }}>
                      <ArrowUpRight size={13} /> Peak +{sim.max_gain_pct}%
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}
