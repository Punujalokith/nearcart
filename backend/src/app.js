import 'dotenv/config';
import http from 'http';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';

import { globalLimiter } from './middleware/rateLimiter.js';
import { errorHandler } from './middleware/errorHandler.js';
import { initSocket } from './socket.js';

import authRoutes       from './modules/auth/auth.routes.js';
import usersRoutes      from './modules/users/users.routes.js';
import vendorsRoutes    from './modules/vendors/vendors.routes.js';
import productsRoutes   from './modules/products/products.routes.js';
import categoriesRoutes from './modules/categories/categories.routes.js';
import ordersRoutes     from './modules/orders/orders.routes.js';
import paymentsRoutes   from './modules/payments/payments.routes.js';
import reviewsRoutes    from './modules/reviews/reviews.routes.js';

const app    = express();
const server = http.createServer(app);

// Security & logging
app.use(helmet());
app.use(cors({ origin: process.env.CLIENT_URL || '*', credentials: true }));
app.use(morgan('dev'));
app.use(globalLimiter);

// Raw body for Stripe webhooks BEFORE express.json()
app.use('/api/payments/webhook', express.raw({ type: 'application/json' }));
app.use(express.json());

// ─── Routes ────────────────────────────────────────────────────────────────────
app.use('/api/auth',       authRoutes);
app.use('/api/users',      usersRoutes);
app.use('/api/vendors',    vendorsRoutes);
app.use('/api/products',   productsRoutes);
app.use('/api/categories', categoriesRoutes);
app.use('/api/orders',     ordersRoutes);
app.use('/api/payments',   paymentsRoutes);
app.use('/api/reviews',    reviewsRoutes);

// Health check
app.get('/health', (_, res) => res.json({ status: 'ok', ts: new Date().toISOString() }));

// 404
app.use((req, res) => res.status(404).json({ error: 'Route not found' }));

// Global error handler
app.use(errorHandler);

// Socket.io (only in non-serverless environments)
if (!process.env.VERCEL) {
  initSocket(server);
}

const PORT = process.env.PORT || 3000;

// Only start HTTP server when NOT on Vercel (Vercel handles it)
if (!process.env.VERCEL) {
  server.listen(PORT, () => {
    console.log(`NearCart API running on http://localhost:${PORT}`);
    console.log('Routes: auth | users | vendors | products | categories | orders | payments | reviews');
  });
}

export default app;
