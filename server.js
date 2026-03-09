// Load environment variables from .env.local
require("dotenv").config({
  path: require("path").join(__dirname, ".env.local"),
});

const { createServer } = require("http");
const { parse } = require("url");
const next = require("next");
const socketIO = require("socket.io");
const Redis = require("ioredis");
const { createAdapter } = require("@socket.io/redis-adapter");

// Server configs
const port = parseInt(process.env.PORT || "7070" , 10);
const dev = process.env.NODE_ENV !== 'production'; // Enable development mode only in non-production
const hostname = "0.0.0.0";

// Redis configuration for Socket.IO
const redisUrl = process.env.REDIS_URL;
const redisHost = process.env.REDIS_HOST || "localhost";
const redisPort = parseInt(process.env.REDIS_PORT || "6379", 10);
const redisPassword = process.env.REDIS_PASSWORD;
const enableRedis = process.env.REDIS_ENABLED !== "false";

// Production-safe logging
const log = (message, data = null) => {
  if (dev) {
    console.log(message, data || '');
  }
};

log(
  `Starting server on ${hostname}:${port} (${dev ? "development" : "production"} mode)`
);

// Create Next.js app
const app = next({ dev, hostname, port });
const handle = app.getRequestHandler();

// Socket connections map
const socketConnections = new Map();

// Connection monitoring
let connectionStats = {
  total: 0,
  active: 0,
  admins: 0,
  sessions: {},
};

// Log connection stats periodically
const monitorInterval = setInterval(() => {
  const stats = Object.assign({}, connectionStats);
  stats.timestamp = new Date().toISOString();
  log("📊 Connection Stats:", stats);
}, 30000); // Every 30 seconds

