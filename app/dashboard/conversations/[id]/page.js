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

 // ── Scroll refs ───────────────────────────────────────────────────────────
 // bottomRef: a sentinel <div> sitting below the last message.
 // Calling bottomRef.current.scrollIntoView() is more reliable than
 // manually setting scrollTop = scrollHeight because it targets a real
 // DOM node rather than a calculated number that may not reflect the
 // latest paint when useEffect fires.
 const bottomRef = useRef(null);

 // Track whether the initial batch of messages has been loaded.
 // On first load we jump instantly (no animation). Every subsequent
 // message — incoming via socket or outgoing via send — scrolls smoothly.
 const isInitialLoad = useRef(true);

 // ── Typing indicator state ────────────────────────────────────────────────
 // Derived directly from the input value — no extra state needed.
 // True when the agent has typed something but not yet sent.
 const isTyping = messageText.trim().length > 0;

 // ── Socket.io: only handles INCOMING messages ────────────────────────────
 const handleSocketMessage = useCallback((newMessage) => {
 if (newMessage.direction !== 'incoming') return;
 setMessages((prev) => [...prev, newMessage]);
 }, []);

 const { connected } = useConversationSocket(id, handleSocketMessage);

 // ── Initial data fetch ────────────────────────────────────────────────────
 useEffect(() => {
 if (!id) return;

 const fetchConversationDetails = async () => {
 setLoading(true);
 isInitialLoad.current = true; // mark: next scroll should be instant
 try {
 const res = await fetch(`/api/conversations/${id}`);
 const data = await res.json();

 if (data.success) {
 setConversation(data.conversation);
 setWorkspace(data.workspace);
 setMessages(data.messages || []);
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

 // ── Auto-scroll ───────────────────────────────────────────────────────────
 // Fires whenever messages change OR the typing indicator appears/disappears.
 // Using scrollIntoView on the sentinel div is the standard React chat pattern:
 // it waits for the DOM to paint the new node, then scrolls to it precisely.
 useEffect(() => {
 if (!bottomRef.current) return;

 if (isInitialLoad.current) {
 // Jump to bottom instantly on first load — no animation
 bottomRef.current.scrollIntoView({ behavior: 'instant' });
 isInitialLoad.current = false;
 } else {
 // Smooth scroll for every new message or typing indicator toggle
 bottomRef.current.scrollIntoView({ behavior: 'smooth' });
 }
 }, [messages, isTyping]);

 // ── Send message ──────────────────────────────────────────────────────────
 const handleSendMessage = async (e) => {
 e.preventDefault();
 if (!messageText.trim() || sending) return;

 setSending(true);
 const textToSend = messageText.trim();
 setMessageText(""); // clear input immediately → typing indicator disappears

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
 setMessages((prev) => [...prev, data.message]);
 } else {
 console.error("Failed to send message:", data.error);
 setMessageText(textToSend); // restore on failure
 }
 } catch (err) {
 console.error("Error sending message:", err);
 setMessageText(textToSend);
 } finally {
 setSending(false);
 }
 };

 // ── Loading / error states ────────────────────────────────────────────────
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
 <div className="flex flex-col h-full bg-gray-50 [#0a0a0a]">

 {/* Header — unchanged */}
 <header className="px-4 py-3 border-b border-gray-200 bg-white [#111] flex items-center gap-3 shrink-0">
 <Link
 href="/dashboard/conversations"
 className="w-8 h-8 rounded-xl flex items-center justify-center text-gray-500 hover:text-gray-900 :text-white hover:bg-gray-100 :bg-gray-800 transition-all"
 >
 <ArrowLeft size={17} />
 </Link>
 <div className="w-px h-5 bg-gray-200 " />
 <div className="w-9 h-9 rounded-xl bg-gray-100 flex items-center justify-center text-sm font-bold text-gray-600 shrink-0">
 {conversation.phone?.slice(-2)}
 </div>
 <div className="flex-1">
 <h1 className="text-sm font-bold text-gray-900 leading-tight">
 {conversation.phone}
 </h1>
 <p className="text-[11px] text-gray-400 ">
 {workspace?.company_name}
 </p>
 </div>

 {/* Live connection badge */}
 <div
 className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-semibold transition-all ${
 connected
 ? 'bg-green-50 text-green-600 '
 : 'bg-gray-100 text-gray-400 '
 }`}
 title={connected ? 'Real-time active' : 'Connecting...'}
 >
 {connected ? <Wifi size={11} /> : <WifiOff size={11} />}
 {connected ? 'Live' : 'Offline'}
 </div>
 </header>

 {/* Messages thread */}
 <div className="flex-1 overflow-y-auto p-4 sm:p-6">
 <div className="max-w-3xl mx-auto flex flex-col space-y-3">

 {messages.length === 0 && !isTyping && (
 <p className="text-center text-gray-400 text-sm my-12">
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
 ? 'bg-white [#111] text-gray-900 border border-gray-100 rounded-tl-sm shadow-sm'
 : 'bg-black text-white rounded-tr-sm shadow-sm'
 }`}
 >
 <p className="text-sm whitespace-pre-wrap leading-relaxed">
 {msg.text || `[${msg.message_type}]`}
 </p>
 <p className={`text-[10px] mt-1.5 text-right ${
 isIncoming ? 'text-gray-400 ' : 'text-gray-400 '
 }`}>
 {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
 </p>
 </div>
 </div>
 );
 })}

 {/* ── Typing indicator ─────────────────────────────────────────────
 Appears on the RIGHT (outgoing) side while the agent is composing.
 Matches the exact same visual style as outgoing message bubbles
 (bg-black / , rounded-tr-sm) so it feels native.
 Three dots animate with staggered delays to create the wave effect.
 ─────────────────────────────────────────────────────────────────── */}
 {isTyping && (
 <div className="flex w-full justify-end">
 <div className="bg-black rounded-2xl rounded-tr-sm px-4 py-3 shadow-sm">
 <div className="flex items-center gap-[5px]">
 <span
 className="w-[7px] h-[7px] rounded-full bg-white "
 style={{ animation: 'typingBounce 1.2s ease-in-out infinite', animationDelay: '0ms' }}
 />
 <span
 className="w-[7px] h-[7px] rounded-full bg-white "
 style={{ animation: 'typingBounce 1.2s ease-in-out infinite', animationDelay: '200ms' }}
 />
 <span
 className="w-[7px] h-[7px] rounded-full bg-white "
 style={{ animation: 'typingBounce 1.2s ease-in-out infinite', animationDelay: '400ms' }}
 />
 </div>
 </div>
 </div>
 )}

 {/* ── Scroll sentinel ───────────────────────────────────────────────
 This invisible div sits at the very bottom of the message list.
 scrollIntoView() on this node is always accurate because it
 targets a real painted DOM element, not a calculated scrollHeight.
 ─────────────────────────────────────────────────────────────────── */}
 <div ref={bottomRef} />

 </div>
 </div>

 {/* Message input — unchanged */}
 <div className="px-4 py-3 sm:px-6 bg-white [#111] border-t border-gray-200 shrink-0">
 <form onSubmit={handleSendMessage} className="flex items-center gap-2 max-w-3xl mx-auto">
 <input
 type="text"
 value={messageText}
 onChange={(e) => setMessageText(e.target.value)}
 className="flex-1 h-11 px-4 rounded-xl border border-gray-200 bg-gray-50 [#0a0a0a] text-gray-900 placeholder-gray-400 text-sm focus:outline-none focus:ring-2 focus:ring-black :ring-white focus:border-transparent transition-all"
 placeholder="Type a message…"
 autoComplete="off"
 disabled={sending}
 />
 <button
 type="submit"
 disabled={sending || !messageText.trim()}
 className="w-11 h-11 bg-black hover:bg-gray-800 :bg-gray-100 text-white rounded-xl flex items-center justify-center transition-all duration-150 disabled:opacity-40 active:scale-95 shrink-0"
 >
 <Send size={16} className="translate-x-[1px]" />
 </button>
 </form>
 </div>

 </div>
 );
}
// "use client";

