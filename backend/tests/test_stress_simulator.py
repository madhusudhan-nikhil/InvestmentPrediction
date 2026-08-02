import pytest
from fastapi.testclient import TestClient
import sys
import os

# Ensure backend root is in sys.path
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from main import app

client = TestClient(app)

def test_get_probable_scenarios():
    response = client.get("/api/probable-scenarios")
    assert response.status_code == 200
    data = response.json()
    assert "scenarios" in data
    assert len(data["scenarios"]) == 5
    assert data["total_scenarios"] == 5

    for scenario in data["scenarios"]:
        assert "id" in scenario
        assert "title" in scenario
        assert "probability_pct" in scenario
        assert "shocks" in scenario
        assert "crude_oil_spike_pct" in scenario["shocks"]
        assert "usd_inr_depreciation_pct" in scenario["shocks"]
        assert "vix_spike_pct" in scenario["shocks"]
        assert "fii_outflow_spike_cr" in scenario["shocks"]
        assert "rbi_rate_hike_bps" in scenario["shocks"]
        assert "gdelt_escalation_pct" in scenario["shocks"]
        assert "dxy_rally_pct" in scenario["shocks"]

def test_run_stress_test_multi_variable():
    payload = {
        "crude_oil_spike_pct": 25.0,
        "usd_inr_depreciation_pct": 4.5,
        "vix_spike_pct": 40.0,
        "fii_outflow_spike_cr": -5000.0,
        "rbi_rate_hike_bps": 50.0,
        "gdelt_escalation_pct": 35.0,
        "dxy_rally_pct": 4.0,
        "holdings": [
            {"Ticker": "RELIANCE.NS", "Quantity": 10, "Purchase Price": 2800},
            {"Ticker": "TCS.NS", "Quantity": 5, "Purchase Price": 3900}
        ]
    }
    response = client.post("/api/stress-test", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert "simulated_threat_score" in data
    assert data["simulated_threat_score"] > 30.0
    assert "simulated_regime" in data
    assert "estimated_portfolio_impact_pct" in data
    assert "estimated_var_increase_pct" in data
    assert "asset_class_impact_breakdown" in data
    assert "high_vulnerability_sectors" in data
    assert "resilient_sectors" in data
    assert "defensive_recommendations" in data
    assert "scenario_narrative" in data
