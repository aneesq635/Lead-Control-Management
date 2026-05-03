import dotenv
dotenv.load_dotenv()

import io
import os
import uuid
import tempfile
from datetime import datetime
from flask import Flask, request, jsonify, send_file
from flask_cors import CORS
from agent import process_message, clear_session
from rag_module.services.pdf_service import generate_inventory_pdf
from rag_module.services.rag_service import ingest_pdf_to_rag, retrieve_relevant_docs, delete_workspace_documents
import pymongo
from bson import ObjectId
app = Flask(__name__)
CORS(app)

# ── MongoDB connection ─────────────────────────────────────────
MONGODB_URI = os.getenv("MONGODB_URI")
client = pymongo.MongoClient(MONGODB_URI)
db = client["LCM"]
documents_collection = db["documents"]   # stores PDF binary + metadata
inventory_collection = db["inventory"]   # stores inventory rows per workspace


# ══════════════════════════════════════════════════════════════
#  AGENT ROUTES
# ══════════════════════════════════════════════════════════════

@app.route("/message", methods=["POST"])
def receive_message():
    data = request.get_json(force=True)
    phone        = data.get("phone")
    name         = data.get("name", "")
    message      = data.get("message")
    workspace_id = data.get("workspace_id", "default")

    if not phone or not message:
        return jsonify({"success": False, "error": "Both 'phone' and 'message' fields are required."}), 400

    result = process_message(phone, message, workspace_id, name)
    print("result", result)

    return jsonify({
        "success": True,
        "phone": phone,
        "reply": result.get("reply"),
        "user_type": result.get("user_type", "unknown"),
        "lead_data": result.get("lead_data"),
        "inventory_data": result.get("inventory_data"),
        "lead_score": result.get("lead_score"),
        "lead_status": result.get("lead_status"),
        "next_action": result.get("next_action"),
        "needs_human_followup": result.get("needs_human_followup", False)
    }), 200


@app.route("/reset", methods=["POST"])
def reset_session():
    data  = request.get_json(force=True)
    phone = data.get("phone")
    if not phone:
        return jsonify({"success": False, "error": "'phone' field is required."}), 400
    clear_session(phone)
    return jsonify({"success": True, "message": f"Session cleared for {phone}"}), 200


@app.route("/health", methods=["GET"])
def health():
    return jsonify({"status": "ok", "service": "WhatsApp AI Sales Agent"}), 200


# ══════════════════════════════════════════════════════════════
#  RAG ROUTES
# ══════════════════════════════════════════════════════════════

def _doc_to_json(doc):
    """Convert MongoDB document to JSON-serialisable dict."""
    return {
        "id":           str(doc["_id"]),
        "workspace_id": doc.get("workspace_id"),
        "user_id":      doc.get("user_id"),
        "type":         doc.get("type"),
        "file_name":    doc.get("file_name"),
        "created_at":   doc.get("created_at", ""),
        "updated_at":   doc.get("updated_at", ""),
    }


# ── POST /api/rag/pdf/generate ─────────────────────────────────
# Body: { workspace_id, user_id, inventory: [{property_type, area, size, price, description}] }
# Upserts: only ONE PDF document per workspace (replaces previous)
@app.route("/api/rag/pdf/generate", methods=["POST"])
def generate_pdf():
    data         = request.get_json(force=True)
    workspace_id = data.get("workspace_id", "default")
    inventory    = data.get("inventory", [])
    user_id      = data.get("user_id", "default")
    print("geenrte inventry", inventory)

    if not inventory:
        return jsonify({"error": "No inventory data provided"}), 400

    # Generate PDF into a temp file
    tmp_dir   = tempfile.gettempdir()
    file_name = f"inventory_{workspace_id[:8]}.pdf"
    file_path = os.path.join(tmp_dir, file_name)
    generate_inventory_pdf(inventory, file_path)

    # Read binary PDF
    with open(file_path, "rb") as f:
        pdf_binary = f.read()

    now = datetime.now().isoformat()

    # UPSERT: replace the single inventory PDF for this workspace
    documents_collection.update_one(
        {"workspace_id": workspace_id, "type": "inventory"},
        {"$set": {
            "user_id":    user_id,
            "file_name":  file_name,
            "pdf_data":   pdf_binary,
            "updated_at": now,
        },
         "$setOnInsert": {"created_at": now}
        },
        upsert=True
    )

    # Retrieve the upserted doc to return its _id
    doc = documents_collection.find_one({"workspace_id": workspace_id, "type": "inventory"})

    # Upsert inventory rows: clear old rows and insert fresh
    inventory_collection.delete_many({"workspace_id": workspace_id})
    rows_to_insert = [{"workspace_id": workspace_id, "user_id": user_id, **row} for row in inventory]
    if rows_to_insert:
        inventory_collection.insert_many(rows_to_insert)

    # Auto-ingest into RAG / vector store
    delete_workspace_documents(workspace_id, "inventory")
    metadata = {"workspace_id": workspace_id, "type": "inventory", "source": file_name}
    ingest_pdf_to_rag(file_path, metadata)
    print("PDF generated and knowledge ingested", doc)

    return jsonify({
        "success": True,
        "message": "PDF generated and knowledge ingested",
        "document": _doc_to_json(doc)
    })


