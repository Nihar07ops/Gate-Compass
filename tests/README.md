# Testing Structure

This directory contains all tests for the Gate-Compass application.

## Structure

```
tests/
├── __init__.py
├── conftest.py          # Pytest configuration and shared fixtures
├── pytest.ini          # Pytest settings
├── unit/               # Unit tests
│   ├── test_ml_service.py
│   └── test_server.py
├── integration/        # Integration tests
│   └── test_api_integration.py
├── e2e/               # End-to-end tests
│   └── test_full_application.py
├── fixtures/          # Test data and fixtures
│   └── sample_data.json
└── utils/             # Test utilities
    └── test_helpers.py
```

## Running Tests

### All tests
```bash
pytest
```

### Unit tests only
```bash
pytest tests/unit/
```

### Integration tests only
```bash
pytest tests/integration/
```

### End-to-end tests only
```bash
pytest tests/e2e/
```

### With coverage
```bash
pytest --cov=. --cov-report=html
```

## Test Categories

- **Unit Tests**: Test individual components in isolation
- **Integration Tests**: Test component interactions
- **E2E Tests**: Test complete user workflows
- **Fixtures**: Reusable test data and mock objects