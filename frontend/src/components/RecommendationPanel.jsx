import React, { useState, useEffect } from 'react';
import { Layers, ShieldCheck, ArrowUpRight, CheckCircle2, Flame, BarChart3, Download, Target, Calendar, TrendingUp, DollarSign, Clock } from 'lucide-react';

export default function RecommendationPanel({ recommendationsData }) {
  const [activeCategory, setActiveCategory] = useState("ALL");
  const [viewMode, setViewMode] = useState("EXECUTION_PLAN"); // EXECUTION_PLAN | TARGET_PROFIT
  const [targetCapital, setTargetCapital] = useState(100000);
  const [targetProfit, setTargetProfit] = useState(5000);
  const [targetDays, setTargetDays] = useState(30);
  const [targetSellingData, setTargetSellingData] = useState(null);
  const [loadingTargetData, setLoadingTargetData] = useState(false);

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
          holding_days_target: parseInt(targetDays) || 30,
          risk_profile: recommendationsData?.risk_profile || "Moderate"
        })
      });
      if (res.ok) {
        const data = await res.json();
        setTargetSellingData(data);
      }
    } catch (e) {
      console.error("Target selling point fetch error:", e);
    } finally {
      setLoadingTargetData(false);
    }
  };

  useEffect(() => {
    if (viewMode === "TARGET_PROFIT" && !targetSellingData) {
      fetchTargetSellingPoints();
    }
  }, [viewMode]);

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
    const headers = "Ticker,Instrument Name,Category,Current Unit Price (INR),Target Sell Rate (INR),Profit Per Share (INR),Total Stock Profit (INR),Allocation (INR),Allocation (%),Suggested Quantity,Expected Return (%)\n";
    const dataRows = recs.map(r => `"${r.ticker}","${r.instrument_name}","${r.category}",${r.unit_price},${r.target_selling_price || (r.unit_price * (1 + r.expected_return_pct / 100)).toFixed(2)},${r.profit_per_share_inr || 0},${r.total_expected_stock_profit_inr || 0},${r.allocation_inr},${r.allocation_pct},${r.suggested_quantity},${r.expected_return_pct}`);
    
    const totalAllocInr = recs.reduce((sum, r) => sum + (r.allocation_inr || 0), 0);
    const totalAllocPct = recs.reduce((sum, r) => sum + (r.allocation_pct || 0), 0);
    const totalQty = recs.reduce((sum, r) => sum + (r.suggested_quantity || 0), 0);
    const totalProfitInr = recs.reduce((sum, r) => sum + (r.total_expected_stock_profit_inr || 0), 0);
    const weightedReturn = totalAllocInr > 0 ? recs.reduce((sum, r) => sum + ((r.allocation_inr || 0) * (r.expected_return_pct || 0)), 0) / totalAllocInr : 0;

    const totalRow = `"TOTAL","TOTAL PORTFOLIO ALLOCATION SUMMARY","ALL CATEGORIES","-","-","-",${totalProfitInr.toFixed(2)},${totalAllocInr.toFixed(2)},${totalAllocPct.toFixed(2)},${totalQty},${weightedReturn.toFixed(2)}`;

    const blob = new Blob([headers + dataRows.join("\n") + "\n" + totalRow], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "BharatiQuant_Execution_Plan.csv";
    a.click();
  };

  const handleExportTargetSellingCSV = () => {
    if (!targetSellingData || !targetSellingData.recommendations) return;
    const headers = "Ticker,Instrument Name,Category,Current Unit Price (INR),Qty to Buy,Allocated Capital (INR),Target Sell Rate (INR),Profit Per Share (INR),Total Expected Profit (INR),Est Holding Days,Probable Exit Date\n";
    const dataRows = targetSellingData.recommendations.map(item =>
      `"${item.ticker}","${item.instrument_name}","${item.category}",${item.current_unit_price},${item.suggested_quantity},${item.total_allocated_inr},${item.target_selling_price},${item.profit_per_share_inr},${item.total_expected_profit_inr},${item.estimated_holding_days},"${item.probable_exit_date}"`
    );
    const totalQty = targetSellingData.recommendations.reduce((sum, i) => sum + i.suggested_quantity, 0);
    const totalRow = `"TOTAL","OVERALL PORTFOLIO TARGET TOTALS","ALL CATEGORIES","-",${totalQty},${targetSellingData.total_invested_inr},"-","-",${targetSellingData.total_expected_profit_inr},"${targetSellingData.target_return_pct}% Target","${targetSellingData.portfolio_probable_exit_window}"`;

    const blob = new Blob([headers + dataRows.join("\n") + "\n" + totalRow], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "BharatiQuant_Target_Selling_Plan.csv";
    a.click();
  };

  const topAllocations = [...recs].sort((a, b) => b.allocation_inr - a.allocation_inr).slice(0, 3);

  const totalAllocatedInr = recs.reduce((sum, r) => sum + (r.allocation_inr || 0), 0);
  const totalAllocatedPct = recs.reduce((sum, r) => sum + (r.allocation_pct || 0), 0);
  const totalSuggestedUnits = recs.reduce((sum, r) => sum + (r.suggested_quantity || 0), 0);
  const weightedExpReturnPct = totalAllocatedInr > 0 ? recs.reduce((sum, r) => sum + ((r.allocation_inr || 0) * (r.expected_return_pct || 0)), 0) / totalAllocatedInr : 0;

  return (
    <div className="glass-panel" style={{ padding: '20px', marginBottom: '24px' }}>
      {/* View Mode Selector Tabs */}
      <div style={{ display: 'flex', gap: '12px', marginBottom: '20px', borderBottom: '1px solid var(--border-color)', paddingBottom: '12px' }}>
        <button
          onClick={() => setViewMode("EXECUTION_PLAN")}
          style={{
            padding: '8px 16px', borderRadius: '10px', fontSize: '13px', fontWeight: '700', cursor: 'pointer',
            background: viewMode === "EXECUTION_PLAN" ? 'rgba(16, 185, 129, 0.2)' : 'transparent',
            border: viewMode === "EXECUTION_PLAN" ? '1px solid #10b981' : '1px solid transparent',
            color: viewMode === "EXECUTION_PLAN" ? '#34d399' : 'var(--text-muted)',
            display: 'flex', alignItems: 'center', gap: '8px'
          }}
        >
          <Layers size={16} /> HRP Allocation Portfolio Plan
        </button>
        <button
          onClick={() => setViewMode("TARGET_PROFIT")}
          style={{
            padding: '8px 16px', borderRadius: '10px', fontSize: '13px', fontWeight: '700', cursor: 'pointer',
            background: viewMode === "TARGET_PROFIT" ? 'rgba(245, 158, 11, 0.2)' : 'transparent',
            border: viewMode === "TARGET_PROFIT" ? '1px solid #f59e0b' : '1px solid transparent',
            color: viewMode === "TARGET_PROFIT" ? '#fbbf24' : 'var(--text-muted)',
            display: 'flex', alignItems: 'center', gap: '8px'
          }}
        >
          <Target size={16} /> Target Profit & Selling Point Predictor
        </button>
      </div>

      {viewMode === "EXECUTION_PLAN" ? (
        <>
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
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '16px' }}>
            {filteredRecs.map((rec) => {
              const badgeStyle = getBadgeStyle(rec.category_badge_color);
              return (
                <div key={rec.id} style={{
                    padding: '16px', borderRadius: '12px',
                    background: 'rgba(255, 255, 255, 0.02)',
                    border: '1px solid var(--border-color)',
                    display: 'flex', flexDirection: 'column', gap: '10px'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <span style={{ fontSize: '16px', fontWeight: '800', color: '#fff', fontFamily: 'monospace' }}>{rec.ticker}</span>
                        <span style={{ fontSize: '10px', padding: '1px 6px', borderRadius: '4px', background: badgeStyle.bg, color: badgeStyle.color, border: `1px solid ${badgeStyle.border}`, fontWeight: '700' }}>
                          {rec.category}
                        </span>
                      </div>
                      <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '2px' }}>{rec.instrument_name}</div>
                    </div>
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
                        <span style={{ fontSize: '9px', color: '#34d399', fontWeight: '700', marginLeft: '3px' }}>
                          (+₹{(rec.profit_per_share_inr || 0).toLocaleString('en-IN')})
                        </span>
                      </div>
                    </div>

                    <div>
                      <div style={{ fontSize: '10px', color: 'var(--text-dim)', fontWeight: '600' }}>SUGGESTED QTY</div>
                      <div style={{ fontSize: '13px', fontWeight: '700', color: '#fff' }}>{rec.suggested_quantity} units</div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: '10px', color: 'var(--text-dim)', fontWeight: '600' }}>TARGET ALLOCATION</div>
                      <div style={{ fontSize: '13px', fontWeight: '800', color: '#f59e0b' }}>₹{rec.allocation_inr.toLocaleString('en-IN')}</div>
                    </div>
                  </div>

                  {rec.target_price_analytical_rationale && (
                    <div style={{ fontSize: '10px', color: '#fbbf24', background: 'rgba(245, 158, 11, 0.08)', padding: '6px 8px', borderRadius: '6px', border: '1px solid rgba(245, 158, 11, 0.2)' }}>
                      <strong>Price Model: </strong>{rec.target_price_analytical_rationale}
                    </div>
                  )}

                  <div style={{ fontSize: '11px', color: '#d1d5db', lineHeight: '1.3' }}>
                    <strong style={{ color: '#818cf8' }}>Macro & HRP: </strong>{rec.macro_rationale}
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
                <div style={{ fontSize: '10px', color: 'var(--text-dim)', fontWeight: '600' }}>TOTAL ALLOCATED CAPITAL</div>
                <div style={{ fontSize: '15px', fontWeight: '800', color: '#34d399' }}>
                  ₹{totalAllocatedInr.toLocaleString('en-IN')} <span style={{ fontSize: '11px', color: 'var(--text-dim)', fontWeight: '500' }}>({totalAllocatedPct.toFixed(1)}%)</span>
                </div>
              </div>
              <div>
                <div style={{ fontSize: '10px', color: 'var(--text-dim)', fontWeight: '600' }}>TOTAL SUGGESTED UNITS</div>
                <div style={{ fontSize: '15px', fontWeight: '800', color: '#f59e0b' }}>
                  {totalSuggestedUnits.toLocaleString('en-IN')} units
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
        </>
      ) : (
        /* Target Profit & Probable Selling Point Predictor View */
        <div>
          <div style={{
            padding: '16px 20px', borderRadius: '12px', marginBottom: '20px',
            background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.15) 0%, rgba(99, 102, 241, 0.15) 100%)',
            border: '1px solid rgba(245, 158, 11, 0.3)',
            display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px'
          }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Target size={20} color="#fbbf24" />
                <h2 style={{ fontSize: '18px', fontWeight: '800', color: '#fff' }}>Target Profit & Probable Selling Point Predictor</h2>
              </div>
              <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '4px' }}>
                Enter your total capital and expected profit to calculate exact stock purchase rates, target selling prices, profit per share, and estimated exit dates.
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
                    padding: '6px 10px', borderRadius: '8px', background: 'rgba(0,0,0,0.5)',
                    border: '1px solid rgba(255,255,255,0.2)', color: '#fff', fontSize: '13px', width: '110px', fontWeight: '700'
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
                    padding: '6px 10px', borderRadius: '8px', background: 'rgba(0,0,0,0.5)',
                    border: '1px solid rgba(255,255,255,0.2)', color: '#34d399', fontSize: '13px', width: '110px', fontWeight: '700'
                  }}
                />
              </div>

              <div>
                <label style={{ fontSize: '10px', color: 'var(--text-dim)', display: 'block', marginBottom: '2px', fontWeight: '700' }}>TIME HORIZON (DAYS)</label>
                <input
                  type="number"
                  value={targetDays}
                  onChange={(e) => setTargetDays(e.target.value)}
                  style={{
                    padding: '6px 10px', borderRadius: '8px', background: 'rgba(0,0,0,0.5)',
                    border: '1px solid rgba(255,255,255,0.2)', color: '#fbbf24', fontSize: '13px', width: '90px', fontWeight: '700'
                  }}
                />
              </div>

              <button
                onClick={fetchTargetSellingPoints}
                disabled={loadingTargetData}
                style={{
                  marginTop: '16px', padding: '8px 16px', borderRadius: '8px',
                  background: '#f59e0b', color: '#000', border: 'none',
                  fontSize: '13px', fontWeight: '800', cursor: 'pointer',
                  display: 'flex', alignItems: 'center', gap: '6px'
                }}
              >
                {loadingTargetData ? "Calculating..." : "Calculate Exit Points"}
              </button>
            </div>
          </div>

          {targetSellingData && (
            <div>
              <div style={{
                display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px', marginBottom: '20px'
              }}>
                <div style={{ padding: '12px 16px', borderRadius: '10px', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.08)' }}>
                  <div style={{ fontSize: '10px', color: 'var(--text-dim)', fontWeight: '600' }}>REQUIRED GAIN TARGET</div>
                  <div style={{ fontSize: '18px', fontWeight: '800', color: '#fbbf24' }}>{targetSellingData.target_return_pct}%</div>
                  <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>₹{targetSellingData.target_profit_inr.toLocaleString('en-IN')} gain on ₹{targetSellingData.capital_inr.toLocaleString('en-IN')}</div>
                </div>

                <div style={{ padding: '12px 16px', borderRadius: '10px', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.08)' }}>
                  <div style={{ fontSize: '10px', color: 'var(--text-dim)', fontWeight: '600' }}>TOTAL PORTFOLIO PROFIT</div>
                  <div style={{ fontSize: '18px', fontWeight: '800', color: '#34d399' }}>₹{targetSellingData.total_expected_profit_inr.toLocaleString('en-IN')}</div>
                  <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Invested: ₹{targetSellingData.total_invested_inr.toLocaleString('en-IN')}</div>
                </div>

                <div style={{ padding: '12px 16px', borderRadius: '10px', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.08)' }}>
                  <div style={{ fontSize: '10px', color: 'var(--text-dim)', fontWeight: '600' }}>PROBABLE EXIT WINDOW</div>
                  <div style={{ fontSize: '14px', fontWeight: '800', color: '#c084fc', marginTop: '4px' }}>{targetSellingData.portfolio_probable_exit_window}</div>
                  <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Based on technical momentum drift</div>
                </div>
              </div>

              {/* Target Selling Table */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                <span style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: '600' }}>
                  Individual Ticker Target Selling Rates & Profit Breakdown:
                </span>
                <button
                  onClick={handleExportTargetSellingCSV}
                  style={{
                    padding: '6px 12px', borderRadius: '8px',
                    background: '#f59e0b', color: '#000', border: 'none',
                    fontSize: '12px', fontWeight: '700', cursor: 'pointer',
                    display: 'flex', alignItems: 'center', gap: '6px'
                  }}
                >
                  <Download size={14} /> Export Exit Plan CSV
                </button>
              </div>

              <div style={{ overflowX: 'auto', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px', textAlign: 'left' }}>
                  <thead>
                    <tr style={{ background: 'rgba(255, 255, 255, 0.04)', borderBottom: '1px solid var(--border-color)', color: 'var(--text-muted)' }}>
                      <th style={{ padding: '12px' }}>Ticker</th>
                      <th style={{ padding: '12px' }}>Current Rate</th>
                      <th style={{ padding: '12px' }}>Qty to Buy Today</th>
                      <th style={{ padding: '12px' }}>Allocated Capital</th>
                      <th style={{ padding: '12px', color: '#fbbf24' }}>Target Sell Rate</th>
                      <th style={{ padding: '12px', color: '#34d399' }}>Profit / Share</th>
                      <th style={{ padding: '12px', color: '#34d399' }}>Total Profit</th>
                      <th style={{ padding: '12px' }}>Est. Hold Period</th>
                      <th style={{ padding: '12px', color: '#c084fc' }}>Probable Sell Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {targetSellingData.recommendations.map((item, idx) => (
                      <tr key={idx} style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.05)', background: idx % 2 === 0 ? 'transparent' : 'rgba(255, 255, 255, 0.01)' }}>
                        <td style={{ padding: '12px', fontWeight: '700', color: '#fff', fontFamily: 'monospace' }}>
                          {item.ticker}
                          <div style={{ fontSize: '10px', color: 'var(--text-dim)', fontWeight: '400' }}>{item.instrument_name}</div>
                        </td>
                        <td style={{ padding: '12px', fontWeight: '700', color: '#34d399' }}>₹{item.current_unit_price.toLocaleString('en-IN')}</td>
                        <td style={{ padding: '12px', fontWeight: '700', color: '#fff' }}>{item.suggested_quantity} units</td>
                        <td style={{ padding: '12px' }}>₹{item.total_allocated_inr.toLocaleString('en-IN')}</td>
                        <td style={{ padding: '12px', fontWeight: '800', color: '#fbbf24', background: 'rgba(245, 158, 11, 0.1)' }}>
                          ₹{item.target_selling_price.toLocaleString('en-IN')}
                        </td>
                        <td style={{ padding: '12px', fontWeight: '700', color: '#34d399' }}>+₹{item.profit_per_share_inr.toLocaleString('en-IN')}</td>
                        <td style={{ padding: '12px', fontWeight: '800', color: '#34d399' }}>+₹{item.total_expected_profit_inr.toLocaleString('en-IN')}</td>
                        <td style={{ padding: '12px', color: 'var(--text-muted)' }}>{item.estimated_holding_days} days</td>
                        <td style={{ padding: '12px', fontWeight: '700', color: '#c084fc' }}>{item.probable_exit_date}</td>
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
                      <td style={{ padding: '14px 12px', color: '#ffffff', fontSize: '13px' }}>
                        {targetSellingData.recommendations.reduce((sum, i) => sum + i.suggested_quantity, 0).toLocaleString('en-IN')} units
                      </td>
                      <td style={{ padding: '14px 12px', color: '#34d399', fontSize: '13px' }}>
                        ₹{targetSellingData.total_invested_inr.toLocaleString('en-IN')}
                      </td>
                      <td style={{ padding: '14px 12px', color: '#94a3b8' }}>-</td>
                      <td style={{ padding: '14px 12px', color: '#94a3b8' }}>-</td>
                      <td style={{ padding: '14px 12px', color: '#34d399', fontSize: '14px' }}>
                        +₹{targetSellingData.total_expected_profit_inr.toLocaleString('en-IN')}
                      </td>
                      <td style={{ padding: '14px 12px', color: '#fbbf24' }}>
                        Target: {targetSellingData.target_return_pct}%
                      </td>
                      <td style={{ padding: '14px 12px', color: '#c084fc', fontSize: '11px' }}>
                        {targetSellingData.portfolio_probable_exit_window}
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
