import React from 'react';
import { X, BookOpen, HelpCircle, Shield, TrendingUp, Zap, PieChart } from 'lucide-react';

export default function QuantGlossaryModal({ isOpen, onClose }) {
  if (!isOpen) return null;

  const glossaryItems = [
    {
      term: "Hierarchical Risk Parity (HRP)",
      badge: "Allocation Algorithm",
      desc: "A Nobel-level quantitative method that clusters stocks by their correlation and balances risk across clusters so that no single market sector causes a severe portfolio crash."
    },
    {
      term: "Financial Turbulence Index (Mahalanobis Distance)",
      badge: "FinRL Regime Detection",
      desc: "Measures statistical abnormality in market returns: (y_t - μ)^T Σ^(-1) (y_t - μ). When turbulence spikes above the 90th percentile, the system automatically triggers a quantitative risk-off hedging tilt into Gold and Liquid funds."
    },
    {
      term: "Portfolio Health Score (0 - 100)",
      badge: "Diagnostic Metric",
      desc: "A composite health grade evaluating your diversification, sector balance, downside volatility resistance, and vulnerability to macroeconomic shocks (crude oil, currency, FII flows). >75 is considered optimal."
    },
    {
      term: "Herfindahl-Hirschman Index (HHI)",
      badge: "Concentration",
      desc: "Measures whether your capital is concentrated in too few stocks. An HHI below 0.15 indicates healthy diversification; above 0.25 indicates danger of single-stock overexposure."
    },
    {
      term: "Realized Sortino & Calmar Ratios",
      badge: "FinRL Downside Risk",
      desc: "• Sortino: Measures excess return per unit of bad downside deviation (downside semi-variance). >1.5 is strong.\n• Calmar: Ratio of annualized CAGR to historical Maximum Drawdown."
    },
    {
      term: "Value at Risk (VaR 95%) & CVaR (Expected Shortfall)",
      badge: "Tail Risk",
      desc: "• VaR 95%: The maximum expected daily loss on 95 out of 100 normal sessions.\n• CVaR 95% (Expected Shortfall): The average loss expected in the worst 5% tail events."
    },
    {
      term: "Omega Ratio & Tail Ratio",
      badge: "Distribution Metrics",
      desc: "• Omega Ratio: The probability-weighted ratio of gains versus losses relative to the risk-free rate (>1.2 is favorable).\n• Tail Ratio: Ratio of the 95th percentile upside return to the 5th percentile downside risk."
    },
    {
      term: "Statutory Friction & STT Cost (0.15%)",
      badge: "Friction Modeling",
      desc: "Accounts for Indian statutory delivery charges (Securities Transaction Tax / STT = 0.1%, exchange turnover charges, SEBI fees, and stamp duty) to report realistic net realizable profit."
    },
    {
      term: "Category A: Core Holdings to Rebalance",
      badge: "Category A",
      desc: "Established large-cap compounders (e.g., Reliance, TCS, HDFC Bank, Nifty BeES) that form the resilient anchor of your portfolio."
    },
    {
      term: "Category B: Diversifiers & Non-Correlated",
      badge: "Category B",
      desc: "Assets like Gold ETFs (Gold BeES), Pharma, or FMCG that stay steady or rise even when benchmark equities drop."
    },
    {
      term: "Category C: Systematic Alpha / Momentum",
      badge: "Category C",
      desc: "High-velocity momentum stocks and growth leaders selected to generate outsized returns above benchmark indices with live RSI and MACD momentum confirmation."
    },
    {
      term: "Category D: Macro Hedges & Defensives",
      badge: "Category D",
      desc: "Defensive sovereign bonds, liquid funds, or export-earning sectors that protect your capital during high-crude or high-inflation regimes."
    },
    {
      term: "Actions: SELL, HOLD, TOP-UP, BUY",
      badge: "Execution Actions",
      desc: "• SELL: Exit underperforming or overconcentrated holdings to free up cash.\n• HOLD: Maintain high-conviction positions without adding capital.\n• TOP-UP: Add fresh capital to existing winning holdings.\n• BUY: Open new positions in high-alpha or diversifying securities."
    }
  ];

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
        maxWidth: '720px',
        width: '100%',
        maxHeight: '90vh',
        overflowY: 'auto',
        padding: '28px',
        border: '1px solid rgba(16, 185, 129, 0.3)',
        boxShadow: '0 20px 60px rgba(0,0,0,0.7)',
        position: 'relative'
      }}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', borderBottom: '1px solid var(--border-color)', paddingBottom: '14px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <BookOpen size={24} color="#10b981" />
            <div>
              <h2 style={{ fontSize: '18px', fontWeight: '800', color: '#fff' }}>Quant & Financial Terms Glossary</h2>
              <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Beginner-friendly explanations of BharatiQuant quantitative concepts</p>
            </div>
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

        {/* Glossary Items List */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          {glossaryItems.map((item, idx) => (
            <div key={idx} className="glass-card" style={{ padding: '14px 16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px', flexWrap: 'wrap', gap: '8px' }}>
                <span style={{ fontSize: '14px', fontWeight: '700', color: '#fff' }}>{item.term}</span>
                <span style={{
                  fontSize: '11px',
                  fontWeight: '700',
                  padding: '2px 8px',
                  borderRadius: '6px',
                  background: 'rgba(99, 102, 241, 0.15)',
                  color: '#818cf8',
                  border: '1px solid rgba(99, 102, 241, 0.3)'
                }}>
                  {item.badge}
                </span>
              </div>
              <p style={{ fontSize: '12px', color: 'var(--text-muted)', lineHeight: '1.5', whiteSpace: 'pre-line' }}>
                {item.desc}
              </p>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div style={{ marginTop: '20px', display: 'flex', justifyContent: 'flex-end' }}>
          <button
            onClick={onClose}
            style={{
              padding: '10px 20px',
              borderRadius: '10px',
              background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
              color: '#fff',
              border: 'none',
              fontSize: '13px',
              fontWeight: '700',
              cursor: 'pointer'
            }}
          >
            Got It, Close
          </button>
        </div>
      </div>
    </div>
  );
}
