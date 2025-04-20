from datetime import datetime
from typing import Sequence, Annotated

from fastapi import APIRouter, Depends, Query, HTTPException
from sqlmodel import select
from sqlmodel.ext.asyncio.session import AsyncSession
from starlette import status

from database.database import get_session
from models import Order, OrderUserQuery, OrderCreate, Product, OrderItem

order_router = APIRouter()

@order_router.get("", response_model=Sequence[Order])
async def get_orders(user_id: Annotated[OrderUserQuery, Query()], session: AsyncSession = Depends(get_session)) -> Sequence[Order]:
    if user_id is None:
        request = select(Order)
    else:
        request = select(Order).where(Order.user_id == user_id.public_id)
    orders = (await session.execute(request)).scalars().all()

    return orders

@order_router.post("", response_model=Order, status_code=status.HTTP_201_CREATED)
async def create_order(order_data: OrderCreate, session: AsyncSession = Depends(get_session)) -> Order:
    calculated_total = sum(item.quantity * item.unit_price for item in order_data.items)
    if round(calculated_total, 2) != round(order_data.total_amount, 2):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Итоговая сумма не совпадает с суммой товаров"
        )

    product_tags = [item.product_tag for item in order_data.items]
    product_query = select(Product).where(Product.tag.in_(product_tags))
    products = (await session.execute(product_query)).scalars().all()

    if len(products) != len(product_tags):
        found_tags = {product.tag for product in products}
        missing_tags = set(product_tags) - found_tags
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Товары с тегами {missing_tags} не найдены"
        )

    product_dict = {product.tag: product for product in products}

    for item in order_data.items:
        product = product_dict[item.product_tag]
        if round(item.unit_price, 2) != round(product.price, 2):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Цена товара с тегом {item.product_tag} не совпадает с текущей ценой"
            )

    db_order = Order(
        user_id=order_data.public_id,
        total_amount=order_data.total_amount,
        status="pending",
        created_at=datetime.utcnow()
    )
    session.add(db_order)
    await session.flush()

    for item in order_data.items:
        product = product_dict[item.product_tag]
        db_order_item = OrderItem(
            order_id=db_order.id,
            product_id=product.id,
            quantity=item.quantity,
            unit_price=item.unit_price
        )
        session.add(db_order_item)

    await session.commit()
    await session.refresh(db_order)

    return db_order