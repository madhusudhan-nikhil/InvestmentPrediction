import io
import json
import pytest
from fastapi.testclient import TestClient
import sys
import os

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from main import app

# ---------------------------------------------------------
# Root & Macro Pulse Endpoint Tests
# ---------------------------------------------------------

def test_api_root(test_client):
    response = test_client.get("/")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "online"
    assert "BharatiQuant" in data["app"]

def test_macro_pulse_endpoint(test_client):
    response = test_client.get("/api/macro-pulse")
    assert response.status_code == 200
    data = response.json()
    assert "threat_score" in data
    assert 0.0 <= data["threat_score"] <= 100.0
    assert "active_regime" in data
    assert data["brent_crude_usd"] > 0
    assert data["usd_inr"] > 0

# ---------------------------------------------------------
# Portfolio Parsing Endpoint Tests (/api/parse-portfolio)
# ---------------------------------------------------------

def test_parse_portfolio_raw_json(test_client):
    raw_holdings_json = json.dumps([
        {"Ticker": "RELIANCE", "Quantity": 20, "Purchase Price": 2800},
        {"Ticker": "TCS", "Quantity": 10, "Purchase Price": 3800},
        {"Ticker": "NIFTYBEES", "Quantity": 100, "Purchase Price": 250}
    ])
    response = test_client.post("/api/parse-portfolio", data={"raw_holdings": raw_holdings_json})
    assert response.status_code == 200
    data = response.json()
    assert data["total_value_inr"] > 0
    assert data["health_score"] >= 10.0
    assert data["hhi_index"] > 0
    assert len(data["holdings_normalized"]) == 3
    assert data["holdings_normalized"][0]["ticker"] == "RELIANCE.NS"

def test_parse_portfolio_csv_upload(test_client, sample_csv_bytes):
    files = {"file": ("portfolio.csv", sample_csv_bytes, "text/csv")}
    response = test_client.post("/api/parse-portfolio", files=files)
    assert response.status_code == 200
    data = response.json()
    assert data["total_value_inr"] > 0
    assert len(data["holdings_normalized"]) == 4

def test_parse_portfolio_csv_alt_headers_upload(test_client, sample_csv_alt_bytes):
    files = {"file": ("portfolio_alt.csv", sample_csv_alt_bytes, "text/csv")}
    response = test_client.post("/api/parse-portfolio", files=files)
    assert response.status_code == 200
    data = response.json()
    assert data["total_value_inr"] > 0
    assert len(data["holdings_normalized"]) == 3

def test_parse_portfolio_excel_upload(test_client, sample_excel_bytes):
    if sample_excel_bytes == b"DUMMY_EXCEL_BYTES":
        pytest.skip("openpyxl not available for excel byte generation")

    files = {"file": ("portfolio.xlsx", sample_excel_bytes, "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet")}
    response = test_client.post("/api/parse-portfolio", files=files)
    assert response.status_code == 200
    data = response.json()
    assert data["total_value_inr"] > 0
    assert len(data["holdings_normalized"]) == 4

def test_parse_portfolio_unsupported_file(test_client):
    files = {"file": ("document.pdf", b"%PDF-1.4 dummy pdf content", "application/pdf")}
    response = test_client.post("/api/parse-portfolio", files=files)
    assert response.status_code == 400
    assert "Unsupported file format" in response.json()["detail"]

def test_parse_portfolio_invalid_csv_no_ticker_column(test_client):
    bad_csv_bytes = b"Amount,Value,Price\n100,500,50\n"
    files = {"file": ("bad_portfolio.csv", bad_csv_bytes, "text/csv")}
    response = test_client.post("/api/parse-portfolio", files=files)
    assert response.status_code == 400
    assert "CSV/Excel must contain a 'Ticker' or 'Symbol' column" in response.json()["detail"]

def test_parse_portfolio_invalid_raw_json_string(test_client):
    response = test_client.post("/api/parse-portfolio", data={"raw_holdings": "{invalid_json_string}"})
    assert response.status_code == 400
    assert "Invalid JSON string" in response.json()["detail"]

# ---------------------------------------------------------
# Recommendations Endpoint Tests (/api/recommend-inr)
# ---------------------------------------------------------

