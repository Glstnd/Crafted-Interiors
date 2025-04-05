from typing import Sequence

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import joinedload
from sqlmodel import select
from sqlmodel.ext.asyncio.session import AsyncSession

from database.database import get_session
from models import Category, Catalog

category_router = APIRouter()

@category_router.get("/categories", response_model=Sequence[Category])
async def get_categories(catalog_tag: str, session: AsyncSession = Depends(get_session)) -> Sequence[Category]:
    request = select(Catalog).options(joinedload(Catalog.categories)).where(Catalog.tag == catalog_tag)
    result = await session.execute(request)
    catalog: Catalog = result.scalars().first()

    if catalog is None:
        raise HTTPException(status_code=404)

    return catalog.categories