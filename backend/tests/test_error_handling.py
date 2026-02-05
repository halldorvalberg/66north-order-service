"""
Tests for API error handling and edge cases
"""

import pytest


class TestErrorHandling:
    """Tests for API error handling"""

    def test_create_order_invalid_json(self, client):
        """Test creating order with invalid JSON"""
        response = client.post(
            "/orders/",
            data="not valid json",
            headers={"Content-Type": "application/json"},
        )
        assert response.status_code == 422

    def test_create_order_wrong_data_types(self, client):
        """Test creating order with wrong data types"""
        order_data = {
            "order_id": "ORD-2025-001",
            "customer_id": "CUST-123",
            "total_amount": "not a number",
            "currency": "ISK",
        }
        response = client.post("/orders/", json=order_data)
        assert response.status_code == 422

    def test_update_order_invalid_status(self, client, create_sample_order, sample_order_data):
        """Test updating order with invalid status value"""
        create_sample_order()

        update_data = {"status": "invalid_status"}
        response = client.patch(f"/orders/{sample_order_data['order_id']}", json=update_data)

        assert response.status_code == 422

    def test_create_order_currency_invalid(self, client, sample_order_data):
        """Test creating order with invalid currency code"""
        invalid_data = sample_order_data.copy()
        invalid_data["currency"] = "XXX"

        response = client.post("/orders/", json=invalid_data)
        assert response.status_code == 422

    def test_create_order_negative_amount(self, client, sample_order_data):
        """Test creating order with negative amount"""
        invalid_data = sample_order_data.copy()
        invalid_data["total_amount"] = -100

        response = client.post("/orders/", json=invalid_data)
        assert response.status_code == 422

    def test_pagination_zero_limit(self, client, sample_order_data):
        """Test pagination with zero limit"""
        client.post("/orders/", json=sample_order_data)

        response = client.get("/orders/?limit=0")
        assert response.status_code == 200
        assert response.json() == []
