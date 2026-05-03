# Graph Report - .  (2026-05-01)

## Corpus Check
- Corpus is ~28,184 words - fits in a single context window. You may not need a graph.

## Summary
- 158 nodes · 151 edges · 8 communities detected
- Extraction: 74% EXTRACTED · 26% INFERRED · 0% AMBIGUOUS · INFERRED: 39 edges (avg confidence: 0.8)
- Token cost: 0 input · 0 output

## Community Hubs (Navigation)
- [[_COMMUNITY_API Endpoints|API Endpoints]]
- [[_COMMUNITY_RAG Backend (Python)|RAG Backend (Python)]]
- [[_COMMUNITY_UI Components|UI Components]]
- [[_COMMUNITY_AI Agent Logic|AI Agent Logic]]
- [[_COMMUNITY_WhatsApp Webhook & Sockets|WhatsApp Webhook & Sockets]]
- [[_COMMUNITY_Conversation UI|Conversation UI]]
- [[_COMMUNITY_Core Architecture|Core Architecture]]
- [[_COMMUNITY_System Metadata|System Metadata]]

## God Nodes (most connected - your core abstractions)
1. `dbConnect()` - 14 edges
2. `useAuth()` - 7 edges
3. `ingest_pdf_to_rag()` - 7 edges
4. `POST()` - 6 edges
5. `_doc_to_json()` - 6 edges
6. `generate_inventory_pdf()` - 5 edges
7. `Python AI Agent` - 5 edges
8. `GET()` - 4 edges
9. `send_whatsapp_message()` - 4 edges
10. `build_rag_context()` - 4 edges

## Surprising Connections (you probably didn't know these)
- `GET()` --calls--> `dbConnect()`  [INFERRED]
  app\api\webhook\whatsapp\route.js → lib\mongodb.js
- `DELETE()` --calls--> `dbConnect()`  [INFERRED]
  app\api\conversations\delete\route.js → lib\mongodb.js
- `GET()` --calls--> `dbConnect()`  [INFERRED]
  app\api\conversations\[id]\route.js → lib\mongodb.js
- `GET()` --calls--> `dbConnect()`  [INFERRED]
  app\api\dashboard\stats\route.js → lib\mongodb.js
- `PATCH()` --calls--> `dbConnect()`  [INFERRED]
  app\api\lead\[id]\toogle-agent\route.js → lib\mongodb.js

## Hyperedges (group relationships)
- **Core Pipeline** — whatsapp_layer, python_ai_agent, lead_storage, socket_server [INFERRED 0.95]
- **RAG System** — rag_knowledge_base, python_ai_agent, lead_storage [INFERRED 0.90]

## Communities

### Community 0 - "API Endpoints"
Cohesion: 0.09
Nodes (12): GET(), POST(), DELETE(), POST(), GET(), GET(), dbConnect(), send_whatsapp_message() (+4 more)

### Community 1 - "RAG Backend (Python)"
Cohesion: 0.13
Nodes (14): add_inventory_row_and_regenerate(), _doc_to_json(), generate_pdf(), get_documents(), Convert MongoDB document to JSON-serialisable dict., search_knowledge(), upload_document(), generate_pdf() (+6 more)

### Community 3 - "UI Components"
Cohesion: 0.13
Nodes (7): useAuth(), DataLoader(), Header(), CreateWorkspacePage(), emptyRow(), RAGPage(), WhatsAppSettingsPage()

### Community 4 - "AI Agent Logic"
Cohesion: 0.28
Nodes (8): build_rag_context(), clear_session(), get_or_create_session(), process_message(), Query the RAG knowledge base and return a formatted context block.     Returns, Reset conversation for a given phone number., receive_message(), reset_session()

### Community 5 - "WhatsApp Webhook & Sockets"
Cohesion: 0.32
Nodes (5): emitConversationUpdated(), emitNewConversation(), emitNewMessage(), GET(), POST()

### Community 6 - "Conversation UI"
Cohesion: 0.29
Nodes (4): ConversationsLayout(), ConversationThreadPage(), useConversationSocket(), useWorkspaceSocket()

### Community 7 - "Core Architecture"
Cohesion: 0.29
Nodes (7): Buyer Flow, Lead Storage (MongoDB), Python AI Agent, RAG Knowledge Base, Seller Flow, Socket.io Server, WhatsApp Layer

### Community 21 - "System Metadata"
Cohesion: 1.0
Nodes (2): Lead Control Management System, Tech Stack

## Knowledge Gaps
- **11 isolated node(s):** `Query the RAG knowledge base and return a formatted context block.     Returns`, `Reset conversation for a given phone number.`, `Convert MongoDB document to JSON-serialisable dict.`, `data_rows: list of dicts with inventory info`, `Lead Control Management System` (+6 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **Thin community `System Metadata`** (2 nodes): `Lead Control Management System`, `Tech Stack`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `dbConnect()` connect `API Endpoints` to `WhatsApp Webhook & Sockets`?**
  _High betweenness centrality (0.035) - this node is a cross-community bridge._
- **Why does `useAuth()` connect `UI Components` to `Conversation UI`?**
  _High betweenness centrality (0.016) - this node is a cross-community bridge._
- **Why does `POST()` connect `WhatsApp Webhook & Sockets` to `API Endpoints`?**
  _High betweenness centrality (0.012) - this node is a cross-community bridge._
- **Are the 13 inferred relationships involving `dbConnect()` (e.g. with `DELETE()` and `GET()`) actually correct?**
  _`dbConnect()` has 13 INFERRED edges - model-reasoned connections that need verification._
- **Are the 6 inferred relationships involving `useAuth()` (e.g. with `DataLoader()` and `Header()`) actually correct?**
  _`useAuth()` has 6 INFERRED edges - model-reasoned connections that need verification._
- **Are the 5 inferred relationships involving `ingest_pdf_to_rag()` (e.g. with `generate_pdf()` and `add_inventory_row_and_regenerate()`) actually correct?**
  _`ingest_pdf_to_rag()` has 5 INFERRED edges - model-reasoned connections that need verification._
- **Are the 5 inferred relationships involving `POST()` (e.g. with `dbConnect()` and `emitNewConversation()`) actually correct?**
  _`POST()` has 5 INFERRED edges - model-reasoned connections that need verification._