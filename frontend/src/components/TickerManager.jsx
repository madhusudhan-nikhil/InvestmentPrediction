import React, { useState, useEffect, useMemo } from "react";

const API_BASE_URL = "http://localhost:8000";

export default function TickerManager() {
  const [tickers, setTickers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedExchange, setSelectedExchange] = useState("All");
  const [statusMessage, setStatusMessage] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);

  // New Ticker Form State
  const [newTicker, setNewTicker] = useState({
    ticker: "",
    name: "",
    sector: "Financials",
    default_price: 500,
    category: "Category A",
    category_name: "Rebalance & Top-up",
    badge: "emerald",
    base_weight: 0.02,
    exp_return: 14.0,
    sharpe: 1.3,
    risk_reduction_pct: 7.0,
    technical_signal: "EMA 20 > EMA 50 Bullish Trend"
  });

  useEffect(() => {
    fetchTickers();
  }, []);

  const fetchTickers = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/tickers`);
      if (res.ok) {
        const data = await res.json();
        setTickers(data.tickers || []);
      } else {
        showStatus("⚠️ Failed to load ticker dataset from backend", "error");
      }
    } catch (err) {
      console.error(err);
      showStatus("⚠️ Backend connection error", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleSyncTickers = async () => {
    setSyncing(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/tickers/sync`, { method: "POST" });
      if (res.ok) {
        const data = await res.json();
        setTickers(data.tickers || []);
        showStatus(`✅ Successfully synced ${data.total_tickers} tickers (Top 100 NSE & Top 500 BSE) at ${data.synced_at}`, "success");
      } else {
        showStatus("⚠️ Failed to sync ticker universe from backend", "error");
      }
    } catch (err) {
      console.error(err);
      showStatus("⚠️ Sync error: backend unreachable", "error");
    } finally {
      setSyncing(false);
    }
  };

  const handleSaveTickers = async () => {
    setSaving(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/tickers`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tickers })
      });
      if (res.ok) {
        const data = await res.json();
        showStatus(`✅ Saved ${data.total_tickers} ticker records to backend JSON database!`, "success");
      } else {
        showStatus("⚠️ Failed to save ticker modifications", "error");
      }
    } catch (err) {
      console.error(err);
      showStatus("⚠️ Error saving changes", "error");
    } finally {
      setSaving(false);
    }
  };

  const handleFieldChange = (index, field, value) => {
    const updated = [...tickers];
    updated[index][field] = value;
    setTickers(updated);
  };

  const handleDeleteTicker = (indexToDelete) => {
    const updated = tickers.filter((_, idx) => idx !== indexToDelete);
    setTickers(updated);
    showStatus("🗑️ Security removed from universe. Click 'Save All Changes' to apply.", "info");
  };

  const handleAddTicker = (e) => {
    e.preventDefault();
    if (!newTicker.ticker.trim() || !newTicker.name.trim()) {
      showStatus("⚠️ Ticker symbol and name are required", "error");
      return;
    }
    const cleanSym = newTicker.ticker.trim().toUpperCase();
    const formattedSym = cleanSym.endsWith(".NS") || cleanSym.endsWith(".BO") ? cleanSym : `${cleanSym}.NS`;

    const itemToAdd = {
      ...newTicker,
      ticker: formattedSym,
      default_price: parseFloat(newTicker.default_price) || 500,
      base_weight: parseFloat(newTicker.base_weight) || 0.02,
      exp_return: parseFloat(newTicker.exp_return) || 14.0,
      sharpe: parseFloat(newTicker.sharpe) || 1.3,
      risk_reduction_pct: parseFloat(newTicker.risk_reduction_pct) || 7.0
    };

    setTickers([itemToAdd, ...tickers]);
    setShowAddModal(false);
    showStatus(`✅ Added ${itemToAdd.ticker} (${itemToAdd.name}) to ticker database. Click 'Save All Changes' to persist.`, "success");

    // Reset Form
    setNewTicker({
      ticker: "",
      name: "",
      sector: "Financials",
      default_price: 500,
      category: "Category A",
      category_name: "Rebalance & Top-up",
      badge: "emerald",
      base_weight: 0.02,
      exp_return: 14.0,
      sharpe: 1.3,
      risk_reduction_pct: 7.0,
      technical_signal: "EMA 20 > EMA 50 Bullish Trend"
    });
  };

  const showStatus = (msg, type) => {
    setStatusMessage({ msg, type });
    setTimeout(() => setStatusMessage(null), 5000);
  };

  // ⚡ Bolt Optimization: Memoize filtered tickers to prevent expensive re-evaluations on every render
  // Also hoisted search.toLowerCase() to avoid redundant string allocations in the filter loop
  const filteredTickers = useMemo(() => {
    const searchLower = search.toLowerCase();
    return tickers.filter((item) => {
      const matchesSearch =
        item.ticker.toLowerCase().includes(searchLower) ||
        item.name.toLowerCase().includes(searchLower) ||
        item.sector.toLowerCase().includes(searchLower);

      const matchesCategory = selectedCategory === "All" || item.category === selectedCategory;

      const matchesExchange =
        selectedExchange === "All"
          ? true
          : selectedExchange === "NSE"
          ? item.ticker.endsWith(".NS")
          : item.ticker.endsWith(".BO");

      return matchesSearch && matchesCategory && matchesExchange;
    });
  }, [tickers, search, selectedCategory, selectedExchange]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Toast Notification */}
      {statusMessage && (
        <div style={{
          padding: '14px 18px', borderRadius: '12px', fontSize: '13px', fontWeight: '600',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          background: statusMessage.type === "success" ? "rgba(6, 78, 59, 0.9)" : statusMessage.type === "error" ? "rgba(136, 19, 55, 0.9)" : "rgba(120, 53, 15, 0.9)",
          border: statusMessage.type === "success" ? "1px solid #10b981" : statusMessage.type === "error" ? "1px solid #f43f5e" : "1px solid #f59e0b",
          color: statusMessage.type === "success" ? "#a7f3d0" : statusMessage.type === "error" ? "#fecdd3" : "#fef3c7",
          boxShadow: "0 10px 25px rgba(0,0,0,0.5)", transition: "all 0.3s ease"
        }}>
          <span>{statusMessage.msg}</span>
          <button onClick={() => setStatusMessage(null)} style={{ background: 'none', border: 'none', color: 'inherit', fontSize: '16px', cursor: 'pointer', marginLeft: '12px' }}>
            ✕
          </button>
        </div>
      )}

      {/* Header Toolbar Card */}
      <div className="glass-panel" style={{ padding: '24px', display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '20px' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', maxWidth: '650px' }}>
          <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '12px' }}>
            <h2 style={{ fontSize: '20px', fontWeight: '800', color: '#f8fafc', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
              ⚙️ Ticker Universe Manager
            </h2>
            <span style={{
              background: 'rgba(16, 185, 129, 0.15)', color: '#34d399', border: '1px solid rgba(16, 185, 129, 0.3)',
              padding: '4px 12px', borderRadius: '20px', fontSize: '12px', fontWeight: '700', fontFamily: 'monospace'
            }}>
              {tickers.length} Securities (JSON Universe)
            </span>
            <span style={{
              background: 'rgba(168, 85, 247, 0.15)', color: '#c084fc', border: '1px solid rgba(168, 85, 247, 0.3)',
              padding: '4px 12px', borderRadius: '20px', fontSize: '12px', fontWeight: '700', fontFamily: 'monospace'
            }}>
              31 Sector Pools
            </span>
          </div>
          <p style={{ fontSize: '13px', color: 'var(--text-muted)', margin: 0, lineHeight: '1.5' }}>
            Manage Indian securities (Top 100 NSE & Top 500 BSE across 31 traditional & emerging sectors), edit benchmark default prices, base weights, and sync on-demand.
          </p>
        </div>

        <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '12px' }}>
          <button
            onClick={handleSyncTickers}
            disabled={syncing}
            style={{
              padding: '10px 18px', borderRadius: '10px',
              background: 'linear-gradient(135deg, #d97706 0%, #b45309 100%)',
              color: '#ffffff', border: 'none', fontSize: '13px', fontWeight: '700',
              cursor: syncing ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', gap: '8px',
              boxShadow: '0 4px 14px rgba(217, 119, 6, 0.35)', transition: 'all 0.2s'
            }}
          >
            <span>{syncing ? "🔄 Syncing..." : "🔄 Sync Top 500 BSE & 100 NSE"}</span>
          </button>

          <button
            onClick={() => setShowAddModal(true)}
            style={{
              padding: '10px 16px', borderRadius: '10px',
              background: 'rgba(255, 255, 255, 0.06)', color: '#f3f4f6',
              border: '1px solid rgba(255, 255, 255, 0.12)', fontSize: '13px', fontWeight: '600',
              cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', transition: 'all 0.2s'
            }}
          >
            <span>➕ Add Security</span>
          </button>

          <button
            onClick={handleSaveTickers}
            disabled={saving}
            style={{
              padding: '10px 20px', borderRadius: '10px',
              background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
              color: '#ffffff', border: 'none', fontSize: '13px', fontWeight: '700',
              cursor: saving ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', gap: '8px',
              boxShadow: '0 4px 14px rgba(16, 185, 129, 0.4)', transition: 'all 0.2s'
            }}
          >
            <span>{saving ? "⏳ Saving..." : "💾 Save All Changes"}</span>
          </button>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="glass-panel" style={{ padding: '16px 20px', display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '16px' }}>
        {/* Search Input */}
        <div style={{ position: 'relative', width: '320px', maxWidth: '100%' }}>
          <span style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', fontSize: '14px', color: '#64748b' }}>🔍</span>
          <input
            type="text"
            placeholder="Search symbol, company, or sector..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{
              width: '100%', background: 'rgba(0, 0, 0, 0.4)', border: '1px solid rgba(255, 255, 255, 0.12)',
              borderRadius: '10px', padding: '10px 14px 10px 38px', fontSize: '13px', color: '#ffffff',
              outline: 'none', transition: 'border-color 0.2s'
            }}
          />
        </div>

        {/* Category Filter Pills */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
          {["All", "Category A", "Category B", "Category C", "Category D"].map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              style={{
                padding: '7px 14px', borderRadius: '8px', fontSize: '12px', fontWeight: '600', cursor: 'pointer',
                background: selectedCategory === cat ? 'rgba(16, 185, 129, 0.2)' : 'rgba(255, 255, 255, 0.04)',
                border: selectedCategory === cat ? '1px solid #10b981' : '1px solid rgba(255, 255, 255, 0.08)',
                color: selectedCategory === cat ? '#34d399' : '#94a3b8', transition: 'all 0.2s'
              }}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Exchange Filter Segmented Toggle */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: '4px',
          background: 'rgba(0, 0, 0, 0.5)', padding: '4px', borderRadius: '10px',
          border: '1px solid rgba(255, 255, 255, 0.08)'
        }}>
          {["All", "NSE", "BSE"].map((ex) => (
            <button
              key={ex}
              onClick={() => setSelectedExchange(ex)}
              style={{
                padding: '5px 14px', borderRadius: '7px', fontSize: '12px', fontWeight: '700', cursor: 'pointer',
                background: selectedExchange === ex ? 'rgba(255, 255, 255, 0.15)' : 'transparent',
                border: 'none', color: selectedExchange === ex ? '#ffffff' : '#94a3b8', transition: 'all 0.2s'
              }}
            >
              {ex}
            </button>
          ))}
        </div>
      </div>

      {/* Main Dataset Table */}
      <div className="glass-panel" style={{ borderRadius: '16px', border: '1px solid rgba(255, 255, 255, 0.08)', overflow: 'hidden' }}>
        {loading ? (
          <div style={{ padding: '60px', textAlign: 'center', color: '#94a3b8', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
            <span style={{ fontSize: '28px' }}>⚡</span>
            <span style={{ fontSize: '14px', fontWeight: '600' }}>Loading JSON Ticker Database...</span>
          </div>
        ) : filteredTickers.length === 0 ? (
          <div style={{ padding: '60px', textAlign: 'center', color: '#94a3b8', fontSize: '14px' }}>
            No securities matched search filter "<span style={{ color: '#ffffff', fontWeight: '600' }}>{search}</span>"
          </div>
        ) : (
          <div style={{ overflowX: 'auto', maxHeight: '620px', overflowY: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '12px', color: '#e2e8f0' }}>
              <thead style={{ position: 'sticky', top: 0, background: '#0f172a', borderBottom: '1px solid rgba(255, 255, 255, 0.12)', color: '#94a3b8', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.5px', zIndex: 10 }}>
                <tr>
                  <th style={{ padding: '10px 12px' }}>Symbol</th>
                  <th style={{ padding: '10px 12px' }}>Instrument Name</th>
                  <th style={{ padding: '10px 12px' }}>Sector</th>
                  <th style={{ padding: '10px 12px' }}>Category</th>
                  <th style={{ padding: '10px 12px', textAlign: 'right' }}>Default Price (₹)</th>
                  <th style={{ padding: '10px 12px', textAlign: 'right' }}>Base Wt</th>
                  <th style={{ padding: '10px 12px', textAlign: 'right' }}>Sharpe</th>
                  <th style={{ padding: '10px 12px', textAlign: 'right' }}>Risk Red %</th>
                  <th style={{ padding: '10px 12px' }}>Technical Signal</th>
                  <th style={{ padding: '10px 12px', textAlign: 'center' }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredTickers.map((item) => {
                  const origIndex = tickers.findIndex((t) => t.ticker === item.ticker);
                  const isNSE = item.ticker.endsWith(".NS");

                  return (
                    <tr key={item.ticker} style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.04)', transition: 'background 0.15s' }}>
                      {/* Symbol & Exchange Badge */}
                      <td style={{ padding: '8px 12px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <span style={{ fontWeight: '700', fontFamily: 'monospace', color: '#ffffff', fontSize: '12px' }}>
                            {item.ticker}
                          </span>
                          <span style={{
                            fontSize: '9px', fontWeight: '800', padding: '1px 5px', borderRadius: '4px',
                            background: isNSE ? 'rgba(59, 130, 246, 0.2)' : 'rgba(245, 158, 11, 0.2)',
                            color: isNSE ? '#60a5fa' : '#fbbf24',
                            border: isNSE ? '1px solid rgba(59, 130, 246, 0.3)' : '1px solid rgba(245, 158, 11, 0.3)'
                          }}>
                            {isNSE ? "NSE" : "BSE"}
                          </span>
                        </div>
                      </td>

                      {/* Instrument Name */}
                      <td style={{ padding: '8px 12px' }}>
                        <input
                          type="text"
                          value={item.name}
                          onChange={(e) => handleFieldChange(origIndex, "name", e.target.value)}
                          style={{
                            width: '170px', background: 'rgba(0, 0, 0, 0.4)', border: '1px solid rgba(255, 255, 255, 0.1)',
                            borderRadius: '6px', padding: '5px 8px', color: '#f1f5f9', fontSize: '12px', outline: 'none'
                          }}
                        />
                      </td>

                      {/* Sector */}
                      <td style={{ padding: '8px 12px' }}>
                        <input
                          type="text"
                          value={item.sector}
                          onChange={(e) => handleFieldChange(origIndex, "sector", e.target.value)}
                          style={{
                            width: '140px', background: 'rgba(0, 0, 0, 0.4)', border: '1px solid rgba(255, 255, 255, 0.1)',
                            borderRadius: '6px', padding: '5px 8px', color: '#cbd5e1', fontSize: '12px', outline: 'none'
                          }}
                        />
                      </td>

                      {/* Category Dropdown */}
                      <td style={{ padding: '8px 12px' }}>
                        <select
                          value={item.category}
                          onChange={(e) => handleFieldChange(origIndex, "category", e.target.value)}
                          style={{
                            width: '140px', background: '#0f172a', border: '1px solid rgba(255, 255, 255, 0.12)',
                            borderRadius: '6px', padding: '5px 8px', color: '#e2e8f0', fontSize: '12px', outline: 'none'
                          }}
                        >
                          <option value="Category A">Category A (Rebalance)</option>
                          <option value="Category B">Category B (Diversifiers)</option>
                          <option value="Category C">Category C (Alpha)</option>
                          <option value="Category D">Category D (Macro Hedges)</option>
                        </select>
                      </td>

                      {/* Default Price */}
                      <td style={{ padding: '8px 12px', textAlign: 'right' }}>
                        <input
                          type="number"
                          step="0.1"
                          value={item.default_price}
                          onChange={(e) => handleFieldChange(origIndex, "default_price", parseFloat(e.target.value) || 0)}
                          style={{
                            width: '80px', background: 'rgba(0, 0, 0, 0.4)', border: '1px solid rgba(255, 255, 255, 0.1)',
                            borderRadius: '6px', padding: '5px 8px', color: '#34d399', fontSize: '12px',
                            fontFamily: 'monospace', fontWeight: '700', textAlign: 'right', outline: 'none'
                          }}
                        />
                      </td>

                      {/* Base Weight */}
                      <td style={{ padding: '8px 12px', textAlign: 'right' }}>
                        <input
                          type="number"
                          step="0.005"
                          value={item.base_weight}
                          onChange={(e) => handleFieldChange(origIndex, "base_weight", parseFloat(e.target.value) || 0)}
                          style={{
                            width: '60px', background: 'rgba(0, 0, 0, 0.4)', border: '1px solid rgba(255, 255, 255, 0.1)',
                            borderRadius: '6px', padding: '5px 8px', color: '#cbd5e1', fontSize: '12px',
                            fontFamily: 'monospace', textAlign: 'right', outline: 'none'
                          }}
                        />
                      </td>

                      {/* Sharpe */}
                      <td style={{ padding: '8px 12px', textAlign: 'right' }}>
                        <input
                          type="number"
                          step="0.1"
                          value={item.sharpe}
                          onChange={(e) => handleFieldChange(origIndex, "sharpe", parseFloat(e.target.value) || 0)}
                          style={{
                            width: '55px', background: 'rgba(0, 0, 0, 0.4)', border: '1px solid rgba(255, 255, 255, 0.1)',
                            borderRadius: '6px', padding: '5px 8px', color: '#c084fc', fontSize: '12px',
                            fontFamily: 'monospace', fontWeight: '700', textAlign: 'right', outline: 'none'
                          }}
                        />
                      </td>

                      {/* Risk Red % */}
                      <td style={{ padding: '8px 12px', textAlign: 'right' }}>
                        <input
                          type="number"
                          step="0.5"
                          value={item.risk_reduction_pct || item.risk_red || 7.0}
                          onChange={(e) => handleFieldChange(origIndex, "risk_reduction_pct", parseFloat(e.target.value) || 0)}
                          style={{
                            width: '55px', background: 'rgba(0, 0, 0, 0.4)', border: '1px solid rgba(255, 255, 255, 0.1)',
                            borderRadius: '6px', padding: '5px 8px', color: '#60a5fa', fontSize: '12px',
                            fontFamily: 'monospace', fontWeight: '700', textAlign: 'right', outline: 'none'
                          }}
                        />
                      </td>

                      {/* Technical Signal */}
                      <td style={{ padding: '8px 12px' }}>
                        <input
                          type="text"
                          value={item.technical_signal || "EMA 20 > EMA 50 Bullish Trend"}
                          onChange={(e) => handleFieldChange(origIndex, "technical_signal", e.target.value)}
                          style={{
                            width: '180px', background: 'rgba(0, 0, 0, 0.4)', border: '1px solid rgba(255, 255, 255, 0.1)',
                            borderRadius: '6px', padding: '5px 8px', color: '#94a3b8', fontSize: '12px', outline: 'none'
                          }}
                        />
                      </td>

                      {/* Delete Action */}
                      <td style={{ padding: '12px 16px', textAlign: 'center' }}>
                        <button
                          onClick={() => handleDeleteTicker(origIndex)}
                          title="Delete Security"
                          style={{
                            padding: '6px 10px', background: 'rgba(225, 29, 72, 0.15)', color: '#fda4af',
                            border: '1px solid rgba(225, 29, 72, 0.3)', borderRadius: '6px', cursor: 'pointer',
                            fontSize: '12px', transition: 'all 0.2s'
                          }}
                        >
                          🗑️
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add Security Modal */}
      {showAddModal && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 999,
          background: 'rgba(0, 0, 0, 0.8)', backdropFilter: 'blur(12px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px'
        }}>
          <div style={{
            background: '#0f172a', border: '1px solid rgba(255, 255, 255, 0.15)',
            borderRadius: '20px', maxWidth: '540px', width: '100%', padding: '28px',
            boxShadow: '0 20px 40px rgba(0, 0, 0, 0.6)', display: 'flex', flexDirection: 'column', gap: '20px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid rgba(255, 255, 255, 0.1)', pb: '14px' }}>
              <h3 style={{ fontSize: '18px', fontWeight: '800', color: '#ffffff', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                ➕ Add Custom Security to Dataset
              </h3>
              <button onClick={() => setShowAddModal(false)} style={{ background: 'none', border: 'none', color: '#94a3b8', fontSize: '20px', cursor: 'pointer' }}>
                ✕
              </button>
            </div>

            <form onSubmit={handleAddTicker} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: '#94a3b8', marginBottom: '6px' }}>Ticker Symbol</label>
                  <input
                    type="text"
                    placeholder="e.g. ADANIENT.NS"
                    value={newTicker.ticker}
                    onChange={(e) => setNewTicker({ ...newTicker, ticker: e.target.value })}
                    style={{ width: '100%', background: 'rgba(0, 0, 0, 0.4)', border: '1px solid rgba(255, 255, 255, 0.12)', borderRadius: '8px', padding: '9px 12px', fontSize: '13px', color: '#fff', outline: 'none' }}
                    required
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: '#94a3b8', marginBottom: '6px' }}>Instrument Name</label>
                  <input
                    type="text"
                    placeholder="e.g. Adani Enterprises Ltd"
                    value={newTicker.name}
                    onChange={(e) => setNewTicker({ ...newTicker, name: e.target.value })}
                    style={{ width: '100%', background: 'rgba(0, 0, 0, 0.4)', border: '1px solid rgba(255, 255, 255, 0.12)', borderRadius: '8px', padding: '9px 12px', fontSize: '13px', color: '#fff', outline: 'none' }}
                    required
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: '#94a3b8', marginBottom: '6px' }}>Sector</label>
                  <input
                    type="text"
                    placeholder="e.g. Infrastructure"
                    value={newTicker.sector}
                    onChange={(e) => setNewTicker({ ...newTicker, sector: e.target.value })}
                    style={{ width: '100%', background: 'rgba(0, 0, 0, 0.4)', border: '1px solid rgba(255, 255, 255, 0.12)', borderRadius: '8px', padding: '9px 12px', fontSize: '13px', color: '#fff', outline: 'none' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: '#94a3b8', marginBottom: '6px' }}>Category</label>
                  <select
                    value={newTicker.category}
                    onChange={(e) => setNewTicker({ ...newTicker, category: e.target.value })}
                    style={{ width: '100%', background: '#0f172a', border: '1px solid rgba(255, 255, 255, 0.12)', borderRadius: '8px', padding: '9px 12px', fontSize: '13px', color: '#fff', outline: 'none' }}
                  >
                    <option value="Category A">Category A (Rebalance)</option>
                    <option value="Category B">Category B (Diversifiers)</option>
                    <option value="Category C">Category C (Alpha)</option>
                    <option value="Category D">Category D (Macro Hedges)</option>
                  </select>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '14px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: '#94a3b8', marginBottom: '6px' }}>Default Price (₹)</label>
                  <input
                    type="number"
                    value={newTicker.default_price}
                    onChange={(e) => setNewTicker({ ...newTicker, default_price: e.target.value })}
                    style={{ width: '100%', background: 'rgba(0, 0, 0, 0.4)', border: '1px solid rgba(255, 255, 255, 0.12)', borderRadius: '8px', padding: '9px 12px', fontSize: '13px', color: '#34d399', fontFamily: 'monospace', fontWeight: '700', outline: 'none' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: '#94a3b8', marginBottom: '6px' }}>Base Weight</label>
                  <input
                    type="number"
                    step="0.005"
                    value={newTicker.base_weight}
                    onChange={(e) => setNewTicker({ ...newTicker, base_weight: e.target.value })}
                    style={{ width: '100%', background: 'rgba(0, 0, 0, 0.4)', border: '1px solid rgba(255, 255, 255, 0.12)', borderRadius: '8px', padding: '9px 12px', fontSize: '13px', color: '#cbd5e1', fontFamily: 'monospace', outline: 'none' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: '#94a3b8', marginBottom: '6px' }}>Sharpe Ratio</label>
                  <input
                    type="number"
                    step="0.1"
                    value={newTicker.sharpe}
                    onChange={(e) => setNewTicker({ ...newTicker, sharpe: e.target.value })}
                    style={{ width: '100%', background: 'rgba(0, 0, 0, 0.4)', border: '1px solid rgba(255, 255, 255, 0.12)', borderRadius: '8px', padding: '9px 12px', fontSize: '13px', color: '#c084fc', fontFamily: 'monospace', fontWeight: '700', outline: 'none' }}
                  />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: '#94a3b8', marginBottom: '6px' }}>Technical Signal</label>
                <input
                  type="text"
                  placeholder="e.g. Breakout above 50-day High (RSI 64)"
                  value={newTicker.technical_signal}
                  onChange={(e) => setNewTicker({ ...newTicker, technical_signal: e.target.value })}
                  style={{ width: '100%', background: 'rgba(0, 0, 0, 0.4)', border: '1px solid rgba(255, 255, 255, 0.12)', borderRadius: '8px', padding: '9px 12px', fontSize: '13px', color: '#e2e8f0', outline: 'none' }}
                />
              </div>

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '12px', paddingTop: '12px', borderTop: '1px solid rgba(255, 255, 255, 0.1)' }}>
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  style={{ padding: '8px 16px', background: 'rgba(255, 255, 255, 0.06)', color: '#cbd5e1', border: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: '10px', fontSize: '13px', cursor: 'pointer' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  style={{ padding: '9px 20px', background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)', color: '#ffffff', border: 'none', borderRadius: '10px', fontSize: '13px', fontWeight: '700', cursor: 'pointer', boxShadow: '0 4px 14px rgba(16, 185, 129, 0.4)' }}
                >
                  Add Security
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
