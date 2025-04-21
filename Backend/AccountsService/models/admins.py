from typing import Optional

from sqlmodel import SQLModel, Field

import uuid as uuid_pkg


class Admin(SQLModel, table=True):
    id: int = Field(default=None, primary_key=True, index=True)
    username: str
    password: str
    email: Optional[str] = None
    public_id: uuid_pkg.UUID = Field(
        default_factory=uuid_pkg.uuid4,
        primary_key=False,
        index=False,
        nullable=False,
    )

class AdminRegisterRequest(SQLModel):
    username: str
    password: str
    email: Optional[str] = None

class AdminLoginRequest(SQLModel):
    username: str
    password: str

class AdminResponse(SQLModel):
    username: str
    email: Optional[str] = None
    public_id: uuid_pkg.UUID

class AdminToken(SQLModel, table=False):
    access_token: str = Field(nullable=True)
