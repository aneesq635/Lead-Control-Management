import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Workspace from '@/models/Workspace';
import Conversation from '@/models/Conversation';
import Message from '@/models/Message';
import { send_whatsapp_message } from '@/lib/whatsapp';
import { z } from 'zod';
import { emitNewMessage } from '@/lib/socket/server';

const sendSchema = z.object({
  workspace_id: z.string(),
  conversation_id: z.string(),
  phone: z.string(),
  text: z.string().min(1)
});

export async function POST(request) {
  try {
    const body = await request.json();

    // Validate request body
    const result = sendSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json({ error: 'Invalid request data', details: result.error.format() }, { status: 400 });
    }

    const { workspace_id, conversation_id, phone, text } = result.data;

    await dbConnect();

    // Verify workspace exists
    const workspace = await Workspace.findOne({ workspace_id });
    if (!workspace) {
      return NextResponse.json({ error: 'Workspace not found' }, { status: 404 });
    }

    // Verify conversation exists
    const conversation = await Conversation.findById(conversation_id);
    if (!conversation) {
      return NextResponse.json({ error: 'Conversation not found' }, { status: 404 });
    }

    // Attempt to send message via WhatsApp Cloud API
    const waResponse = await send_whatsapp_message(workspace_id, phone, text);

    // Get the generated message ID from WhatsApp's response
    const waMessageId = waResponse.messages?.[0]?.id || '';

    // Save outgoing message in DB
    const newMessage = await Message.create({
      workspace_id,
      conversation_id,
      phone,
      direction: 'outgoing',
      message_type: 'text',
      text,
      whatsapp_message_id: waMessageId,
      timestamp: new Date() // Current time for outgoing
    });

    // Update conversation last activity
    conversation.last_message_at = newMessage.timestamp;
    await conversation.save();

    // ── REAL-TIME: Emit the outgoing message to all clients in this room ───
    // This ensures if two agents have the same conversation open, both see
    // the sent message immediately without relying on the optimistic UI update.
    emitNewMessage(conversation_id, newMessage.toObject());

    return NextResponse.json({ success: true, message: newMessage }, { status: 200 });

  } catch (error) {
    console.error('Error sending message API:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
