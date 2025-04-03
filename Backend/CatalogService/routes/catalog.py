from typing import Sequence

from fastapi import APIRouter, Depends
from sqlmodel import select
from sqlmodel.ext.asyncio.session import AsyncSession

from database.database import get_session
from models import Catalog

catalog_router = APIRouter()

@catalog_router.get("/catalogs", response_model=Sequence[Catalog])
async def get_catalogs(session: AsyncSession = Depends(get_session)) -> Sequence[Catalog]:
    request = select(Catalog)
    result = await session.execute(request)

    return result.scalars().all()