// Socket event initializer
const initializeSocket = (io) => {
  io.on("connection", (socket) => {
    // Track connection stats
    connectionStats.total++;
    connectionStats.active = io.engine.clientsCount || socketConnections.size;

    log(`Socket connected: ${socket.id} (Total: ${connectionStats.active})`);

    socket.on("join", (email) => {
      socket.join(email);
      socketConnections.set(email, socket.id);
      log(`User ${email} joined with socket ${socket.id}`);
    });

    socket.on("conversation:join", (conversationId) => {
      socket.join(`conversation:${conversationId}`);
      log(`Socket ${socket.id} joined conversation ${conversationId}`);
    });

    socket.on("message:new", (data) => {
      io.to(`conversation:${data.conversationId}`).emit("message:received", data);
      log(`New message in conversation ${data.conversationId}`);
    });

    socket.on("refund:join", (refundId) => {
      socket.join(`refund:${refundId}`);
      log(`Socket ${socket.id} joined refund ${refundId}`);
    });

    socket.on("refund:chat", (data) => {
      io.to(`refund:${data.refundId}`).emit("refund:message", data);
      log(`New chat in refund ${data.refundId}`);
    });

    // LIVE CHAT HANDLERS
    // Admin registration
    socket.on("admin:register", (data) => {
      socket.join("admins");
      socket.adminName = data.adminName;
      socket.isAdmin = true;
      connectionStats.admins++;
      log(`Admin ${data.adminName} registered (${socket.id}) - Total admins: ${connectionStats.admins}`);
    });

    // User requesting an agent
    socket.on("user:request-agent", (data) => {
      const { sessionId, userId, userEmail, userName } = data;
      socket.join(`session:${sessionId}`);
      socket.sessionId = sessionId;
      socket.userId = userId;
      socket.userEmail = userEmail;
      socket.userName = userName;

      log('📞 User requesting agent:', {
        sessionId,
        userId,
        userEmail,
        userName,
        socketId: socket.id,
      });

      // Notify all admins
      io.to("admins").emit("admin:user-request", {
        sessionId,
        userId,
        userEmail,
        userName,
      });

      log(`✅ Broadcasting to admins room for session ${sessionId}`);
    });

    // User sending message
    socket.on("user:message", (data) => {
      const { sessionId, message, userId, userEmail, userName } = data;
      const messageId = Date.now();

      // Broadcast to session participants (for agent:message)
      io.to(`session:${sessionId}`).emit("agent:message", {
        id: messageId,
        sessionId,
        message,
        userId,
        userEmail,
        userName,
        sender: "user",
        timestamp: new Date(),
      });

      // Also notify admins listening on admin channel
      io.to("admins").emit("admin:user-message", {
        id: messageId,
        sessionId,
        message,
        userId,
        userEmail,
        userName,
        sender: "user",
        timestamp: new Date(),
      });

      log(`📨 User message in session ${sessionId}: ${message} (from ${userName} / ${userEmail})`);
    });

    // Admin accepting session
    socket.on("admin:accept-session", (data) => {
      const { sessionId, adminName } = data;
      socket.join(`session:${sessionId}`);
      socket.activeSessionId = sessionId;

      // Notify user that admin connected
      io.to(`session:${sessionId}`).emit("agent:connected", {
        sessionId,
        agentName: adminName,
        adminId: socket.id,
      });

      log(`Admin ${adminName} accepted session ${sessionId}`);
    });

    // Admin sending message
    socket.on("admin:message", (data) => {
      const { sessionId, message, adminName } = data;
      const messageId = Date.now();

      log('📨 Admin message:', {
        sessionId,
        adminName,
        message,
        socketId: socket.id,
      });

      // If admin hasn't explicitly joined session yet, do it now
      if (!socket.activeSessionId || socket.activeSessionId !== sessionId) {
        socket.leave(`session:${socket.activeSessionId}`);
        socket.join(`session:${sessionId}`);
        socket.activeSessionId = sessionId;

        // Notify user that agent connected
        io.to(`session:${sessionId}`).emit("agent:connected", {
          sessionId,
          agentName: adminName,
          adminId: socket.id,
        });

        log(`🟢 Admin ${adminName} auto-joined session ${sessionId}`);
      }

      // Broadcast to user and other admins in session
      io.to(`session:${sessionId}`).emit("agent:message", {
        id: messageId,
        sessionId,
        message,
        agentName: adminName,
        sender: "admin",
        timestamp: new Date(),
      });

      log(`✅ Admin ${adminName} sent message in session ${sessionId}`);
    });

    // Admin disconnecting from session
    socket.on("admin:disconnect-session", (data) => {
      const { sessionId } = data;
      socket.leave(`session:${sessionId}`);

      // Notify user
      io.to(`session:${sessionId}`).emit("agent:disconnected", {
        sessionId,
      });

      log(`Admin disconnected from session ${sessionId}`);
    });

    // Admin closing session (with deletion)
    socket.on("admin:close-session", (data) => {
      const { sessionId } = data;
      socket.leave(`session:${sessionId}`);

      // Notify user that chat is closing
      io.to(`session:${sessionId}`).emit("agent:disconnected", {
        sessionId,
      });

      log(`🗑️ Admin closed and deleted session ${sessionId}`);
    });

    socket.on("disconnect", () => {
      log(`Socket disconnected: ${socket.id}`);
      
      connectionStats.active = io.engine.clientsCount || socketConnections.size - 1;
      if (socket.isAdmin) connectionStats.admins--;
      
      // If admin, notify all users in their sessions
      if (socket.isAdmin && socket.activeSessionId) {
        io.to(`session:${socket.activeSessionId}`).emit("agent:disconnected", {
          sessionId: socket.activeSessionId,
        });
        delete connectionStats.sessions[socket.activeSessionId];
      }

      // Remove from socket connections map
      for (const [email, socketId] of socketConnections.entries()) {
        if (socketId === socket.id) {
          socketConnections.delete(email);
          break;
        }
      }
    });

    socket.on("error", (error) => {
      console.error(`Socket error: ${error}`);
    });
  });
};

