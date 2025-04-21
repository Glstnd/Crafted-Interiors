from typing import Optional

from sqlmodel import SQLModel, Field

import uuid as uuid_pkg


class User(SQLModel, table=True):
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
    fname: Optional[str] = None
    lname: Optional[str] = None
    phone: Optional[str] = None

class UserRegisterRequest(SQLModel):
    username: str
    password: str
    email: Optional[str] = None

class UserLoginRequest(SQLModel):
    username: str
    password: str

class UserResponse(SQLModel):
    username: str
    email: Optional[str] = None
    public_id: uuid_pkg.UUID
    fname: Optional[str] = None
    lname: Optional[str] = None
    phone: Optional[str] = None

class UserToken(SQLModel, table=False):
    access_token: str = Field(nullable=True)

class UserPatch(SQLModel):
    public_id: Optional[uuid_pkg.UUID] = None
    fname: Optional[str] = None
    lname: Optional[str] = None
    phone: Optional[str] = None
