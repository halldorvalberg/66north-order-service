from datetime import datetime
from decimal import Decimal
from pydantic import BaseModel, Field
from typing import Optional


class OrderBase(BaseModel):
    """Base schema with common fields"""

    order_id: str = Field(..., description="Business order ID")
    customer_id: str = Field(..., description="Customer reference")
    total_amount: int = Field(..., description="Total order amount in cents/smallest currency unit")
    currency: str = Field(
        ..., min_length=3, max_length=3, description="ISO 4217 currency code (e.g., ISK, USD)"
    )
    status: str = Field(default="pending", description="Order status")
    order_date: Optional[datetime] = Field(default=None, description="Order placement date")


class OrderCreate(OrderBase):
    """Schema for creating a new order"""

    pass


class OrderUpdate(BaseModel):
    """Schema for updating an existing order"""

    customer_id: Optional[str] = Field(None, description="Customer reference")
    total_amount: Optional[int] = Field(
        None, description="Total order amount in cents/smallest currency unit"
    )
    currency: Optional[str] = Field(
        None, min_length=3, max_length=3, description="ISO 4217 currency code (e.g., ISK, USD)"
    )
    status: Optional[str] = Field(None, description="Order status")
    order_date: Optional[datetime] = Field(None, description="Order placement date")


class OrderResponse(OrderBase):
    """Schema for reading an order"""

    id: int = Field(..., description="Unique identifier for the order")
    created_at: datetime = Field(..., description="Record creation timestamp")
    updated_at: datetime = Field(..., description="Record last update timestamp")

    model_config = {"from_attributes": True}
