/**
 * Custom Next.js Server with Socket.io
 *
 * WHY A CUSTOM SERVER?
 * Next.js App Router does not expose the underlying Node.js HTTP server.
 * To attach Socket.io (which needs the raw httpServer), we must create our
 * own server.js that boots Next.js manually and then attaches Socket.io to
 * the same HTTP server. This is the official recommended approach.
 *
 * The Socket.io instance is stored on `global.io` so that any API route
 * (webhook, send message, etc.) can call global.io.to(room).emit(...)
 * without needing to import a complex singleton.
 */

import { createServer } from 'http';
import { parse } from 'url';
import next from 'next';
import { initSocketServer } from './lib/socket/server.js';

const dev = process.env.NODE_ENV !== 'production';
const hostname = process.env.HOSTNAME || 'localhost';
const port = parseInt(process.env.PORT || '3000', 10);

const app = next({ dev, hostname, port });
const handle = app.getRequestHandler();

app.prepare().then(() => {
  // 1. Create the raw Node.js HTTP server
  const httpServer = createServer(async (req, res) => {
    try {
      const parsedUrl = parse(req.url, true);
      await handle(req, res, parsedUrl);
    } catch (err) {
      console.error('Error handling request:', err);
      res.statusCode = 500;
      res.end('Internal Server Error');
    }
  });

  // 2. Attach Socket.io to the same HTTP server
  initSocketServer(httpServer);

  // 3. Start listening
  httpServer.listen(port, hostname, () => {
    console.log(`✅ Server ready on http://${hostname}:${port}`);
    console.log(`✅ Socket.io is active`);
  });
});
