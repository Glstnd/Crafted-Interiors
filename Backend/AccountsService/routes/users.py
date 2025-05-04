from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, Response

from sqlalchemy.ext.asyncio import AsyncSession
from sqlmodel import select
from starlette import status

from database.database import get_session
from models import User, UserRegisterRequest, UserResponse, UserLoginRequest, UserToken, UserPatch

from auth.auth import security, config

user_router = APIRouter(
    tags=['User']
)

@user_router.post('/register', response_model=UserToken)
async def create_user(user: UserRegisterRequest, response: Response, session: AsyncSession = Depends(get_session)) -> UserToken:
    user = User(**user.model_dump())
    session.add(user)
    await session.commit()
    await session.refresh(user)

    token = security.create_access_token(uid=str(user.id))
    response.set_cookie(config.JWT_ACCESS_COOKIE_NAME, token)

    return UserToken(access_token=token)

@user_router.post('/login', response_model=UserToken)
async def login(user: UserLoginRequest, response: Response, session: AsyncSession = Depends(get_session)) -> UserToken:
    request = select(User).where(User.username == user.username)
    result = await session.execute(request)

    user_db = result.scalars().first()

    if not user_db or user.password != user_db.password:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail='Bad username or password')

    token = security.create_access_token(uid=str(user_db.id))
    response.set_cookie(config.JWT_ACCESS_COOKIE_NAME, token)

    return UserToken(access_token=token)

@security.set_subject_getter
def get_current_uid(uid: str) -> str:
    return uid

@user_router.get('/protected', dependencies=[Depends(security.access_token_required)], response_model=UserResponse)
async def get_protected(uid: str = Depends(security.get_current_subject), session: AsyncSession = Depends(get_session)) -> Optional[UserResponse]:
    request = select(User).where(User.id == int(uid))
    result = await session.execute(request)

    return result.scalars().first()

@user_router.patch('/profile', dependencies=[Depends(security.access_token_required)], response_model=UserResponse)
async def change_profile(userPatch: UserPatch, uid: str = Depends(security.get_current_subject), session: AsyncSession = Depends(get_session)) -> UserResponse:
    request = select(User).where(User.id == int(uid))
    result = await session.execute(request)

    user = result.scalars().first()
    if user is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail='User not found')

    if userPatch.fname is not None:
        user.fname = userPatch.fname
    if userPatch.lname is not None:
        user.lname = userPatch.lname
    if userPatch.phone is not None:
        user.phone = userPatch.phone

    session.add(user)
    await session.commit()
    await session.refresh(user)

    return UserResponse.model_validate(user)

@user_router.get('/{public_id}/info', response_model=UserPatch)
async def get_info_user(public_id: str, session: AsyncSession = Depends(get_session)) -> UserPatch:
    request = select(User).where(User.public_id == public_id)
    result = await session.execute(request)

    user = result.scalars().first()
    if user is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail='User not found')

    return UserPatch.model_validate(user)