def test_recommendations_endpoint_success(test_client):
    payload = {
        "available_capital_inr": 500000.0,
        "risk_profile": "Moderate",
        "holdings": [
            {"Ticker": "RELIANCE.NS", "Quantity": 20, "Purchase Price": 2800}
        ]
    }
    response = test_client.post("/api/recommend-inr", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["total_capital_inr"] == 500000.0
    assert data["recommendation_count"] > 0
    assert len(data["recommendations"]) == data["recommendation_count"]

    categories = set(r["category"] for r in data["recommendations"])
    assert len(categories) == 4

def test_recommendations_endpoint_custom_count_override(test_client):
    payload = {
        "available_capital_inr": 1000000.0,
        "risk_profile": "Aggressive",
        "holdings": [],
        "count": 30
    }
    response = test_client.post("/api/recommend-inr", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["recommendation_count"] == 30
    assert len(data["recommendations"]) == 30

def test_recommendations_endpoint_no_csv_holdings(test_client):
    payload = {
        "available_capital_inr": 250000.0,
        "risk_profile": "Conservative",
        "holdings": []
    }
    response = test_client.post("/api/recommend-inr", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["recommendation_count"] > 0
    assert len(data["recommendations"]) == data["recommendation_count"]

def test_recommendations_endpoint_validation_error(test_client):
    # Capital below 1000 INR constraint
    payload = {
        "available_capital_inr": 500.0,
        "risk_profile": "Moderate"
    }
    response = test_client.post("/api/recommend-inr", json=payload)
    assert response.status_code == 422  # Unprocessable Entity for Pydantic validation failure

# ---------------------------------------------------------
# Stress Test Endpoint Tests (/api/stress-test)
# ---------------------------------------------------------

def test_stress_test_endpoint_high_threat(test_client, monkeypatch, mock_macro_high_threat):
    async def mock_pulse():
        return mock_macro_high_threat

    from services.mcp_client import mcp_client
    monkeypatch.setattr(mcp_client, "get_macro_pulse", mock_pulse)

    payload = {
        "crude_oil_spike_pct": 20.0,
        "usd_inr_depreciation_pct": 5.0,
        "fii_outflow_spike_cr": -3000.0,
        "vix_spike_pct": 25.0
    }
    response = test_client.post("/api/stress-test", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["simulated_threat_score"] >= 70.0
    assert data["simulated_regime"] in ["HIGH_CRUDE_INFLATION_RISK", "GEOPOLITICAL_CRUCIAL_SHOCK"]
    assert len(data["high_vulnerability_sectors"]) > 0
    assert len(data["defensive_recommendations"]) > 0

def test_stress_test_endpoint_low_threat(test_client, monkeypatch, mock_macro_low_threat):
    async def mock_pulse():
        return mock_macro_low_threat

    from services.mcp_client import mcp_client
    monkeypatch.setattr(mcp_client, "get_macro_pulse", mock_pulse)

    payload = {
        "crude_oil_spike_pct": 0.0,
        "usd_inr_depreciation_pct": 0.0,
        "fii_outflow_spike_cr": 0.0,
        "vix_spike_pct": 0.0
    }
    response = test_client.post("/api/stress-test", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["simulated_threat_score"] <= 50.0
    assert data["simulated_regime"] == "BULLISH_DOMESTIC_GROWTH"

# ---------------------------------------------------------
# Broker Execution Endpoint Tests (/api/broker-execute)
# ---------------------------------------------------------

@pytest.mark.parametrize("broker", ["Zerodha Kite", "Angel One SmartAPI", "Upstox API"])
def test_broker_execute_endpoint(test_client, broker):
    payload = {
        "broker_name": broker,
        "api_key": "test_api_key_123",
        "access_token": "test_access_token_abc",
        "orders": [
            {"ticker": "NIFTYBEES.NS", "suggested_quantity": 50, "allocation_inr": 13750.0},
            {"ticker": "GOLDBEES.NS", "suggested_quantity": 100, "allocation_inr": 6850.0}
        ]
    }
    response = test_client.post("/api/broker-execute", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "SUCCESS"
    assert data["broker_name"] == broker
    assert data["executed_count"] == 2
    assert data["total_executed_value_inr"] == 20600.0
    assert len(data["orders_summary"]) == 2
    assert "timestamp" in data

def test_broker_execute_empty_orders(test_client):
    payload = {
        "broker_name": "Zerodha Kite",
        "orders": []
    }
    response = test_client.post("/api/broker-execute", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "SUCCESS"
    assert data["executed_count"] == 0
    assert data["total_executed_value_inr"] == 0.0

# ---------------------------------------------------------
# Service Exception / 500 Error Handling Tests
# ---------------------------------------------------------

def test_macro_pulse_500_error_handling(test_client, monkeypatch):
    async def mock_error():
        raise Exception("Database connection failure")

    from services.mcp_client import mcp_client
    monkeypatch.setattr(mcp_client, "get_macro_pulse", mock_error)

    response = test_client.get("/api/macro-pulse")
    assert response.status_code == 500
    assert "Internal server error" in response.json()["detail"]

# ---------------------------------------------------------
# Ticker Management API Tests (/api/tickers)
# ---------------------------------------------------------

def test_get_tickers_endpoint(test_client):
    response = test_client.get("/api/tickers")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "SUCCESS"
    assert data["total_tickers"] > 0
    assert len(data["tickers"]) == data["total_tickers"]

def test_save_and_sync_tickers_endpoint(test_client):
    res = test_client.get("/api/tickers")
    tickers = res.json()["tickers"]

    save_res = test_client.post("/api/tickers", json={"tickers": tickers[:50]})
    assert save_res.status_code == 200
    assert save_res.json()["total_tickers"] == 50

    sync_res = test_client.post("/api/tickers/sync")
    assert sync_res.status_code == 200
    assert sync_res.json()["status"] == "SUCCESS"
    assert sync_res.json()["total_tickers"] > 50
