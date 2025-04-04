from fastapi import FastAPI

from database.database import init_db
from routes.catalog import catalog_router
from routes.docs import add_docs
from fastapi.middleware.cors import CORSMiddleware

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
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

add_docs(app)
app.include_router(catalog_router)

@app.on_event("startup")
async def on_startup():
    await init_db()
