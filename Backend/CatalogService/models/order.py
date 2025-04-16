from datetime import datetime
from decimal import Decimal
from typing import Optional, List

from sqlmodel import SQLModel, Field, Relationship

from models import Product


class OrderItem(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    order_id: int = Field(foreign_key="order.id")
    product_id: int = Field(foreign_key="product.id")
    quantity: int = Field(ge=1)
    unit_price: Decimal = Field(decimal_places=2, max_digits=10)

    # Связи
    order: Optional["Order"] = Relationship(back_populates="items")
    product: Optional[Product] = Relationship(back_populates="order_items")


class Order(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    created_at: datetime = Field(default_factory=datetime.utcnow)
    status: str = Field(default="pending", nullable=False)
    total_amount: Decimal = Field(default=0.0, decimal_places=2, max_digits=12)
    user_id: Optional[int] = Field(default=None)  # Внешний ключ к пользователю

    # Связи
    items: List[OrderItem] = Relationship(back_populates="order")


