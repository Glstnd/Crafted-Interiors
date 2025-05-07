

from authx.exceptions import MissingTokenError
from fastapi import FastAPI
from starlette import status
from starlette.requests import Request
from starlette.responses import JSONResponse

from logs import logger


def exceptions_handlers(app: FastAPI):
    @app.exception_handler(MissingTokenError)
    async def http_exception_handler(request: Request, exc: MissingTokenError):
        logger.error(f"\n{request.method}\n{request.url}\n{exc}\n{request.headers}")
        return JSONResponse(
            {"error": "Admin not authorized"},
            status_code=status.HTTP_401_UNAUTHORIZED)