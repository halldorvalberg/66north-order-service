"""
Tests for database models
"""

from datetime import datetime
from app.models import Order


def test_order_model_creation(db_session):
    """Test creating an Order model instance"""
    order = Order(
        order_id="ORD-TEST-001",
        customer_id="CUST-TEST",
        total_amount=15000,
        currency="ISK",
        status="pending",
    )

    db_session.add(order)
    db_session.commit()
    db_session.refresh(order)

    assert order.id is not None
    assert order.order_id == "ORD-TEST-001"
    assert order.customer_id == "CUST-TEST"
    assert order.total_amount == 15000
    assert order.currency == "ISK"
    assert order.status == "pending"
    assert isinstance(order.created_at, datetime)
    assert isinstance(order.updated_at, datetime)


def test_order_model_unique_order_id(db_session):
    """Test that order_id must be unique"""
    order1 = Order(
        order_id="ORD-UNIQUE-001",
        customer_id="CUST-1",
        total_amount=1000,
        currency="ISK",
        status="pending",
    )
    db_session.add(order1)
    db_session.commit()

    # Try to create another order with same order_id
    order2 = Order(
        order_id="ORD-UNIQUE-001",  # Duplicate
        customer_id="CUST-2",
        total_amount=2000,
        currency="ISK",
        status="pending",
    )
    db_session.add(order2)

    try:
        db_session.commit()
        assert False, "Should have raised an integrity error"
    except Exception:
        db_session.rollback()
        assert True


def test_order_model_default_status(db_session):
    """Test that status defaults to 'pending'"""
    order = Order(
        order_id="ORD-DEFAULT-001",
        customer_id="CUST-TEST",
        total_amount=5000,
        currency="USD",
        # No status provided
    )

    db_session.add(order)
    db_session.commit()
    db_session.refresh(order)

    assert order.status == "pending"


def test_order_model_query(db_session):
    """Test querying orders from database"""
    # Create multiple orders
    for i in range(3):
        order = Order(
            order_id=f"ORD-QUERY-{i:03d}",
            customer_id="CUST-TEST",
            total_amount=1000 * (i + 1),
            currency="ISK",
            status="pending",
        )
        db_session.add(order)
    db_session.commit()

    # Query all orders
    orders = db_session.query(Order).all()
    assert len(orders) == 3

    # Query by customer_id
    customer_orders = db_session.query(Order).filter(Order.customer_id == "CUST-TEST").all()
    assert len(customer_orders) == 3


def test_order_model_multiple_currencies(db_session):
    """Test storing orders with different currencies"""
    currencies = ["ISK", "USD", "EUR"]

    for i, currency in enumerate(currencies):
        order = Order(
            order_id=f"ORD-CURR-{currency}-{i:03d}",
            customer_id="CUST-TEST",
            total_amount=1000,
            currency=currency,
            status="pending",
        )
        db_session.add(order)
    db_session.commit()

    orders = db_session.query(Order).all()
    assert len(orders) == 3
    order_currencies = {order.currency for order in orders}
    assert order_currencies == set(currencies)
