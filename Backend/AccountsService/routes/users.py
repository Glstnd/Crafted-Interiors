from fastapi import APIRouter, Depends

from sqlalchemy.ext.asyncio import AsyncSession

from database.database import get_session
from models import User, UserRegisterRequest, UserRegisterResponse

user_router = APIRouter(
    tags=['User']
)

@user_router.post('/register', response_model=UserRegisterResponse)
async def create_user(user: UserRegisterRequest, session: AsyncSession = Depends(get_session)) -> UserRegisterResponse:
    user = User(**user.model_dump())
    session.add(user)
    await session.commit()
    await session.refresh(user)

    return UserRegisterResponse.model_validate(user)
