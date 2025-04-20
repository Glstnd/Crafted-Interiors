import json
from typing import Sequence, Optional

from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form
from pydantic import ValidationError
from sqlmodel import select
from sqlmodel.ext.asyncio.session import AsyncSession

from database.database import get_session
from models import Catalog, CatalogRequestResponse, CatalogUpdateResponse
from s3_storage.storage import s3_client

catalog_router = APIRouter()

@catalog_router.get("/catalogs", response_model=Sequence[Catalog])
async def get_catalogs(session: AsyncSession = Depends(get_session)) -> Sequence[Catalog]:
    request = select(Catalog)
    result = await session.execute(request)

    return result.scalars().all()

@catalog_router.post("/catalogs", response_model=CatalogRequestResponse, status_code=201)
async def create_catalog(catalog_request = Form(...), file: Optional[UploadFile] = File(None), session: AsyncSession = Depends(get_session)) -> CatalogRequestResponse:
    try:
        # Десериализуем JSON-строку в словарь
        catalog_data = json.loads(catalog_request)
        # Валидируем данные через модель Pydantic
        catalog_model = CatalogRequestResponse(**catalog_data)
    except json.JSONDecodeError:
        raise HTTPException(status_code=422, detail="Invalid JSON format in catalog_request")
    except ValidationError as e:
        raise HTTPException(status_code=422, detail=str(e))

    catalog = Catalog(**catalog_model.dict())

    if file is not None:
        await s3_client.upload_file(file, f"catalogs/{catalog.tag}")

        file_spec = file.filename.split(".")[-1]
        catalog.image_path = f"catalogs/{catalog.tag}.{file_spec}"

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

@catalog_router.get("/catalogs/{tag}")
async def get_catalog_by_tag(tag: str, session: AsyncSession = Depends(get_session)) -> CatalogRequestResponse:
    request = select(Catalog).where(Catalog.tag == tag)
    result = await session.execute(request)
    catalog = result.scalar_one_or_none()
    if catalog is None:
        raise HTTPException(status_code=404, detail="Catalog not found")

    return CatalogRequestResponse.model_validate(catalog)

@catalog_router.post("/catalogs/{tag}/upload")
async def upload_catalog_photo(tag: str, file: UploadFile, session: AsyncSession = Depends(get_session)) -> CatalogRequestResponse:
    request = select(Catalog).where(Catalog.tag == tag)
    result = await session.execute(request)
    catalog: Catalog | None = result.scalar_one_or_none()
    if catalog is None:
        raise HTTPException(status_code=404, detail="Catalog not found")

    await s3_client.upload_file(file, f"catalogs/{catalog.tag}")

    file_spec = file.filename.split(".")[-1]
    catalog.image_path = f"catalogs/{catalog.tag}.{file_spec}"

    session.add(catalog)
    await session.commit()
    await session.refresh(catalog)
    return CatalogRequestResponse.model_validate(catalog)
