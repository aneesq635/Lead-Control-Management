"""
config.py
─────────
Centralised configuration for the AI Brain Module.
All settings are loaded from environment variables (via .env).
"""

import os
from dotenv import load_dotenv

load_dotenv()


class Config:
    # ── Flask ────────────────────────────────────────────────────────────────
    SECRET_KEY: str = os.getenv("SECRET_KEY", "change-me-in-production")
    DEBUG: bool = os.getenv("FLASK_DEBUG", "false").lower() == "true"
    PORT: int = int(os.getenv("PORT", 5050))

    # ── OpenAI ───────────────────────────────────────────────────────────────
    OPENAI_API_KEY: str = os.getenv("OPENAI_API_KEY", "")
    OPENAI_MODEL: str = os.getenv("OPENAI_MODEL", "gpt-4o")
    OPENAI_TEMPERATURE: float = float(os.getenv("OPENAI_TEMPERATURE", 0.3))
    OPENAI_MAX_TOKENS: int = int(os.getenv("OPENAI_MAX_TOKENS", 1024))

    # ── Redis (conversation memory) ──────────────────────────────────────────
    REDIS_URL: str = os.getenv("REDIS_URL", "redis://localhost:6379/0")
    MEMORY_TTL: int = int(os.getenv("MEMORY_TTL_SECONDS", 86400))  # 24 h

    # ── Logging ──────────────────────────────────────────────────────────────
    LOG_LEVEL: str = os.getenv("LOG_LEVEL", "INFO")

    # ── Lead Scoring Weights ─────────────────────────────────────────────────
    SCORE_BUDGET: int = 25
    SCORE_AREA: int = 20
    SCORE_PROPERTY_TYPE: int = 15
    SCORE_SIZE: int = 20
    SCORE_RETURNING_USER: int = 20

    @classmethod
    def validate(cls) -> None:
        """Raise early if critical env-vars are missing."""
        if not cls.OPENAI_API_KEY:
            raise EnvironmentError(
                "OPENAI_API_KEY is not set. "
                "Please copy .env.example → .env and fill it in."
            )


config = Config()
