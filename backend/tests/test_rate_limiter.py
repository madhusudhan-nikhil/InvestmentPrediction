import pytest
from fastapi.testclient import TestClient
import time
import sys
import os

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from main import app, rate_limiter

client = TestClient(app)

def test_rate_limiter_allows_under_limit():
    rate_limiter.requests.clear()
    # "testclient" is the default host set by TestClient
    for _ in range(120):
        response = client.get("/")
        assert response.status_code == 200

def test_rate_limiter_blocks_over_limit():
    rate_limiter.requests.clear()

    # 120 requests should pass
    for _ in range(120):
        response = client.get("/")
        assert response.status_code == 200

    # The 121st request should be blocked
    response = client.get("/")
    assert response.status_code == 429
    assert response.json() == {"detail": "Too Many Requests"}

def test_rate_limiter_evicts_old_ips():
    rate_limiter.requests.clear()
    rate_limiter.max_ips = 2 # Set a small max_ips to test eviction easily

    rate_limiter.is_allowed("ip1")
    rate_limiter.is_allowed("ip2")

    assert "ip1" in rate_limiter.requests
    assert "ip2" in rate_limiter.requests

    rate_limiter.is_allowed("ip3")

    # "ip1" should be evicted because it's the oldest IP
    assert "ip1" not in rate_limiter.requests
    assert "ip2" in rate_limiter.requests
    assert "ip3" in rate_limiter.requests

    # Restore default value
    rate_limiter.max_ips = 10000
