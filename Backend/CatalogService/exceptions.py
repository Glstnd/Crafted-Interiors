import logging

from fastapi import FastAPI, HTTPException
from starlette.requests import Request


def exceptions_handlers(app: FastAPI):
    @app.exception_handler(HTTPException)
    async def http_exception_handler(request: Request, exc: HTTPException):
        print(request.json())
        logging.info(request.json())
        raise exc