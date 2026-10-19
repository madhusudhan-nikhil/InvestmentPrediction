import pytest
from fastapi.testclient import TestClient
from main import app, rate_limiter

@pytest.fixture(autouse=True)
def clear_rate_limiter():
    rate_limiter.requests.clear()
    yield
    rate_limiter.requests.clear()

def test_rate_limiting(test_client):
    for i in range(120):
        res = test_client.get("/")
        assert res.status_code == 200

    res = test_client.get("/")
    assert res.status_code == 429
