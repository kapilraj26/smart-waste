from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    APP_NAME: str = "SmartWaste AI"
    # Postgres is the primary store. Register writes here, login reads here.
    # Example: postgresql://postgres:postgres@localhost:5432/smartwaste
    DATABASE_URL: str = "postgresql://postgres:postgres@localhost:5432/smartwaste"
    SECRET_KEY: str = "change-me-to-a-long-random-secret"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24

    class Config:
        env_file = ".env"


settings = Settings()
