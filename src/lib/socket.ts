import { Server as SocketIOServer } from 'socket.io';
import { NextApiRequest, NextApiResponse } from 'next';

// Store socket connections
const socketConnections: Map<string, string> = new Map(); // email -> socketId

export const initializeSocket = (io: SocketIOServer) => {
  io.on('connection', (socket) => {
    console.log(`[Socket] User connected: ${socket.id}`);

    // Store user connection by email
    socket.on('join', (userEmail: string) => {
      socketConnections.set(userEmail, socket.id);
      socket.join(`user:${userEmail}`);
      console.log(`[Socket] User ${userEmail} joined room`);
    });

    // Handle new conversation message
    socket.on('message:new', (data: { conversationId: string; senderEmail: string; message: string }) => {
      // Broadcast to conversation room
      io.to(`conversation:${data.conversationId}`).emit('message:received', {
        conversationId: data.conversationId,
        senderEmail: data.senderEmail,
        message: data.message,
        timestamp: new Date(),
      });
    });

    // Join conversation room
    socket.on('conversation:join', (conversationId: string) => {
      socket.join(`conversation:${conversationId}`);
      console.log(`[Socket] User joined conversation: ${conversationId}`);
    });

    // Handle refund request chat
    socket.on('refund:chat', (data: { refundRequestId: string; senderEmail: string; message: string }) => {
      io.to(`refund:${data.refundRequestId}`).emit('refund:message', {
        refundRequestId: data.refundRequestId,
        senderEmail: data.senderEmail,
        message: data.message,
        timestamp: new Date(),
      });
    });

    // Join refund room
    socket.on('refund:join', (refundRequestId: string) => {
      socket.join(`refund:${refundRequestId}`);
      console.log(`[Socket] User joined refund: ${refundRequestId}`);
    });

    // Handle disconnection
    socket.on('disconnect', () => {
      // Remove from socketConnections
      for (const [email, id] of socketConnections) {
        if (id === socket.id) {
          socketConnections.delete(email);
          console.log(`[Socket] User ${email} disconnected`);
          break;
        }
      }
    });
  });
};

export const getSocketId = (userEmail: string): string | undefined => {
  return socketConnections.get(userEmail);
};
