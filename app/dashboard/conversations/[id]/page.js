"use client";

import { useEffect, useState, useRef } from 'react';
import Link from 'next/link';
import { ArrowLeft, Send } from 'lucide-react';
import { useParams } from 'next/navigation';

export default function ConversationThreadPage() {
  const params = useParams();
  const id = params?.id;

  const [conversation, setConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [workspace, setWorkspace] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [messageText, setMessageText] = useState("");
  const [sending, setSending] = useState(false);

  const scrollRef = useRef(null);

  useEffect(() => {
    if (!id) return;

    const fetchConversationDetails = async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/conversations/${id}`);
        const data = await res.json();

        if (data.success) {
          setConversation(data.conversation);
          setMessages(data.messages);
          setWorkspace(data.workspace);
        } else {
          setError(data.error || "Failed to load conversation");
        }
      } catch (err) {
        setError("Error fetching conversation details.");
      } finally {
        setLoading(false);
      }
    };

    fetchConversationDetails();
  }, [id]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!messageText.trim() || sending) return;

    setSending(true);
    const textToSend = messageText.trim();
    // Clear message quickly for better UX
    setMessageText("");

    try {
      const res = await fetch('/api/messages/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          workspace_id: conversation.workspace_id,
          conversation_id: conversation._id,
          phone: conversation.phone,
          text: textToSend
        }),
      });

      const data = await res.json();
      if (data.success) {
        // Append the new message to the list safely
        setMessages(prev => [...prev, data.message]);
      } else {
        console.error("Failed to send message:", data.error);
        setMessageText(textToSend); // Restore text on failure
      }
    } catch (err) {
      console.error("Error sending message:", err);
      setMessageText(textToSend); // Restore text on failure
    } finally {
      setSending(false);
    }
  };

  if (loading) {
    return <div className="p-8 flex justify-center items-center h-full text-gray-500">Loading conversation...</div>;
  }

  if (error || !conversation) {
    return <div className="p-8 text-red-500">{error || "Conversation not found."}</div>;
  }

  return (
    <div className="flex flex-col h-full bg-gray-50">
      <header className="p-4 border-b bg-white flex items-center shadow-sm z-10">
        <Link href="/dashboard/conversations" className="mr-4 text-gray-500 hover:text-gray-900 transition-colors">
          <ArrowLeft size={20} />
        </Link>
        <div>
          <h1 className="text-xl font-bold text-black">{conversation.phone}</h1>
          <p className="text-xs text-gray-500">Workspace: {workspace?.company_name}</p>
        </div>
      </header>

      {/* Messages Thread */}
      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto p-4 space-y-4 flex flex-col items-center"
      >
        <div className="w-full max-w-3xl flex flex-col space-y-4">
          {messages.length === 0 && (
            <p className="text-center text-gray-500 my-8">No messages yet.</p>
          )}

          {messages.map((msg) => {
            const isIncoming = msg.direction === 'incoming';
            return (
              <div
                key={msg._id}
                className={`flex w-full ${isIncoming ? 'justify-start' : 'justify-end'}`}
              >
                <div
                  className={`max-w-[75%] rounded-2xl px-4 py-2 shadow-sm ${isIncoming
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
          onSubmit={handleSendMessage}
          className="flex space-x-2 w-full max-w-3xl bg-white p-2 rounded-full border border-gray-200 shadow-sm focus-within:ring-2 focus-within:ring-green-400 focus-within:border-transparent transition-all"
        >
          <input
            type="text"
            value={messageText}
            onChange={(e) => setMessageText(e.target.value)}
            className="flex-1 bg-transparent px-4 py-2 outline-none text-gray-800 placeholder-gray-400"
            placeholder="Type a message..."
            autoComplete="off"
            disabled={sending}
          />
          <button
            type="submit"
            disabled={sending || !messageText.trim()}
            className="bg-[#25D366] text-white p-2 rounded-full hover:bg-[#1EBE5A] transition-colors flex items-center justify-center h-10 w-10 shrink-0 disabled:opacity-50"
          >
            <Send size={18} className="translate-x-[2px]" />
          </button>
        </form>
      </div>
    </div>
  );
}
