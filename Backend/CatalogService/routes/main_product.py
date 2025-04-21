from fastapi import APIRouter, Depends
from sqlmodel import select
from sqlmodel.ext.asyncio.session import AsyncSession

from database.database import get_session
from models import Product

main_product_router = APIRouter()

@main_product_router.get("/{product_id}", response_model=Product)
async def get_product(product_id: int, session: AsyncSession = Depends(get_session)) -> Product:
    request = select(Product).where(Product.id == product_id)
    result = await session.execute(request)

    return result.scalar_one_or_none()
