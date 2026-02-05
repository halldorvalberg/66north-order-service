"""
Tests for order CRUD operations
"""

import pytest
from datetime import datetime


class TestCreateOrder:
    """Tests for POST /orders/"""

    def test_create_order_success(self, client, sample_order_data):
        """Test successfully creating an order"""
        response = client.post("/orders/", json=sample_order_data)

        assert response.status_code == 201
        data = response.json()
        assert data["order_id"] == sample_order_data["order_id"]
        assert data["customer_id"] == sample_order_data["customer_id"]
        assert data["total_amount"] == sample_order_data["total_amount"]
        assert data["currency"] == sample_order_data["currency"]
        assert data["status"] == sample_order_data["status"]
        assert "id" in data
        assert "created_at" in data
        assert "updated_at" in data

    def test_create_order_duplicate_order_id(self, client, sample_order_data, create_sample_order):
        """Test creating an order with duplicate order_id fails"""
        create_sample_order()
        response = client.post("/orders/", json=sample_order_data)

        assert response.status_code == 400
        assert response.json()["detail"] == "Order ID already exists"

    def test_create_order_missing_required_fields(self, client):
        """Test creating an order with missing required fields"""
        incomplete_data = {"order_id": "ORD-2025-002"}
        response = client.post("/orders/", json=incomplete_data)
        assert response.status_code == 422


class TestReadOrders:
    """Tests for GET /orders/"""

    def test_read_orders_empty(self, client):
        """Test getting orders when database is empty"""
        response = client.get("/orders/")
        assert response.status_code == 200
        assert response.json() == []

    def test_read_orders_multiple(self, client, sample_order_data):
        """Test getting multiple orders"""
        for i in range(3):
            order_data = sample_order_data.copy()
            order_data["order_id"] = f"ORD-2025-{i:03d}"
            client.post("/orders/", json=order_data)

        response = client.get("/orders/")
        assert response.status_code == 200
        assert len(response.json()) == 3

    def test_read_orders_filter_by_status(self, client, sample_order_data):
        """Test filtering orders by status"""
        for status in ["pending", "completed", "pending"]:
            order_data = sample_order_data.copy()
            order_data["order_id"] = f"ORD-{status}-{datetime.now().timestamp()}"
            order_data["status"] = status
            client.post("/orders/", json=order_data)

        response = client.get("/orders/?status=pending")
        assert response.status_code == 200
        assert len(response.json()) == 2


class TestReadOrder:
    """Tests for GET /orders/{order_id}"""

    def test_read_order_success(self, client, create_sample_order, sample_order_data):
        """Test getting a specific order"""
        create_sample_order()

        response = client.get(f"/orders/{sample_order_data['order_id']}")

        assert response.status_code == 200
        data = response.json()
        assert data["order_id"] == sample_order_data["order_id"]
        assert data["customer_id"] == sample_order_data["customer_id"]

    def test_read_order_not_found(self, client):
        """Test getting a non-existent order"""
        response = client.get("/orders/NONEXISTENT-ORDER")

        assert response.status_code == 404
        assert response.json()["detail"] == "Order not found"


class TestUpdateOrder:
    """Tests for PATCH /orders/{order_id}"""

    def test_update_order_status(self, client, create_sample_order, sample_order_data):
        """Test updating order status"""
        create_sample_order()

        update_data = {"status": "completed"}
        response = client.patch(f"/orders/{sample_order_data['order_id']}", json=update_data)

        assert response.status_code == 200
        assert response.json()["status"] == "completed"

    def test_update_order_not_found(self, client):
        """Test updating a non-existent order"""
        update_data = {"status": "completed"}
        response = client.patch("/orders/NONEXISTENT-ORDER", json=update_data)

        assert response.status_code == 404
        assert response.json()["detail"] == "Order not found"


class TestDeleteOrder:
    """Tests for DELETE /orders/{order_id}"""

    def test_delete_order_success(self, client, create_sample_order, sample_order_data):
        """Test successfully deleting an order"""
        create_sample_order()

        response = client.delete(f"/orders/{sample_order_data['order_id']}")

        assert response.status_code == 204

        # Verify order is deleted
        get_response = client.get(f"/orders/{sample_order_data['order_id']}")
        assert get_response.status_code == 404

    def test_delete_order_not_found(self, client):
        """Test deleting a non-existent order"""
        response = client.delete("/orders/NONEXISTENT-ORDER")

        assert response.status_code == 404
        assert response.json()["detail"] == "Order not found"
