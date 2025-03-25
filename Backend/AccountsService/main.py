from fastapi import FastAPI

from database.database import init_db
from routes.admins import admin_router
from routes.docs import add_docs
from routes.users import user_router
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(
    title="Accounts Service",
    description = "Accounts Service",
    version="1.0.0",
    docs_url=None,
    redoc_url=None
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

add_docs(app)

app.include_router(user_router, prefix="/users")
app.include_router(admin_router, prefix="/admins")

@app.on_event("startup")
async def on_startup():
    await init_db()


@app.get("/")
async def root():
    return {"message": "Hello World"}
