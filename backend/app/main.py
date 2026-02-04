from datetime import date
from fastapi import FastAPI, Depends, HTTPException
from sqlalchemy import func
from sqlalchemy.orm import Session

from app.database import get_db
from app import models, schemas

app = FastAPI(title="66°North Order Service")


@app.get("/")
def read_root():
    return {"message": "Welcome to 66°North Order Service API!"}


@app.post("/orders/", response_model=schemas.OrderResponse, status_code=201)
def create_order(order: schemas.OrderCreate, db: Session = Depends(get_db)):
    """Create a new order"""
    # Check if order_id already exists
    db_order = db.query(models.Order).filter(models.Order.order_id == order.order_id).first()
    if db_order:
        raise HTTPException(status_code=400, detail="Order ID already exists")

    # Create order
    db_order = models.Order(**order.model_dump())
    db.add(db_order)
    db.commit()
    db.refresh(db_order)
    return db_order


@app.get("/orders/summary", response_model=schemas.OrderSummary)
def get_orders_summary(db: Session = Depends(get_db)):
    """
    Get aggregated order data:
    - Total number of orders
    - Total revenue per currency
    - Revenue per day per currency
    """
    # Total orders count
    total_orders = db.query(func.count(models.Order.id)).scalar() or 0

    # Total revenue by currency
    revenue_by_currency = (
        db.query(models.Order.currency, func.sum(models.Order.total_amount).label("total"))
        .group_by(models.Order.currency)
        .all()
    )

    # Format revenue by currency
    total_revenue = [
        {"currency": row.currency, "total": int(row.total)} for row in revenue_by_currency
    ]

    # Revenue per day by currency
    revenue_by_day_currency = (
        db.query(
            func.date(models.Order.order_date).label("date"),
            models.Order.currency,
            func.sum(models.Order.total_amount).label("revenue"),
        )
        .group_by(func.date(models.Order.order_date), models.Order.currency)
        .order_by(func.date(models.Order.order_date).desc(), models.Order.currency)
        .all()
    )

    # Format revenue per day
    revenue_per_day = [
        {"date": str(row.date), "currency": row.currency, "revenue": int(row.revenue)}
        for row in revenue_by_day_currency
    ]

    return {
        "total_orders": total_orders,
        "total_revenue": total_revenue,
        "revenue_per_day": revenue_per_day,
    }


@app.get("/orders/", response_model=list[schemas.OrderResponse])
def read_orders(
    skip: int = 0,
    limit: int = 100,
    status: str | None = None,
    customer_id: str | None = None,
    db: Session = Depends(get_db),
):
    """Get all orders with optional filtering"""
    query = db.query(models.Order)

    # Apply filters if provided
    if status:
        query = query.filter(models.Order.status == status)
    if customer_id:
        query = query.filter(models.Order.customer_id == customer_id)

    orders = query.offset(skip).limit(limit).all()
    return orders


@app.get("/orders/{order_id}", response_model=schemas.OrderResponse)
def read_order(order_id: str, db: Session = Depends(get_db)):
    """Get a specific order by order_id"""
    order = db.query(models.Order).filter(models.Order.order_id == order_id).first()
    if order is None:
        raise HTTPException(status_code=404, detail="Order not found")
    return order


@app.patch("/orders/{order_id}", response_model=schemas.OrderResponse)
def update_order(order_id: str, order_update: schemas.OrderUpdate, db: Session = Depends(get_db)):
    """Update an existing order"""
    db_order = db.query(models.Order).filter(models.Order.order_id == order_id).first()
    if db_order is None:
        raise HTTPException(status_code=404, detail="Order not found")

    # Update only provided fields
    update_data = order_update.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(db_order, field, value)

    db.commit()
    db.refresh(db_order)
    return db_order


@app.delete("/orders/{order_id}", status_code=204)
def delete_order(order_id: str, db: Session = Depends(get_db)):
    """Delete an order"""
    db_order = db.query(models.Order).filter(models.Order.order_id == order_id).first()
    if db_order is None:
        raise HTTPException(status_code=404, detail="Order not found")

    db.delete(db_order)
    db.commit()
    return None


@app.get("/orders/customer/{customer_id}", response_model=list[schemas.OrderResponse])
def read_customer_orders(customer_id: str, db: Session = Depends(get_db)):
    """Get all orders for a specific customer"""
    orders = db.query(models.Order).filter(models.Order.customer_id == customer_id).all()
    return orders
