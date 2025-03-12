from fastapi import APIRouter, Depends
from sqlalchemy import insert
from sqlalchemy.ext.asyncio import AsyncSession

from database.database import get_session
from models import User, UserRegister

user_router = APIRouter(
    tags=['User']
)

@user_router.post('/register', response_model=User)
async def create_user(user: UserRegister, session: AsyncSession = Depends(get_session)) -> User:
    user = User(**user.model_dump())
    session.add(user)
    await session.commit()
    await session.refresh(user)

    return user
