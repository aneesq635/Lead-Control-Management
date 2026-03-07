"""
app.py
──────
AI Brain Module — Flask application factory & entry point.

Run locally:
    python app.py

Run with Gunicorn (production):
    gunicorn -w 2 -b 0.0.0.0:5050 "app:create_app()"
"""

from __future__ import annotations

import os
import sys

from flask import Flask, jsonify
from flask_cors import CORS

from config import config
from routes.ai_routes import ai_bp
from utils.logger import get_logger

logger = get_logger(__name__)


def create_app() -> Flask:
    """
    Application factory.

    Returns a fully configured Flask application with:
      - CORS enabled (restrict origins in production via environment vars)
      - AI blueprint registered at /ai/*
      - Global error handlers
    """
    # Validate critical environment variables early
    try:
        config.validate()
    except EnvironmentError as exc:
        logger.critical("❌  Configuration error: %s", exc)
        sys.exit(1)

    app = Flask(__name__)
    app.config["SECRET_KEY"] = config.SECRET_KEY
    app.config["JSON_SORT_KEYS"] = False   # preserve key ordering in responses

    # ── CORS ──────────────────────────────────────────────────────────────────
    # In production, replace "*" with your Communication Module's domain.
    CORS(app, resources={r"/ai/*": {"origins": os.getenv("ALLOWED_ORIGINS", "*")}})

    # ── Blueprints ────────────────────────────────────────────────────────────
    app.register_blueprint(ai_bp)

    # ── Global error handlers ─────────────────────────────────────────────────
    @app.errorhandler(400)
    def bad_request(exc):
        return jsonify({"error": str(exc), "code": "BAD_REQUEST"}), 400

    @app.errorhandler(404)
    def not_found(exc):
        return jsonify({"error": "Resource not found.", "code": "NOT_FOUND"}), 404

    @app.errorhandler(500)
    def internal_error(exc):
        logger.exception("Unhandled 500 error: %s", exc)
        return jsonify({"error": "Internal server error.", "code": "SERVER_ERROR"}), 500

    # ── Root health check (non-AI) ────────────────────────────────────────────
    @app.route("/", methods=["GET"])
    def root():
        return jsonify({
            "service": "AI Brain Module",
            "version": "1.0.0",
            "docs":    "/ai/status",
        }), 200

    logger.info("✅  AI Brain Flask application created successfully")
    return app


# ── Entry point ───────────────────────────────────────────────────────────────

if __name__ == "__main__":
    application = create_app()
    application.run(
        host="0.0.0.0",
        port=config.PORT,
        debug=config.DEBUG,
    )
