import React, { useState } from 'react';
import { X, Plus, Trash2, CheckCircle2, IndianRupee, HelpCircle, Layers } from 'lucide-react';

const POPULAR_NSE_TICKERS = [
  "RELIANCE", "TCS", "HDFCBANK", "INFY", "ICICIBANK", "SBIN", "BHARTIARTL", 
  "ITC", "KOTAKBANK", "LT", "HINDUNILVR", "TATAMOTORS", "BAJFINANCE", 
  "SUNPHARMA", "NIFTYBEES", "BANKBEES", "GOLDBEES", "ITBEES", "SILVERBEES"
];

export default function ManualHoldingsModal({ isOpen, onClose, currentHoldings, onApplyHoldings }) {
  if (!isOpen) return null;

  const [rows, setRows] = useState(() => {
    if (currentHoldings && currentHoldings.length > 0) {
      return currentHoldings.map(h => ({
        ticker: (h.Ticker || h.ticker || "").replace('.NS', ''),
        quantity: h.Quantity || h.quantity || 1,
        purchase_price: h["Purchase Price"] || h.purchase_price || h.buy_price || 100
      }));
    }
    return [
      { ticker: "RELIANCE", quantity: 25, purchase_price: 2850 },
      { ticker: "TCS", quantity: 15, purchase_price: 3900 },
      { ticker: "HDFCBANK", quantity: 50, purchase_price: 1520 }
    ];
  });

  const handleRowChange = (index, field, value) => {
    const updated = [...rows];
    updated[index][field] = field === 'ticker' ? value.toUpperCase() : value;
    setRows(updated);
  };

  const handleAddRow = () => {
    setRows([...rows, { ticker: "", quantity: 10, purchase_price: 500 }]);
  };

  const handleDeleteRow = (index) => {
    setRows(rows.filter((_, i) => i !== index));
  };

  const handleClearAll = () => {
    setRows([{ ticker: "", quantity: 1, purchase_price: 100 }]);
  };

  const totalValue = rows.reduce((sum, r) => {
    const q = Number(r.quantity) || 0;
    const p = Number(r.purchase_price) || 0;
    return sum + (q * p);
  }, 0);

  const handleSave = () => {
    const validHoldings = rows
      .filter(r => r.ticker && r.ticker.trim().length > 0)
      .map(r => ({
        Ticker: r.ticker.trim().toUpperCase(),
        Quantity: Math.max(1, Number(r.quantity) || 1),
        "Purchase Price": Math.max(0, Number(r.purchase_price) || 0)
      }));

    onApplyHoldings(validHoldings);
    onClose();
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.75)',
      backdropFilter: 'blur(8px)',
      zIndex: 10000,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px'
    }}>
      <div className="glass-panel" style={{
        maxWidth: '750px',
        width: '100%',
        maxHeight: '90vh',
        overflowY: 'auto',
        padding: '26px',
        border: '1px solid rgba(16, 185, 129, 0.3)',
        boxShadow: '0 20px 60px rgba(0,0,0,0.7)'
      }}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', borderBottom: '1px solid var(--border-color)', paddingBottom: '14px' }}>
          <div>
            <h2 style={{ fontSize: '18px', fontWeight: '800', color: '#fff', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Layers size={20} color="#10b981" />
              Manual Portfolio Stock Entry
            </h2>
            <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '2px' }}>
              Add, remove, or edit your current stock holdings without needing a CSV file.
            </p>
          </div>
          <button
            onClick={onClose}
            style={{
              background: 'rgba(255, 255, 255, 0.05)',
              border: '1px solid var(--border-color)',
              borderRadius: '8px',
              color: 'var(--text-muted)',
              cursor: 'pointer',
              padding: '6px',
              display: 'flex',
              alignItems: 'center'
            }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Quick Ticker Add Pills */}
        <div style={{ marginBottom: '16px' }}>
          <div style={{ fontSize: '11px', color: 'var(--text-dim)', fontWeight: '700', marginBottom: '6px' }}>QUICK ADD POPULAR NSE TICKERS:</div>
          <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
            {POPULAR_NSE_TICKERS.map(sym => (
              <button
                key={sym}
                onClick={() => setRows([...rows, { ticker: sym, quantity: 10, purchase_price: 500 }])}
                type="button"
                style={{
                  padding: '3px 8px',
                  borderRadius: '6px',
                  background: 'rgba(255, 255, 255, 0.04)',
                  border: '1px solid var(--border-color)',
                  color: 'var(--text-muted)',
                  fontSize: '11px',
                  fontWeight: '600',
                  cursor: 'pointer'
                }}
              >
                +{sym}
              </button>
            ))}
          </div>
        </div>

        {/* Holdings Table */}
        <div style={{ overflowX: 'auto', marginBottom: '16px' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border-color)', color: 'var(--text-muted)', textAlign: 'left' }}>
                <th style={{ padding: '8px' }}>NSE Ticker / Symbol</th>
                <th style={{ padding: '8px', width: '120px' }}>Quantity</th>
                <th style={{ padding: '8px', width: '150px' }}>Buy Price (₹)</th>
                <th style={{ padding: '8px', width: '140px' }}>Total Cost (₹)</th>
                <th style={{ padding: '8px', width: '50px' }}></th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row, idx) => {
                const rowTotal = (Number(row.quantity) || 0) * (Number(row.purchase_price) || 0);
                return (
                  <tr key={idx} style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.04)' }}>
                    <td style={{ padding: '8px' }}>
                      <input
                        type="text"
                        placeholder="e.g. RELIANCE"
                        value={row.ticker}
                        onChange={(e) => handleRowChange(idx, 'ticker', e.target.value)}
                        style={{
                          width: '100%',
                          padding: '8px 10px',
                          borderRadius: '8px',
                          background: 'rgba(0, 0, 0, 0.3)',
                          border: '1px solid var(--border-color)',
                          color: '#34d399',
                          fontWeight: '700',
                          fontFamily: 'JetBrains Mono',
                          outline: 'none'
                        }}
                      />
                    </td>
                    <td style={{ padding: '8px' }}>
                      <input
                        type="number"
                        min="1"
                        value={row.quantity}
                        onChange={(e) => handleRowChange(idx, 'quantity', Math.max(1, Number(e.target.value)))}
                        style={{
                          width: '100%',
                          padding: '8px 10px',
                          borderRadius: '8px',
                          background: 'rgba(0, 0, 0, 0.3)',
                          border: '1px solid var(--border-color)',
                          color: '#fff',
                          fontWeight: '600',
                          outline: 'none'
                        }}
                      />
                    </td>
                    <td style={{ padding: '8px' }}>
                      <input
                        type="number"
                        min="0"
                        value={row.purchase_price}
                        onChange={(e) => handleRowChange(idx, 'purchase_price', Math.max(0, Number(e.target.value)))}
                        style={{
                          width: '100%',
                          padding: '8px 10px',
                          borderRadius: '8px',
                          background: 'rgba(0, 0, 0, 0.3)',
                          border: '1px solid var(--border-color)',
                          color: '#fff',
                          fontWeight: '600',
                          outline: 'none'
                        }}
                      />
                    </td>
                    <td style={{ padding: '8px', color: '#fbbf24', fontWeight: '700' }}>
                      ₹{rowTotal.toLocaleString('en-IN')}
                    </td>
                    <td style={{ padding: '8px', textAlign: 'center' }}>
                      <button
                        onClick={() => handleDeleteRow(idx)}
                        disabled={rows.length === 1}
                        style={{
                          background: 'transparent',
                          border: 'none',
                          color: rows.length === 1 ? 'var(--text-dim)' : '#fb7185',
                          cursor: rows.length === 1 ? 'not-allowed' : 'pointer',
                          padding: '4px'
                        }}
                      >
                        <Trash2 size={16} />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Add Row & Clear Buttons */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '10px' }}>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              onClick={handleAddRow}
              type="button"
              style={{
                padding: '8px 14px',
                borderRadius: '8px',
                background: 'rgba(16, 185, 129, 0.15)',
                border: '1px solid #10b981',
                color: '#34d399',
                fontSize: '12px',
                fontWeight: '700',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}
            >
              <Plus size={15} /> Add Stock Row
            </button>
            <button
              onClick={handleClearAll}
              type="button"
              style={{
                padding: '8px 14px',
                borderRadius: '8px',
                background: 'rgba(255, 255, 255, 0.04)',
                border: '1px solid var(--border-color)',
                color: 'var(--text-muted)',
                fontSize: '12px',
                fontWeight: '600',
                cursor: 'pointer'
              }}
            >
              Clear Table
            </button>
          </div>

          {/* Total Portfolio Value Badge */}
          <div style={{
            padding: '8px 16px',
            borderRadius: '10px',
            background: 'rgba(0,0,0,0.4)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Estimated Investment:</span>
            <span style={{ fontSize: '15px', fontWeight: '800', color: '#10b981' }}>
              ₹{totalValue.toLocaleString('en-IN')}
            </span>
          </div>
        </div>

        {/* Footer Actions */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', borderTop: '1px solid var(--border-color)', paddingTop: '16px' }}>
          <button
            onClick={onClose}
            style={{
              padding: '10px 18px',
              borderRadius: '10px',
              background: 'transparent',
              border: '1px solid var(--border-color)',
              color: 'var(--text-muted)',
              fontSize: '13px',
              fontWeight: '600',
              cursor: 'pointer'
            }}
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            style={{
              padding: '10px 22px',
              borderRadius: '10px',
              background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
              color: '#fff',
              border: 'none',
              fontSize: '13px',
              fontWeight: '700',
              cursor: 'pointer',
              boxShadow: '0 4px 16px rgba(16, 185, 129, 0.4)',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            <CheckCircle2 size={16} /> Apply to Portfolio & Compute
          </button>
        </div>
      </div>
    </div>
  );
}
