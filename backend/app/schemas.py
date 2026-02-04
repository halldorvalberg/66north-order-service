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
    COMPLETED = "completed"
    CANCELLED = "cancelled"


# Common ISO 4217 currency codes
VALID_CURRENCIES = {"ISK", "USD", "EUR", "GBP", "CAD", "AUD", "JPY", "CHF", "SEK", "NOK", "DKK"}


class OrderBase(BaseModel):
    """Base schema with common fields"""

    order_id: str = Field(..., min_length=1, description="Business order ID")
    customer_id: str = Field(..., min_length=1, description="Customer reference")
    total_amount: int = Field(
        ..., gt=0, description="Total order amount in cents/smallest currency unit"
    )
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


class CurrencyTotal(BaseModel):
    """Total revenue for a specific currency"""

    currency: str = Field(..., description="ISO 4217 currency code")
    total: int = Field(..., description="Total revenue in smallest currency unit")


class DailyRevenueByCurrency(BaseModel):
    """Revenue for a specific day and currency"""

    date: str = Field(..., description="Date in YYYY-MM-DD format")
    currency: str = Field(..., description="ISO 4217 currency code")
    revenue: int = Field(..., description="Total revenue for this day in this currency")


class OrderSummary(BaseModel):
    """Aggregated order summary data with multi-currency support"""

    total_orders: int = Field(..., description="Total number of orders across all currencies")
    total_revenue: list[CurrencyTotal] = Field(
        ..., description="Total revenue broken down by currency"
    )
    revenue_per_day: list[DailyRevenueByCurrency] = Field(
        ..., description="Daily revenue breakdown by currency"
    )