// import { useEffect, useState, useRef, useCallback } from 'react';
// import Link from 'next/link';
// import { ArrowLeft, Send, Wifi, WifiOff } from 'lucide-react';
// import { useParams } from 'next/navigation';
// import { useConversationSocket } from '@/lib/socket/client';

// export default function ConversationThreadPage() {
// const params = useParams();
// const id = params?.id;

// const [conversation, setConversation] = useState(null);
// const [messages, setMessages] = useState([]);
// const [workspace, setWorkspace] = useState(null);
// const [loading, setLoading] = useState(true);
// const [error, setError] = useState("");
// const [messageText, setMessageText] = useState("");
// const [sending, setSending] = useState(false);

// // Track rendered message IDs to prevent duplicates between optimistic UI
// // and socket echo (both the REST send response and the socket emit carry
// // the same _id, so we only render whichever arrives first).
// const seenMessageIds = useRef(new Set());
// const scrollRef = useRef(null);

// // ── Socket.io Real-Time Handler ──────────────────────────────────────────
// const handleSocketMessage = useCallback((newMessage) => {
// const msgId = newMessage._id?.toString();
// if (msgId && seenMessageIds.current.has(msgId)) return; // deduplicate
// if (msgId) seenMessageIds.current.add(msgId);
// setMessages((prev) => [...prev, newMessage]);
// }, []);

