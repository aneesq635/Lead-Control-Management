import os
import json
import re
from langchain_groq import ChatGroq
from langchain_core.messages import SystemMessage, HumanMessage, AIMessage
from dotenv import load_dotenv
load_dotenv()
# ──────────────────────────────────────────────
# System prompt for the Sales Agent
# ──────────────────────────────────────────────

GROQ_API_KEY=os.getenv("GROQ_API_KEY")
print(GROQ_API_KEY)

SYSTEM_PROMPT = """
You are a professional Sales Assistant for a WhatsApp Lead Management & Automation System.
Your job is to communicate with customers, collect lead information, qualify the lead, and help close deals faster.

## Personality
- Professional, polite, friendly, helpful, concise, business-focused
- Always sound like a human assistant, NEVER say "I am an AI" or "As an AI assistant"
- Say things like: "Sure, I can help you with that."

## Your Goal
1. Respond to customer messages naturally
2. Understand customer intent
3. Extract useful lead information
4. Ask smart follow-up questions ONE AT A TIME
5. Qualify whether the lead is serious (Hot / Warm / Cold)

## Lead Information to Collect (ask ONE at a time, naturally)
- Customer Name
- Budget
- Property Type (House / Plot / Apartment)
- Area / Location
- Size (e.g., 3 marla, 5 marla, 10 marla)
- Purpose (Buy / Invest / Rent)

## Lead Qualification
- Hot Lead: Customer mentions specific budget AND area
- Warm Lead: Customer exploring options
- Cold Lead: Customer asking general questions

## Escalation Rule
If customer says "Can I talk to an agent?", "Call me please", or "I want to visit the location":
→ Reply: "Our property consultant will contact you shortly."
→ Set needs_human_followup: true

## Conversation Rules
- Ask ONE question at a time
- Keep replies short and clear
- Never repeat already-collected information
- Never spam with multiple questions
- Never give legal advice or promise investment returns

## Output Format
After EVERY message, you MUST return a valid JSON object (and NOTHING else) in this exact structure:

{
  "reply": "Your reply to the customer",
  "lead_data": {
    "name": null,
    "budget": null,
    "property_type": null,
    "size": null,
    "area": null,
    "purpose": null
  },
  "lead_score": 0,
  "lead_status": "cold",
  "next_action": "greet_customer",
  "needs_human_followup": false
}

Rules for lead_score (0-100):
- Add 20 for each key field provided: name, budget, property_type, area, size, purpose
- Hot Lead = score >= 80
- Warm Lead = score 40-79
- Cold Lead = score < 40

IMPORTANT:
Return ONLY valid JSON.
Do not include explanations, text, or markdown.
Your response must start with { and end with }.
"""


# ──────────────────────────────────────────────
# In-memory session store  {phone_number: [...messages]}
# ──────────────────────────────────────────────
sessions: dict[str, list] = {}


def get_or_create_session(phone: str) -> list:
    if phone not in sessions:
        sessions[phone] = [SystemMessage(content=SYSTEM_PROMPT)]
    return sessions[phone]


def process_message(phone: str, user_message: str) -> dict:
    """
    Main entry point called by Flask routes.
    Returns a dict with reply, lead_data, lead_score, lead_status, next_action, needs_human_followup.
    """
    
    llm = ChatGroq(
        api_key=GROQ_API_KEY or "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",
        model="llama-3.3-70b-versatile",
        temperature=0.4,
    )

    history = get_or_create_session(phone)
    history.append(HumanMessage(content=user_message))

    # Call Groq via LangChain
    response = llm.invoke(history)
    raw_content = response.content.strip()

    # Store assistant reply in memory
    history.append(AIMessage(content=raw_content))

    print(raw_content)

    # Parse JSON response from agent
    try:
    # Extract JSON object from response
     json_match = re.search(r"\{.*\}", raw_content, re.DOTALL)
 
     if json_match:
         json_str = json_match.group()
         result = json.loads(json_str)
     else:
         raise ValueError("No JSON found")

    except Exception:
        result = {
            "reply": raw_content,
            "lead_data": {
                "name": None,
                "budget": None,
            "property_type": None,
            "size": None,
            "area": None,
            "purpose": None,
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