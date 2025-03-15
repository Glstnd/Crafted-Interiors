import typing
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, Response

from sqlalchemy.ext.asyncio import AsyncSession
from sqlmodel import select
from starlette import status

from database.database import get_session
from models import User, UserRegisterRequest, UserResponse, UserLoginRequest

from auth.auth import security, config

user_router = APIRouter(
    tags=['User']
)

@user_router.post('/register', response_model=UserResponse)
async def create_user(user: UserRegisterRequest, response: Response, session: AsyncSession = Depends(get_session)) -> UserResponse:
    user = User(**user.model_dump())
    session.add(user)
    await session.commit()
    await session.refresh(user)

    token = security.create_access_token(uid=str(user.id))
    response.set_cookie(config.JWT_ACCESS_COOKIE_NAME, token)

    return UserResponse.model_validate(user)

@user_router.post('/login', response_model=UserResponse)
async def login(user: UserLoginRequest, response: Response, session: AsyncSession = Depends(get_session)) -> UserResponse:
    request = select(User).where(User.username == user.username)
    result = await session.execute(request)

    user_db = result.scalar_one_or_none()

    if not user_db or user.password != user_db.password:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail='Bad username or password')

    token = security.create_access_token(uid=str(user_db.id))
    response.set_cookie(config.JWT_ACCESS_COOKIE_NAME, token)

    return UserResponse.model_validate(user_db)

@security.set_subject_getter
def get_current_uid(uid: str) -> str:
    return uid

@user_router.get('/protected', dependencies=[Depends(security.access_token_required)], response_model=UserResponse)
async def get_protected(uid: str = Depends(security.get_current_subject), session: AsyncSession = Depends(get_session)) -> Optional[UserResponse]:
    request = select(User).where(User.id == int(uid))
    result = await session.execute(request)

    return result.scalar_one_or_none()
