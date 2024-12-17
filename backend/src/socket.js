import { Server } from 'socket.io';
import { verifyAccessToken } from './utils/jwt.js';

export function initSocket(httpServer) {
  const io = new Server(httpServer, {
    cors: {
      origin: process.env.CLIENT_URL || '*',
      methods: ['GET', 'POST'],
    },
  });

  // Auth middleware — expect token in handshake query or auth header
  io.use((socket, next) => {
    const token = socket.handshake.auth?.token || socket.handshake.query?.token;
    if (!token) return next(new Error('Authentication required'));
    try {
      socket.user = verifyAccessToken(token);
      next();
    } catch {
      next(new Error('Invalid token'));
    }
  });

  io.on('connection', (socket) => {
    const userId = socket.user.sub;
    socket.join(`user:${userId}`);

    // Vendor: update order status
    socket.on('order:update', ({ orderId, status }) => {
      io.to(`order:${orderId}`).emit('order:status_changed', { orderId, status });
    });

    // Vendor/driver: broadcast live location
    socket.on('location:update', ({ orderId, lat, lng }) => {
      io.to(`order:${orderId}`).emit('tracking:update', { lat, lng });
    });

    // Buyer: subscribe to an order room
    socket.on('order:subscribe', ({ orderId }) => {
      socket.join(`order:${orderId}`);
    });

    socket.on('disconnect', () => {});
  });

  return io;
}
