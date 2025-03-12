from fastapi import FastAPI

from database.database import init_db
from routes.docs import add_docs
from routes.users import user_router

app = FastAPI(
    title="Accounts Service",
    description = "Accounts Service",
    version="1.0.0",
    docs_url=None,
    redoc_url=None
)
add_docs(app)

app.include_router(user_router, prefix="/users")

@app.on_event("startup")
async def on_startup():
    await init_db()


@app.get("/")
async def root():
    return {"message": "Hello World"}
