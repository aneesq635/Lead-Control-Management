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
// Paste this return() into your Conversation detail component
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
        <div>
          <h1 className="text-sm font-bold text-gray-900 dark:text-white leading-tight">
            {conversation.phone}
          </h1>
          <p className="text-[11px] text-gray-400 dark:text-gray-500">
            {workspace?.company_name}
          </p>
        </div>
      </header>

      {/* Messages Thread */}
      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto p-4 sm:p-6"
      >
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
                    isIncoming
                      ? 'text-gray-400 dark:text-gray-600'
                      : 'text-gray-400 dark:text-gray-500'
                  }`}>
                    {new Date(msg.timestamp).toLocaleTimeString([], {
                      hour: '2-digit', minute: '2-digit'
                    })}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Message Input */}
      <div className="px-4 py-3 sm:px-6 bg-white dark:bg-[#111] border-t border-gray-200 dark:border-gray-800 shrink-0">
        <form
          onSubmit={handleSendMessage}
          className="flex items-center gap-2 max-w-3xl mx-auto"
        >
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
  // return (
  //   <div className="flex flex-col h-full bg-gray-50">
  //     <header className="p-4 border-b bg-white flex items-center shadow-sm z-10">
  //       <Link href="/dashboard/conversations" className="mr-4 text-gray-500 hover:text-gray-900 transition-colors">
  //         <ArrowLeft size={20} />
  //       </Link>
  //       <div>
  //         <h1 className="text-xl font-bold text-black">{conversation.phone}</h1>
  //         <p className="text-xs text-gray-500">Workspace: {workspace?.company_name}</p>
  //       </div>
  //     </header>

  //     {/* Messages Thread */}
  //     <div
  //       ref={scrollRef}
  //       className="flex-1 overflow-y-auto p-4 space-y-4 flex flex-col items-center"
  //     >
  //       <div className="w-full max-w-3xl flex flex-col space-y-4">
  //         {messages.length === 0 && (
  //           <p className="text-center text-gray-500 my-8">No messages yet.</p>
  //         )}

  //         {messages.map((msg) => {
  //           const isIncoming = msg.direction === 'incoming';
  //           return (
  //             <div
  //               key={msg._id}
  //               className={`flex w-full ${isIncoming ? 'justify-start' : 'justify-end'}`}
  //             >
  //               <div
  //                 className={`max-w-[75%] rounded-2xl px-4 py-2 shadow-sm ${isIncoming
  //                     ? 'bg-white text-gray-900 border border-gray-100 rounded-tl-sm'
  //                     : 'bg-[#DCF8C6] text-gray-900 rounded-tr-sm' // WhatsApp green for outgoing
  //                   }`}
  //               >
  //                 <p className="text-[15px] whitespace-pre-wrap">{msg.text || `[${msg.message_type}]`}</p>
  //                 <div className="text-[10px] text-gray-500 mt-1 text-right flex justify-end items-center space-x-1">
  //                   <span>{new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
  //                 </div>
  //               </div>
  //             </div>
  //           );
  //         })}
  //       </div>
  //     </div>

  //     {/* Message Input */}
  //     <div className="p-4 bg-gray-100 border-t flex justify-center">
  //       <form
  //         onSubmit={handleSendMessage}
  //         className="flex space-x-2 w-full max-w-3xl bg-white p-2 rounded-full border border-gray-200 shadow-sm focus-within:ring-2 focus-within:ring-green-400 focus-within:border-transparent transition-all"
  //       >
  //         <input
  //           type="text"
  //           value={messageText}
  //           onChange={(e) => setMessageText(e.target.value)}
  //           className="flex-1 bg-transparent px-4 py-2 outline-none text-gray-800 placeholder-gray-400"
  //           placeholder="Type a message..."
  //           autoComplete="off"
  //           disabled={sending}
  //         />
  //         <button
  //           type="submit"
  //           disabled={sending || !messageText.trim()}
  //           className="bg-[#25D366] text-white p-2 rounded-full hover:bg-[#1EBE5A] transition-colors flex items-center justify-center h-10 w-10 shrink-0 disabled:opacity-50"
  //         >
  //           <Send size={18} className="translate-x-[2px]" />
  //         </button>
  //       </form>
  //     </div>
  //   </div>
  // );
}
