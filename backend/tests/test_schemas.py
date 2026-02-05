"""
Tests for Pydantic schemas and validation
"""

import pytest
from pydantic import ValidationError
from app.schemas import OrderCreate, OrderUpdate, OrderStatus


class TestOrderCreate:
    """Tests for OrderCreate schema"""

    def test_order_create_valid(self):
        """Test creating a valid order"""
        order_data = {
            "order_id": "ORD-2025-001",
            "customer_id": "CUST-123",
            "total_amount": 25990,
            "currency": "ISK",
        }
        order = OrderCreate(**order_data)
        assert order.order_id == "ORD-2025-001"
        assert order.customer_id == "CUST-123"
        assert order.total_amount == 25990
        assert order.currency == "ISK"

    def test_order_create_currency_uppercase_conversion(self):
        """Test that currency is converted to uppercase"""
        order_data = {
            "order_id": "ORD-2025-002",
            "customer_id": "CUST-123",
            "total_amount": 1000,
            "currency": "usd",
        }
        order = OrderCreate(**order_data)
        assert order.currency == "USD"

    def test_order_create_invalid_currency(self):
        """Test that invalid currency code raises error"""
        order_data = {
            "order_id": "ORD-2025-003",
            "customer_id": "CUST-123",
            "total_amount": 1000,
            "currency": "XXX",
        }
        with pytest.raises(ValidationError) as exc_info:
            OrderCreate(**order_data)
        assert "Currency must be a valid ISO 4217 code" in str(exc_info.value)

    def test_order_create_empty_fields(self):
        """Test that empty fields raise error"""
        order_data = {
            "order_id": "   ",
            "customer_id": "CUST-123",
            "total_amount": 1000,
            "currency": "ISK",
        }
        with pytest.raises(ValidationError) as exc_info:
            OrderCreate(**order_data)
        assert (
            "Field cannot be empty" in str(exc_info.value)
            or "whitespace" in str(exc_info.value).lower()
        )

    def test_order_create_negative_amount(self):
        """Test that negative amount raises error"""
        order_data = {
            "order_id": "ORD-2025-004",
            "customer_id": "CUST-123",
            "total_amount": -100,
            "currency": "ISK",
        }
        with pytest.raises(ValidationError) as exc_info:
            OrderCreate(**order_data)
        assert "greater than 0" in str(exc_info.value)

    def test_order_create_missing_required_fields(self):
        """Test that missing required fields raise error"""
        order_data = {"order_id": "ORD-2025-005"}
        with pytest.raises(ValidationError):
            OrderCreate(**order_data)


class TestOrderUpdate:
    """Tests for OrderUpdate schema"""

    def test_order_update_partial(self):
        """Test partial update"""
        update_data = {"status": "shipped"}
        update = OrderUpdate(**update_data)
        assert update.status == OrderStatus.SHIPPED
        assert update.customer_id is None

    def test_order_update_invalid_currency(self):
        """Test that invalid currency raises error"""
        update_data = {"currency": "XXX"}
        with pytest.raises(ValidationError) as exc_info:
            OrderUpdate(**update_data)
        assert "Currency must be a valid ISO 4217 code" in str(exc_info.value)

    def test_order_update_negative_amount(self):
        """Test that negative amount raises error"""
        update_data = {"total_amount": -500}
        with pytest.raises(ValidationError):
            OrderUpdate(**update_data)
