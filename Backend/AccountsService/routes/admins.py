from typing import Optional, Sequence

from fastapi import APIRouter, Depends, HTTPException, Response

from sqlalchemy.ext.asyncio import AsyncSession
from sqlmodel import select
from starlette import status

from database.database import get_session
from models import Admin, AdminRegisterRequest, AdminResponse, AdminLoginRequest, AdminToken

from auth.auth import security, config

admin_router = APIRouter(
    tags=['Admin']
)

@admin_router.post('/register', response_model=AdminResponse)
async def create_user(admin: AdminRegisterRequest, response: Response, session: AsyncSession = Depends(get_session)) -> AdminResponse:
    admin = Admin(**admin.model_dump())
    session.add(admin)
    await session.commit()
    await session.refresh(admin)

    token = security.create_access_token(uid=str(admin.id))
    response.set_cookie(config.JWT_ACCESS_COOKIE_NAME, token)

    return AdminResponse.model_validate(admin)

@admin_router.post('/login', response_model=AdminResponse)
async def login(admin: AdminLoginRequest, response: Response, session: AsyncSession = Depends(get_session)) -> AdminResponse:
    request = select(Admin).where(Admin.username == admin.username)
    result = await session.execute(request)

    admin_db = result.scalar_one_or_none()

    if not admin_db or admin.password != admin_db.password:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail='Bad username or password')

    token = security.create_access_token(uid=str(admin_db.id))
    response.set_cookie(config.JWT_ACCESS_COOKIE_NAME, token)

    return AdminToken(access_token=token)

@security.set_subject_getter
def get_current_uid(uid: str) -> str:
    return uid

@admin_router.get('/protected', dependencies=[Depends(security.access_token_required)], response_model=AdminResponse)
async def get_protected(uid: str = Depends(security.get_current_subject), session: AsyncSession = Depends(get_session)) -> Optional[AdminResponse]:
    request = select(Admin).where(Admin.id == int(uid))
    result = await session.execute(request)

    return result.scalar_one_or_none()

@admin_router.get('', response_model=Sequence[AdminResponse])
async def get_admins(session: AsyncSession = Depends(get_session)) -> Sequence[Admin]:
    request = select(Admin)
    result = await session.execute(request)

    return result.scalars().all()
