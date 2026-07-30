import os
import sys
import pytest

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from services.quant_engine_india import (
    normalize_ticker, calculate_portfolio_diagnostics, generate_recommendations
)
from services.mcp_client import mcp_client

def test_normalize_ticker():
    assert normalize_ticker("RELIANCE") == "RELIANCE.NS"
    assert normalize_ticker("tcs.ns") == "TCS.NS"
    assert normalize_ticker("INFY.BO") == "INFY.NS"
    assert normalize_ticker("NIFTYBEES") == "NIFTYBEES.NS"

def test_portfolio_diagnostics():
    raw_holdings = [
        {"Ticker": "RELIANCE", "Quantity": 10, "Purchase Price": 2800},
        {"Ticker": "TCS", "Quantity": 5, "Purchase Price": 3800},
        {"Ticker": "HDFCBANK", "Quantity": 20, "Purchase Price": 1500}
    ]
    diag = calculate_portfolio_diagnostics(raw_holdings, macro_threat_score=30.0)

    assert diag["total_value_inr"] > 0
    assert diag["health_score"] >= 1.0 and diag["health_score"] <= 100.0
    assert diag["hhi_index"] > 0
    assert len(diag["sector_breakdown"]) > 0
    assert len(diag["holdings_normalized"]) == 3
    assert diag["holdings_normalized"][0]["ticker"] == "RELIANCE.NS"

@pytest.mark.asyncio
async def test_macro_pulse():
    pulse = await mcp_client.get_macro_pulse()
    assert 0.0 <= pulse["threat_score"] <= 100.0
    assert pulse["active_regime"] in [
        "HIGH_CRUDE_INFLATION_RISK", "FII_OUTFLOW_VOLATILITY",
        "RISK_OFF_GOLD_FLIGHT", "BULLISH_DOMESTIC_GROWTH"
    ]
    assert pulse["brent_crude_usd"] > 0
    assert pulse["usd_inr"] > 0

def test_generate_recommendations():
    res = generate_recommendations(
        available_capital_inr=500000.0,
        risk_profile="Moderate"
    )

    assert res["total_capital_inr"] == 500000.0
    # Must generate EXACTLY 10 to 20 recommendations as per Section 4 specs
    assert 10 <= res["recommendation_count"] <= 20
    assert len(res["recommendations"]) == res["recommendation_count"]

    # Verify allocation sum equals available capital
    total_allocated = sum(r["allocation_inr"] for r in res["recommendations"])
    assert abs(total_allocated - 500000.0) < 100.0  # Allow minor rounding threshold

    # Verify recommendation fields
    for r in res["recommendations"]:
        assert r["ticker"].endswith(".NS")
        assert r["category"] in ["Category A", "Category B", "Category C", "Category D"]
        assert r["allocation_inr"] > 0
        assert r["quantitative_rationale"] != ""
        assert r["macro_rationale"] != ""
