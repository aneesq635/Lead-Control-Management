/**
 * lib/socket/server.js
 *
 * Initializes the Socket.io server and attaches it to the Node.js httpServer.
 * Stores the io instance on `global.io` so any API route can emit events.
 *
 * ROOM STRATEGY:
 *   Each conversation gets its own Socket.io room keyed by conversationId.
 *   When the frontend opens a conversation, it emits 'conversation:join'.
 *   When it navigates away, it emits 'conversation:leave'.
 *   The webhook emits 'message:new' to the room → only the open tab receives it.
 *
 * EVENT CONTRACT:
 *   Client → Server:
 *     'conversation:join'   (conversationId: string)
 *     'conversation:leave'  (conversationId: string)
 *
 *   Server → Client:
 *     'message:new'         (message: MessageObject)
 *     'conversation:updated' (conversation: ConversationObject)
 */

import { Server } from 'socket.io';

/**
 * @param {import('http').Server} httpServer
 * @returns {import('socket.io').Server}
 */
export function initSocketServer(httpServer) {
  // Prevent double-initialization in development hot reloads
  if (global.io) {
    console.log('♻️  Socket.io already initialized, reusing instance.');
    return global.io;
  }

  const io = new Server(httpServer, {
    // Allow all origins in development; restrict in production via env
    cors: {
      origin: process.env.NEXT_PUBLIC_APP_URL || '*',
      methods: ['GET', 'POST'],
    },
    // Path defaults to /socket.io — keep this consistent with the client
    path: '/socket.io',
    // Use websocket first, fall back to polling if needed
    transports: ['websocket', 'polling'],
  });

  // ─── Connection Lifecycle ────────────────────────────────────────────────
  io.on('connection', (socket) => {
    console.log(`🔌 Socket connected: ${socket.id}`);

    /**
     * Join a conversation room.
     * The frontend calls this when it opens a conversation thread.
     */
    socket.on('conversation:join', (conversationId) => {
      if (!conversationId || typeof conversationId !== 'string') return;

      socket.join(conversationId);
      console.log(`📥 Socket ${socket.id} joined room: ${conversationId}`);
    });

    /**
     * Leave a conversation room.
     * The frontend calls this on component unmount or navigation.
     */
    socket.on('conversation:leave', (conversationId) => {
      if (!conversationId || typeof conversationId !== 'string') return;

      socket.leave(conversationId);
      console.log(`📤 Socket ${socket.id} left room: ${conversationId}`);
    });

    /**
     * Handle disconnection — Socket.io automatically removes
     * the socket from all rooms, so no manual cleanup needed.
     */
    socket.on('disconnect', (reason) => {
      console.log(`🔴 Socket disconnected: ${socket.id} (${reason})`);
    });

    socket.on('error', (err) => {
      console.error(`⚠️  Socket error [${socket.id}]:`, err);
    });
  });

  // Store globally so API routes can access it without circular imports
  global.io = io;

  console.log('🚀 Socket.io server initialized');
  return io;
}

/**
 * Emit a new incoming message to all clients subscribed to that conversation.
 * Call this from the webhook route after saving to DB.
 *
 * @param {string} conversationId
 * @param {object} message - The saved Mongoose document (plain object)
 */
export function emitNewMessage(conversationId, message) {
  if (!global.io) {
    console.warn('⚠️  Socket.io not initialized — cannot emit message:new');
    return;
  }
  console.log("conversation id + message", conversationId, message)
  global.io.to(conversationId).emit('message:new', message);
}

/**
 * Emit a conversation update (e.g., new message arrived, last_message_at changed).
 * Useful for the conversations list page to re-sort without a full reload.
 *
 * @param {string} workspaceId
 * @param {object} conversation - Plain conversation object
 */
export function emitConversationUpdated(workspaceId, conversation) {
  if (!global.io) return;
  // Broadcast to a workspace-level room so the list page can update
  global.io.to(`workspace:${workspaceId}`).emit('conversation:updated', conversation);
}

export function emitNewConversation(workspaceId, conversation){
if(!global.io) return;
global.io.to(`workspace:${workspaceId}`).emit('conversation:new', conversation);
}