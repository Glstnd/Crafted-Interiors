from sqlmodel import SQLModel, Field, Relationship

import typing

if typing.TYPE_CHECKING:
    from models import Catalog, Product


class Category(SQLModel, table=True):
    id: int = Field(default=None, primary_key=True, index=True)
    name: str = Field(nullable=False)
    description: str = Field(nullable=True)
    tag: str = Field(nullable=False, unique=True)

    catalog_id: int = Field(default=None, foreign_key="catalog.id")
    catalog: "Catalog" = Relationship(back_populates="categories")

    products: list["Product"] = Relationship(back_populates="category")
