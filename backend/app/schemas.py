from datetime import datetime
from decimal import Decimal
from enum import Enum
from pydantic import BaseModel, Field, field_validator
from typing import Optional


class OrderStatus(str, Enum):
    """Valid order statuses"""
    PENDING = "pending"
    CONFIRMED = "confirmed"
    PROCESSING = "processing"
    SHIPPED = "shipped"
    DELIVERED = "delivered"
    CANCELLED = "cancelled"


# Common ISO 4217 currency codes
VALID_CURRENCIES = {
    "ISK", "USD", "EUR", "GBP", "CAD", "AUD", "JPY", "CHF", "SEK", "NOK", "DKK"
}


class OrderBase(BaseModel):
    """Base schema with common fields"""

    order_id: str = Field(..., min_length=1, description="Business order ID")
    customer_id: str = Field(..., min_length=1, description="Customer reference")
    total_amount: int = Field(..., gt=0, description="Total order amount in cents/smallest currency unit")
    currency: str = Field(
        ..., min_length=3, max_length=3, description="ISO 4217 currency code (e.g., ISK, USD)"
    )
    status: OrderStatus = Field(default=OrderStatus.PENDING, description="Order status")
    order_date: Optional[datetime] = Field(default=None, description="Order placement date")

    @field_validator("order_id", "customer_id")
    @classmethod
    def validate_not_empty(cls, v: str) -> str:
        """Ensure strings are not just whitespace"""
        if not v or not v.strip():
            raise ValueError("Field cannot be empty or whitespace")
        return v.strip()

    @field_validator("currency")
    @classmethod
    def validate_currency(cls, v: str) -> str:
        """Validate currency is a known ISO 4217 code"""
        v_upper = v.upper()
        if v_upper not in VALID_CURRENCIES:
            raise ValueError(
                f"Currency must be a valid ISO 4217 code. Supported: {', '.join(sorted(VALID_CURRENCIES))}"
            )
        return v_upper


class OrderCreate(OrderBase):
    """Schema for creating a new order"""

    pass


class OrderUpdate(BaseModel):
    """Schema for updating an existing order"""

    customer_id: Optional[str] = Field(None, min_length=1, description="Customer reference")
    total_amount: Optional[int] = Field(
        None, gt=0, description="Total order amount in cents/smallest currency unit"
    )
    currency: Optional[str] = Field(
        None, min_length=3, max_length=3, description="ISO 4217 currency code (e.g., ISK, USD)"
    )
    status: Optional[OrderStatus] = Field(None, description="Order status")
    order_date: Optional[datetime] = Field(None, description="Order placement date")

    @field_validator("customer_id")
    @classmethod
    def validate_customer_id(cls, v: Optional[str]) -> Optional[str]:
        """Ensure customer_id is not just whitespace if provided"""
        if v is not None and (not v or not v.strip()):
            raise ValueError("Customer ID cannot be empty or whitespace")
        return v.strip() if v else v

    @field_validator("currency")
    @classmethod
    def validate_currency(cls, v: Optional[str]) -> Optional[str]:
        """Validate currency is a known ISO 4217 code if provided"""
        if v is None:
            return v
        v_upper = v.upper()
        if v_upper not in VALID_CURRENCIES:
            raise ValueError(
                f"Currency must be a valid ISO 4217 code. Supported: {', '.join(sorted(VALID_CURRENCIES))}"
            )
        return v_upper


class OrderResponse(OrderBase):
    """Schema for reading an order"""

    id: int = Field(..., description="Unique identifier for the order")
    created_at: datetime = Field(..., description="Record creation timestamp")
    updated_at: datetime = Field(..., description="Record last update timestamp")

    model_config = {"from_attributes": True}


class DailyRevenue(BaseModel):
    """Revenue for a specific day"""

    date: str = Field(..., description="Date in YYYY-MM-DD format")
    revenue: int = Field(..., description="Total revenue for the day")


class OrderSummary(BaseModel):
    """Aggregated order summary data"""

    total_orders: int = Field(..., description="Total number of orders")
    total_revenue: int = Field(..., description="Total revenue across all orders")
    revenue_per_day: list[DailyRevenue] = Field(..., description="Revenue breakdown by day")
