"""
services/extraction_service.py
───────────────────────────────
Extracts structured lead fields from a customer message using an LLM.
Merges new data with existing lead data (never overwrites filled fields
with null values).
"""

from __future__ import annotations

import json
import re
from typing import Any

from langchain_openai import ChatOpenAI

from config import config
from models.lead_schema import ExtractedLeadData, PropertyType, Purpose
from prompts.lead_prompt import EXTRACTION_PROMPT
from utils.logger import get_logger

logger = get_logger(__name__)


def _clean_json(raw: str) -> str:
    """Strip markdown fences and leading/trailing whitespace from LLM output."""
    raw = raw.strip()
    raw = re.sub(r"^```(?:json)?", "", raw)
    raw = re.sub(r"```$", "", raw)
    return raw.strip()


def _safe_enum(enum_cls, value: Any):
    """Return enum member or None if value is invalid."""
    if value is None:
        return None
    try:
        return enum_cls(str(value).lower())
    except ValueError:
        return None


class ExtractionService:
    """Extracts and merges structured lead data from customer messages."""

    def __init__(self) -> None:
        self._llm = ChatOpenAI(
            model=config.OPENAI_MODEL,
            temperature=0.0,
            max_tokens=300,
            api_key=config.OPENAI_API_KEY,
        )
        self._chain = EXTRACTION_PROMPT | self._llm

    def extract(
        self,
        message: str,
        existing: ExtractedLeadData | None = None,
    ) -> ExtractedLeadData:
        """
        Extract lead fields from `message` and merge with `existing`.

        Parameters
        ----------
        message  : Raw customer message.
        existing : Previously extracted data (may be partially filled).

        Returns
        -------
        ExtractedLeadData — merged, updated lead data.
        """
        existing = existing or ExtractedLeadData()
        existing_json = existing.model_dump_json(indent=2)

        try:
            result = self._chain.invoke(
                {"message": message, "existing_data": existing_json}
            )
            cleaned = _clean_json(result.content)
            raw_dict: dict = json.loads(cleaned)
        except (json.JSONDecodeError, Exception) as exc:
            logger.warning("Extraction LLM failed (%s) — returning existing data", exc)
            return existing

        # ── Merge: new values overwrite only if existing field is empty ──────
        merged = existing.model_dump()

        for field in ["name", "budget", "area", "size"]:
            new_val = raw_dict.get(field)
            if new_val and not merged.get(field):
                merged[field] = str(new_val).strip()

        # Enum fields need special handling
        new_pt = _safe_enum(PropertyType, raw_dict.get("property_type"))
        if new_pt and (not merged.get("property_type") or merged["property_type"] == "unknown"):
            merged["property_type"] = new_pt.value

        new_purpose = _safe_enum(Purpose, raw_dict.get("purpose"))
        if new_purpose and (not merged.get("purpose") or merged["purpose"] == "unknown"):
            merged["purpose"] = new_purpose.value

        try:
            return ExtractedLeadData(**merged)
        except Exception as exc:
            logger.error("Failed to build ExtractedLeadData from merged dict: %s", exc)
            return existing
