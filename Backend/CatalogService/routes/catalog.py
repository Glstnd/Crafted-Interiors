from typing import Sequence

from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import select
from sqlmodel.ext.asyncio.session import AsyncSession
from sqlmodel.sql._expression_select_cls import SelectBase

from database.database import get_session
from models import Catalog, CatalogRequestResponse, CatalogUpdateResponse

catalog_router = APIRouter()

@catalog_router.get("/catalogs", response_model=Sequence[Catalog])
async def get_catalogs(session: AsyncSession = Depends(get_session)) -> Sequence[Catalog]:
    request = select(Catalog)
    result = await session.execute(request)

    return result.scalars().all()

@catalog_router.post("/catalogs", response_model=CatalogRequestResponse, status_code=201)
async def create_catalog(catalog_request: CatalogRequestResponse,session: AsyncSession = Depends(get_session)) -> CatalogRequestResponse:
    catalog = Catalog(**catalog_request.model_dump())
    session.add(catalog)
    await session.commit()
    await session.refresh(catalog)

    return CatalogRequestResponse.model_validate(catalog)

@catalog_router.put("/catalogs/{tag}", response_model=CatalogUpdateResponse, status_code=202)
async def update_catalog(tag: str, catalog_update: CatalogUpdateResponse, session: AsyncSession = Depends(get_session)) -> CatalogRequestResponse:
    request = select(Catalog).where(Catalog.tag == tag)
    result = await session.execute(request)
    catalog = result.scalar_one_or_none()
    if catalog is None:
        raise HTTPException(status_code=404, detail="Catalog not found")

    for key, value in catalog_update.model_dump().items():
        if value is not None:
            setattr(catalog, key, value)

    session.add(catalog)
    await session.commit()
    await session.refresh(catalog)

    return CatalogRequestResponse.model_validate(catalog)

