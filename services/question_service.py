"""
services/question_service.py
─────────────────────────────
Decides the NEXT best question to ask the customer based on which
lead fields are still missing. Uses LLM for natural phrasing with
a hardcoded fallback matrix for resilience.
"""

from __future__ import annotations

from langchain_openai import ChatOpenAI

from config import config
from models.lead_schema import ExtractedLeadData
from prompts.lead_prompt import NEXT_QUESTION_PROMPT
from utils.logger import get_logger

logger = get_logger(__name__)

# ── Priority order for collecting fields ──────────────────────────────────────
COLLECTION_PRIORITY = ["name", "purpose", "property_type", "area", "size", "budget"]

# ── Fallback questions (when LLM is unavailable) ──────────────────────────────
_FALLBACK_QUESTIONS: dict[str, str] = {
    "name":          "May I know your good name, please?",
    "purpose":       "Are you looking to buy, rent, or invest in a property?",
    "property_type": "What type of property are you interested in — house, apartment, plot, or commercial?",
    "area":          "Which area or location do you prefer? (e.g. DHA, Bahria Town, Gulberg)",
    "size":          "What size of property are you looking for? (e.g. 5 marla, 10 marla, 1 kanal)",
    "budget":        "What is your approximate budget range? (e.g. 50 lakh, 1 crore)",
}


class QuestionService:
    """Generates the next conversational question to collect missing lead data."""

    def __init__(self) -> None:
        self._llm = ChatOpenAI(
            model=config.OPENAI_MODEL,
            temperature=0.7,   # slightly creative for natural phrasing
            max_tokens=80,
            api_key=config.OPENAI_API_KEY,
        )
        self._chain = NEXT_QUESTION_PROMPT | self._llm

    def next_question(self, lead: ExtractedLeadData) -> str | None:
        """
        Return the next question to ask, or None if all fields are filled.

        Parameters
        ----------
        lead : Current state of extracted lead data.

        Returns
        -------
        str | None — Question text, or None if nothing is missing.
        """
        missing = lead.missing_fields()
        if not missing:
            return None   # all done — agent can wrap up

        # Sort missing fields by collection priority
        ordered_missing = sorted(
            missing,
            key=lambda f: COLLECTION_PRIORITY.index(f) if f in COLLECTION_PRIORITY else 99,
        )
        next_field = ordered_missing[0]
        known = lead.filled_fields()

        try:
            result = self._chain.invoke(
                {
                    "missing_fields": ", ".join(ordered_missing),
                    "known_fields":   ", ".join(known) if known else "none yet",
                    "customer_name":  lead.name or "the customer",
                }
            )
            question = result.content.strip()
            if question:
                return question
        except Exception as exc:
            logger.warning("QuestionService LLM failed (%s) — using fallback", exc)

        return _FALLBACK_QUESTIONS.get(next_field, "Could you share a bit more about what you're looking for?")
