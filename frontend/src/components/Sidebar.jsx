import React, { useState } from 'react';
import { Upload, IndianRupee, ShieldCheck, Zap, FileSpreadsheet, CheckCircle2, TrendingUp, Plus, Trash2, HelpCircle } from 'lucide-react';
import { formatINRDenomination } from '../utils/formatters';

export default function Sidebar({
  availableCapital, setAvailableCapital,
  riskProfile, setRiskProfile,
  assetTypePreference, setAssetTypePreference,
  onUploadCSV, onLoadSamplePortfolio,
  onOpenManualModal, onClearPortfolio, onOpenGlossary,
  holdingsCount = 0,
  onRunOptimization, loading
}) {
  const [file, setFile] = useState(null);
  const [uploadSuccess, setUploadSuccess] = useState(false);

  const presets = [
    { label: '₹50K', value: 50000 },
    { label: '₹1 Lakh', value: 100000 },
    { label: '₹2 Lakhs', value: 200000 },
    { label: '₹5 Lakhs', value: 500000 },
    { label: '₹10 Lakhs', value: 1000000 },
    { label: '₹25 Lakhs', value: 2500000 }
  ];

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      setFile(selectedFile);
      onUploadCSV(selectedFile);
      setUploadSuccess(true);
      setTimeout(() => setUploadSuccess(false), 4000);
    }
  };

  return (
    <aside className="glass-panel" style={{
      padding: '20px', display: 'flex', flexDirection: 'column', gap: '22px',
      alignSelf: 'start', position: 'sticky', top: '24px',
      maxHeight: 'calc(100vh - 48px)', overflowY: 'auto'
    }}>
      {/* 1. Portfolio Holdings Ingestion */}
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
          <h2 style={{ fontSize: '15px', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '8px', color: '#fff' }}>
            <FileSpreadsheet size={17} color="#10b981" />
            1. Portfolio Holdings File
          </h2>
          {holdingsCount > 0 && (
            <span style={{ fontSize: '11px', padding: '1px 6px', borderRadius: '6px', background: 'rgba(16, 185, 129, 0.2)', color: '#34d399', fontWeight: '700' }}>
              {holdingsCount} stocks loaded
            </span>
          )}
        </div>
        <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '10px' }}>
          Upload CSV/Excel or enter stock positions directly:
        </p>

        {/* Upload Zone */}
        <label style={{
          display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
          padding: '14px', borderRadius: '10px', border: '2px dashed var(--border-color)',
          background: 'rgba(255, 255, 255, 0.02)', cursor: 'pointer', transition: 'all 0.2s',
          marginBottom: '10px'
        }}>
          <Upload size={20} color="#9ca3af" style={{ marginBottom: '4px' }} />
          <span style={{ fontSize: '12px', fontWeight: '600' }}>
            {file ? file.name : "Click to browse or drop CSV"}
          </span>
          <span style={{ fontSize: '10px', color: 'var(--text-dim)', marginTop: '2px' }}>Auto-normalizes to NSE (.NS)</span>
          <input type="file" accept=".csv, .xlsx, .xls" onChange={handleFileChange} style={{ display: 'none' }} />
        </label>

        {uploadSuccess && (
          <div style={{ fontSize: '11px', color: '#34d399', display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px' }}>
            <CheckCircle2 size={13} /> Portfolio uploaded & normalized!
          </div>
        )}

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px', marginBottom: '6px' }}>
          <button
            onClick={onOpenManualModal}
            type="button"
            style={{
              padding: '7px 8px', borderRadius: '8px',
              background: 'rgba(16, 185, 129, 0.12)', border: '1px solid rgba(16, 185, 129, 0.25)',
              color: '#34d399', fontSize: '11px', fontWeight: '700', cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px'
            }}
          >
            <Plus size={13} /> Manual Entry
          </button>

          <button
            onClick={onLoadSamplePortfolio}
            type="button"
            style={{
              padding: '7px 8px', borderRadius: '8px',
              background: 'rgba(99, 102, 241, 0.1)', border: '1px solid rgba(99, 102, 241, 0.2)',
              color: '#818cf8', fontSize: '11px', fontWeight: '600', cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px'
            }}
          >
            ⚡ Sample Nifty 50
          </button>
        </div>

        {holdingsCount > 0 && (
          <button
            onClick={onClearPortfolio}
            type="button"
            style={{
              width: '100%', padding: '5px 8px', borderRadius: '6px',
              background: 'transparent', border: '1px solid rgba(244, 63, 94, 0.25)',
              color: '#fb7185', fontSize: '11px', fontWeight: '600', cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px'
            }}
          >
            <Trash2 size={12} /> Clear Portfolio (Deploy Fresh Capital Only)
          </button>
        )}
      </div>

      <hr style={{ borderColor: 'var(--border-color)' }} />

      {/* Capital Deployment Section */}
      <div>
        <h2 style={{ fontSize: '15px', fontWeight: '700', marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '8px', color: '#fff' }}>
          <IndianRupee size={17} color="#f59e0b" />
          2. Deployment Capital (₹ INR)
        </h2>
        <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '8px' }}>
          Fresh cash to invest or rebalance.
        </p>

        {/* INR Input */}
        <div style={{ position: 'relative', marginBottom: '6px' }}>
          <span style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', fontWeight: '700', color: '#f59e0b' }}>₹</span>
          <input
            type="number"
            value={availableCapital}
            onChange={(e) => setAvailableCapital(Number(e.target.value))}
            style={{
              width: '100%', padding: '10px 14px 10px 32px', borderRadius: '10px',
              background: 'rgba(0, 0, 0, 0.3)', border: '1px solid var(--border-color)',
              color: '#fff', fontSize: '15px', fontWeight: '700', outline: 'none'
            }}
          />
        </div>

        {/* Indian Denomination Word Preview */}
        <div style={{ fontSize: '11px', color: '#fbbf24', fontWeight: '600', marginBottom: '8px', paddingLeft: '2px' }}>
          Amount: {formatINRDenomination(availableCapital)}
        </div>

        {/* Preset Buttons */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '6px', marginBottom: '8px' }}>
          {presets.map((p) => (
            <button
              key={p.value}
              onClick={() => setAvailableCapital(p.value)}
              style={{
                padding: '5px 6px', borderRadius: '6px', fontSize: '11px', fontWeight: '600',
                background: availableCapital === p.value ? 'rgba(245, 158, 11, 0.2)' : 'rgba(255, 255, 255, 0.04)',
                border: availableCapital === p.value ? '1px solid #f59e0b' : '1px solid var(--border-color)',
                color: availableCapital === p.value ? '#fbbf24' : 'var(--text-muted)',
                cursor: 'pointer'
              }}
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      <hr style={{ borderColor: 'var(--border-color)' }} />

      {/* Risk Profile Selection */}
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
          <h2 style={{ fontSize: '15px', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '8px', color: '#fff' }}>
            <ShieldCheck size={17} color="#a855f7" />
            3. Risk Profile
          </h2>
          {onOpenGlossary && (
            <button
              onClick={onOpenGlossary}
              title="View Quant Glossary"
              type="button"
              style={{ background: 'transparent', border: 'none', color: 'var(--text-dim)', cursor: 'pointer' }}
            >
              <HelpCircle size={14} />
            </button>
          )}
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginTop: '8px' }}>
          {[
            { id: 'Conservative', title: 'Conservative', desc: 'Capital Protection & Defensives' },
            { id: 'Moderate', title: 'Moderate', desc: 'Balanced growth & Core HRP' },
            { id: 'Aggressive', title: 'Aggressive', desc: 'Factor Momentum & High Alpha' }
          ].map((profile) => (
            <div
              key={profile.id}
              onClick={() => setRiskProfile(profile.id)}
              style={{
                padding: '8px 12px', borderRadius: '8px', cursor: 'pointer',
                background: riskProfile === profile.id ? 'rgba(168, 85, 247, 0.15)' : 'rgba(255, 255, 255, 0.03)',
                border: riskProfile === profile.id ? '1px solid #a855f7' : '1px solid var(--border-color)',
                transition: 'all 0.2s'
              }}
            >
              <div style={{ fontSize: '12px', fontWeight: '700', color: riskProfile === profile.id ? '#c084fc' : '#f3f4f6' }}>
                {profile.title}
              </div>
              <div style={{ fontSize: '10px', color: 'var(--text-muted)', marginTop: '1px' }}>
                {profile.desc}
              </div>
            </div>
          ))}
        </div>
      </div>

      <hr style={{ borderColor: 'var(--border-color)' }} />

      {/* Asset Class Preference Selection */}
      <div>
        <h2 style={{ fontSize: '15px', fontWeight: '700', marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '8px', color: '#fff' }}>
          <TrendingUp size={17} color="#3b82f6" />
          4. Asset Class Focus
        </h2>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginTop: '8px' }}>
          {[
            { id: 'EQUITY_FOCUSED', title: '🚀 Direct Equity / Stocks', desc: 'Stock-heavy allocation (~90%+ direct stocks)' },
            { id: 'EQUITY_ONLY', title: '💎 100% Direct Equities Only', desc: 'Pure direct stocks (zero Mutual Funds / ETFs)' },
            { id: 'BALANCED', title: '⚖️ Balanced Mix', desc: 'Equities + ETFs & Mutual Funds' },
            { id: 'MUTUAL_FUNDS_ETFS', title: '🛡️ Mutual Funds & ETFs', desc: 'Fund & Index heavy allocation' }
          ].map((assetPref) => (
            <div
              key={assetPref.id}
              onClick={() => setAssetTypePreference && setAssetTypePreference(assetPref.id)}
              style={{
                padding: '8px 12px', borderRadius: '8px', cursor: 'pointer',
                background: assetTypePreference === assetPref.id ? 'rgba(59, 130, 246, 0.18)' : 'rgba(255, 255, 255, 0.03)',
                border: assetTypePreference === assetPref.id ? '1px solid #3b82f6' : '1px solid var(--border-color)',
                transition: 'all 0.2s'
              }}
            >
              <div style={{ fontSize: '12px', fontWeight: '700', color: assetTypePreference === assetPref.id ? '#60a5fa' : '#f3f4f6' }}>
                {assetPref.title}
              </div>
              <div style={{ fontSize: '10px', color: 'var(--text-muted)', marginTop: '1px' }}>
                {assetPref.desc}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Run Optimization Action Button */}
      <button
        onClick={() => onRunOptimization()}
        disabled={loading}
        style={{
          marginTop: '6px', padding: '12px', borderRadius: '10px',
          background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
          color: '#fff', border: 'none', fontSize: '14px', fontWeight: '700',
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
          cursor: loading ? 'not-allowed' : 'pointer',
          boxShadow: '0 4px 16px rgba(16, 185, 129, 0.4)'
        }}
      >
        <Zap size={17} />
        {loading ? "Computing HRP Matrix..." : "Generate Optimized Portfolio"}
      </button>
    </aside>
  );
}

