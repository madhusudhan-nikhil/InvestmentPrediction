import io
import pytest
import pandas as pd
from fastapi.testclient import TestClient
import sys
import os

# Ensure backend root is on sys.path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from main import app

@pytest.fixture
def test_client():
    """FastAPI TestClient fixture."""
    return TestClient(app)

@pytest.fixture
def sample_holdings_raw():
    """Sample raw holdings dictionary list."""
    return [
        {"Ticker": "RELIANCE", "Quantity": 20, "Purchase Price": 2800.0},
        {"Ticker": "TCS", "Quantity": 10, "Purchase Price": 3800.0},
        {"Ticker": "HDFCBANK", "Quantity": 15, "Purchase Price": 1500.0},
        {"Ticker": "NIFTYBEES", "Quantity": 100, "Purchase Price": 250.0}
    ]

@pytest.fixture
def sample_holdings_alt_headers():
    """Sample holdings dictionary list with alternate header names."""
    return [
        {"Symbol": "INFY", "Qty": 25, "Buy Price": 1600.0},
        {"Symbol": "ICICIBANK", "Qty": 30, "Buy Price": 1100.0},
        {"Symbol": "GOLDBEES", "Qty": 200, "Buy Price": 60.0}
    ]

@pytest.fixture
def sample_csv_bytes(sample_holdings_raw):
    """In-memory CSV byte string generated from sample holdings."""
    df = pd.DataFrame(sample_holdings_raw)
    csv_str = df.to_csv(index=False)
    return csv_str.encode("utf-8")

@pytest.fixture
def sample_csv_alt_bytes(sample_holdings_alt_headers):
    """In-memory CSV byte string with alternative headers."""
    df = pd.DataFrame(sample_holdings_alt_headers)
    csv_str = df.to_csv(index=False)
    return csv_str.encode("utf-8")

@pytest.fixture
def sample_excel_bytes(sample_holdings_raw):
    """In-memory Excel (.xlsx) byte string generated from sample holdings."""
    df = pd.DataFrame(sample_holdings_raw)
    output = io.BytesIO()
    try:
        with pd.ExcelWriter(output, engine='openpyxl') as writer:
            df.to_excel(writer, index=False, sheet_name='Holdings')
        return output.getvalue()
    except Exception:
        # Fallback if openpyxl is not present
        return b"DUMMY_EXCEL_BYTES"

@pytest.fixture
def mock_macro_high_threat():
    """Macro data fixture with high threat score."""
    return {
        "threat_score": 75.0,
        "active_regime": "HIGH_CRUDE_INFLATION_RISK",
        "regime_description": "Elevated Brent Crude oil prices pose import bill inflation.",
        "brent_crude_usd": 92.5,
        "brent_crude_change_pct": 4.5,
        "usd_inr": 85.20,
        "usd_inr_change_pct": 0.8,
        "india_vix": 22.4,
        "india_vix_change_pct": 5.2,
        "fii_net_flow_cr": -3500.0,
        "dii_net_flow_cr": 2100.0,
        "rbi_repo_rate": 6.5,
        "gdelt_tension_index": 65.0,
        "dxy_index": 106.5,
        "threat_factors": []
    }

@pytest.fixture
def mock_macro_low_threat():
    """Macro data fixture with low threat score."""
    return {
        "threat_score": 25.0,
        "active_regime": "BULLISH_DOMESTIC_GROWTH",
        "regime_description": "Robust domestic DII inflows and stable inflation.",
        "brent_crude_usd": 74.0,
        "brent_crude_change_pct": -1.2,
        "usd_inr": 82.80,
        "usd_inr_change_pct": -0.1,
        "india_vix": 11.5,
        "india_vix_change_pct": -2.0,
        "fii_net_flow_cr": 1500.0,
        "dii_net_flow_cr": 2200.0,
        "rbi_repo_rate": 6.5,
        "gdelt_tension_index": 35.0,
        "dxy_index": 102.1,
        "threat_factors": []
    }
