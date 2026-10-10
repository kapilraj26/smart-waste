from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    APP_NAME: str = "SmartWaste AI"
    # Postgres is the primary store. Register writes here, login reads here.
    # Example: postgresql://postgres:postgres@localhost:5432/smartwaste
    DATABASE_URL: str = "postgresql://postgres:postgres@localhost:5432/smartwaste"
    SECRET_KEY: str = "change-me-to-a-long-random-secret"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24
    # Ollama (local LLM). Default model is the text-only llama3.2:3b, so the
    # scanner extracts image features and Llama reasons over them. If a vision
    # model (llava, moondream, qwen2.5vl, llama3.2-vision) is configured, the
    # raw photo is sent to it directly.
    OLLAMA_URL: str = "http://localhost:11434"
    OLLAMA_MODEL: str = "llama3.2:3b"
    OLLAMA_TIMEOUT_S: int = 180

    class Config:
        env_file = ".env"


settings = Settings()
