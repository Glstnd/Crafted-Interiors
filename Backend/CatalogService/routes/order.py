from typing import Sequence, Annotated

from fastapi import APIRouter, Depends, Query
from sqlmodel import select
from sqlmodel.ext.asyncio.session import AsyncSession

from database.database import get_session
from models import Order, OrderUserQuery

order_router = APIRouter()

@order_router.get("", response_model=Sequence[Order])
async def get_orders(user_id: Annotated[OrderUserQuery, Query()], session: AsyncSession = Depends(get_session)) -> Sequence[Order]:
    if user_id is None:
        request = select(Order)
    else:
        request = select(Order).where(Order.user_id == user_id.public_id)
    orders = (await session.execute(request)).scalars().all()

    return orders
