import os

class Settings:
    SECRET_KEY: str = os.getenv("SECRET_KEY", "compfest_super_secret_key_change_me_in_production")
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 7  # 1 week
    DATABASE_URL: str = os.getenv("DATABASE_URL", "sqlite:///./compfest_db.sqlite")

settings = Settings()
