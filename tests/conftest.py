"""
Pytest configuration and shared fixtures
"""
import pytest
import sys
import os

# Add project root to Python path
sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))

@pytest.fixture
def sample_data():
    """Sample test data fixture"""
    return {
        "test_user": {
            "username": "testuser",
            "email": "test@example.com"
        },
        "test_topic": {
            "name": "Mathematics",
            "difficulty": "Medium"
        }
    }

@pytest.fixture
def mock_api_response():
    """Mock API response fixture"""
    return {
        "status": "success",
        "data": [],
        "message": "Test response"
    }