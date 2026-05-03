import os
import json
import re
from langchain_openai import ChatOpenAI
from langchain_core.messages import SystemMessage, HumanMessage, AIMessage
from dotenv import load_dotenv
from rag_module.services.rag_service import retrieve_relevant_docs

load_dotenv()

OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")

# ──────────────────────────────────────────────
# System prompt for the Sales Agent
# ──────────────────────────────────────────────
SYSTEM_PROMPT = """
You are a professional Sales & Acquisition Assistant for a WhatsApp Lead Management System.
Your job is to communicate with customers, determine if they want to BUY or SELL property, and collect the necessary information.

## Personality
- Professional, polite, friendly, helpful, concise, business-focused
- Always sound like a human assistant, NEVER say "I am an AI"

## Knowledge Base Context
If a [KNOWLEDGE BASE] section is present, it contains REAL business inventory and rules.
- Use it to answer specific questions about available properties, pricing, sizes, etc.

## Customer Identity
You are automatically provided with the customer's phone number and name (if available) in the context above your prompt.
- DO NOT ask the customer for their phone number or name, as you already have it.
- Feel free to politely use their name in your greeting.

## Conversation Flow (STRICT)

### STEP 1 — Determine Intent (First message):
Greet the customer warmly and ask if they are looking to BUY or SELL a property.
Example: "Welcome! I'd love to help you with your property needs. Are you looking to buy a property or sell one today?"

### STEP 2 — Buyer Flow (If they want to buy):
Ask for the following details ALL AT ONCE in a single polite message:
- Budget
- Property type (House/Plot/Apartment)
- Preferred area/location
- Size (e.g., 5 marla, 10 marla)
- Purpose (Buy/Invest/Rent)
Example: "Could you please tell me your budget, preferred location, property type, and size?"
Once enough info is collected (budget + area + type), set needs_human_followup: true.

### STEP 3 — Seller Flow (If they want to sell):
Ask for ALL the following property details AT ONCE in a single polite message to save time:
- Property type
- Area/Location
- Size
- Expected Price
- Description (any extra details)
Example: "Great! Please share your property details: its type, area, size, and expected price."
Once all details are collected, set needs_human_followup: true.

### STEP 4 — Wrap up:
- Thank them and say: "Our property consultant will get back to you shortly."
- Do NOT ask more questions after setting needs_human_followup: true.
- In ALL messages after needs_human_followup is true, keep needs_human_followup: true and only send a short polite closing if user replies.

## Output Format
After EVERY message, return ONLY this valid JSON:

{
  "reply": "Your reply to the customer",
  "user_type": "unknown",
  "lead_data": {
    "name": null,
    "budget": null,
    "property_type": null,
    "size": null,
    "area": null,
    "purpose": null,
    "extra_info": {}
  },
  "inventory_data": {
    "property_type": null,
    "area": null,
    "size": null,
    "price": null,
    "description": null,
    "owner_name": null,
    "owner_phone": null
  },
  "lead_score": 0,
  "lead_status": "cold",
  "next_action": "collect_info",
  "needs_human_followup": false
}

## Rules (STRICT):
- If user_type is "buyer":
    - Fill ALL collected fields in `lead_data`. Never leave a field null if the user provided that info.
    - Keep `inventory_data` as ALL nulls.
    - lead_score: add 20 points per field collected (budget, property_type, area, size, purpose).
    - lead_status: score >= 60 = "hot", 40-59 = "warm", < 40 = "cold".
    - If budget + area + property_type are ALL provided, set needs_human_followup: true.

- If user_type is "seller":
    - Fill ALL collected fields in `inventory_data`. Never leave a field null if the user provided that info.
    - Use the `price` field in `inventory_data` for their expected price.
    - Keep `lead_data` as ALL nulls.
    - If property_type + area + size + price are ALL provided, set needs_human_followup: true.

- If user_type is "unknown":
    - Keep BOTH `lead_data` and `inventory_data` as ALL nulls.

- Once needs_human_followup is true:
    - Keep needs_human_followup: true in ALL subsequent JSON responses.
    - Do NOT ask any more questions. Only send a short polite closing message if user replies.

- Return ONLY valid JSON, starting with { and ending with }. No extra text, no markdown.
"""