// Prepare Next.js
app.prepare().then(async () => {
  // Configurable allowed origins for CORS (used for preflight handling and Socket.IO)
  const allowedOrigins = (process.env.ALLOWED_ORIGINS || 'https://trustinn.nitminer.com,https://www.nitminer.com,https://nitminer.com,http://localhost:3000,http://localhost:7070').split(',').map(d => d.trim());

  const server = createServer((req, res) => {
    // CORS / preflight handling: allow specific origins and respond to OPTIONS
    const origin = req.headers.origin || '';
    if (origin && allowedOrigins.includes(origin)) {
      res.setHeader('Access-Control-Allow-Origin', origin);
      res.setHeader('Access-Control-Allow-Credentials', 'true');
      res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS');
      res.setHeader('Access-Control-Allow-Headers', 'Content-Type,Authorization,X-Requested-With');
    }

    // Immediately handle preflight requests to avoid redirects breaking the preflight
    if (req.method === 'OPTIONS') {
      res.writeHead(204);
      res.end();
      return;
    }

    const host = req.headers.host || '';
    const allowedDomains = (process.env.ALLOWED_DOMAINS || 'www.nitminer.com').split(',').map(d => d.trim());
    const redirectDomains = (process.env.REDIRECT_DOMAIN || 'nitminer.com').split(',').map(d => d.trim());

    // Check if current host needs redirect
    const hostWithoutPort = host.split(':')[0];

    // Don't perform redirects for websocket upgrade requests, socket.io endpoint,
    // or API routes — these must reach the server and redirects break websockets.
    const pathname = parse(req.url || '').pathname || '';
    const isWebsocketUpgrade = req.headers && req.headers.upgrade && req.headers.upgrade.toLowerCase() === 'websocket';
    const isSocketIoPath = pathname.startsWith('/socket.io');
    const isApiPath = pathname.startsWith('/api');

    if (redirectDomains.includes(hostWithoutPort) && !isWebsocketUpgrade && !isSocketIoPath && !isApiPath) {
      const protocol = req.headers['x-forwarded-proto'] || 'https';
      const newUrl = `${protocol}://www.nitminer.com${req.url}`;
      log(`🔄 Redirecting ${host} to www.nitminer.com`);
      res.writeHead(301, { Location: newUrl });
      res.end();
      return;
    }

    const parsedUrl = parse(req.url, true);
    handle(req, res, parsedUrl);
  });

  // Create Socket.IO server
  const io = socketIO(server, {
    cors: {
      origin: function (origin, callback) {
        // Allow non-browser or same-origin connections (origin may be undefined)
        if (!origin) return callback(null, true);
        if (allowedOrigins.includes(origin)) return callback(null, true);
        return callback(new Error('Origin not allowed'), false);
      },
      methods: ["GET", "POST"],
      credentials: true,
    },
    transports: ["websocket", "polling"],
  });

  // Setup Redis adapter if enabled (for distributed deployments)
  if (enableRedis) {
    try {
      let pubClient, subClient;

      if (redisUrl) {
        pubClient = new Redis(redisUrl, {
          maxRetriesPerRequest: null,
          enableOfflineQueue: true,
        });
        subClient = pubClient.duplicate();
      } else {
        const redisConfig = {
          host: redisHost,
          port: redisPort,
          maxRetriesPerRequest: null,
          enableOfflineQueue: true,
        };

        if (redisPassword) {
          redisConfig.password = redisPassword;
        }

        pubClient = new Redis(redisConfig);
        subClient = new Redis(redisConfig);
      }

      // Wait for both clients to be ready before setting up adapter
      Promise.all([pubClient.ready, subClient.ready])
        .then(() => {
          // Setup Redis adapter once clients are ready
          io.adapter(createAdapter(pubClient, subClient));
          log("✅ Socket.IO configured with Redis adapter (distributed mode - multi-server support)");
        })
        .catch((error) => {
          console.error("❌ Failed to setup Redis adapter:", error.message);
          log("⚠️  Falling back to in-memory adapter");
        });

      pubClient.on("connect", () => {
        log("✅ Socket.IO Redis pub client connected");
      });

      subClient.on("connect", () => {
        log("✅ Socket.IO Redis sub client connected");
      });

      pubClient.on("error", (err) => {
        console.error("❌ Socket.IO Redis pub client error:", err.message);
      });

      subClient.on("error", (err) => {
        console.error("❌ Socket.IO Redis sub client error:", err.message);
      });
    } catch (error) {
      console.error("Failed to initialize Redis clients:", error.message);
      log("⚠️  Falling back to in-memory adapter");
    }
  } else {
    log("ℹ️  Socket.IO configured with in-memory adapter (single-server mode)");
  }

  // Initialize Socket handlers
  initializeSocket(io);

  // Make io available in API routes
  global.io = io;

  // Start HTTP server
  server.listen(port, () => {
    log(`🚀 Server running at http://${hostname}:${port}`);
    log(`🔌 Socket.IO running at ws://${hostname}:${port}`);
  });

  // Graceful shutdown
  process.on("SIGTERM", () => {
    log("SIGTERM received, shutting down gracefully...");
    clearInterval(monitorInterval);
    io.close();
    server.close(() => {
      log("Server closed");
      process.exit(0);
    });
  });

  process.on("SIGINT", () => {
    log("SIGINT received, shutting down gracefully...");
    clearInterval(monitorInterval);
    io.close();
    server.close(() => {
      log("Server closed");
      process.exit(0);
    });
  });
});
