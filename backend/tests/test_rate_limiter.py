import pytest
from fastapi.testclient import TestClient
from main import app, rate_limiter

client = TestClient(app)

def test_rate_limiter():
    # Reset custom limiter before running to avoid pollution
    rate_limiter.requests.clear()

    # Create a unique IP for this test using request headers
    test_headers = {"X-Forwarded-For": "192.168.1.100"}

    # Wait to ensure we are at the start of a clear bucket, though clear() handles it
    for _ in range(120):
        response = client.get("/api/tickers", headers=test_headers)
        assert response.status_code == 200

    response = client.get("/api/tickers", headers=test_headers)
    assert response.status_code == 429

    # Clean up after test
    rate_limiter.requests.clear()
