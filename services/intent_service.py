"""
services/intent_service.py
──────────────────────────
Detects the customer's intent from their message using an LLM call.
Falls back to rule-based detection if the LLM fails.
"""

from __future__ import annotations

import re
from langchain_openai import ChatOpenAI

from config import config
from models.lead_schema import Intent
from prompts.lead_prompt import INTENT_PROMPT
from utils.logger import get_logger

logger = get_logger(__name__)

# ── Keyword-based fallback ────────────────────────────────────────────────────

_KEYWORD_MAP: dict[Intent, list[str]] = {
    Intent.GREETING: [
        "hello", "hi", "salam", "assalam", "hey", "good morning",
        "good afternoon", "good evening", "السلام",
    ],
    Intent.PROPERTY_SEARCH: [
        "looking for", "need a", "want to buy", "want to rent", "searching",
        "find me", "chahiye", "dhundna", "property search",
    ],
    Intent.PRICE_INQUIRY: [
        "price", "cost", "rate", "how much", "kitna", "kimat", "budget",
        "amount", "charges",
    ],
    Intent.APPOINTMENT: [
    "visit", "appointment", "schedule", "meeting", "milna", "come",
    "see the property", "site visit",
    ],
    Intent.FOLLOW_UP: [
        "i told you", "as i said", "following up", "any update", "koi update",
        "back again", "returning",
    ],
}


def _keyword_fallback(message: str) -> Intent:
    """Simple keyword scan — used when LLM call fails."""
    lower = message.lower()
    for intent, keywords in _KEYWORD_MAP.items():
        if any(kw in lower for kw in keywords):
            return intent
    return Intent.UNKNOWN


# ── Main detector ─────────────────────────────────────────────────────────────

class IntentService:
    """Detects customer intent from a raw WhatsApp message."""

    def __init__(self) -> None:
        self._llm = ChatOpenAI(
            model=config.OPENAI_MODEL,
            temperature=0.0,  # deterministic for classification
            max_tokens=20,
            api_key=config.OPENAI_API_KEY,
        )
        self._chain = INTENT_PROMPT | self._llm

    def detect(self, message: str) -> Intent:
        """
        Detect intent from a message.

        Parameters
        ----------
        message : str
            Raw customer WhatsApp message.

        Returns
        -------
        Intent
            Detected intent enum value.
        """
        try:
            result = self._chain.invoke({"message": message})
            raw = result.content.strip().lower()

            # Remove any stray punctuation / whitespace
            raw = re.sub(r"[^a-z_]", "", raw)

            return Intent(raw)
        except (ValueError, Exception) as exc:
            logger.warning("LLM intent detection failed (%s) — using keyword fallback", exc)
            return _keyword_fallback(message)
