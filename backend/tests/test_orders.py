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
        # Create first order
        create_sample_order()

        # Try to create duplicate
        response = client.post("/orders/", json=sample_order_data)

        assert response.status_code == 400
        assert response.json()["detail"] == "Order ID already exists"

    def test_create_order_missing_required_fields(self, client):
        """Test creating an order with missing required fields"""
        incomplete_data = {
            "order_id": "ORD-2025-002",
            "customer_id": "CUST-456",
            # Missing: total_amount, currency, status
        }
        response = client.post("/orders/", json=incomplete_data)

        assert response.status_code == 422  # Validation error

    def test_create_order_invalid_currency_code(self, client, sample_order_data):
        """Test creating an order with invalid currency code"""
        invalid_data = sample_order_data.copy()
        invalid_data["currency"] = "INVALID"  # Too long

        response = client.post("/orders/", json=invalid_data)

        assert response.status_code == 422

    def test_create_order_with_custom_order_date(self, client, sample_order_data):
        """Test creating an order with a custom order_date"""
        custom_data = sample_order_data.copy()
        custom_data["order_date"] = "2025-02-01T12:00:00Z"

        response = client.post("/orders/", json=custom_data)

        assert response.status_code == 201
        assert response.json()["order_date"] is not None


class TestReadOrders:
    """Tests for GET /orders/"""

    def test_read_orders_empty(self, client):
        """Test getting orders when database is empty"""
        response = client.get("/orders/")

        assert response.status_code == 200
        assert response.json() == []

    def test_read_orders_single(self, client, create_sample_order):
        """Test getting orders when one exists"""
        create_sample_order()

        response = client.get("/orders/")

        assert response.status_code == 200
        data = response.json()
        assert len(data) == 1
        assert data[0]["order_id"] == "ORD-2025-001"

    def test_read_orders_multiple(self, client, sample_order_data):
        """Test getting multiple orders"""
        # Create multiple orders
        for i in range(5):
            order_data = sample_order_data.copy()
            order_data["order_id"] = f"ORD-2025-{i:03d}"
            client.post("/orders/", json=order_data)

        response = client.get("/orders/")

        assert response.status_code == 200
        assert len(response.json()) == 5

    def test_read_orders_pagination(self, client, sample_order_data):
        """Test pagination with skip and limit"""
        # Create 10 orders
        for i in range(10):
            order_data = sample_order_data.copy()
            order_data["order_id"] = f"ORD-2025-{i:03d}"
            client.post("/orders/", json=order_data)

        # Get first 3 orders
        response = client.get("/orders/?skip=0&limit=3")
        assert len(response.json()) == 3

        # Get next 3 orders
        response = client.get("/orders/?skip=3&limit=3")
        assert len(response.json()) == 3

    def test_read_orders_filter_by_status(self, client, sample_order_data):
        """Test filtering orders by status"""
        # Create orders with different statuses
        for status in ["pending", "completed", "pending", "cancelled"]:
            order_data = sample_order_data.copy()
            order_data["order_id"] = f"ORD-{status}-{datetime.now().timestamp()}"
            order_data["status"] = status
            client.post("/orders/", json=order_data)

        # Filter by pending status
        response = client.get("/orders/?status=pending")

        assert response.status_code == 200
        data = response.json()
        assert len(data) == 2
        assert all(order["status"] == "pending" for order in data)

    def test_read_orders_filter_by_customer(self, client, sample_order_data):
        """Test filtering orders by customer_id"""
        # Create orders for different customers
        for customer_id in ["CUST-001", "CUST-002", "CUST-001"]:
            order_data = sample_order_data.copy()
            order_data["order_id"] = f"ORD-{customer_id}-{datetime.now().timestamp()}"
            order_data["customer_id"] = customer_id
            client.post("/orders/", json=order_data)

        # Filter by customer
        response = client.get("/orders/?customer_id=CUST-001")

        assert response.status_code == 200
        data = response.json()
        assert len(data) == 2
        assert all(order["customer_id"] == "CUST-001" for order in data)


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
        data = response.json()
        assert data["status"] == "completed"
        assert data["order_id"] == sample_order_data["order_id"]  # Other fields unchanged

    def test_update_order_multiple_fields(self, client, create_sample_order, sample_order_data):
        """Test updating multiple fields at once"""
        create_sample_order()

        update_data = {"status": "shipped", "total_amount": 30000}
        response = client.patch(f"/orders/{sample_order_data['order_id']}", json=update_data)

        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "shipped"
        assert data["total_amount"] == 30000

    def test_update_order_not_found(self, client):
        """Test updating a non-existent order"""
        update_data = {"status": "completed"}
        response = client.patch("/orders/NONEXISTENT-ORDER", json=update_data)

        assert response.status_code == 404
        assert response.json()["detail"] == "Order not found"

    def test_update_order_partial(self, client, create_sample_order, sample_order_data):
        """Test partial update doesn't affect unspecified fields"""
        create_sample_order()

        # Update only status
        update_data = {"status": "processing"}
        response = client.patch(f"/orders/{sample_order_data['order_id']}", json=update_data)

        data = response.json()
        # Original values should remain
        assert data["customer_id"] == sample_order_data["customer_id"]
        assert data["total_amount"] == sample_order_data["total_amount"]
        assert data["currency"] == sample_order_data["currency"]


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


class TestCustomerOrders:
    """Tests for GET /orders/customer/{customer_id}"""

    def test_get_customer_orders_success(self, client, sample_order_data):
        """Test getting all orders for a customer"""
        customer_id = "CUST-999"

        # Create multiple orders for the same customer
        for i in range(3):
            order_data = sample_order_data.copy()
            order_data["order_id"] = f"ORD-CUST999-{i:03d}"
            order_data["customer_id"] = customer_id
            client.post("/orders/", json=order_data)

        # Create order for different customer
        other_order = sample_order_data.copy()
        other_order["order_id"] = "ORD-OTHER-001"
        other_order["customer_id"] = "CUST-OTHER"
        client.post("/orders/", json=other_order)

        response = client.get(f"/orders/customer/{customer_id}")

        assert response.status_code == 200
        data = response.json()
        assert len(data) == 3
        assert all(order["customer_id"] == customer_id for order in data)

    def test_get_customer_orders_none(self, client):
        """Test getting orders for customer with no orders"""
        response = client.get("/orders/customer/CUST-NOORDERS")

        assert response.status_code == 200
        assert response.json() == []
