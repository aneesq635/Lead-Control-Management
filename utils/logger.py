"""
utils/logger.py
───────────────
Centralised, structured logger for the AI Brain Module.
Uses Python's built-in logging with a clean, production-friendly format.
"""

import logging
import sys
from config import config


def get_logger(name: str) -> logging.Logger:
    """
    Return a configured logger instance.

    Usage
    -----
    from utils.logger import get_logger
    logger = get_logger(__name__)
    logger.info("message")
    """
    logger = logging.getLogger(name)

    if logger.handlers:
        return logger  # already configured — avoid duplicate handlers

    logger.setLevel(getattr(logging, config.LOG_LEVEL.upper(), logging.INFO))

    handler = logging.StreamHandler(sys.stdout)
    formatter = logging.Formatter(
        fmt="%(asctime)s | %(levelname)-8s | %(name)s | %(message)s",
        datefmt="%Y-%m-%d %H:%M:%S",
    )
    handler.setFormatter(formatter)
    logger.addHandler(handler)
    logger.propagate = False

    return logger
