import pytest
import sys
import os

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from services.mcp_client import WorldMonitorMCPClient, mcp_client

@pytest.mark.asyncio
async def test_get_macro_pulse_default_returns_valid_structure():
    client = WorldMonitorMCPClient()
    pulse = await client.get_macro_pulse()

    assert isinstance(pulse, dict)
    assert "threat_score" in pulse
    assert 0.0 <= pulse["threat_score"] <= 100.0
    assert "active_regime" in pulse
    assert pulse["active_regime"] in [
        "HIGH_CRUDE_INFLATION_RISK",
        "FII_OUTFLOW_VOLATILITY",
        "RISK_OFF_GOLD_FLIGHT",
        "BULLISH_DOMESTIC_GROWTH"
    ]
    assert "regime_description" in pulse
    assert pulse["brent_crude_usd"] > 0
    assert pulse["usd_inr"] > 0
    assert pulse["india_vix"] > 0
    assert "fii_net_flow_cr" in pulse
    assert "dii_net_flow_cr" in pulse
    assert "rbi_repo_rate" in pulse
    assert "gdelt_tension_index" in pulse
    assert "dxy_index" in pulse
    assert "threat_factors" in pulse
    assert len(pulse["threat_factors"]) == 5

    for factor in pulse["threat_factors"]:
        assert "factor" in factor
        assert "score" in factor
        assert "weight" in factor
        assert "detail" in factor

@pytest.mark.asyncio
async def test_macro_pulse_yfinance_exception_fallback(monkeypatch):
    """Verify that if yfinance throws an exception, get_macro_pulse returns a resilient fallback."""
    def mock_yf_tickers(*args, **kwargs):
        raise RuntimeError("Network error fetching live yfinance macro data")

    try:
        import yfinance as yf
        monkeypatch.setattr(yf, "Tickers", mock_yf_tickers)
    except ImportError:
        pass

    client = WorldMonitorMCPClient()
    pulse = await client.get_macro_pulse()

    assert pulse["threat_score"] >= 0.0
    assert pulse["brent_crude_usd"] == 84.5
    assert pulse["usd_inr"] == 83.45

@pytest.mark.asyncio
async def test_singleton_mcp_client():
    pulse = await mcp_client.get_macro_pulse()
    assert pulse["threat_score"] >= 0.0
