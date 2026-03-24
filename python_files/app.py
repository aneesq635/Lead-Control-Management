from flask import Flask, request, jsonify
from agent import process_message, clear_session

app = Flask(__name__)


# ──────────────────────────────────────────────
# POST /message
# Receive a WhatsApp message and return agent reply
# Body: { "phone": "923001234567", "message": "I want a 5 marla house" }
# ──────────────────────────────────────────────
@app.route("/message", methods=["POST"])
def receive_message():
    data = request.get_json(force=True)

    phone = data.get("phone")
    message = data.get("message")

    if not phone or not message:
        return jsonify({
            "success": False,
            "error": "Both 'phone' and 'message' fields are required."
        }), 400

    result = process_message(phone, message)
    print("result", result)

    return jsonify({
        "success": True,
        "phone": phone,
        "reply": result.get("reply"),
        "lead_data": result.get("lead_data"),
        "lead_score": result.get("lead_score"),
        "lead_status": result.get("lead_status"),
        "next_action": result.get("next_action"),
        "needs_human_followup": result.get("needs_human_followup", False)
    }), 200


# ──────────────────────────────────────────────
# POST /reset
# Clear conversation history for a phone number
# Body: { "phone": "923001234567" }
# ──────────────────────────────────────────────
@app.route("/reset", methods=["POST"])
def reset_session():
    data = request.get_json(force=True)
    phone = data.get("phone")

    if not phone:
        return jsonify({"success": False, "error": "'phone' field is required."}), 400

    clear_session(phone)
    return jsonify({
        "success": True,
        "message": f"Session cleared for {phone}"
    }), 200


# ──────────────────────────────────────────────
# GET /health
# Health check
# ──────────────────────────────────────────────
@app.route("/health", methods=["GET"])
def health():
    return jsonify({"status": "ok", "service": "WhatsApp AI Sales Agent"}), 200


if __name__ == "__main__":
    app.run(debug=True, host="0.0.0.0", port=5000)