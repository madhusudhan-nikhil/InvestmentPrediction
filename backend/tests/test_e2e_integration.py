import os
import sys
import pytest
from fastapi.testclient import TestClient

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from main import app

client = TestClient(app)

def test_api_root():
    response = client.get("/")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "online"

def test_macro_pulse_endpoint():
    response = client.get("/api/macro-pulse")
    assert response.status_code == 200
    data = response.json()
    assert "threat_score" in data
    assert 0 <= data["threat_score"] <= 100
    assert "active_regime" in data
    assert data["brent_crude_usd"] > 0
    assert data["usd_inr"] > 0

def test_parse_portfolio_raw_json():
    raw_holdings_json = '[{"Ticker": "RELIANCE", "Quantity": 20, "Purchase Price": 2800}, {"Ticker": "TCS", "Quantity": 10, "Purchase Price": 3800}, {"Ticker": "NIFTYBEES", "Quantity": 100, "Purchase Price": 250}]'
    response = client.post("/api/parse-portfolio", data={"raw_holdings": raw_holdings_json})
    assert response.status_code == 200
    data = response.json()
    assert data["total_value_inr"] > 0
    assert data["health_score"] >= 1.0
    assert data["hhi_index"] > 0
    assert len(data["holdings_normalized"]) == 3
    assert data["holdings_normalized"][0]["ticker"] == "RELIANCE.NS"

def test_recommendations_endpoint():
    payload = {
        "available_capital_inr": 500000,
        "risk_profile": "Moderate",
        "holdings": [
            {"Ticker": "RELIANCE.NS", "Quantity": 20, "Purchase Price": 2800}
        ]
    }
    response = client.post("/api/recommend-inr", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["total_capital_inr"] == 500000
    # Must be 10 to 20 recommendations as required by Section 4 specs
    assert 10 <= data["recommendation_count"] <= 20
    assert len(data["recommendations"]) == data["recommendation_count"]

    categories = set(r["category"] for r in data["recommendations"])
    assert "Category A" in categories
    assert "Category B" in categories
    assert "Category C" in categories
    assert "Category D" in categories

def test_stress_test_endpoint():
    payload = {
        "crude_oil_spike_pct": 20.0,
        "usd_inr_depreciation_pct": 5.0,
        "fii_outflow_spike_cr": -3000.0,
        "vix_spike_pct": 25.0
    }
    response = client.post("/api/stress-test", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["simulated_threat_score"] > 0
    assert len(data["high_vulnerability_sectors"]) >= 0
