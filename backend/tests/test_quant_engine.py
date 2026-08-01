import os
import sys
import pytest
import numpy as np
import pandas as pd

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from services.quant_engine_india import (
    normalize_ticker, fetch_current_prices, calculate_portfolio_diagnostics,
    hrp_optimization, generate_recommendations, DEFAULT_PRICES, SECTOR_MAPPING
)

# ---------------------------------------------------------
# Unit Tests: normalize_ticker
# ---------------------------------------------------------

@pytest.mark.parametrize("raw_input,expected", [
    ("RELIANCE", "RELIANCE.NS"),
    ("tcs.ns", "TCS.NS"),
    ("INFY.BO", "INFY.NS"),
    ("  hdfcbank  ", "HDFCBANK.NS"),
    ("niftybees.bo", "NIFTYBEES.NS"),
    ("LT.NS", "LT.NS"),
    ("ITC", "ITC.NS"),
])
def test_normalize_ticker_variations(raw_input, expected):
    assert normalize_ticker(raw_input) == expected

# ---------------------------------------------------------
# Unit Tests: fetch_current_prices
# ---------------------------------------------------------

def test_fetch_current_prices_known_and_unknown():
    tickers = ["RELIANCE.NS", "UNKNOWN_TICKER.NS"]
    prices = fetch_current_prices(tickers)

    assert "RELIANCE.NS" in prices
    assert prices["RELIANCE.NS"] > 0
    assert "UNKNOWN_TICKER.NS" in prices
    assert prices["UNKNOWN_TICKER.NS"] == 500.0  # Fallback default price

def test_fetch_current_prices_yfinance_exception_fallback(monkeypatch):
    def mock_yf_ticker(*args, **kwargs):
        raise Exception("yfinance API connectivity failure")

    import yfinance as yf
    monkeypatch.setattr(yf, "Ticker", mock_yf_ticker)

    tickers = ["RELIANCE.NS", "TCS.NS"]
    prices = fetch_current_prices(tickers)
    assert prices["RELIANCE.NS"] == DEFAULT_PRICES["RELIANCE.NS"]
    assert prices["TCS.NS"] == DEFAULT_PRICES["TCS.NS"]

# ---------------------------------------------------------
# Unit Tests: calculate_portfolio_diagnostics
# ---------------------------------------------------------

def test_portfolio_diagnostics_empty():
    diag = calculate_portfolio_diagnostics([])
    assert diag["total_value_inr"] == 0.0
    assert diag["total_invested_inr"] == 0.0
    assert diag["health_score"] == 75.0
    assert diag["hhi_index"] == 0.0
    assert diag["holdings_normalized"] == []

def test_portfolio_diagnostics_single_holding():
    raw_holdings = [{"Ticker": "RELIANCE", "Quantity": 10, "Purchase Price": 2500}]
    diag = calculate_portfolio_diagnostics(raw_holdings, macro_threat_score=20.0)

    assert diag["total_value_inr"] > 0
    assert diag["hhi_index"] == 1.0  # Single asset = 100% concentration
    assert "High Concentration Risk" in diag["hhi_status"]
    assert len(diag["top_concentrations"]) == 1
    assert diag["top_concentrations"][0]["weight_pct"] == 100.0

def test_portfolio_diagnostics_diversified(sample_holdings_raw):
    diag = calculate_portfolio_diagnostics(sample_holdings_raw, macro_threat_score=40.0)

    assert diag["total_value_inr"] > 0
    assert diag["total_invested_inr"] > 0
    assert 10.0 <= diag["health_score"] <= 100.0
    assert 0.0 < diag["hhi_index"] < 1.0
    assert isinstance(diag["sortino_ratio"], float)
    assert isinstance(diag["calmar_ratio"], float)
    assert isinstance(diag["value_at_risk_95_pct"], float)
    assert isinstance(diag["cvar_95_pct"], float)
    assert isinstance(diag["max_drawdown_pct"], float)
    assert len(diag["sector_breakdown"]) > 0
    assert len(diag["holdings_normalized"]) == len(sample_holdings_raw)

    # Check correlation matrix structure
    corr = diag["correlation_matrix"]
    assert isinstance(corr, dict)
    for t1 in corr:
        assert corr[t1][t1] == 1.0  # Self correlation is 1.0

