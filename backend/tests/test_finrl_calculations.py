import pytest
import numpy as np
import pandas as pd
from services.quant_engine_india import (
    compute_dynamic_technical_features,
    compute_empirical_portfolio_risk_metrics,
    FinancialTurbulenceEngine,
    calculate_statutory_friction_inr,
    calculate_portfolio_diagnostics,
    generate_recommendations,
    calculate_target_selling_points,
    fetch_ticker_price_history
)

def test_compute_dynamic_technical_features_valid():
    dates = pd.date_range(end="2026-08-20", periods=50, freq="B")
    prices = 100.0 * np.cumprod(1.0 + np.random.normal(0.001, 0.015, len(dates)))
    df = pd.DataFrame({
        "Open": prices * 0.99,
        "High": prices * 1.02,
        "Low": prices * 0.98,
        "Close": prices,
        "Volume": np.random.randint(10000, 500000, len(dates))
    }, index=dates)

    features = compute_dynamic_technical_features(df)
    assert "rsi" in features
    assert 0.0 <= features["rsi"] <= 100.0
    assert "macd_signal" in features
    assert features["macd_signal"] in ["BULLISH_CROSSOVER", "BEARISH_DIVERGENCE", "BULLISH_TREND"]
    assert "atr" in features
    assert features["atr"] > 0
    assert "technical_signal" in features
    assert len(features["technical_signal"]) > 5

def test_compute_dynamic_technical_features_fallback():
    features = compute_dynamic_technical_features(None)
    assert features["rsi"] == 52.0
    assert features["atr"] == 15.0
    assert "technical_signal" in features

def test_compute_empirical_portfolio_risk_metrics():
    np.random.seed(42)
    daily_rets = np.random.normal(0.0008, 0.012, 252)
    metrics = compute_empirical_portfolio_risk_metrics(daily_rets, risk_free_rate_annual=0.065)

    assert "sortino_ratio" in metrics
    assert "calmar_ratio" in metrics
    assert "value_at_risk_95_pct" in metrics
    assert "cvar_95_pct" in metrics
    assert "max_drawdown_pct" in metrics
    assert "omega_ratio" in metrics
    assert "tail_ratio" in metrics
    assert "historical_cagr_pct" in metrics
    assert "annualized_volatility_pct" in metrics

    # Mathematical consistency checks
    assert metrics["value_at_risk_95_pct"] < 0 # VaR at 5th percentile of normal daily return
    assert metrics["cvar_95_pct"] <= metrics["value_at_risk_95_pct"] # Expected Shortfall is more severe than VaR
    assert metrics["omega_ratio"] > 0
    assert metrics["tail_ratio"] > 0
    assert metrics["max_drawdown_pct"] <= 0

def test_financial_turbulence_engine():
    # 4 assets across 100 trading days
    np.random.seed(123)
    rets = np.random.normal(0.0005, 0.015, size=(100, 4))
    turb_series = FinancialTurbulenceEngine.calculate_turbulence(rets)

    assert len(turb_series) == 100
    assert all(t >= 0 for t in turb_series) # Mahalanobis distance squared is strictly non-negative

    status = FinancialTurbulenceEngine.get_market_turbulence_status()
    assert "market_turbulence_index" in status
    assert "turbulence_regime" in status
    assert "hedge_multiplier" in status
    assert status["hedge_multiplier"] >= 1.0

def test_statutory_friction_inr():
    fric_buy = calculate_statutory_friction_inr(100000.0, "BUY")
    assert fric_buy == 150.0 # 0.15% of 1,00,000 INR

    fric_zero = calculate_statutory_friction_inr(0.0, "BUY")
    assert fric_zero == 0.0

def test_calculate_portfolio_diagnostics_empirical():
    holdings = [
        {"Ticker": "RELIANCE.NS", "Quantity": 10, "Purchase Price": 2800.0},
        {"Ticker": "TCS.NS", "Quantity": 5, "Purchase Price": 3800.0},
        {"Ticker": "HDFCBANK.NS", "Quantity": 20, "Purchase Price": 1600.0}
    ]
    diag = calculate_portfolio_diagnostics(holdings, macro_threat_score=40.0)

    assert diag["total_value_inr"] > 0
    assert 0.0 <= diag["health_score"] <= 100.0
    assert "omega_ratio" in diag
    assert "tail_ratio" in diag
    assert "historical_cagr_pct" in diag
    assert "annualized_volatility_pct" in diag
    assert "correlation_matrix" in diag
    assert "RELIANCE.NS" in diag["correlation_matrix"]
    assert diag["correlation_matrix"]["RELIANCE.NS"]["RELIANCE.NS"] == 1.0

def test_generate_recommendations_with_finrl_metrics():
    res = generate_recommendations(
        available_capital_inr=100000.0,
        risk_profile="Moderate",
        recommendation_count=8
    )

    assert res["recommendation_count"] > 0
    recs = res["recommendations"]
    assert len(recs) > 0

    first = recs[0]
    assert "rsi" in first
    assert "macd_signal" in first
    assert "atr_inr" in first
    assert "estimated_friction_inr" in first
    assert "net_expected_profit_inr" in first
    assert "technical_momentum_signal" in first
    assert "optimization_method" in res
    assert "FinRL Mahalanobis Turbulence" in res["optimization_method"]

def test_calculate_target_selling_points_and_history_backtest():
    target_res = calculate_target_selling_points(
        capital_inr=100000.0,
        target_profit_inr=6000.0,
        time_horizon_months=2.0
    )

    assert "total_estimated_friction_inr" in target_res
    assert "net_expected_profit_inr" in target_res
    assert len(target_res["recommendations"]) > 0
    first_card = target_res["recommendations"][0]
    assert "rsi" in first_card
    assert "atr_inr" in first_card

    # Test history scenario backtest
    hist_res = fetch_ticker_price_history(ticker="INFY.NS", period="6mo", target_profit_pct=5.0)
    assert "overall_scenario_win_rate_pct" in hist_res
    assert "profit_factor" in hist_res
    assert len(hist_res["historical_scenarios"]) > 0
    scenario_1 = hist_res["historical_scenarios"][0]
    assert "benchmark_alpha_pct" in scenario_1
    assert "scenario_beta" in scenario_1
    assert "underwater_max_drawdown_pct" in scenario_1
