from sqlmodel import SQLModel, Field, Relationship

import typing

if typing.TYPE_CHECKING:
    from models import Category


class Product(SQLModel, table=True):
    id: int = Field(default=None, primary_key=True, index=True)
    name: str = Field(nullable=False)
    tag: str = Field(nullable=False, unique=True)

    category_id: int = Field(default=None, foreign_key="category.id")
    category: "Category" = Relationship(back_populates="products")