// const { connected } = useConversationSocket(id, handleSocketMessage);

// // ── Initial Data Fetch ───────────────────────────────────────────────────
// useEffect(() => {
// if (!id) return;

// const fetchConversationDetails = async () => {
// setLoading(true);
// try {
// const res = await fetch(`/api/conversations/${id}`);
// const data = await res.json();

// if (data.success) {
// setConversation(data.conversation);
// setWorkspace(data.workspace);
// const initialMessages = data.messages || [];
// initialMessages.forEach((m) => {
// if (m._id) seenMessageIds.current.add(m._id.toString());
// });
// setMessages(initialMessages);
// } else {
// setError(data.error || "Failed to load conversation");
// }
// } catch (err) {
// setError("Error fetching conversation details.");
// } finally {
// setLoading(false);
// }
// };

// fetchConversationDetails();
// }, [id]);

// useEffect(() => {
// if (scrollRef.current) {
// scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
// }
// }, [messages]);

// // ── Send Message ─────────────────────────────────────────────────────────
// const handleSendMessage = async (e) => {
// e.preventDefault();
// if (!messageText.trim() || sending) return;

// setSending(true);
// const textToSend = messageText.trim();
// setMessageText("");

// try {
// const res = await fetch('/api/messages/send', {
// method: 'POST',
// headers: { 'Content-Type': 'application/json' },
// body: JSON.stringify({
// workspace_id: conversation.workspace_id,
// conversation_id: conversation._id,
// phone: conversation.phone,
// text: textToSend
// }),
// });

// const data = await res.json();
// if (data.success) {
// const msgId = data.message._id?.toString();
// if (msgId) seenMessageIds.current.add(msgId);
// setMessages((prev) => [...prev, data.message]);
// } else {
// console.error("Failed to send message:", data.error);
// setMessageText(textToSend);
// }
// } catch (err) {
// console.error("Error sending message:", err);
// setMessageText(textToSend);
// } finally {
// setSending(false);
// }
// };

// if (loading) {
// return (
// <div className="p-8 flex justify-center items-center h-full text-gray-500">
// Loading conversation...
// </div>
// );
// }

