# 🧠 AI Brain Module — Lead Control Management System

A production-ready Flask micro-service that processes customer WhatsApp messages
and returns intelligent, structured lead qualification responses using
**LangChain + OpenAI GPT-4o**.

---

## 📁 Project Structure

```
ai_brain/
├── app.py                    # Flask app factory & entry point
├── config.py                 # Centralised settings (loaded from .env)
├── requirements.txt
├── .env.example              # Copy → .env and fill in your keys
│
├── routes/
│   └── ai_routes.py          # API endpoint definitions (Blueprint)
│
├── agents/
│   └── lead_agent.py         # Core LangChain orchestration agent
│
├── services/
│   ├── intent_service.py     # LLM-powered intent detection
│   ├── extraction_service.py # Structured field extraction & merging
│   ├── scoring_service.py    # Lead quality scoring (0-100)
│   └── question_service.py   # Next-best-question generator
│
├── prompts/
│   └── lead_prompt.py        # All LangChain PromptTemplate definitions
│
├── models/
│   └── lead_schema.py        # Pydantic v2 request/response schemas
│
└── utils/
    ├── __init__.py
    └── logger.py             # Structured, production-ready logger
```

---

## ⚡ Quick Start

### 1. Clone & install dependencies

```bash
cd ai_brain
python -m venv venv
source venv/bin/activate      # Windows: venv\Scripts\activate
pip install -r requirements.txt
```

### 2. Configure environment

```bash
cp .env.example .env
# Open .env and set OPENAI_API_KEY (and other values as needed)
```

### 3. Run (development)

```bash
python app.py
```

### 4. Run (production with Gunicorn)

```bash
gunicorn -w 2 -b 0.0.0.0:5050 "app:create_app()"
```

---

## 🔌 API Endpoints

### `GET /ai/status`

Liveness probe — no LLM call, returns immediately.

**Response**
```json
{ "status": "running" }
```

---

### `POST /ai/process-message`

Main AI pipeline. Receives a customer WhatsApp message and returns a
structured, qualified lead response.

**Request**
```json
{
  "workspace_id":    "ws_abc123",
  "phone":           "+923001234567",
  "message":         "Assalam o Alaikum! I'm looking for a 5 marla house in DHA Lahore.",
  "conversation_id": "conv_xyz789"
}
```

**Response**
```json
{
  "reply": "Wa Alaikum Assalam! Great choice — DHA Lahore has some lovely options. What is your approximate budget range for this property?",
  "intent": "property_search",
  "extracted_data": {
    "name":          null,
    "budget":        null,
    "area":          "DHA Lahore",
    "property_type": "house",
    "size":          "5 marla",
    "purpose":       null
  },
  "lead_score": 55
}
```

**Second message (same conversation)** — budget provided:
```json
{
  "workspace_id":    "ws_abc123",
  "phone":           "+923001234567",
  "message":         "My budget is around 1.5 crore",
  "conversation_id": "conv_xyz789"
}
```

**Response** — score jumps, agent asks for name:
```json
{
  "reply": "Perfect! 1.5 crore gives you excellent options in DHA. May I know your good name, please?",
  "intent": "follow_up",
  "extracted_data": {
    "name":          null,
    "budget":        "1.5 crore",
    "area":          "DHA Lahore",
    "property_type": "house",
    "size":          "5 marla",
    "purpose":       null
  },
  "lead_score": 80
}
```

---

## 🏆 Lead Scoring Rules

| Field Provided     | Points |
|--------------------|--------|
| Budget mentioned   | +25    |
| Area mentioned     | +20    |
| Property type      | +15    |
| Size mentioned     | +20    |
| Returning user     | +20    |
| **Maximum**        | **100**|

---

## 🤖 AI Pipeline (per message)

```
Customer Message
      │
      ▼
 [1] Intent Detection        ← LLM classification (+ keyword fallback)
      │
      ▼
 [2] Field Extraction        ← LLM JSON extraction (merged with prior data)
      │
      ▼
 [3] Lead Scoring            ← Deterministic rule engine
      │
      ▼
 [4] Next-Question Decision  ← LLM phrasing (+ hardcoded fallback)
      │
      ▼
 [5] Master LLM Reply        ← Context-aware, conversational response
      │
      ▼
 Structured JSON Response
```

---

## 🔒 Production Checklist

- [ ] Set `OPENAI_API_KEY` in `.env`
- [ ] Change `SECRET_KEY` to a strong random value
- [ ] Restrict `ALLOWED_ORIGINS` to your Communication Module domain
- [ ] Configure Redis for persistent conversation memory
- [ ] Deploy behind HTTPS (nginx / AWS ALB)
- [ ] Set `FLASK_DEBUG=false` and `FLASK_ENV=production`
- [ ] Monitor with Gunicorn + Supervisor / systemd

---

## 🧪 cURL Examples

```bash
# Health check
curl http://localhost:5050/ai/status

# Process a message
curl -X POST http://localhost:5050/ai/process-message \
  -H "Content-Type: application/json" \
  -d '{
    "workspace_id":    "ws_demo",
    "phone":           "+923001234567",
    "message":         "I want to buy a 1 kanal house in Bahria Town within 3 crore budget",
    "conversation_id": "conv_demo_001"
  }'
```
