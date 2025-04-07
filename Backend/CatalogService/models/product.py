from decimal import Decimal

from sqlmodel import SQLModel, Field, Relationship
from typing import Optional

import typing

if typing.TYPE_CHECKING:
    from models import Category


class Product(SQLModel, table=True):
    id: int = Field(default=None, primary_key=True, index=True)
    name: str = Field(nullable=False)
    description: Optional[str] = Field(default=None, nullable=True)
    tag: str = Field(nullable=False, unique=True)
    image_path: str | None = None
    price: Optional[Decimal] = Field(default=None, decimal_places=2, max_digits=10)

    category_id: int = Field(default=None, foreign_key="category.id")
    category: "Category" = Relationship(back_populates="products")