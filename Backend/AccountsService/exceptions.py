

from authx.exceptions import MissingTokenError
from fastapi import FastAPI
from starlette import status
from starlette.requests import Request
from starlette.responses import JSONResponse


def exceptions_handlers(app: FastAPI):
    @app.exception_handler(MissingTokenError)
    async def http_exception_handler(request: Request, exc: MissingTokenError):
        return JSONResponse(
            {"error": "Admin not authorized"},
            status_code=status.HTTP_401_UNAUTHORIZED)