# ──────────────────────────────────────────────
# In-memory session store  {phone_number: [...messages]}
# ──────────────────────────────────────────────
sessions: dict[str, list] = {}
session_flags: dict[str, dict] = {}


def get_or_create_session(phone: str) -> list:
    if phone not in sessions:
        sessions[phone] = [SystemMessage(content=SYSTEM_PROMPT)]
    if phone not in session_flags:
        session_flags[phone] = {"needs_human_followup": False, "user_type": "unknown"}
    return sessions[phone]


def build_rag_context(user_message: str, workspace_id: str) -> str:
    """
    Query the RAG knowledge base and return a formatted context block.
    Returns empty string if nothing relevant found.
    """
    try:
        docs = retrieve_relevant_docs(user_message, workspace_id, top_k=4)
        if not docs:
            return ""
        chunks = [d.page_content for d in docs]
        context = "\n\n".join(chunks)
        return f"[KNOWLEDGE BASE]\n{context}\n[/KNOWLEDGE BASE]\n\n"
    except Exception as e:
        print(f"RAG retrieval error: {e}")
        return ""


def process_message(phone: str, user_message: str, workspace_id: str = "default", name: str = "") -> dict:
    """
    Main entry point called by Flask routes.
    1. If needs_human_followup already flagged, skip LLM — return silent result.
    2. Retrieves relevant RAG documents for the user's query.
    3. Prepends them as context to the user message.
    4. Calls LLM and returns structured JSON response.
    """
    history = get_or_create_session(phone)
    flags = session_flags.get(phone, {})

    # ── Early exit: human already took over, don't call LLM ──
    if flags.get("needs_human_followup"):
        print(f"[Agent] Skipping LLM for {phone} — needs_human_followup already set.")
        return {
            "reply": None,
            "user_type": flags.get("user_type", "unknown"),
            "lead_data": {
                "name": None, "budget": None, "property_type": None,
                "size": None, "area": None, "purpose": None, "extra_info": {}
            },
            "inventory_data": {
                "property_type": None, "area": None, "size": None,
                "price": None, "description": None, "owner_name": None, "owner_phone": None
            },
            "lead_score": 0,
            "lead_status": "cold",
            "next_action": "human_followup",
            "needs_human_followup": True,
        }

    llm = ChatOpenAI(
        api_key=OPENAI_API_KEY,
        model="gpt-4o-mini",
        temperature=0.4,
    )

    # ── RAG: fetch relevant knowledge and prepend to user message ──
    rag_context = build_rag_context(user_message, workspace_id)
    identity_context = f"[Customer Phone: {phone}]" + (f" [Customer Name: {name}]" if name else "") + "\n\n"
    augmented_message = identity_context + (rag_context if rag_context else "") + user_message

    history.append(HumanMessage(content=augmented_message))

    # Call OpenAI via LangChain
    response    = llm.invoke(history)
    raw_content = response.content.strip()

    # Store assistant reply in history
    history.append(AIMessage(content=raw_content))

    print(raw_content)

    # Parse JSON response from agent
    try:
        json_match = re.search(r"\{.*\}", raw_content, re.DOTALL)
        if json_match:
            result = json.loads(json_match.group())
        else:
            raise ValueError("No JSON found")
    except Exception:
        result = {
            "reply": raw_content,
            "user_type": "unknown",
            "lead_data": {
                "name": None, "budget": None, "property_type": None,
                "size": None, "area": None, "purpose": None, "extra_info": {}
            },
            "inventory_data": {
                "property_type": None, "area": None, "size": None,
                "price": None, "description": None, "owner_name": None, "owner_phone": None
            },
            "lead_score": 0,
            "lead_status": "cold",
            "next_action": "unknown",
            "needs_human_followup": False,
        }

    # ── Persist flags for next turn ──
    if result.get("needs_human_followup"):
        session_flags[phone]["needs_human_followup"] = True

    if result.get("user_type") and result["user_type"] != "unknown":
        session_flags[phone]["user_type"] = result["user_type"]

    print("result", result)
    return result


def clear_session(phone: str):
    """Reset conversation for a given phone number."""
    if phone in sessions:
        del sessions[phone]
    if phone in session_flags:
        del session_flags[phone]