// if (error || !conversation) {
// return <div className="p-8 text-red-500">{error || "Conversation not found."}</div>;
// }

// return (
// <div className="flex flex-col h-full bg-gray-50 [#0a0a0a]">

// {/* Header */}
// <header className="px-4 py-3 border-b border-gray-200 bg-white [#111] flex items-center gap-3 shrink-0">
// <Link
// href="/dashboard/conversations"
// className="w-8 h-8 rounded-xl flex items-center justify-center text-gray-500 hover:text-gray-900 :text-white hover:bg-gray-100 :bg-gray-800 transition-all"
// >
// <ArrowLeft size={17} />
// </Link>
// <div className="w-px h-5 bg-gray-200 " />
// <div className="w-9 h-9 rounded-xl bg-gray-100 flex items-center justify-center text-sm font-bold text-gray-600 shrink-0">
// {conversation.phone?.slice(-2)}
// </div>
// <div className="flex-1">
// <h1 className="text-sm font-bold text-gray-900 leading-tight">
// {conversation.phone}
// </h1>
// <p className="text-[11px] text-gray-400 ">
// {workspace?.company_name}
// </p>
// </div>

// {/* Live connection badge */}
// <div
// className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-semibold transition-all ${
// connected
// ? 'bg-green-50 text-green-600 '
// : 'bg-gray-100 text-gray-400 '
// }`}
// title={connected ? 'Real-time active' : 'Connecting...'}
// >
// {connected ? <Wifi size={11} /> : <WifiOff size={11} />}
// {connected ? 'Live' : 'Offline'}
// </div>
// </header>

// {/* Messages Thread */}
// <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 sm:p-6">
// <div className="max-w-3xl mx-auto flex flex-col space-y-3">
// {messages.length === 0 && (
// <p className="text-center text-gray-400 text-sm my-12">
// No messages yet.
// </p>
// )}

// {messages.map((msg) => {
// const isIncoming = msg.direction === 'incoming';
// return (
// <div
// key={msg._id}
// className={`flex w-full ${isIncoming ? 'justify-start' : 'justify-end'}`}
// >
// <div
// className={`max-w-[78%] sm:max-w-[65%] rounded-2xl px-4 py-2.5 ${
// isIncoming
// ? 'bg-white [#111] text-gray-900 border border-gray-100 rounded-tl-sm shadow-sm'
// : 'bg-black text-white rounded-tr-sm shadow-sm'
// }`}
// >
// <p className="text-sm whitespace-pre-wrap leading-relaxed">
// {msg.text || `[${msg.message_type}]`}
// </p>
// <p className={`text-[10px] mt-1.5 text-right ${
// isIncoming ? 'text-gray-400 ' : 'text-gray-400 '
// }`}>
// {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
// </p>
// </div>
// </div>
// );
// })}
// </div>
// </div>

// {/* Message Input */}
// <div className="px-4 py-3 sm:px-6 bg-white [#111] border-t border-gray-200 shrink-0">
// <form onSubmit={handleSendMessage} className="flex items-center gap-2 max-w-3xl mx-auto">
// <input
// type="text"
// value={messageText}
// onChange={(e) => setMessageText(e.target.value)}
// className="flex-1 h-11 px-4 rounded-xl border border-gray-200 bg-gray-50 [#0a0a0a] text-gray-900 placeholder-gray-400 text-sm focus:outline-none focus:ring-2 focus:ring-black :ring-white focus:border-transparent transition-all"
// placeholder="Type a message…"
// autoComplete="off"
// disabled={sending}
// />
// <button
// type="submit"
// disabled={sending || !messageText.trim()}
// className="w-11 h-11 bg-black hover:bg-gray-800 :bg-gray-100 text-white rounded-xl flex items-center justify-center transition-all duration-150 disabled:opacity-40 active:scale-95 shrink-0"
// >
// <Send size={16} className="translate-x-[1px]" />
// </button>
// </form>
// </div>

// </div>
// );
// }
