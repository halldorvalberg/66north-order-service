from sqlalchemy import Column, Integer, String, Boolean, DateTime
from sqlalchemy.sql import func

from app.database import Base


class Order(Base):
    __tablename__ = "orders"

    """
    Fields:
      - id: serial ID primary key
      - order_id: varchar order_id UK "Business ID"
      - customer_id: varchar customer_id "Customer reference"
      - order_date: timestampz order_date "Order placement date"
      - total_amount: decimal total_amount "Total order amount"
      - currency: varchar currency "ISO 4217 currency code"
      - status: varchar status "Order status"
      - created_at: timestampz created_at "Record creation timestamp"
      - updated_at: timestampz updated_at "Record last update timestamp"
    """

    id = Column(Integer, primary_key=True, index=True)
    order_id = Column(String, unique=True, index=True, nullable=False)
    customer_id = Column(String, index=True, nullable=False)
    order_date = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    total_amount = Column(Integer, nullable=False)
    currency = Column(String(3), nullable=False)
    status = Column(String, nullable=False, default="pending")
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(
        DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False
    )
