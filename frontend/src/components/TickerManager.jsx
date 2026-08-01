import React, { useState, useEffect } from "react";

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

  // Filtering
  const filteredTickers = tickers.filter((item) => {
    const matchesSearch =
      item.ticker.toLowerCase().includes(search.toLowerCase()) ||
      item.name.toLowerCase().includes(search.toLowerCase()) ||
      item.sector.toLowerCase().includes(search.toLowerCase());

    const matchesCategory = selectedCategory === "All" || item.category === selectedCategory;

    const matchesExchange =
      selectedExchange === "All"
        ? true
        : selectedExchange === "NSE"
        ? item.ticker.endsWith(".NS")
        : item.ticker.endsWith(".BO");

    return matchesSearch && matchesCategory && matchesExchange;
  });

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {statusMessage && (
        <div
          className={`p-4 rounded-xl text-sm font-medium border shadow-lg flex items-center justify-between transition-all duration-300 ${
            statusMessage.type === "success"
              ? "bg-emerald-950/80 border-emerald-500/40 text-emerald-300"
              : statusMessage.type === "error"
              ? "bg-rose-950/80 border-rose-500/40 text-rose-300"
              : "bg-amber-950/80 border-amber-500/40 text-amber-300"
          }`}
        >
          <span>{statusMessage.msg}</span>
          <button onClick={() => setStatusMessage(null)} className="text-gray-400 hover:text-white ml-4">
            ✕
          </button>
        </div>
      )}

      {/* Header Toolbar Card */}
      <div className="bg-gray-900/60 backdrop-blur-xl border border-gray-800 p-6 rounded-2xl shadow-2xl flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <span>⚙️ Ticker Universe Manager</span>
            <span className="bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-xs px-2.5 py-1 rounded-full font-mono">
              {tickers.length} Securities (JSON)
            </span>
          </h2>
          <p className="text-xs text-gray-400 mt-1">
            Manage Indian securities (Top 100 NSE & Top 500 BSE), edit benchmark default prices, base weights, and sync on-demand.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={handleSyncTickers}
            disabled={syncing}
            className="px-4 py-2.5 bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-500 hover:to-amber-600 text-white rounded-xl text-sm font-semibold shadow-lg shadow-amber-900/20 transition-all flex items-center gap-2 disabled:opacity-50"
          >
            <span className={syncing ? "animate-spin" : ""}>🔄</span>
            <span>{syncing ? "Syncing..." : "Sync Top 500 BSE & 100 NSE"}</span>
          </button>

          <button
            onClick={() => setShowAddModal(true)}
            className="px-4 py-2.5 bg-gray-800 hover:bg-gray-700 text-white rounded-xl text-sm font-semibold border border-gray-700 transition-all flex items-center gap-2"
          >
            <span>➕</span>
            <span>Add Security</span>
          </button>

          <button
            onClick={handleSaveTickers}
            disabled={saving}
            className="px-5 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white rounded-xl text-sm font-semibold shadow-lg shadow-emerald-900/20 transition-all flex items-center gap-2 disabled:opacity-50"
          >
            <span>{saving ? "⏳ Saving..." : "💾 Save All Changes"}</span>
          </button>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-gray-900/40 border border-gray-800 p-4 rounded-xl flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Search */}
        <div className="relative w-full md:w-80">
          <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-500 text-sm">🔍</span>
          <input
            type="text"
            placeholder="Search symbol, company, or sector..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-gray-950 border border-gray-800 rounded-lg pl-9 pr-4 py-2 text-sm text-gray-200 focus:outline-none focus:border-emerald-500/50"
          />
        </div>

        {/* Category Pill Filters */}
        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          {["All", "Category A", "Category B", "Category C", "Category D"].map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                selectedCategory === cat
                  ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/40"
                  : "bg-gray-800/60 text-gray-400 hover:text-white border border-gray-800"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Exchange Filter Pills */}
        <div className="flex items-center gap-1.5 bg-gray-950 p-1 rounded-lg border border-gray-800 text-xs">
          {["All", "NSE", "BSE"].map((ex) => (
            <button
              key={ex}
              onClick={() => setSelectedExchange(ex)}
              className={`px-2.5 py-1 rounded-md transition-all font-medium ${
                selectedExchange === ex ? "bg-gray-800 text-white shadow" : "text-gray-400 hover:text-white"
              }`}
            >
              {ex}
            </button>
          ))}
        </div>
      </div>

      {/* Main Dataset Table */}
      <div className="bg-gray-900/60 border border-gray-800 rounded-2xl shadow-xl overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-gray-400 flex flex-col items-center gap-3">
            <span className="animate-spin text-2xl">⚡</span>
            <span>Loading JSON Ticker Database...</span>
          </div>
        ) : filteredTickers.length === 0 ? (
          <div className="p-12 text-center text-gray-400">
            No securities matched search filter "<span className="text-white">{search}</span>"
          </div>
        ) : (
          <div className="overflow-x-auto max-h-[600px] overflow-y-auto">
            <table className="w-full text-left text-xs text-gray-300">
              <thead className="sticky top-0 bg-gray-950/90 backdrop-blur-md text-gray-400 uppercase font-semibold border-b border-gray-800">
                <tr>
                  <th className="py-3 px-4">Symbol</th>
                  <th className="py-3 px-4">Instrument Name</th>
                  <th className="py-3 px-4">Sector</th>
                  <th className="py-3 px-4">Category</th>
                  <th className="py-3 px-4 text-right">Default Price (₹)</th>
                  <th className="py-3 px-4 text-right">Base Wt</th>
                  <th className="py-3 px-4 text-right">Sharpe</th>
                  <th className="py-3 px-4 text-right">Risk Red %</th>
                  <th className="py-3 px-4">Technical Signal</th>
                  <th className="py-3 px-4 text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800/60">
                {filteredTickers.map((item, idx) => {
                  // Find original index in tickers array
                  const origIndex = tickers.findIndex((t) => t.ticker === item.ticker);
                  return (
                    <tr key={item.ticker} className="hover:bg-gray-800/40 transition-colors">
                      <td className="py-3 px-4 font-mono font-bold text-white flex items-center gap-1.5">
                        <span>{item.ticker}</span>
                        {item.ticker.endsWith(".NS") ? (
                          <span className="text-[10px] bg-blue-900/40 text-blue-400 border border-blue-500/30 px-1 py-0.5 rounded">
                            NSE
                          </span>
                        ) : (
                          <span className="text-[10px] bg-amber-900/40 text-amber-400 border border-amber-500/30 px-1 py-0.5 rounded">
                            BSE
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-4">
                        <input
                          type="text"
                          value={item.name}
                          onChange={(e) => handleFieldChange(origIndex, "name", e.target.value)}
                          className="bg-gray-950 border border-gray-800 rounded px-2 py-1 text-xs text-gray-100 w-48 focus:border-emerald-500/50"
                        />
                      </td>
                      <td className="py-3 px-4">
                        <input
                          type="text"
                          value={item.sector}
                          onChange={(e) => handleFieldChange(origIndex, "sector", e.target.value)}
                          className="bg-gray-950 border border-gray-800 rounded px-2 py-1 text-xs text-gray-300 w-32 focus:border-emerald-500/50"
                        />
                      </td>
                      <td className="py-3 px-4">
                        <select
                          value={item.category}
                          onChange={(e) => handleFieldChange(origIndex, "category", e.target.value)}
                          className="bg-gray-950 border border-gray-800 rounded px-2 py-1 text-xs text-gray-300 focus:border-emerald-500/50"
                        >
                          <option value="Category A">Category A (Rebalance)</option>
                          <option value="Category B">Category B (Diversifiers)</option>
                          <option value="Category C">Category C (Alpha)</option>
                          <option value="Category D">Category D (Macro Hedges)</option>
                        </select>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <input
                          type="number"
                          step="0.1"
                          value={item.default_price}
                          onChange={(e) => handleFieldChange(origIndex, "default_price", parseFloat(e.target.value) || 0)}
                          className="bg-gray-950 border border-gray-800 rounded px-2 py-1 text-xs text-right text-emerald-400 font-mono w-24 focus:border-emerald-500/50"
                        />
                      </td>
                      <td className="py-3 px-4 text-right">
                        <input
                          type="number"
                          step="0.005"
                          value={item.base_weight}
                          onChange={(e) => handleFieldChange(origIndex, "base_weight", parseFloat(e.target.value) || 0)}
                          className="bg-gray-950 border border-gray-800 rounded px-2 py-1 text-xs text-right text-gray-300 font-mono w-16 focus:border-emerald-500/50"
                        />
                      </td>
                      <td className="py-3 px-4 text-right font-mono text-purple-400">
                        <input
                          type="number"
                          step="0.1"
                          value={item.sharpe}
                          onChange={(e) => handleFieldChange(origIndex, "sharpe", parseFloat(e.target.value) || 0)}
                          className="bg-gray-950 border border-gray-800 rounded px-2 py-1 text-xs text-right text-purple-400 font-mono w-16 focus:border-emerald-500/50"
                        />
                      </td>
                      <td className="py-3 px-4 text-right font-mono text-blue-400">
                        <input
                          type="number"
                          step="0.5"
                          value={item.risk_reduction_pct || item.risk_red || 7.0}
                          onChange={(e) => handleFieldChange(origIndex, "risk_reduction_pct", parseFloat(e.target.value) || 0)}
                          className="bg-gray-950 border border-gray-800 rounded px-2 py-1 text-xs text-right text-blue-400 font-mono w-16 focus:border-emerald-500/50"
                        />
                      </td>
                      <td className="py-3 px-4">
                        <input
                          type="text"
                          value={item.technical_signal || "EMA 20 > EMA 50 Bullish Trend"}
                          onChange={(e) => handleFieldChange(origIndex, "technical_signal", e.target.value)}
                          className="bg-gray-950 border border-gray-800 rounded px-2 py-1 text-xs text-gray-300 w-48 focus:border-emerald-500/50"
                        />
                      </td>
                      <td className="py-3 px-4 text-center">
                        <button
                          onClick={() => handleDeleteTicker(origIndex)}
                          title="Delete Security"
                          className="p-1.5 bg-rose-950/40 text-rose-400 hover:bg-rose-900/60 border border-rose-800/40 rounded-lg transition-all"
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
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-gray-900 border border-gray-800 rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-gray-800 pb-3">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <span>➕ Add Custom Security to Dataset</span>
              </h3>
              <button onClick={() => setShowAddModal(false)} className="text-gray-400 hover:text-white text-lg">
                ✕
              </button>
            </div>

            <form onSubmit={handleAddTicker} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-400 mb-1">Ticker Symbol</label>
                  <input
                    type="text"
                    placeholder="e.g. ADANIENT.NS"
                    value={newTicker.ticker}
                    onChange={(e) => setNewTicker({ ...newTicker, ticker: e.target.value })}
                    className="w-full bg-gray-950 border border-gray-800 rounded-lg px-3 py-2 text-sm text-white focus:border-emerald-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-400 mb-1">Instrument Name</label>
                  <input
                    type="text"
                    placeholder="e.g. Adani Enterprises Ltd"
                    value={newTicker.name}
                    onChange={(e) => setNewTicker({ ...newTicker, name: e.target.value })}
                    className="w-full bg-gray-950 border border-gray-800 rounded-lg px-3 py-2 text-sm text-white focus:border-emerald-500"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-400 mb-1">Sector</label>
                  <input
                    type="text"
                    placeholder="e.g. Infrastructure"
                    value={newTicker.sector}
                    onChange={(e) => setNewTicker({ ...newTicker, sector: e.target.value })}
                    className="w-full bg-gray-950 border border-gray-800 rounded-lg px-3 py-2 text-sm text-white focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-400 mb-1">Category</label>
                  <select
                    value={newTicker.category}
                    onChange={(e) => setNewTicker({ ...newTicker, category: e.target.value })}
                    className="w-full bg-gray-950 border border-gray-800 rounded-lg px-3 py-2 text-sm text-white focus:border-emerald-500"
                  >
                    <option value="Category A">Category A (Rebalance)</option>
                    <option value="Category B">Category B (Diversifiers)</option>
                    <option value="Category C">Category C (Alpha)</option>
                    <option value="Category D">Category D (Macro Hedges)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-400 mb-1">Default Price (₹)</label>
                  <input
                    type="number"
                    value={newTicker.default_price}
                    onChange={(e) => setNewTicker({ ...newTicker, default_price: e.target.value })}
                    className="w-full bg-gray-950 border border-gray-800 rounded-lg px-3 py-2 text-sm text-emerald-400 font-mono focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-400 mb-1">Base Weight</label>
                  <input
                    type="number"
                    step="0.005"
                    value={newTicker.base_weight}
                    onChange={(e) => setNewTicker({ ...newTicker, base_weight: e.target.value })}
                    className="w-full bg-gray-950 border border-gray-800 rounded-lg px-3 py-2 text-sm text-gray-300 font-mono focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-400 mb-1">Sharpe Ratio</label>
                  <input
                    type="number"
                    step="0.1"
                    value={newTicker.sharpe}
                    onChange={(e) => setNewTicker({ ...newTicker, sharpe: e.target.value })}
                    className="w-full bg-gray-950 border border-gray-800 rounded-lg px-3 py-2 text-sm text-purple-400 font-mono focus:border-emerald-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-400 mb-1">Technical Signal</label>
                <input
                  type="text"
                  placeholder="e.g. Breakout above 50-day High (RSI 64)"
                  value={newTicker.technical_signal}
                  onChange={(e) => setNewTicker({ ...newTicker, technical_signal: e.target.value })}
                  className="w-full bg-gray-950 border border-gray-800 rounded-lg px-3 py-2 text-sm text-gray-300 focus:border-emerald-500"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-gray-800">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded-xl text-sm"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-sm font-semibold shadow-lg shadow-emerald-900/20"
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
