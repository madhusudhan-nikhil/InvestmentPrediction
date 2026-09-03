import pytest
from main import rate_limiter

def test_rate_limiter():
    original_limit = rate_limiter.limit
    original_window = rate_limiter.window

    try:
        rate_limiter.limit = 5
        rate_limiter.window = 1

        assert rate_limiter.is_allowed("192.168.1.1") == True
        assert rate_limiter.is_allowed("192.168.1.1") == True
        assert rate_limiter.is_allowed("192.168.1.1") == True
        assert rate_limiter.is_allowed("192.168.1.1") == True
        assert rate_limiter.is_allowed("192.168.1.1") == True
        assert rate_limiter.is_allowed("192.168.1.1") == False
    finally:
        rate_limiter.limit = original_limit
        rate_limiter.window = original_window