# ── POST /api/rag/inventory/add  — Add single inventory and regenerate PDF ──
# Body: { workspace_id, user_id, item: { property_type, area, size, price, description, owner_name, owner_phone } }
@app.route("/api/rag/inventory/add", methods=["POST"])
def add_inventory_row_and_regenerate():
    data = request.get_json(force=True)
    workspace_id = data.get("workspace_id", "default")
    user_id = data.get("user_id", "auto")
    item = data.get("item")

    if not item:
        return jsonify({"error": "No item provided"}), 400

    # Upsert single row to prevent duplicates for the same user
    row_to_insert = {"workspace_id": workspace_id, "user_id": user_id, **item}
    inventory_collection.update_one(
        {"workspace_id": workspace_id, "user_id": user_id},
        {"$set": row_to_insert},
        upsert=True
    )

    # Fetch all rows to regenerate PDF
    all_inventory = list(inventory_collection.find({"workspace_id": workspace_id}, {"_id": 0}))

    # Generate PDF into a temp file
    tmp_dir = tempfile.gettempdir()
    file_name = f"inventory_{workspace_id[:8]}.pdf"
    file_path = os.path.join(tmp_dir, file_name)
    generate_inventory_pdf(all_inventory, file_path)

    # Read binary PDF
    with open(file_path, "rb") as f:
        pdf_binary = f.read()

    now = datetime.now().isoformat()

    # UPSERT: replace the single inventory PDF for this workspace
    documents_collection.update_one(
        {"workspace_id": workspace_id, "type": "inventory"},
        {"$set": {
            "user_id": user_id,
            "file_name": file_name,
            "pdf_data": pdf_binary,
            "updated_at": now,
        },
         "$setOnInsert": {"created_at": now}
        },
        upsert=True
    )

    doc = documents_collection.find_one({"workspace_id": workspace_id, "type": "inventory"})

    # Auto-ingest into RAG / vector store
    delete_workspace_documents(workspace_id, "inventory")
    metadata = {"workspace_id": workspace_id, "type": "inventory", "source": file_name}
    ingest_pdf_to_rag(file_path, metadata)
    print("New inventory added and knowledge ingested", doc)

    return jsonify({
        "success": True,
        "message": "Inventory added, PDF regenerated and knowledge ingested",
        "document": _doc_to_json(doc) if doc else None
    })

# ── GET /api/rag/pdf/<doc_id>  — stream the PDF from MongoDB ──
@app.route("/api/rag/pdf/<doc_id>", methods=["GET"])
def serve_pdf(doc_id):
    try:
        oid = ObjectId(doc_id)
    except Exception:
        return jsonify({"error": "Invalid document ID"}), 400

    doc = documents_collection.find_one({"_id": oid})
    if not doc or "pdf_data" not in doc:
        return jsonify({"error": "PDF not found"}), 404

    pdf_stream = io.BytesIO(doc["pdf_data"])
    pdf_stream.seek(0)
    return send_file(
        pdf_stream,
        mimetype="application/pdf",
        download_name=doc.get("file_name", "inventory.pdf"),
        as_attachment=False
    )