# ---------------------------------------------------------
# Unit Tests: hrp_optimization
# ---------------------------------------------------------

def test_hrp_optimization_direct():
    # Construct a 4x4 covariance matrix
    cov_data = np.array([
        [0.04, 0.01, 0.005, 0.002],
        [0.01, 0.09, 0.01,  0.003],
        [0.005, 0.01, 0.16, 0.01],
        [0.002, 0.003, 0.01, 0.02]
    ])
    labels = ["Asset_A", "Asset_B", "Asset_C", "Asset_D"]
    cov_df = pd.DataFrame(cov_data, index=labels, columns=labels)

    weights = hrp_optimization(cov_df)

    assert isinstance(weights, pd.Series)
    assert len(weights) == 4
    assert pytest.approx(weights.sum(), abs=1e-5) == 1.0
    assert (weights >= 0).all()
    # Asset_D has lowest variance (0.02) so it should receive substantial allocation
    assert weights["Asset_D"] > 0

# ---------------------------------------------------------
# Unit Tests: generate_recommendations
# ---------------------------------------------------------

@pytest.mark.parametrize("risk_profile", ["Conservative", "Moderate", "Aggressive"])
def test_generate_recommendations_risk_profiles(risk_profile):
    capital = 250000.0
    res = generate_recommendations(
        available_capital_inr=capital,
        risk_profile=risk_profile
    )

    assert res["total_capital_inr"] == capital
    assert res["risk_profile"] == risk_profile
    assert 10 <= res["recommendation_count"] <= 20
    assert len(res["recommendations"]) == res["recommendation_count"]

    total_allocated = sum(r["allocation_inr"] for r in res["recommendations"])
    assert total_allocated <= capital

    # Verify unit_price * suggested_quantity equals allocation_inr exactly for all cards
    for r in res["recommendations"]:
        assert r["suggested_quantity"] >= 1
        assert abs(r["allocation_inr"] - round(r["suggested_quantity"] * r["unit_price"], 2)) < 0.05

    # Ensure all 4 categories are represented
    categories = set(r["category"] for r in res["recommendations"])
    assert len(categories) == 4

def test_generate_recommendations_high_threat_macro(mock_macro_high_threat):
    res = generate_recommendations(
        available_capital_inr=500000.0,
        risk_profile="Moderate",
        macro_data=mock_macro_high_threat
    )

    # In high threat score scenario (>60.0), Category D (Hedges) should receive higher allocation
    cat_summary = res["category_summary"]
    assert cat_summary["Category D"] > 0
    assert cat_summary["Category B"] > 0

def test_generate_recommendations_custom_count_override():
    res = generate_recommendations(
        available_capital_inr=1000000.0,
        risk_profile="Aggressive",
        existing_holdings=[],
        recommendation_count=30
    )

    assert res["recommendation_count"] == 30
    assert len(res["recommendations"]) == 30

    total_allocated = sum(r["allocation_inr"] for r in res["recommendations"])
    assert abs(total_allocated - 1000000.0) < 100.0

def test_generate_recommendations_no_csv_upload_holdings():
    # Verify recommendations generate seamlessly without any previous portfolio upload (empty holdings)
    res = generate_recommendations(
        available_capital_inr=500000.0,
        risk_profile="Moderate",
        existing_holdings=[]
    )

    assert res["recommendation_count"] > 0
    assert len(res["recommendations"]) == res["recommendation_count"]
    assert res["portfolio_health_before"] == 75.0

