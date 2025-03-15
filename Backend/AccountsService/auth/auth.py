from authx import AuthXConfig, AuthX

from models import User

config = AuthXConfig()
config.JWT_ALGORITHM = "HS256"
config.JWT_SECRET_KEY = "kljDSALKGhj167"
config.JWT_TOKEN_LOCATION = ["cookies"]

security = AuthX(config=config, model=User)
