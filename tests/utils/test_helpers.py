"""
Test helper utilities
"""
import json
import os

def load_test_data(filename):
    """Load test data from fixtures"""
    fixtures_path = os.path.join(os.path.dirname(__file__), '../fixtures')
    with open(os.path.join(fixtures_path, filename), 'r') as f:
        return json.load(f)

def create_mock_response(status_code=200, data=None):
    """Create mock HTTP response"""
    class MockResponse:
        def __init__(self, status_code, data):
            self.status_code = status_code
            self.data = data or {}
        
        def json(self):
            return self.data
    
    return MockResponse(status_code, data)