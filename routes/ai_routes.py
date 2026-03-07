"""
routes/ai_routes.py
────────────────────
Flask Blueprint exposing the AI Brain API endpoints.

Endpoints
---------
POST /ai/process-message   — Main lead qualification pipeline
GET  /ai/status            — Health / liveness check
"""

from __future__ import annotations

import time
from functools import wraps
from typing import Callable

from flask import Blueprint, jsonify, request, Response
from pydantic import ValidationError

from agents.lead_agent import LeadAgent
from models.lead_schema import ProcessMessageRequest
from utils.logger import get_logger

logger = get_logger(__name__)

ai_bp = Blueprint("ai", __name__, url_prefix="/ai")

# Module-level agent singleton (one instance per worker process)
_agent: LeadAgent | None = None


def _get_agent() -> LeadAgent:
    """Lazy-initialise the LeadAgent (avoids startup cost if not used)."""
    global _agent
    if _agent is None:
        _agent = LeadAgent()
        logger.info("LeadAgent initialised")
    return _agent


# ── Decorator helpers ─────────────────────────────────────────────────────────

def _timed(fn: Callable) -> Callable:
    """Log request duration for every decorated route."""
    @wraps(fn)
    def wrapper(*args, **kwargs):
        start = time.perf_counter()
        response = fn(*args, **kwargs)
        elapsed_ms = (time.perf_counter() - start) * 1000
        logger.info("%s completed in %.1f ms", fn.__name__, elapsed_ms)
        return response
    return wrapper


# ── Routes ────────────────────────────────────────────────────────────────────

@ai_bp.route("/status", methods=["GET"])
def status() -> Response:
    """
    GET /ai/status
    ──────────────
    Liveness probe — returns immediately without touching the LLM.

    Response 200:
        { "status": "running" }
    """
    return jsonify({"status": "running"}), 200


@ai_bp.route("/process-message", methods=["POST"])
@_timed
def process_message() -> Response:
    """
    POST /ai/process-message
    ────────────────────────
    Main AI pipeline endpoint. Receives a customer WhatsApp message
    and returns a structured AI reply with intent, extracted lead data,
    and lead score.

    Request body (JSON):
    {
        "workspace_id":    "ws_abc123",
        "phone":           "+923001234567",
        "message":         "I'm looking for a 5 marla house in DHA",
        "conversation_id": "conv_xyz789"
    }

    Response 200:
    {
        "reply":          "Great! What is your approximate budget?",
        "intent":         "property_search",
        "extracted_data": {
            "name":          null,
            "budget":        null,
            "area":          "DHA",
            "property_type": "house",
            "size":          "5 marla",
            "purpose":       null
        },
        "lead_score": 55
    }
    """
    # ── Parse & validate request body ────────────────────────────────────────
    body = request.get_json(silent=True)

    if not body:
        return jsonify({
            "error": "Request body must be valid JSON.",
            "code": "INVALID_JSON",
        }), 400

    try:
        req = ProcessMessageRequest(**body)
    except ValidationError as exc:
        errors = exc.errors()
        logger.warning("Request validation failed: %s", errors)
        return jsonify({
            "error": "Request validation failed.",
            "code":  "VALIDATION_ERROR",
            "details": [
                {"field": ".".join(str(loc) for loc in e["loc"]), "msg": e["msg"]}
                for e in errors
            ],
        }), 422

    # ── Run AI pipeline ───────────────────────────────────────────────────────
    try:
        agent    = _get_agent()
        response = agent.process(req)
    except Exception as exc:
        logger.exception("LeadAgent.process raised an unexpected error: %s", exc)
        return jsonify({
            "error": "An internal AI processing error occurred.",
            "code":  "AI_ERROR",
        }), 500

    # ── Serialise & return ────────────────────────────────────────────────────
    return jsonify(response.model_dump()), 200


# ── Error handlers scoped to this blueprint ───────────────────────────────────

@ai_bp.errorhandler(404)
def not_found(exc) -> Response:
    return jsonify({"error": "Endpoint not found.", "code": "NOT_FOUND"}), 404


@ai_bp.errorhandler(405)
def method_not_allowed(exc) -> Response:
    return jsonify({"error": "Method not allowed.", "code": "METHOD_NOT_ALLOWED"}), 405
