from sqlmodel import SQLModel, Field, Relationship

import typing

if typing.TYPE_CHECKING:
    from models import Category


class Catalog(SQLModel, table=True):
    id: int = Field(default=None, primary_key=True, index=True)
    name: str = Field(nullable=False)
    description: str = Field(nullable=True)
    tag: str = Field(nullable=False, unique=True)
    image_path: str | None = None

    categories: list["Category"] = Relationship(back_populates="catalog")


class CatalogRequestResponse(SQLModel, table=False):
    name: str = Field(nullable=False)
    description: typing.Optional[str] = Field(default=None, nullable=True)
    tag: str = Field(nullable=False, unique=True)
    image_path: typing.Optional[str] = None


class CatalogUpdateResponse(SQLModel, table=False):
    name: str | None = None
    description: str | None = None
    tag: str | None = None