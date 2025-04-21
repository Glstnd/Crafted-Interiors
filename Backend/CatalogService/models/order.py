from datetime import datetime
from decimal import Decimal
from typing import Optional, List

from sqlmodel import SQLModel, Field, Relationship

from models import Product

import uuid as uuid_pkg


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
    user_id: uuid_pkg.UUID = Field(default_factory=uuid_pkg.uuid4,
                                             primary_key=False,
                                             index=False,
                                             nullable=False)  # Внешний ключ к пользователю

    # Связи
    items: List[OrderItem] = Relationship(back_populates="order")


class OrderItemResponse(SQLModel, table=False):
    id: Optional[int] = Field(default=None)
    product_id: int
    quantity: int
    unit_price: Decimal


class OrderFullResponse(SQLModel, table=False):
    id: Optional[int] = Field(default=None, primary_key=True)
    created_at: Optional[datetime] = Field(default_factory=datetime.utcnow)
    status: Optional[str] = "pending"
    total_amount: Optional[Decimal] = Field(default=0.0, decimal_places=2, max_digits=12)
    user_id: Optional[uuid_pkg.UUID] = Field(default_factory=uuid_pkg.uuid4,
                                   primary_key=False,
                                   index=False,
                                   nullable=False)
    items: List[OrderItemResponse] = []


class OrderUserQuery(SQLModel, table=False):
    public_id: Optional[uuid_pkg.UUID] = Field(default=None)


class OrderItemCreate(SQLModel):
    product_tag: str
    quantity: int = Field(ge=1)
    unit_price: Decimal = Field(ge=0, decimal_places=2, max_digits=10)


class OrderCreate(SQLModel):
    public_id: uuid_pkg.UUID
    items: List[OrderItemCreate]
    total_amount: Decimal = Field(ge=0, decimal_places=2, max_digits=12)
