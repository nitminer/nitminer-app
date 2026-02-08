// Load environment variables from .env.local
require('dotenv').config({ path: require('path').join(__dirname, '.env.local') });

const { createServer } = require('http');
const { parse } = require('url');
const fs = require('fs');
const path = require('path');

// Create Next.js app
const next = require('next');
const socketIO = require('socket.io');

const port = parseInt(process.env.PORT || '7070', 10);
const dev = process.env.NODE_ENV !== 'production';
const hostname = 'localhost';

console.log(`Starting server on ${hostname}:${port} (${dev ? 'development' : 'production'} mode)`);

// Create Next app
const app = next({ dev, hostname, port });
const handle = app.getRequestHandler();

// Socket.io handler
const socketConnections = new Map();

const initializeSocket = (io) => {
  io.on('connection', (socket) => {
    console.log(`Socket connected: ${socket.id}`);

    // Join personal room
    socket.on('join', (email) => {
      console.log(`User ${email} joined with socket ${socket.id}`);
      socket.join(email);
      socketConnections.set(email, socket.id);
    });

    // Join conversation room
    socket.on('conversation:join', (conversationId) => {
      console.log(`Socket ${socket.id} joined conversation ${conversationId}`);
      socket.join(`conversation:${conversationId}`);
    });

    // New message in conversation
    socket.on('message:new', (data) => {
      console.log(`New message in conversation ${data.conversationId}`);
      io.to(`conversation:${data.conversationId}`).emit('message:received', data);
    });

    // Join refund request room
    socket.on('refund:join', (refundId) => {
      console.log(`Socket ${socket.id} joined refund ${refundId}`);
      socket.join(`refund:${refundId}`);
    });

    // New chat in refund
    socket.on('refund:chat', (data) => {
      console.log(`New chat in refund ${data.refundId}`);
      io.to(`refund:${data.refundId}`).emit('refund:message', data);
    });

    // Disconnect
    socket.on('disconnect', () => {
      console.log(`Socket disconnected: ${socket.id}`);
      // Remove from connections map
      for (const [email, socketId] of socketConnections.entries()) {
        if (socketId === socket.id) {
          socketConnections.delete(email);
          break;
        }
      }
    });

    // Handle errors
    socket.on('error', (error) => {
      console.error(`Socket error: ${error}`);
    });
  });
};

// Prepare Next app
app.prepare().then(() => {
  const server = createServer((req, res) => {
    const parsedUrl = parse(req.url, true);
    handle(req, res, parsedUrl);
  });

  // Attach Socket.io to HTTP server
  const io = socketIO(server, {
    cors: {
      origin: ['http://localhost:6060', 'http://localhost:3000'],
      methods: ['GET', 'POST'],
    },
    transports: ['websocket', 'polling'],
  });

  // Initialize Socket.io handlers
  initializeSocket(io);

  // Store io instance globally for use in API routes
  global.io = io;

  server.listen(port, (err) => {
    if (err) throw err;
    console.log(`✅ Server ready on http://${hostname}:${port}`);
    console.log(`✅ Socket.io ready on ws://${hostname}:${port}`);
  });
});
