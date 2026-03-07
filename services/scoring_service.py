"""
services/scoring_service.py
────────────────────────────
Calculates a lead quality score (0-100) based on the fields extracted
from the conversation and whether the customer is a returning user.

Scoring rules (per spec):
  budget mentioned        → +25
  area mentioned          → +20
  property_type mentioned → +15
  size mentioned          → +20
  returning user          → +20
  ────────────────────────────
  Maximum possible        = 100
"""

from __future__ import annotations

from models.lead_schema import ExtractedLeadData
from config import config
from utils.logger import get_logger

logger = get_logger(__name__)


class ScoringService:
    """Stateless lead scorer — call `calculate` at any point in the pipeline."""

    @staticmethod
    def calculate(
        lead: ExtractedLeadData,
        is_returning_user: bool = False,
    ) -> int:
        """
        Compute a lead quality score.

        Parameters
        ----------
        lead             : Extracted lead data (may be partial).
        is_returning_user: True if this phone number has chatted before.

        Returns
        -------
        int — score clamped to [0, 100].
        """
        score = 0

        # Budget
        if lead.budget:
            score += config.SCORE_BUDGET
            logger.debug("Score +%d for budget (%s)", config.SCORE_BUDGET, lead.budget)

        # Area / Location
        if lead.area:
            score += config.SCORE_AREA
            logger.debug("Score +%d for area (%s)", config.SCORE_AREA, lead.area)

        # Property Type
        if lead.property_type and lead.property_type.value != "unknown":
            score += config.SCORE_PROPERTY_TYPE
            logger.debug("Score +%d for property_type (%s)", config.SCORE_PROPERTY_TYPE, lead.property_type)

        # Size
        if lead.size:
            score += config.SCORE_SIZE
            logger.debug("Score +%d for size (%s)", config.SCORE_SIZE, lead.size)

        # Returning user
        if is_returning_user:
            score += config.SCORE_RETURNING_USER
            logger.debug("Score +%d for returning user", config.SCORE_RETURNING_USER)

        final_score = max(0, min(100, score))
        logger.info("Lead score computed: %d", final_score)
        return final_score
