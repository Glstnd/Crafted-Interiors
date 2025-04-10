from fastapi import APIRouter, Depends
from sqlmodel import select
from sqlmodel.ext.asyncio.session import AsyncSession
from shapely.wkt import loads as wkt_loads

from database.database import get_session
from models import StoreCreate, StorePublic, Store

store_router = APIRouter()


@store_router.post("/stores/", response_model=StorePublic)
async def create_store(store: StoreCreate, session: AsyncSession = Depends(get_session)):
    # Создаем объект магазина с координатами в формате POINT
    db_store = Store(
        name=store.name,
        address=store.address,
        location=f"POINT({store.longitude} {store.latitude})"
    )
    session.add(db_store)
    await session.commit()
    await session.refresh(db_store)

    # Извлекаем координаты из location с помощью shapely
    point = wkt_loads(str(db_store.location))
    longitude, latitude = point.x, point.y

    return StorePublic(
        id=db_store.id,
        name=db_store.name,
        address=db_store.address,
        latitude=latitude,
        longitude=longitude
    )


@store_router.get("/stores/", response_model=list[StorePublic])
async def get_stores(session: AsyncSession = Depends(get_session)):
    # Получаем все магазины
    stores = (await session.execute(select(Store))).scalars().all()
    result = []

    for store in stores:
        # Извлекаем координаты из location с помощью shapely
        point = wkt_loads(str(store.location))
        longitude, latitude = point.x, point.y

        result.append(
            StorePublic(
                id=store.id,
                name=store.name,
                address=store.address,
                latitude=latitude,
                longitude=longitude
            )
        )
    return result