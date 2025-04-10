from typing import Optional
from sqlmodel import SQLModel, Field
from geoalchemy2 import Geometry

class Store(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    name: str = Field(index=True)
    address: str
    location: Optional[str] = Field(sa_column=Geometry("POINT", srid=4326))

class StoreCreate(SQLModel):
    name: str
    address: str
    latitude: float  # Широта
    longitude: float  # Долгота

class StorePublic(SQLModel):
    id: int
    name: str
    address: str
    latitude: float
    longitude: float