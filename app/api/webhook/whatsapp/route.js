import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Workspace from '@/models/Workspace';
import Conversation from '@/models/Conversation';
import Message from '@/models/Message';
import Lead from '@/models/Lead';
import { send_whatsapp_message } from '@/lib/whatsapp';
import { emitNewMessage, emitConversationUpdated } from '@/lib/socket/server';


export async function GET(request) {
 const { searchParams } = new URL(request.url);
 
 const mode = searchParams.get('hub.mode');
 const token = searchParams.get('hub.verify_token');
 const challenge = searchParams.get('hub.challenge');
 console.log("webhook verify token", token);
 console.log("webhook verify token in env", process.env.WEBHOOK_VERIFY_TOKEN)

 if (mode && token) {
 if (mode === 'subscribe') {
 await dbConnect();
 
 // Look up workspace by verify_token
 // In a multi-tenant system where each workspace might have its own verify token (if they configure their own Webhook)
 // or if there's a global one, we check if ANY workspace matches this token, or if it matches a global env var.
 // Based on the requirements, verify_token is stored per workspace.
 const workspace = await Workspace.findOne({ whatsapp_verify_token: token });
 
 if (workspace || token === process.env.WEBHOOK_VERIFY_TOKEN) {
 // Responds with the challenge token from the request
 console.log('WEBHOOK_VERIFIED');
 return new NextResponse(challenge, { status: 200 });
 } else {
 // Responds with '403 Forbidden' if verify tokens do not match
 return new NextResponse('Forbidden', { status: 403 });
 }
 }
 }

 return new NextResponse('Bad Request', { status: 400 });
}

// POST: Receive messages
export async function POST(request) {
 try {
 const body = await request.json();
 console.log('data from webhook', body)

 // Check if this is an event from a WhatsApp API
 if (body.object === 'whatsapp_business_account') {
 await dbConnect();

 for (const entry of body.entry) {
 for (const change of entry.changes) {
 if (change.value && change.value.messages && change.value.messages[0]) {
 const phone_number_id = change.value.metadata.phone_number_id;
 const message = change.value.messages[0];
 const contact = change.value.contacts?.[0];

 const senderPhone = message.from;
 const messageId = message.id;
 const timestamp = new Date(parseInt(message.timestamp) * 1000); // WhatsApp sends unix timestamp in seconds
 const messageType = message.type;
 
 let text = '';
 if (messageType === 'text') {
 text = message.text.body;
 } else if (messageType === 'button') {
 text = message.button.text;
 } else if (messageType === 'interactive') {
 text = message.interactive.button_reply?.title || message.interactive.list_reply?.title || '';
 } else {
 text = `[${messageType} message]`;
 }

 // 1. Find workspace using phone_number_id
 const workspace = await Workspace.findOne({ whatsapp_phone_number_id: phone_number_id });
 
 if (!workspace) {
 console.warn(`No workspace found for phone_number_id: ${phone_number_id}`);
 continue;
 }

 // 2. Find or create conversation
 let conversation = await Conversation.findOne({
 workspace_id: workspace.workspace_id,
 phone: senderPhone
 });

 if (!conversation) {
 conversation = await Conversation.create({
 workspace_id: workspace.workspace_id,
 phone: senderPhone,
 last_message_at: timestamp,
 created_at: new Date()
 });
 } else {
 // Update last message timestamp
 conversation.last_message_at = timestamp;
 await conversation.save();
 }

 // 3. Save incoming message
 // Check if message already exists (WhatsApp might retry delivery)
 const existingMessage = await Message.findOne({ whatsapp_message_id: messageId });
 
 if (!existingMessage) {
 const savedMessage = await Message.create({
 workspace_id: workspace.workspace_id,
 conversation_id: conversation._id,
 phone: senderPhone,
 direction: 'incoming',
 message_type: messageType,
 text: text,
 whatsapp_message_id: messageId,
 timestamp: timestamp
 });
 
 console.log(`Saved incoming message from ${senderPhone} for workspace ${workspace.company_name}`);

 // ── REAL-TIME: Emit to subscribed frontend clients ──────────────
 const conversationId = conversation._id.toString();

 // 1. Push the new message to the open conversation thread
 emitNewMessage(conversationId, savedMessage.toObject());

 // 2. Update the conversations list page (last_message_at sort order)
 emitConversationUpdated(workspace.workspace_id, {
 _id: conversation._id,
 phone: conversation.phone,
 last_message_at: conversation.last_message_at,
 workspace_id: conversation.workspace_id,
 });

 // 4. Send message to Python Agent
 try {
 const pythonApiUrl = process.env.PYTHON_API_URL || 'http://127.0.0.1:5000';
 console.log(`Sending message to Python agent at ${pythonApiUrl}/message...`);
 
 const agentResponse = await fetch(`${pythonApiUrl}/message`, {
 method: 'POST',
 headers: { 'Content-Type': 'application/json' },
 body: JSON.stringify({ phone: senderPhone, message: text }),
 });

 if (agentResponse.ok) {
 const agentData = await agentResponse.json();
 console.log('Received response from Python agent:', agentData);
 
 if (agentData.success) {
 // Update Lead Data
 await Lead.findOneAndUpdate(
 { conversation_id: conversation._id },
 {
 workspace_id: workspace.workspace_id,
 conversation_id: conversation._id,
 phone: senderPhone,
 lead_data: agentData.lead_data || {},
 lead_score: agentData.lead_score || 0,
 lead_status: agentData.lead_status || 'new',
 needs_human_followup: agentData.needs_human_followup || false,
 next_action: agentData.next_action || ''
 },
 { upsert: true, new: true }
 );
 console.log('Lead data updated successfully');

 // Send reply back to WhatsApp
 if (agentData.reply) {
 const waResponse = await send_whatsapp_message(workspace.workspace_id, senderPhone, agentData.reply);
 const waMessageId = waResponse?.messages?.[0]?.id || '';

 const replyMessage = await Message.create({
 workspace_id: workspace.workspace_id,
 conversation_id: conversation._id,
 phone: senderPhone,
 direction: 'outgoing',
 message_type: 'text',
 text: agentData.reply,
 whatsapp_message_id: waMessageId,
 timestamp: new Date()
 });

 conversation.last_message_at = replyMessage.timestamp;
 await conversation.save();

 emitNewMessage(conversationId, replyMessage.toObject());
 emitConversationUpdated(workspace.workspace_id, {
 _id: conversation._id,
 phone: conversation.phone,
 last_message_at: conversation.last_message_at,
 workspace_id: conversation.workspace_id,
 });
 console.log('Agent reply sent and saved successfully');
 }
 } else {
 console.error('Python agent returned success=false:', agentData);
 }
 } else {
 console.error(`Python agent API returned status ${agentResponse.status}`);
 }
 } catch (agentError) {
 console.error("Error communicating with Python agent:", agentError)
 }
 }
 }
 }
 }
 
 // Return 200 OK immediately to WhatsApp to prevent retries
 return new NextResponse('EVENT_RECEIVED', { status: 200 });
 } else {
 // Return a 404 if the event is not from a WhatsApp API
 return new NextResponse('Not Found', { status: 404 });
 }
 } catch (error) {
 console.error('Error processing webhook:', error);
 // WhatsApp requires a 200 response even on error to stop retries, 
 // but returning 500 might be appropriate if we want them to retry.
 // Standard practice for Meta is to return 200 if we received it, regardless of our internal errors,
 // or return 500 to let it retry. We'll return 200 to prevent backlog if it's a persistent error.
 return new NextResponse('Internal Server Error', { status: 500 });
 }
}