# ── GET /api/rag/inventory?workspace_id=xxx  — load saved inventory rows ──
@app.route("/api/rag/inventory", methods=["GET"])
def get_inventory():
    workspace_id = request.args.get("workspace_id", "default")
    rows = list(inventory_collection.find({"workspace_id": workspace_id}, {"_id": 0, "workspace_id": 0, "user_id": 0}))
    return jsonify({"success": True, "inventory": rows})


# ── DELETE /api/rag/inventory/row  — remove a single inventory row ──
# Body: { workspace_id, property_type, area, size, price }  (enough to identify)
@app.route("/api/rag/inventory/row", methods=["DELETE"])
def delete_inventory_row():
    data         = request.get_json(force=True)
    workspace_id = data.get("workspace_id", "default")
    # We use index (0-based) passed from frontend for precision
    index        = data.get("index")

    if index is None:
        return jsonify({"error": "index is required"}), 400

    # Load all rows for workspace, remove the indexed one, save back
    rows = list(inventory_collection.find({"workspace_id": workspace_id}))
    if index < 0 or index >= len(rows):
        return jsonify({"error": "Index out of range"}), 400

    row_to_delete = rows[index]
    inventory_collection.delete_one({"_id": row_to_delete["_id"]})

    return jsonify({"success": True, "message": "Row removed from inventory"})


# ── POST /api/rag/upload  — multipart/form-data: file + workspace_id ──
@app.route("/api/rag/upload", methods=["POST"])
def upload_document():
    workspace_id = request.form.get("workspace_id", "default")
    user_id      = request.form.get("user_id", "default")

    if "file" not in request.files:
        return jsonify({"error": "No file part"}), 400

    file = request.files["file"]
    if not file.filename:
        return jsonify({"error": "No selected file"}), 400

    tmp_dir   = tempfile.gettempdir()
    file_path = os.path.join(tmp_dir, file.filename)
    file.save(file_path)

    with open(file_path, "rb") as f:
        pdf_binary = f.read()

    metadata = {"workspace_id": workspace_id, "type": "document", "source": file.filename}

    try:
        ingest_pdf_to_rag(file_path, metadata)
        now = datetime.now().isoformat()

        result = documents_collection.insert_one({
            "workspace_id": workspace_id,
            "user_id":      user_id,
            "type":         "document",
            "file_name":    file.filename,
            "pdf_data":     pdf_binary,
            "created_at":   now,
            "updated_at":   now,
        })

        doc = documents_collection.find_one({"_id": result.inserted_id})
        return jsonify({
            "success":  True,
            "message":  "File uploaded and ingested into knowledge base",
            "document": _doc_to_json(doc)
        })
    except Exception as e:
        return jsonify({"error": str(e)}), 500


# ── GET /api/rag/documents?workspace_id=xxx ──
@app.route("/api/rag/documents", methods=["GET"])
def get_documents():
    workspace_id = request.args.get("workspace_id", "default")
    docs = list(documents_collection.find(
        {"workspace_id": workspace_id},
        {"pdf_data": 0}          # never send binary over JSON
    ))
    return jsonify({"success": True, "documents": [_doc_to_json(d) for d in docs]})


# ── DELETE /api/rag/documents/<doc_id> ──
@app.route("/api/rag/documents/<doc_id>", methods=["DELETE"])
def delete_document(doc_id):
    try:
        oid = ObjectId(doc_id)
    except Exception:
        return jsonify({"error": "Invalid document ID"}), 400

    result = documents_collection.delete_one({"_id": oid})
    if result.deleted_count == 0:
        return jsonify({"error": "Document not found"}), 404

    return jsonify({"success": True})


# ── POST /api/rag/search  — test RAG retrieval ──
@app.route("/api/rag/search", methods=["POST"])
def search_knowledge():
    data         = request.get_json(force=True)
    query        = data.get("query", "")
    workspace_id = data.get("workspace_id", "default")
    if not query:
        return jsonify({"error": "query is required"}), 400
    docs = retrieve_relevant_docs(query, workspace_id)
    results = [{"content": d.page_content, "metadata": d.metadata} for d in docs]
    return jsonify({"success": True, "results": results})


# ══════════════════════════════════════════════════════════════
if __name__ == "__main__":
    app.run(debug=True, host="0.0.0.0", port=5000)