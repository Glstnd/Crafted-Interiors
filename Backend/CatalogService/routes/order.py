from typing import Sequence

from fastapi import APIRouter, Depends
from sqlmodel import select
from sqlmodel.ext.asyncio.session import AsyncSession

from database.database import get_session
from models import Order

order_router = APIRouter()

@order_router.get("", response_model=Sequence[Order])
async def get_orders(session: AsyncSession = Depends(get_session)) -> Sequence[Order]:
    request = select(Order)
    orders = (await session.execute(request)).scalars().all()

    return orders
