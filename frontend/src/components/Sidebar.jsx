import React, { useState } from 'react';
import { Upload, IndianRupee, ShieldCheck, Zap, FileSpreadsheet, CheckCircle2 } from 'lucide-react';

export default function Sidebar({
  availableCapital, setAvailableCapital,
  riskProfile, setRiskProfile,
  onUploadCSV, onLoadSamplePortfolio,
  onRunOptimization, loading
}) {
  const [file, setFile] = useState(null);
  const [uploadSuccess, setUploadSuccess] = useState(false);

  const presets = [
    { label: '₹50K', value: 50000 },
    { label: '₹1 Lakh', value: 100000 },
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
      padding: '20px', display: 'flex', flexDirection: 'column', gap: '24px',
      alignSelf: 'start', position: 'sticky', top: '24px', height: 'fit-content'
    }}>
      <div>
        <h2 style={{ fontSize: '16px', fontWeight: '700', marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <FileSpreadsheet size={18} color="#10b981" />
          1. Portfolio Holdings File
        </h2>
        <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '12px' }}>
          Upload CSV/Excel containing columns: <code style={{ color: '#34d399' }}>[Ticker, Quantity, Purchase Price]</code>
        </p>

        {/* Upload Zone */}
        <label style={{
          display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
          padding: '16px', borderRadius: '12px', border: '2px dashed var(--border-color)',
          background: 'rgba(255, 255, 255, 0.02)', cursor: 'pointer', transition: 'all 0.2s',
          marginBottom: '10px'
        }}>
          <Upload size={22} color="#9ca3af" style={{ marginBottom: '6px' }} />
          <span style={{ fontSize: '13px', fontWeight: '500' }}>
            {file ? file.name : "Click to browse or drop CSV"}
          </span>
          <span style={{ fontSize: '11px', color: 'var(--text-dim)', marginTop: '2px' }}>Auto-normalizes to NSE (.NS)</span>
          <input type="file" accept=".csv, .xlsx, .xls" onChange={handleFileChange} style={{ display: 'none' }} />
        </label>

        {uploadSuccess && (
          <div style={{ fontSize: '12px', color: '#34d399', display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px' }}>
            <CheckCircle2 size={14} /> Portfolio uploaded & normalized!
          </div>
        )}

        <button
          onClick={onLoadSamplePortfolio}
          style={{
            width: '100%', padding: '8px 12px', borderRadius: '8px',
            background: 'rgba(99, 102, 241, 0.1)', border: '1px solid rgba(99, 102, 241, 0.2)',
            color: '#818cf8', fontSize: '12px', fontWeight: '600', cursor: 'pointer'
          }}
        >
          ⚡ Load Sample Nifty 50 Holdings
        </button>
      </div>

      <hr style={{ borderColor: 'var(--border-color)' }} />

      {/* Capital Deployment Section */}
      <div>
        <h2 style={{ fontSize: '16px', fontWeight: '700', marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <IndianRupee size={18} color="#f59e0b" />
          2. Deployment Capital (₹ INR)
        </h2>
        <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '12px' }}>
          Immediate available capital for new investment allocations.
        </p>

        {/* INR Input */}
        <div style={{ position: 'relative', marginBottom: '12px' }}>
          <span style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', fontWeight: '700', color: '#f59e0b' }}>₹</span>
          <input
            type="number"
            value={availableCapital}
            onChange={(e) => setAvailableCapital(Number(e.target.value))}
            style={{
              width: '100%', padding: '12px 14px 12px 32px', borderRadius: '10px',
              background: 'rgba(0, 0, 0, 0.3)', border: '1px solid var(--border-color)',
              color: '#fff', fontSize: '16px', fontWeight: '700'
            }}
          />
        </div>

        {/* Preset Buttons */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '6px', marginBottom: '12px' }}>
          {presets.map((p) => (
            <button
              key={p.value}
              onClick={() => setAvailableCapital(p.value)}
              style={{
                padding: '6px 8px', borderRadius: '6px', fontSize: '11px', fontWeight: '600',
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
        <h2 style={{ fontSize: '16px', fontWeight: '700', marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <ShieldCheck size={18} color="#a855f7" />
          3. Risk & Objective Profile
        </h2>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '12px' }}>
          {[
            { id: 'Conservative', title: 'Conservative', desc: 'Capital Protection, Gold & Fixed Income focus' },
            { id: 'Moderate', title: 'Moderate', desc: 'Balanced Nifty 50, Midcap & Gold allocation' },
            { id: 'Aggressive', title: 'Aggressive', desc: 'Factor Momentum & Smallcaps Alpha focus' }
          ].map((profile) => (
            <div
              key={profile.id}
              onClick={() => setRiskProfile(profile.id)}
              style={{
                padding: '10px 14px', borderRadius: '10px', cursor: 'pointer',
                background: riskProfile === profile.id ? 'rgba(168, 85, 247, 0.15)' : 'rgba(255, 255, 255, 0.03)',
                border: riskProfile === profile.id ? '1px solid #a855f7' : '1px solid var(--border-color)',
                transition: 'all 0.2s'
              }}
            >
              <div style={{ fontSize: '13px', fontWeight: '700', color: riskProfile === profile.id ? '#c084fc' : '#f3f4f6' }}>
                {profile.title}
              </div>
              <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '2px' }}>
                {profile.desc}
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
          marginTop: '8px', padding: '14px', borderRadius: '12px',
          background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
          color: '#fff', border: 'none', fontSize: '15px', fontWeight: '700',
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
          cursor: loading ? 'not-allowed' : 'pointer',
          boxShadow: '0 4px 20px rgba(16, 185, 129, 0.4)'
        }}
      >
        <Zap size={18} />
        {loading ? "Computing HRP Matrix..." : "Generate Optimized Portfolio"}
      </button>
    </aside>
  );
}
