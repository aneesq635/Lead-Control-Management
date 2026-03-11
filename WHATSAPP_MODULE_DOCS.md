# WhatsApp Module Documentation & Testing Guide

This document details the Multi-Tenant WhatsApp Communication Module implemented directly in the Next.js App Router.

## 1. Folder Structure
The following files were created in your Next.js project:

``` text
lcm/
├── .env.example
├── lib/
│   ├── mongodb.js       (Database connection caching for Next.js API)
│   └── whatsapp.js      (WhatsApp Cloud API send utility)
├── models/
│   ├── Workspace.js     (Multi-tenant config schema)
│   ├── Conversation.js  (Thread schema per phone number + workspace)
│   └── Message.js       (Individual incoming/outgoing message schema)
├── app/
│   ├── api/
│   │   ├── messages/send/
│   │   │   └── route.js (POST endpoint for manual dashboard sending)
│   │   └── webhook/whatsapp/
│   │       └── route.js (GET verification & POST receive endpoint)
│   └── dashboard/
│       ├── layout.js
│       ├── settings/whatsapp/page.js
│       └── conversations/
│           ├── page.js
│           └── [id]/page.js
```

## 2. MongoDB Schema Context
- **Workspace**: Identifies the tenant. Contains credentials (`whatsapp_access_token`, `whatsapp_phone_number_id`, `whatsapp_verify_token`).
- **Conversation**: Ties a Workspace to a Sender's Phone number. Stores the `last_message_at` timestamp used for sorting inbox.
- **Message**: Foreign Keys: `workspace_id`, `conversation_id`. Tracks `direction` ("incoming" | "outgoing"), `whatsapp_message_id`, and `text`.

## 3. Setup Instructions
1. Copy `.env.example` to `.env.local` and add your MongoDB URI:
   ```env
   MONGODB_URI="mongodb+srv://<user>:<password>@cluster0.exmpl.mongodb.net/lcm_database?retryWrites=true&w=majority"
   ```
2. Start the dev server: `npm run dev`
3. Navigate to `http://localhost:3000/dashboard/settings/whatsapp` to create the initial workspace and configure the Meta App tokens.

## 4. API Testing (Postman Examples)

### Test 1: Webhook Verification (GET)
Meta App Dashboard requires this when you register `https://your-domain.ngrok-free.app/api/webhook/whatsapp`.

- **Method**: GET
- **URL**: `http://localhost:3000/api/webhook/whatsapp?hub.mode=subscribe&hub.verify_token=YOUR_CUSTOM_TOKEN&hub.challenge=1158201444`
*(Ensure `YOUR_CUSTOM_TOKEN` matches the one saved for your workspace in the dashboard.)*
- **Expected Result**: Status 200 OK. Body returns the raw challenge `1158201444`.

### Test 2: Simulating an Incoming WhatsApp Message (POST)
When a customer messages the business number, Meta sends a POST webhook.

- **Method**: POST
- **URL**: `http://localhost:3000/api/webhook/whatsapp`
- **Headers**: `Content-Type: application/json`
- **Body** (Raw JSON):
```json
{
  "object": "whatsapp_business_account",
  "entry": [
    {
      "id": "WHATSAPP_BUSINESS_ACCOUNT_ID",
      "changes": [
        {
          "value": {
            "messaging_product": "whatsapp",
            "metadata": {
              "display_phone_number": "15551234567",
              "phone_number_id": "YOUR_WORKSPACE_PHONE_NUMBER_ID"
            },
            "contacts": [
              {
                "profile": {
                  "name": "John Doe"
                },
                "wa_id": "15550001111"
              }
            ],
            "messages": [
              {
                "from": "15550001111",
                "id": "wamid.HBgLMTU1NTAwMDExMTERF...",
                "timestamp": "1710000000",
                "text": {
                  "body": "Hello! I am a new lead interested in your product."
                },
                "type": "text"
              }
            ]
          },
          "field": "messages"
        }
      ]
    }
  ]
}
```
**Important:** Replace `YOUR_WORKSPACE_PHONE_NUMBER_ID` with the actual Phone Number ID saved in your Workspace dashboard.
**Expected Result**: Status 200 OK with `EVENT_RECEIVED`. The database will now contain a Conversation and an Incoming Message. Visit `http://localhost:3000/dashboard/conversations` to see it.

### Test 3: Simulating Dashboard Outgoing Message API
Though the Next.js UI does this via Server Actions natively in `[id]/page.js`, you can also trigger outgoing messages via API if another service needs it:

- **Method**: POST
- **URL**: `http://localhost:3000/api/messages/send`
- **Headers**: `Content-Type: application/json`
- **Body** (Raw JSON):
```json
{
  "workspace_id": "65eba988abc...",
  "conversation_id": "65eba999abc...",
  "phone": "15550001111",
  "text": "Hello John, thank you for reaching out!"
}
```
**Expected Result**: Triggers the Meta WhatsApp API, logs the message as `outgoing` in MongoDB, and returns 200 OK with `{ success: true, message: { ... } }`.
