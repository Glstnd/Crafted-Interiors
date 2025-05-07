from datetime import timedelta

from authx import AuthXConfig, AuthX

from models import User

config = AuthXConfig()
config.JWT_ALGORITHM = "HS256"
config.JWT_SECRET_KEY = "kljDSALKGhj167"
config.JWT_TOKEN_LOCATION = ["headers", "cookies"]
config.JWT_ACCESS_TOKEN_EXPIRES = timedelta(days=10)
config.JWT_HEADER_NAME = "access"
config.JWT_HEADER_TYPE = ""

security = AuthX(config=config, model=User)
