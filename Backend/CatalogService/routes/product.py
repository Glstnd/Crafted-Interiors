from fastapi import APIRouter, Depends, HTTPException
from typing import Sequence

from sqlalchemy.orm import joinedload
from sqlmodel import select
from sqlmodel.ext.asyncio.session import AsyncSession

from database.database import get_session
from models import Product, Category

product_router = APIRouter()

@product_router.get("/products", response_model=Sequence[Product])
async def get_products(catalog_tag: str, category_tag: str, session: AsyncSession = Depends(get_session)) -> Sequence[Product]:
    request = select(Category).options(joinedload(Category.catalog), joinedload(Category.products)).where(Category.tag == category_tag)
    result = await session.execute(request)
    category: Category = result.scalars().first()

    if category is None:
        raise HTTPException(status_code=404)

    if category.catalog.tag != catalog_tag:
        raise HTTPException(status_code=404)

    return category.products