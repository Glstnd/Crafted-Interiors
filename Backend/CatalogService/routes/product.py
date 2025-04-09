from fastapi import APIRouter, Depends, HTTPException, Query
from typing import Sequence, Annotated

from sqlalchemy.orm import joinedload
from sqlmodel import select
from sqlmodel.ext.asyncio.session import AsyncSession
from starlette import status

from database.database import get_session
from models import Product, Category, ProductFilter

product_router = APIRouter()

@product_router.get("/products", response_model=Sequence[Product])
async def get_products(catalog_tag: str, category_tag: str, filter_query: Annotated[ProductFilter, Query()], session: AsyncSession = Depends(get_session)) -> Sequence[Product]:
    request = select(Category).options(joinedload(Category.catalog), joinedload(Category.products)).where(Category.tag == category_tag)

    result = await session.execute(request)
    category: Category = result.scalars().first()

    if category is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND)

    if filter_query.sort_field is not None:
        category.products.sort(key=lambda product: getattr(product, filter_query.sort_field), reverse=filter_query.sort_direction == "desc")

    if filter_query.min_price is not None:
        category.products = [product for product in (filter(lambda product: product.price >= filter_query.min_price, category.products))]

    if filter_query.max_price is not None:
        category.products = [product for product in (filter(lambda product: product.price <= filter_query.max_price, category.products))]

    if filter_query.has_photo is not None:
        category.products = [product for product in (filter(lambda product: product.image_path is not None, category.products))]

    if filter_query.has_description is not None:
        category.products = [product for product in (filter(lambda product: product.description is not None, category.products))]

    if category.catalog.tag != catalog_tag:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND)

    return category.products

@product_router.get("/products/{product_tag}", response_model=Product)
async def get_product(catalog_tag: str, category_tag: str, product_tag: str, session: AsyncSession = Depends(get_session)):
    request = select(Product).options(joinedload(Product.category)).where(Product.tag == product_tag)

    result = await session.execute(request)
    product: Product = result.scalars().first()
    if product is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND)

    if product.category.tag != category_tag:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND)

    request = select(Category).options(joinedload(Category.catalog)).where(Category.tag == category_tag)

    result = await session.execute(request)
    category: Category = result.scalars().first()

    if category is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND)

    if category.catalog.tag != catalog_tag:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND)

    return product