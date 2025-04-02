from sqlmodel import SQLModel, Field, Relationship

import typing

if typing.TYPE_CHECKING:
    from models import Category


class Catalog(SQLModel, table=True):
    id: int = Field(default=None, primary_key=True, index=True)
    name: str = Field(nullable=False)
    description: str = Field(nullable=True)
    tag: str = Field(nullable=False, unique=True)

    categories: list["Category"] = Relationship(back_populates="catalog")