"""
models/lead_schema.py
─────────────────────
Pydantic v2 schemas for request/response validation and
structured lead data extracted from conversations.
"""

from __future__ import annotations

from enum import Enum
from typing import Optional
from pydantic import BaseModel, Field, field_validator


# ── Enums ────────────────────────────────────────────────────────────────────

class Intent(str, Enum):
    PROPERTY_SEARCH   = "property_search"
    PRICE_INQUIRY     = "price_inquiry"
    APPOINTMENT       = "appointment_request"
    GENERAL_INQUIRY   = "general_inquiry"
    FOLLOW_UP         = "follow_up"
    GREETING          = "greeting"
    UNKNOWN           = "unknown"


class PropertyType(str, Enum):
    HOUSE      = "house"
    APARTMENT  = "apartment"
    PLOT       = "plot"
    COMMERCIAL = "commercial"
    VILLA      = "villa"
    UNKNOWN    = "unknown"


class Purpose(str, Enum):
    BUY   = "buy"
    RENT  = "rent"
    SELL  = "sell"
    INVEST = "invest"
    UNKNOWN = "unknown"


# ── Extracted Lead Fields ────────────────────────────────────────────────────

class ExtractedLeadData(BaseModel):
    """Structured fields extracted from the customer's conversation."""

    name:          Optional[str]         = Field(None, description="Customer name")
    budget:        Optional[str]         = Field(None, description="Budget range (e.g. '1 crore', '50 lakh')")
    area:          Optional[str]         = Field(None, description="Preferred location/area (e.g. DHA, Gulberg)")
    property_type: Optional[PropertyType] = Field(None, description="Type of property desired")
    size:          Optional[str]         = Field(None, description="Property size (e.g. '5 marla', '10 marla', '1 kanal')")
    purpose:       Optional[Purpose]     = Field(None, description="Buy / Rent / Sell / Invest")

    def filled_fields(self) -> list[str]:
        """Return list of fields that have been collected."""
        return [
            field for field, value in self.model_dump().items()
            if value is not None and value not in ("unknown",)
        ]

    def missing_fields(self) -> list[str]:
        """Return list of key fields still missing."""
        key_fields = ["name", "budget", "area", "property_type", "size", "purpose"]
        return [f for f in key_fields if getattr(self, f) is None]


# ── API Request / Response ───────────────────────────────────────────────────

class ProcessMessageRequest(BaseModel):
    """Incoming payload from the Communication Module."""

    workspace_id:    str  = Field(..., min_length=1, description="Tenant / workspace identifier")
    phone:           str  = Field(..., min_length=7,  description="Customer WhatsApp number (E.164)")
    message:         str  = Field(..., min_length=1,  description="Raw customer message text")
    conversation_id: str  = Field(..., min_length=1,  description="Unique conversation thread ID")

    @field_validator("phone")
    @classmethod
    def phone_strip_spaces(cls, v: str) -> str:
        return v.replace(" ", "").strip()


class ProcessMessageResponse(BaseModel):
    """AI Brain response sent back to the Communication Module."""

    reply:          str              = Field(..., description="AI-generated reply message")
    intent:         Intent           = Field(..., description="Detected customer intent")
    extracted_data: ExtractedLeadData = Field(..., description="Structured lead fields extracted so far")
    lead_score:     int              = Field(..., ge=0, le=100, description="Lead quality score 0-100")
