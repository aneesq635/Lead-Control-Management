/**
 * lib/socket/client.js
 *
 * React hook that manages a Socket.io client connection.
 *
 * USAGE in a conversation page:
 *
 *   import { useConversationSocket } from '@/lib/socket/client';
 *
 *   const { connected } = useConversationSocket(conversationId, (message) => {
 *     setMessages(prev => [...prev, message]);
 *   });
 *
 * The hook:
 *  1. Creates a single socket connection when the component mounts.
 *  2. Joins the conversation room.
 *  3. Listens for 'message:new' events and calls onNewMessage.
 *  4. Leaves the room and disconnects when the component unmounts.
 *  5. Handles reconnection automatically via Socket.io built-in logic.
 */

'use client';

import { useEffect, useRef, useState } from 'react';
import { io } from 'socket.io-client';

/**
 * Hook to subscribe to real-time messages for a specific conversation.
 *
 * @param {string|null} conversationId - MongoDB _id of the conversation
 * @param {(message: object) => void} onNewMessage - Called when a new message arrives
 * @returns {{ connected: boolean }}
 */
export function useConversationSocket(conversationId, onNewMessage, onConversationUpdated) {
  const socketRef = useRef(null);
  const [connected, setConnected] = useState(false);
  const onNewMessageRef = useRef(onNewMessage);
  const onConversationUpdatedRef = useRef(onConversationUpdated);

  // Update refs when callbacks change
  useEffect(() => {
    onNewMessageRef.current = onNewMessage;
    onConversationUpdatedRef.current = onConversationUpdated;
  }, [onNewMessage, onConversationUpdated]);

  useEffect(() => {
    if (!conversationId) return;

    const socket = io({
      path: '/socket.io',
      transports: ['websocket', 'polling'],
      reconnection: true,
    });

    socketRef.current = socket;

    socket.on('connect', () => {
      setConnected(true);
      socket.emit('conversation:join', conversationId);
    });

    socket.on('disconnect', () => setConnected(false));

    socket.on('message:new', (message) => {
      if (typeof onNewMessageRef.current === 'function') {
        onNewMessageRef.current(message);
      }
    });

    socket.on('conversation:updated', (conversation) => {
      if (typeof onConversationUpdatedRef.current === 'function') {
        onConversationUpdatedRef.current(conversation);
      }
    });

    return () => {
      if (socket.connected) {
        socket.emit('conversation:leave', conversationId);
      }
      socket.disconnect();
      socketRef.current = null;
    };
  }, [conversationId]);

  return { connected };
}

/**
 * Hook to subscribe to workspace-level conversation updates.
 * Used in the conversations list page to show new conversations or
 * update last_message_at without a full reload.
 *
 * @param {string|null} workspaceId
 * @param {(conversation: object) => void} onConversationUpdated
 * @returns {{ connected: boolean }}
 */
export function useWorkspaceSocket(workspaceId,onNewConversation, onConversationUpdated ) {
  const socketRef = useRef(null);
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    if (!workspaceId) return;

    const socket = io({
      path: '/socket.io',
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionAttempts: 5,
    });

    socketRef.current = socket;

    socket.on('connect', () => {
      setConnected(true);
      socket.emit('conversation:join', `workspace:${workspaceId}`);
    });

    socket.on('disconnect', () => setConnected(false));

    socket.on('reconnect', () => {
      socket.emit('conversation:join', `workspace:${workspaceId}`);
    });

    socket.on('conversation:updated', (conversation) => {
      console.log("conversastion updated call", conversation)
      if (typeof onConversationUpdated === 'function') {
        onConversationUpdated(conversation);
      }
    });

    socket.on('conversation:new', (conversation)=>{
      console.log("new conversation appear", conversation)
      onNewConversation(conversation)
    })

    return () => {
      if (socket.connected) {
        socket.emit('conversation:leave', `workspace:${workspaceId}`);
      }
      socket.disconnect();
      socketRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [workspaceId]);

  return { connected };
}
