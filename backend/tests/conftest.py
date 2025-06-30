import pytest
import os
import sys

# Add the project root to the path to allow imports from 'backend'
project_root = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..'))
sys.path.insert(0, project_root)

from backend.app import app as flask_app

@pytest.fixture
def app():
    """Create and configure a new app instance for each test."""
    # Set up any test-specific configuration
    flask_app.config.update({
        "TESTING": True,
        # You can override other config values here, e.g., for a test database
    })

    yield flask_app


@pytest.fixture
def client(app):
    """A test client for the app."""
    return app.test_client()


@pytest.fixture
def runner(app):
    """A test runner for the app's Click commands."""
    return app.test_cli_runner() 