def test_generate_recommendations_card_fields():
    res = generate_recommendations(available_capital_inr=100000.0)

    for card in res["recommendations"]:
        assert card["id"] > 0
        assert card["ticker"].endswith(".NS")
        assert len(card["instrument_name"]) > 0
        assert card["category"] in ["Category A", "Category B", "Category C", "Category D"]
        assert card["allocation_inr"] > 0
        assert card["allocation_pct"] > 0
        assert card["suggested_quantity"] >= 1
        assert card["sharpe_uplift"] > 0
        assert card["hrp_risk_reduction_pct"] > 0
        assert card["technical_momentum_signal"] != ""
        assert card["quantitative_rationale"] != ""
        assert card["macro_rationale"] != ""
        assert card["expected_return_pct"] > 0
        assert card["unit_price"] > 0
        assert card["target_selling_price"] > card["unit_price"]
        assert card["profit_per_share_inr"] > 0
        assert card["total_expected_stock_profit_inr"] > 0
        assert len(card["target_price_analytical_rationale"]) > 0

def test_calculate_target_selling_points():
    from services.quant_engine_india import calculate_target_selling_points

    res = calculate_target_selling_points(
        capital_inr=100000.0,
        target_profit_inr=5000.0,
        time_horizon_months=1.0,
        risk_profile="Moderate"
    )

    assert res["capital_inr"] == 100000.0
    assert res["target_profit_inr"] == 5000.0
    assert res["time_horizon_months"] == 1.0
    assert res["target_return_pct"] == 5.0
    assert res["total_invested_inr"] > 0
    assert res["total_expected_profit_inr"] > 0
    assert res["strategy_regime_name"] == "SHORT_HORIZON_HIGH_VELOCITY_ALPHA"
    assert "months" in res["portfolio_probable_exit_window"]
    assert len(res["recommendations"]) > 0

    for card in res["recommendations"]:
        assert card["current_unit_price"] > 0
        assert card["target_selling_price"] > card["current_unit_price"]
        assert card["profit_per_share_inr"] > 0
        assert card["total_expected_profit_inr"] > 0
        assert card["estimated_holding_days"] > 0
        assert card["estimated_holding_months"] > 0
        assert len(card["target_difficulty_rating"]) > 0
        assert len(card["probable_exit_date"]) > 0

def test_horizon_varying_stock_selection():
    from services.quant_engine_india import calculate_target_selling_points

    # 1 Month Horizon
    res_1m = calculate_target_selling_points(capital_inr=100000.0, target_profit_inr=5000.0, time_horizon_months=1.0)
    tickers_1m = [card["ticker"] for card in res_1m["recommendations"]]

    # 24 Month Horizon
    res_24m = calculate_target_selling_points(capital_inr=100000.0, target_profit_inr=5000.0, time_horizon_months=24.0)
    tickers_24m = [card["ticker"] for card in res_24m["recommendations"]]

    # Ensure that 1 Month and 24 Month horizons generate DIFFERENT stock picks and strategy regimes!
    assert res_1m["strategy_regime_name"] != res_24m["strategy_regime_name"]
    assert tickers_1m != tickers_24m

def test_fetch_ticker_price_history():
    from services.quant_engine_india import fetch_ticker_price_history

    res = fetch_ticker_price_history(ticker="RELIANCE.NS", period="6mo", target_profit_pct=5.0)

    assert res["ticker"] == "RELIANCE.NS"
    assert res["period"] == "6mo"
    assert res["current_price"] > 0
    assert res["target_profit_pct"] == 5.0
    assert res["target_selling_price"] > res["current_price"]
    assert res["data_points_count"] > 0
    assert len(res["history"]) > 0
    assert len(res["historical_scenarios"]) > 0

    for sc in res["historical_scenarios"]:
        assert sc["entry_price"] > 0
        assert sc["target_selling_price"] > sc["entry_price"]
        assert sc["days_to_target"] >= 1
        assert sc["target_status"] in ["TARGET_HIT", "IN_PROGRESS"]
