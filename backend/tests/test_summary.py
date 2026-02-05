"""
Tests for /orders/summary endpoint
"""

import pytest


class TestOrdersSummaryEndpoint:
    """Tests for GET /orders/summary"""

    def test_summary_empty_database(self, client):
        """Test summary endpoint with no orders"""
        response = client.get("/orders/summary")

        assert response.status_code == 200
        data = response.json()
        assert data["total_orders"] == 0
        assert data["total_revenue"] == []
        assert data["revenue_per_day"] == []

    def test_summary_single_order(self, client, sample_order_data):
        """Test summary with a single order"""
        client.post("/orders/", json=sample_order_data)

        response = client.get("/orders/summary")

        assert response.status_code == 200
        data = response.json()
        assert data["total_orders"] == 1
        assert len(data["total_revenue"]) == 1
        assert data["total_revenue"][0]["currency"] == sample_order_data["currency"]
        assert data["total_revenue"][0]["total"] == sample_order_data["total_amount"]

    def test_summary_multiple_orders_same_currency(self, client, sample_order_data):
        """Test summary with multiple orders in same currency"""
        total_amount = 0
        for i in range(3):
            order_data = sample_order_data.copy()
            order_data["order_id"] = f"ORD-SAME-{i:03d}"
            order_data["total_amount"] = (i + 1) * 10000
            total_amount += order_data["total_amount"]
            client.post("/orders/", json=order_data)

        response = client.get("/orders/summary")

        assert response.status_code == 200
        data = response.json()
        assert data["total_orders"] == 3
        assert len(data["total_revenue"]) == 1
        assert data["total_revenue"][0]["total"] == total_amount

    def test_summary_multiple_currencies(self, client, sample_order_data):
        """Test summary with orders in different currencies"""
        currencies = ["ISK", "USD", "EUR"]
        amounts = {}

        for i, currency in enumerate(currencies):
            order_data = sample_order_data.copy()
            order_data["order_id"] = f"ORD-{currency}-{i:03d}"
            order_data["currency"] = currency
            order_data["total_amount"] = (i + 1) * 10000
            amounts[currency] = order_data["total_amount"]
            client.post("/orders/", json=order_data)

        response = client.get("/orders/summary")

        assert response.status_code == 200
        data = response.json()
        assert data["total_orders"] == 3
        assert len(data["total_revenue"]) == 3

        # Verify each currency is present with correct total
        currency_totals = {item["currency"]: item["total"] for item in data["total_revenue"]}
        for currency, amount in amounts.items():
            assert currency_totals[currency] == amount

    def test_summary_revenue_per_day(self, client, sample_order_data):
        """Test revenue_per_day calculation"""
        for i in range(2):
            order_data = sample_order_data.copy()
            order_data["order_id"] = f"ORD-TODAY-{i:03d}"
            order_data["total_amount"] = 10000
            client.post("/orders/", json=order_data)

        response = client.get("/orders/summary")

        assert response.status_code == 200
        data = response.json()
        assert len(data["revenue_per_day"]) > 0

        # Verify structure
        for day_revenue in data["revenue_per_day"]:
            assert "date" in day_revenue
            assert "currency" in day_revenue
            assert "revenue" in day_revenue

    def test_summary_revenue_per_day_different_dates(self, client, sample_order_data):
        """Test revenue_per_day with orders on different dates"""
        dates = ["2025-02-01T10:00:00Z", "2025-02-02T10:00:00Z"]

        for i, date in enumerate(dates):
            order_data = sample_order_data.copy()
            order_data["order_id"] = f"ORD-DATE-{i:03d}"
            order_data["order_date"] = date
            order_data["total_amount"] = 10000
            client.post("/orders/", json=order_data)

        response = client.get("/orders/summary")

        assert response.status_code == 200
        data = response.json()
        assert len(data["revenue_per_day"]) == 2

    def test_summary_aggregation_accuracy(self, client, sample_order_data):
        """Test that revenue aggregation is accurate"""
        amounts = [12345, 67890, 11111]
        expected_total = sum(amounts)

        for i, amount in enumerate(amounts):
            order_data = sample_order_data.copy()
            order_data["order_id"] = f"ORD-AGGR-{i:03d}"
            order_data["total_amount"] = amount
            client.post("/orders/", json=order_data)

        response = client.get("/orders/summary")

        assert response.status_code == 200
        data = response.json()
        assert data["total_orders"] == 3
        assert data["total_revenue"][0]["total"] == expected_total
