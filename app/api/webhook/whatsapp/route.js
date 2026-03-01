import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Workspace from '@/models/Workspace';
import Conversation from '@/models/Conversation';
import Message from '@/models/Message';


export async function GET(request) {
  const { searchParams } = new URL(request.url);
  
  const mode = searchParams.get('hub.mode');
  const token = searchParams.get('hub.verify_token');
  const challenge = searchParams.get('hub.challenge');

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
              workspace_id: workspace._id,
              phone: senderPhone
            });

            if (!conversation) {
              conversation = await Conversation.create({
                workspace_id: workspace._id,
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
              await Message.create({
                workspace_id: workspace._id,
                conversation_id: conversation._id,
                phone: senderPhone,
                direction: 'incoming',
                message_type: messageType,
                text: text,
                whatsapp_message_id: messageId,
                timestamp: timestamp
              });
              
              console.log(`Saved incoming message from ${senderPhone} for workspace ${workspace.company_name}`);
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
