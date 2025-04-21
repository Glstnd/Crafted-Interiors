from datetime import datetime
from decimal import Decimal
from typing import Sequence, Annotated

from fastapi import APIRouter, Depends, Query, HTTPException
from sqlalchemy import delete
from sqlalchemy.orm import selectinload
from sqlmodel import select
from sqlmodel.ext.asyncio.session import AsyncSession
from starlette import status

from database.database import get_session
from models import Order, OrderUserQuery, OrderCreate, Product, OrderItem, OrderFullResponse

order_router = APIRouter()

@order_router.get("", response_model=Sequence[Order])
async def get_orders(user_id: Annotated[OrderUserQuery, Query()], session: AsyncSession = Depends(get_session)) -> Sequence[Order]:
    if user_id.public_id is None:
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


@order_router.get("/{order_id}", response_model=OrderFullResponse)
async def get_order(order_id: int, session: AsyncSession = Depends(get_session)) -> OrderFullResponse:
    request = select(Order).options(selectinload(Order.items)).where(Order.id == order_id)
    result = await session.execute(request)
    order = result.scalars().first()

    if not order:
        raise HTTPException(status_code=404, detail="Заказ не найден")

    return OrderFullResponse.model_validate(order)


@order_router.put("/{order_id}", response_model=OrderFullResponse, status_code=status.HTTP_200_OK)
async def update_order(order_id: int, order_data: OrderFullResponse,
                       session: AsyncSession = Depends(get_session)) -> OrderFullResponse:
    # Находим заказ по ID
    order_query = select(Order).where(Order.id == order_id)
    result = await session.execute(order_query)
    db_order = result.scalars().first()

    if not db_order:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Заказ с ID {order_id} не найден"
        )

    # Проверяем итоговую сумму
    calculated_total = sum(item.quantity * item.unit_price for item in order_data.items)
    if round(Decimal(calculated_total), 2) != round(Decimal(order_data.total_amount), 2):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Итоговая сумма не совпадает с суммой товаров"
        )

    # Проверяем наличие товаров и совпадение цен
    product_ids = [item.product_id for item in order_data.items]
    product_query = select(Product).where(Product.id.in_(product_ids))
    result = await session.execute(product_query)
    products = result.scalars().all()

    if len(products) != len(product_ids):
        found_ids = {product.id for product in products}
        missing_ids = set(product_ids) - found_ids
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Товары с ID {missing_ids} не найдены"
        )

    product_dict = {product.id: product for product in products}

    for item in order_data.items:
        product = product_dict[item.product_id]
        if round(Decimal(item.unit_price), 2) != round(Decimal(product.price), 2):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Цена товара с ID {item.product_id} не совпадает с текущей ценой"
            )

    # Валидация статуса
    valid_statuses = {"pending", "processing", "shipped", "completed"}
    if order_data.status and order_data.status not in valid_statuses:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Недопустимый статус: {order_data.status}. Допустимые значения: {valid_statuses}"
        )

    # Проверяем public_id
    if order_data.user_id and order_data.user_id != db_order.user_id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Идентификатор пользователя не соответствует заказу"
        )

    # Удаляем существующие элементы заказа
    request = delete(OrderItem).where(OrderItem.order_id == order_id)
    await session.execute(request)

    # Обновляем поля заказа
    db_order.total_amount = order_data.total_amount
    db_order.status = order_data.status if order_data.status else db_order.status

    # Добавляем новые элементы заказа
    for item in order_data.items:
        product = product_dict[item.product_id]
        db_order_item = OrderItem(
            order_id=db_order.id,
            product_id=product.id,
            quantity=item.quantity,
            unit_price=item.unit_price
        )
        session.add(db_order_item)

    await session.commit()
    await session.refresh(db_order)

    # Загружаем элементы заказа для ответа
    order_query = select(Order).where(Order.id == order_id)
    result = await session.execute(order_query)
    db_order = result.scalars().first()

    return db_order


