from fastapi import FastAPI

from database.database import init_db
from exceptions import exceptions_handlers
from routes.catalog import catalog_router
from routes.category import category_router
from routes.docs import add_docs
from fastapi.middleware.cors import CORSMiddleware

from routes.main_product import main_product_router
from routes.order import order_router
from routes.product import product_router
from routes.store import store_router

app = FastAPI(
    title="Catalog Service",
    description = "Catalogs Service",
    version="1.0.0",
    docs_url=None,
    redoc_url=None
)

origins = [
    "http://localhost:5173",
    "https://localhost:5173",
    "http://localhost:5174",
    "https://localhost:5174",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

add_docs(app)
exceptions_handlers(app)
category_router.include_router(product_router, prefix="/categories/{category_tag}")
catalog_router.include_router(category_router, prefix="/catalogs/{catalog_tag}")
app.include_router(catalog_router)
app.include_router(store_router)
app.include_router(order_router, prefix="/orders")
app.include_router(main_product_router, prefix="/products")

@app.on_event("startup")
async def on_startup():
    await init_db()
