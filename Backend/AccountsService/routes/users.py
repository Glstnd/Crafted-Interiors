from fastapi import APIRouter, Depends, HTTPException

from sqlalchemy.ext.asyncio import AsyncSession
from sqlmodel import select
from starlette import status

from database.database import get_session
from models import User, UserRegisterRequest, UserResponse, UserLoginRequest

user_router = APIRouter(
    tags=['User']
)

@user_router.post('/register', response_model=UserResponse)
async def create_user(user: UserRegisterRequest, session: AsyncSession = Depends(get_session)) -> UserResponse:
    user = User(**user.model_dump())
    session.add(user)
    await session.commit()
    await session.refresh(user)

    return UserResponse.model_validate(user)

@user_router.post('/login', response_model=UserResponse)
async def login(user: UserLoginRequest, session: AsyncSession = Depends(get_session)) -> UserResponse:
    request = select(User).where(User.username == user.username)
    result = await session.execute(request)

    user_db = result.scalars().one()

    if not user_db or user.password != user_db.password:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail='Bad username or password')

    return UserResponse.model_validate(user_db)