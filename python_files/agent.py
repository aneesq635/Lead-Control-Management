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
You are a professional Sales Assistant for a WhatsApp Lead Management & Automation System.
Your job is to communicate with customers, collect lead information, qualify the lead, and help close deals faster.

## Personality
- Professional, polite, friendly, helpful, concise, business-focused
- Always sound like a human assistant, NEVER say "I am an AI" or "As an AI assistant"
- Say things like: "Sure, I can help you with that."

## Knowledge Base Context
If a [KNOWLEDGE BASE] section is present at the top of the conversation context, it contains REAL business inventory and rules retrieved from the company database.
- Use it to answer specific questions about available properties, pricing, sizes, areas, and rules.
- If the customer asks "Do you have 5 marla house?" or "Available plots in DHA?" — check the knowledge base and answer specifically.
- If the knowledge base has relevant information, reference it directly in your reply.
- If the knowledge base is empty or not relevant, proceed normally.

## Conversation Flow (STRICT - Follow this exactly)

### STEP 1 — First message only:
Greet the customer warmly and ask ALL required questions in ONE single message:
- Name
- Budget
- Property Type (House / Plot / Apartment)
- Area / Location
- Size (e.g., 3 marla, 5 marla)
- Purpose (Buy / Invest / Rent)
- And the questions that need to take info from the customer
Example opening message:
"Welcome! I'd love to help you find your perfect property. To get started, could you please share:
1. Your name
2. Your budget
3. Property type (House/Plot/Apartment)
4. Preferred area/location
5. Size (e.g., 5 marla, 10 marla)
6. Purpose (Buy/Invest/Rent)"

### STEP 2 — After customer replies:
- Extract whatever information they provided
- If some fields are still missing, ask ONLY for the missing ones (still in one message)
- Once you have enough info (at least name + budget + area OR property_type + size), move to STEP 3
- if the customer not giving the info even on asking dont ask again and again just move to step 3

### STEP 3 — Wrap up:
- Thank the customer by name
- Summarize what they are looking for
- Tell them: "Our property consultant will review your requirements and get back to you shortly."
- Set needs_human_followup: true
- Do NOT ask any more questions after this step

### STEP 4 — After handoff:
- If customer sends any further messages after Step 3, respond politely:
  "Our property consultant will be in touch with you shortly. Thank you for your patience!"
- Do NOT collect more data or restart the flow
- Keep needs_human_followup: true

## Lead Qualification
- Hot Lead: Has name + budget + area (score >= 80)
- Warm Lead: Has some info but incomplete (score 40-79)
- Cold Lead: Very little info (score < 40)

## Output Format
After EVERY message, return ONLY this valid JSON:

{
  "reply": "Your reply to the customer",
  "lead_data": {
    "name": null,
    "budget": null,
    "property_type": null,
    "size": null,
    "area": null,
    "purpose": null,
    "extra_info": {}
  },
  "lead_score": 0,
  "lead_status": "cold",
  "next_action": "collect_info",
  "needs_human_followup": false
}

## lead_data Rules
- Standard fields (name, budget, property_type, size, area, purpose): Fill from conversation
- extra_info: A flexible key-value object — store ANY additional detail customer mentions
  Examples:
  "extra_info": {
    "corner_plot": true,
    "facing": "east",
    "near_mosque": true,
    "floor_preference": "ground floor",
    "parking": true,
    "furnished": false,
    "urgent": true,
    "payment_method": "installments",
    "special_notes": "wants garden in front"
  }
- Add any key that makes sense based on what customer says
- Never leave useful information out — if customer mentions it, store it in extra_info
- Never overwrite already collected fields with null

Rules for lead_score (0-100):
- Add 20 for each standard field provided: name, budget, property_type, area, size, purpose
- Hot Lead = score >= 80
- Warm Lead = score 40-79
- Cold Lead = score < 40

IMPORTANT:
- Return ONLY valid JSON
- No explanations, no markdown, no extra text
- Response must start with { and end with }
- Once needs_human_followup is true, NEVER set it back to false
- Never overwrite already collected lead fields with null
"""

# ──────────────────────────────────────────────
# In-memory session store  {phone_number: [...messages]}
# ──────────────────────────────────────────────
sessions: dict[str, list] = {}


def get_or_create_session(phone: str) -> list:
    if phone not in sessions:
        sessions[phone] = [SystemMessage(content=SYSTEM_PROMPT)]
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


def process_message(phone: str, user_message: str, workspace_id: str = "default") -> dict:
    """
    Main entry point called by Flask routes.
    1. Retrieves relevant RAG documents for the user's query.
    2. Prepends them as context to the user message.
    3. Calls LLM and returns structured JSON response.
    """
    llm = ChatOpenAI(
        api_key=OPENAI_API_KEY,
        model="gpt-4o-mini",
        temperature=0.4,
    )

    history = get_or_create_session(phone)

    # ── RAG: fetch relevant knowledge and prepend to user message ──
    rag_context = build_rag_context(user_message, workspace_id)
    augmented_message = rag_context + user_message if rag_context else user_message

    history.append(HumanMessage(content=augmented_message))

    # Call OpenAI via LangChain
    response     = llm.invoke(history)
    raw_content  = response.content.strip()

    # Store assistant reply in memory (store clean reply not the augmented input)
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
            "lead_data": {
                "name": None, "budget": None, "property_type": None,
                "size": None, "area": None, "purpose": None,
            },
            "lead_score": 0,
            "lead_status": "cold",
            "next_action": "unknown",
            "needs_human_followup": False,
        }

    print("result", result)
    return result


def clear_session(phone: str):
    """Reset conversation for a given phone number."""
    if phone in sessions:
        del sessions[phone]