from fastapi import FastAPI

from database.database import init_db

app = FastAPI()

@app.on_event("startup")
async def on_startup():
    await init_db()

@app.get("/")
async def root():
    return {"message": "Hello World"}
