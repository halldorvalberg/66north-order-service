"""
Pytest configuration and fixtures for testing
"""

import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

from app.database import Base, get_db
from app.main import app
from app.auth import verify_api_key

# Use in-memory SQLite database for testing
SQLALCHEMY_DATABASE_URL = "sqlite:///:memory:"

engine = create_engine(
    SQLALCHEMY_DATABASE_URL,
    connect_args={"check_same_thread": False},
    poolclass=StaticPool,
)
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


@pytest.fixture(scope="function")
def db_session():
    """Create a fresh database for each test"""
    Base.metadata.create_all(bind=engine)
    session = TestingSessionLocal()
    try:
        yield session
    finally:
        session.close()
        Base.metadata.drop_all(bind=engine)


@pytest.fixture(scope="function")
def client(db_session):
    """Create a test client with the test database"""

    def override_get_db():
        try:
            yield db_session
        finally:
            pass

    def override_verify_api_key():
        """Mock API key verification for tests"""
        return "test-api-key"

    app.dependency_overrides[get_db] = override_get_db
    app.dependency_overrides[verify_api_key] = override_verify_api_key
    with TestClient(app) as test_client:
        yield test_client
    app.dependency_overrides.clear()


@pytest.fixture
def sample_order_data():
    """Sample order data for testing"""
    return {
        "order_id": "ORD-2025-001",
        "customer_id": "CUST-123",
        "total_amount": 25990,
        "currency": "ISK",
        "status": "pending",
    }


@pytest.fixture
def create_sample_order(client, sample_order_data):
    """Helper fixture to create an order"""

    def _create_order(order_data=None):
        data = order_data or sample_order_data
        response = client.post("/orders/", json=data)
        return response

    return _create_order
