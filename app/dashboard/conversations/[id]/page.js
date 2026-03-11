"use client";

import { useEffect, useState, useRef, useCallback } from 'react';
import Link from 'next/link';
import { ArrowLeft, Send, Wifi, WifiOff } from 'lucide-react';
import { useParams } from 'next/navigation';
import { useConversationSocket } from '@/lib/socket/client';

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

  // Track rendered message IDs to prevent duplicates between optimistic UI
  // and socket echo (both the REST send response and the socket emit carry
  // the same _id, so we only render whichever arrives first).
  const seenMessageIds = useRef(new Set());
  const scrollRef = useRef(null);

  // ── Socket.io Real-Time Handler ──────────────────────────────────────────
  const handleSocketMessage = useCallback((newMessage) => {
    const msgId = newMessage._id?.toString();
    if (msgId && seenMessageIds.current.has(msgId)) return; // deduplicate
    if (msgId) seenMessageIds.current.add(msgId);
    setMessages((prev) => [...prev, newMessage]);
  }, []);

  const { connected } = useConversationSocket(id, handleSocketMessage);

  // ── Initial Data Fetch ───────────────────────────────────────────────────
  useEffect(() => {
    if (!id) return;

    const fetchConversationDetails = async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/conversations/${id}`);
        const data = await res.json();

        if (data.success) {
          setConversation(data.conversation);
          setWorkspace(data.workspace);
          const initialMessages = data.messages || [];
          initialMessages.forEach((m) => {
            if (m._id) seenMessageIds.current.add(m._id.toString());
          });
          setMessages(initialMessages);
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

  // ── Send Message ─────────────────────────────────────────────────────────
  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!messageText.trim() || sending) return;

    setSending(true);
    const textToSend = messageText.trim();
    setMessageText("");

    try {
      const res = await fetch('/api/messages/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          workspace_id: conversation.workspace_id,
          conversation_id: conversation._id,
          phone: conversation.phone,
          text: textToSend
        }),
      });

      const data = await res.json();
      if (data.success) {
        const msgId = data.message._id?.toString();
        if (msgId) seenMessageIds.current.add(msgId);
        setMessages((prev) => [...prev, data.message]);
      } else {
        console.error("Failed to send message:", data.error);
        setMessageText(textToSend);
      }
    } catch (err) {
      console.error("Error sending message:", err);
      setMessageText(textToSend);
    } finally {
      setSending(false);
    }
  };

  if (loading) {
    return (
      <div className="p-8 flex justify-center items-center h-full text-gray-500">
        Loading conversation...
      </div>
    );
  }

  if (error || !conversation) {
    return <div className="p-8 text-red-500">{error || "Conversation not found."}</div>;
  }

  return (
    <div className="flex flex-col h-full bg-gray-50 dark:bg-[#0a0a0a]">

      {/* Header */}
      <header className="px-4 py-3 border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-[#111] flex items-center gap-3 shrink-0">
        <Link
          href="/dashboard/conversations"
          className="w-8 h-8 rounded-xl flex items-center justify-center text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800 transition-all"
        >
          <ArrowLeft size={17} />
        </Link>
        <div className="w-px h-5 bg-gray-200 dark:bg-gray-800" />
        <div className="w-9 h-9 rounded-xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-sm font-bold text-gray-600 dark:text-gray-300 shrink-0">
          {conversation.phone?.slice(-2)}
        </div>
        <div className="flex-1">
          <h1 className="text-sm font-bold text-gray-900 dark:text-white leading-tight">
            {conversation.phone}
          </h1>
          <p className="text-[11px] text-gray-400 dark:text-gray-500">
            {workspace?.company_name}
          </p>
        </div>

        {/* Live connection badge */}
        <div
          className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-semibold transition-all ${
            connected
              ? 'bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400'
              : 'bg-gray-100 dark:bg-gray-800 text-gray-400 dark:text-gray-500'
          }`}
          title={connected ? 'Real-time active' : 'Connecting...'}
        >
          {connected ? <Wifi size={11} /> : <WifiOff size={11} />}
          {connected ? 'Live' : 'Offline'}
        </div>
      </header>

      {/* Messages Thread */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 sm:p-6">
        <div className="max-w-3xl mx-auto flex flex-col space-y-3">
          {messages.length === 0 && (
            <p className="text-center text-gray-400 dark:text-gray-600 text-sm my-12">
              No messages yet.
            </p>
          )}

          {messages.map((msg) => {
            const isIncoming = msg.direction === 'incoming';
            return (
              <div
                key={msg._id}
                className={`flex w-full ${isIncoming ? 'justify-start' : 'justify-end'}`}
              >
                <div
                  className={`max-w-[78%] sm:max-w-[65%] rounded-2xl px-4 py-2.5 ${
                    isIncoming
                      ? 'bg-white dark:bg-[#111] text-gray-900 dark:text-gray-100 border border-gray-100 dark:border-gray-800 rounded-tl-sm shadow-sm'
                      : 'bg-black dark:bg-white text-white dark:text-black rounded-tr-sm shadow-sm'
                  }`}
                >
                  <p className="text-sm whitespace-pre-wrap leading-relaxed">
                    {msg.text || `[${msg.message_type}]`}
                  </p>
                  <p className={`text-[10px] mt-1.5 text-right ${
                    isIncoming ? 'text-gray-400 dark:text-gray-600' : 'text-gray-400 dark:text-gray-500'
                  }`}>
                    {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Message Input */}
      <div className="px-4 py-3 sm:px-6 bg-white dark:bg-[#111] border-t border-gray-200 dark:border-gray-800 shrink-0">
        <form onSubmit={handleSendMessage} className="flex items-center gap-2 max-w-3xl mx-auto">
          <input
            type="text"
            value={messageText}
            onChange={(e) => setMessageText(e.target.value)}
            className="flex-1 h-11 px-4 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-[#0a0a0a] text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-600 text-sm focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white focus:border-transparent transition-all"
            placeholder="Type a message…"
            autoComplete="off"
            disabled={sending}
          />
          <button
            type="submit"
            disabled={sending || !messageText.trim()}
            className="w-11 h-11 bg-black dark:bg-white hover:bg-gray-800 dark:hover:bg-gray-100 text-white dark:text-black rounded-xl flex items-center justify-center transition-all duration-150 disabled:opacity-40 active:scale-95 shrink-0"
          >
            <Send size={16} className="translate-x-[1px]" />
          </button>
        </form>
      </div>

    </div>
  );
}
