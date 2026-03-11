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
export function useConversationSocket(conversationId, onNewMessage) {
  const socketRef = useRef(null);
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    if (!conversationId) return;

    // Create the socket connection.
    // The URL is empty string so it connects to the same origin (the custom server).
    const socket = io({
      path: '/socket.io',
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
    });

    socketRef.current = socket;

    // ── Connection Events ──────────────────────────────────────────────────
    socket.on('connect', () => {
      console.log('🔌 Socket connected:', socket.id);
      setConnected(true);

      // Join the conversation-specific room after connecting
      socket.emit('conversation:join', conversationId);
    });

    socket.on('disconnect', (reason) => {
      console.log('🔴 Socket disconnected:', reason);
      setConnected(false);
    });

    socket.on('connect_error', (err) => {
      console.error('⚠️  Socket connection error:', err.message);
    });

    socket.on('reconnect', (attempt) => {
      console.log(`♻️  Socket reconnected after ${attempt} attempt(s)`);
      // Re-join the room after reconnect
      socket.emit('conversation:join', conversationId);
    });

    // ── Message Events ─────────────────────────────────────────────────────
    socket.on('message:new', (message) => {
      console.log('📨 New message received via socket:', message._id);
      if (typeof onNewMessage === 'function') {
        onNewMessage(message);
      }
    });

    // ── Cleanup ────────────────────────────────────────────────────────────
    return () => {
      if (socket.connected) {
        socket.emit('conversation:leave', conversationId);
      }
      socket.disconnect();
      socketRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
export function useWorkspaceSocket(workspaceId, onConversationUpdated) {
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
      if (typeof onConversationUpdated === 'function') {
        onConversationUpdated(conversation);
      }
    });

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
