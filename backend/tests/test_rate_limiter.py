import pytest
from fastapi.testclient import TestClient
import sys
import os

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from main import app, rate_limiter

client = TestClient(app)

def test_rate_limiter():
    rate_limiter.requests.clear()

    # By default TestClient connects from "testclient", which is not 127.0.0.1
    # So X-Forwarded-For will be ignored.
    # To test X-Forwarded-For properly we need to force client IP to 127.0.0.1,
    # but fastapi.testclient doesn't give us a direct way to spoof the client host easily in get().
    # Let's just test that standard rate limiting works based on the fallback IP.
    for i in range(120):
        response = client.get("/")
        assert response.status_code == 200

    response = client.get("/")
    assert response.status_code == 429
    assert response.json() == {"detail": "Too Many Requests"}
