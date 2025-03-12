from typing import Optional

from sqlmodel import SQLModel, Field


class User(SQLModel, table=True):
    id: int = Field(default=None, primary_key=True, index=True)
    username: str
    password: str
    email: Optional[str] = None

class UserRegister(SQLModel):
    username: str
    password: str
    email: Optional[str] = None