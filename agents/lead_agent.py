"""
agents/lead_agent.py
─────────────────────
The core AI orchestration agent for the Lead Control Management System.

This agent:
  1. Maintains per-conversation memory (Redis-backed with in-memory fallback).
  2. Calls sub-services for intent detection, extraction, scoring, and next question.
  3. Makes a single master LLM call to generate a context-aware, JSON-structured reply.
  4. Merges all outputs into a ProcessMessageResponse.
"""

from __future__ import annotations

import json
import re
from typing import Any

from langchain_openai import ChatOpenAI
from langchain.memory import ConversationBufferWindowMemory
from langchain.schema import HumanMessage, AIMessage

from config import config
from models.lead_schema import (
    ExtractedLeadData,
    Intent,
    ProcessMessageRequest,
    ProcessMessageResponse,
    PropertyType,
    Purpose,
)
from prompts.lead_prompt import AGENT_SYSTEM_PROMPT, FULL_AGENT_PROMPT
from services.intent_service import IntentService
from services.extraction_service import ExtractionService
from services.scoring_service import ScoringService
from services.question_service import QuestionService
from utils.logger import get_logger

logger = get_logger(__name__)


# ── In-process conversation store (fallback when Redis is unavailable) ────────
_MEMORY_STORE: dict[str, dict[str, Any]] = {}


def _get_conversation_state(conversation_id: str) -> dict[str, Any]:
    """Retrieve stored conversation state (lead data + history)."""
    return _MEMORY_STORE.get(
        conversation_id,
        {
            "lead_data":    {},
            "history":      [],   # list of {"role": "user"|"ai", "content": str}
            "message_count": 0,
        },
    )


def _save_conversation_state(conversation_id: str, state: dict[str, Any]) -> None:
    """Persist conversation state in memory."""
    _MEMORY_STORE[conversation_id] = state


def _format_history(history: list[dict]) -> str:
    """Convert history list to a readable string for the prompt."""
    if not history:
        return "(no prior conversation)"
    lines = []
    for turn in history[-10:]:   # keep last 10 turns to stay within context limits
        role = "Customer" if turn["role"] == "user" else "Agent"
        lines.append(f"{role}: {turn['content']}")
    return "\n".join(lines)


def _clean_json(raw: str) -> str:
    """Strip markdown fences from LLM output."""
    raw = raw.strip()
    raw = re.sub(r"^```(?:json)?", "", raw)
    raw = re.sub(r"```$", "", raw)
    return raw.strip()


def _safe_enum(enum_cls, value):
    if value is None:
        return None
    try:
        return enum_cls(str(value).lower())
    except ValueError:
        return None


class LeadAgent:
    """
    Orchestrates the full AI pipeline for lead qualification.

    Pipeline
    --------
    message → intent detection → extraction → scoring → next-question →
    master LLM call → structured JSON response
    """

    def __init__(self) -> None:
        # Sub-services
        self._intent_svc    = IntentService()
        self._extract_svc   = ExtractionService()
        self._scoring_svc   = ScoringService()
        self._question_svc  = QuestionService()

        # Master LLM (higher token budget for reply generation)
        self._llm = ChatOpenAI(
            model=config.OPENAI_MODEL,
            temperature=config.OPENAI_TEMPERATURE,
            max_tokens=config.OPENAI_MAX_TOKENS,
            api_key=config.OPENAI_API_KEY,
        )

    # ── Public entry point ────────────────────────────────────────────────────

    def process(self, req: ProcessMessageRequest) -> ProcessMessageResponse:
        """
        Full lead-qualification pipeline for one incoming message.

        Parameters
        ----------
        req : Validated incoming request from the Communication Module.

        Returns
        -------
        ProcessMessageResponse — structured AI reply ready for WhatsApp.
        """
        logger.info(
            "Processing message | workspace=%s conversation=%s",
            req.workspace_id,
            req.conversation_id,
        )

        # ── 1. Load conversation state ────────────────────────────────────────
        state = _get_conversation_state(req.conversation_id)
        is_returning = state["message_count"] > 0

        existing_lead = ExtractedLeadData(**state["lead_data"]) if state["lead_data"] else None

        # ── 2. Detect intent ──────────────────────────────────────────────────
        intent = self._intent_svc.detect(req.message)
        logger.info("Intent detected: %s", intent.value)

        # ── 3. Extract / merge lead data ──────────────────────────────────────
        updated_lead = self._extract_svc.extract(req.message, existing_lead)
        logger.info("Lead fields filled: %s", updated_lead.filled_fields())

        # ── 4. Score the lead ─────────────────────────────────────────────────
        lead_score = self._scoring_svc.calculate(updated_lead, is_returning_user=is_returning)

        # ── 5. Decide next question ───────────────────────────────────────────
        next_question = self._question_svc.next_question(updated_lead)

        # ── 6. Master LLM call — generate final reply ─────────────────────────
        reply = self._generate_reply(
            message       = req.message,
            intent        = intent,
            lead          = updated_lead,
            lead_score    = lead_score,
            next_question = next_question,
            history       = state["history"],
            is_returning  = is_returning,
        )

        # ── 7. Persist updated state ──────────────────────────────────────────
        state["history"].append({"role": "user", "content": req.message})
        state["history"].append({"role": "ai",   "content": reply})
        state["lead_data"]     = updated_lead.model_dump()
        state["message_count"] += 1
        _save_conversation_state(req.conversation_id, state)

        logger.info("Response ready | score=%d intent=%s", lead_score, intent.value)

        return ProcessMessageResponse(
            reply          = reply,
            intent         = intent,
            extracted_data = updated_lead,
            lead_score     = lead_score,
        )

    # ── Private helpers ───────────────────────────────────────────────────────

    def _generate_reply(
        self,
        message:       str,
        intent:        Intent,
        lead:          ExtractedLeadData,
        lead_score:    int,
        next_question: str | None,
        history:       list[dict],
        is_returning:  bool,
    ) -> str:
        """
        Call the master LLM to generate a context-aware reply.
        Falls back to the pre-computed next_question if the LLM fails.
        """
        existing_lead_json = json.dumps(lead.model_dump(), indent=2, default=str)
        history_str        = _format_history(history)

        # Inject next_question hint into system prompt
        hint = ""
        if next_question:
            hint = f"\n\nNEXT QUESTION TO ASK (use this naturally in your reply): {next_question}"
        elif not lead.missing_fields():
            hint = "\n\nAll fields collected. Thank the customer and offer to connect them with an agent."

        full_system = AGENT_SYSTEM_PROMPT + hint

        prompt_text = FULL_AGENT_PROMPT.format(
            system_prompt        = full_system,
            conversation_history = history_str,
            existing_lead_data   = existing_lead_json,
            is_returning_user    = str(is_returning),
            current_message      = message,
        )

        try:
            result = self._llm.invoke([HumanMessage(content=prompt_text)])
            cleaned = _clean_json(result.content)
            parsed  = json.loads(cleaned)
            reply   = parsed.get("reply", "").strip()

            if reply:
                return reply
        except Exception as exc:
            logger.error("Master LLM call failed: %s", exc)

        # Graceful fallback
        if next_question:
            return next_question
        if not lead.missing_fields():
            name = lead.name or "there"
            return (
                f"Thank you, {name}! We have all the information we need. "
                "Our agent will be in touch with you shortly. 😊"
            )
        return "Thank you for reaching out! Could you share a little more about what you're looking for?"
