from typing import Sequence

from fastapi import APIRouter, Depends, HTTPException, UploadFile
from sqlalchemy.orm import joinedload
from sqlmodel import select
from sqlmodel.ext.asyncio.session import AsyncSession

from database.database import get_session
from models import Category, Catalog
from s3_storage.storage import s3_client

category_router = APIRouter()

@category_router.get("/categories", response_model=Sequence[Category])
async def get_categories(catalog_tag: str, session: AsyncSession = Depends(get_session)) -> Sequence[Category]:
    request = select(Catalog).options(joinedload(Catalog.categories)).where(Catalog.tag == catalog_tag)
    result = await session.execute(request)
    catalog: Catalog = result.scalars().first()

    if catalog is None:
        raise HTTPException(status_code=404)

    return catalog.categories

@category_router.get("/categories/{category_tag}", response_model=Catalog)
async def get_category(catalog_tag: str, category_tag: str, session: AsyncSession = Depends(get_session)) -> Category:
    request = select(Category).options(joinedload(Category.catalog)).where(Category.tag == category_tag)
    result = await session.execute(request)
    category: Category = result.scalars().first()

    if category is None:
        raise HTTPException(status_code=404, detail="Category not found")

    if category.catalog.tag != catalog_tag:
        raise HTTPException(status_code=404, detail="Category found, catalog tag does not match")

    return category

@category_router.post("/categories/{category_tag}/upload", response_model=Catalog)
async def upload_category_image(catalog_tag: str, category_tag: str, file: UploadFile, session: AsyncSession = Depends(get_session)) -> Category:
    request = select(Category).options(joinedload(Category.catalog)).where(Category.tag == category_tag)
    result = await session.execute(request)
    category: Category = result.scalars().first()

    if category is None:
        raise HTTPException(status_code=404, detail="Category not found")

    if category.catalog.tag != catalog_tag:
        raise HTTPException(status_code=404, detail="Category found, catalog tag does not match")

    await s3_client.upload_file(file, f"catalogs/{category.catalog.tag}/{category.tag}")

    file_spec = file.filename.split(".")[-1]
    category.image_path = f"catalogs/{category.catalog.tag}/{category.tag}.{file_spec}"

    session.add(category)
    await session.commit()
    await session.refresh(category)
    return category