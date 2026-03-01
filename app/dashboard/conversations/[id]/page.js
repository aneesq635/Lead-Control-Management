import dbConnect from '@/lib/mongodb';
import Workspace from '@/models/Workspace';
import Conversation from '@/models/Conversation';
import Message from '@/models/Message';
import Link from 'next/link';
import { ArrowLeft, Send } from 'lucide-react';
import { revalidatePath } from 'next/cache';
import { send_whatsapp_message } from '@/lib/whatsapp';

export default async function ConversationThreadPage({ params }) {
  const { id } = params;

  await dbConnect();

  const conversation = await Conversation.findById(id).lean();

  if (!conversation) {
    return <div className="p-8">Conversation not found.</div>;
  }

  // Get messages sorted by oldest first
  const messages = await Message.find({ conversation_id: id })
    .sort({ timestamp: 1 })
    .lean();

  const workspace = await Workspace.findById(conversation.workspace_id).lean();

  // Server action for sending a message
  async function handleSendMessage(formData) {
    'use server';
    const text = formData.get('message_text');
    if (!text || !text.trim()) return;

    await dbConnect();

    // Send via WhatsApp
    try {
      const waResponse = await send_whatsapp_message(
        conversation.workspace_id.toString(),
        conversation.phone,
        text
      );
      
      const waMessageId = waResponse.messages?.[0]?.id || '';

      // Save to MongoDB
      const newMsg = await Message.create({
        workspace_id: conversation.workspace_id,
        conversation_id: conversation._id,
        phone: conversation.phone,
        direction: 'outgoing',
        message_type: 'text',
        text: text,
        whatsapp_message_id: waMessageId,
        timestamp: new Date()
      });

      await Conversation.findByIdAndUpdate(conversation._id, {
        last_message_at: newMsg.timestamp
      });

      // Revalidate to show new message
      revalidatePath(`/dashboard/conversations/${conversation._id.toString()}`);
    } catch (error) {
      console.error('Failed to send message:', error);
      // In a real app we'd handle error state, passing it back to UI
    }
  }

  return (
    <div className="flex flex-col h-full bg-gray-50">
      <header className="p-4 border-b bg-white flex items-center shadow-sm z-10">
        <Link href="/dashboard/conversations" className="mr-4 text-gray-500 hover:text-gray-900 transition-colors">
          <ArrowLeft size={20} />
        </Link>
        <div>
          <h1 className="text-xl font-bold">{conversation.phone}</h1>
          <p className="text-xs text-gray-500">Workspace: {workspace?.company_name}</p>
        </div>
      </header>

      {/* Messages Thread */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 flex flex-col items-center">
        <div className="w-full max-w-3xl flex flex-col space-y-4">
          {messages.length === 0 && (
            <p className="text-center text-gray-500 my-8">No messages yet.</p>
          )}

          {messages.map((msg) => {
            const isIncoming = msg.direction === 'incoming';
            return (
              <div 
                key={msg._id.toString()} 
                className={`flex w-full ${isIncoming ? 'justify-start' : 'justify-end'}`}
              >
                <div 
                  className={`max-w-[75%] rounded-2xl px-4 py-2 shadow-sm ${
                    isIncoming 
                      ? 'bg-white text-gray-900 border border-gray-100 rounded-tl-sm' 
                      : 'bg-[#DCF8C6] text-gray-900 rounded-tr-sm' // WhatsApp green for outgoing
                  }`}
                >
                  <p className="text-[15px] whitespace-pre-wrap">{msg.text || `[${msg.message_type}]`}</p>
                  <div className="text-[10px] text-gray-500 mt-1 text-right flex justify-end items-center space-x-1">
                    <span>{new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Message Input */}
      <div className="p-4 bg-gray-100 border-t flex justify-center">
        <form 
          action={handleSendMessage} 
          className="flex space-x-2 w-full max-w-3xl bg-white p-2 rounded-full border border-gray-200 shadow-sm focus-within:ring-2 focus-within:ring-green-400 focus-within:border-transparent transition-all"
        >
          <input 
            type="text" 
            name="message_text"
            className="flex-1 bg-transparent px-4 py-2 outline-none text-gray-800 placeholder-gray-400"
            placeholder="Type a message..."
            autoComplete="off"
          />
          <button 
            type="submit" 
            className="bg-[#25D366] text-white p-2 rounded-full hover:bg-[#1EBE5A] transition-colors flex items-center justify-center h-10 w-10 shrink-0"
          >
            <Send size={18} className="translate-x-[2px]" />
          </button>
        </form>
      </div>
    </div>
  );
}
