"""
Tests for basic API endpoints
"""


def test_read_root(client):
    """Test the root endpoint"""
    response = client.get("/")
    assert response.status_code == 200
    assert response.json() == {"message": "Welcome to 66°North Order Service API!"}


def test_health_check(client):
    """Verify API is running"""
    response = client.get("/")
    assert response.status_code == 200
