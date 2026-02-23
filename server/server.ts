import 'dotenv/config';
import http from 'http';
import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';

import { validateEnv }      from './config/env.js';
import { connectDB }        from './config/db.js';
import { configureCloudinary } from './config/cloudinary.js';
import { errorHandler }     from './middleware/errorHandler.js';
import { apiLimiter }       from './middleware/rateLimiter.js';
import { attachSocketIO }   from './sockets/socketHandler.js';

import authRoutes     from './routes/auth.js';
import userRoutes     from './routes/users.js';
import inviteRoutes   from './routes/invites.js';
import projectRoutes  from './routes/projects.js';
import eventRoutes    from './routes/events.js';
import forumRoutes    from './routes/forum.js';
import teamRoutes     from './routes/teams.js';

// ─── Validate env before anything else ──────────────────────────────────────
validateEnv();

const app = express();

// ─── Security & logging ──────────────────────────────────────────────────────
app.use(helmet());
app.use(cors({
  origin: process.env.FRONTEND_URL ?? '*',
  credentials: true,
  methods: ['GET', 'POST', 'PATCH', 'PUT', 'DELETE', 'OPTIONS'],
}));
app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'));

// ─── Body parsers ────────────────────────────────────────────────────────────
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// ─── Global rate limiter ─────────────────────────────────────────────────────
app.use('/api', apiLimiter);

// ─── Routes ──────────────────────────────────────────────────────────────────
app.use('/api/auth',     authRoutes);
app.use('/api/users',    userRoutes);
app.use('/api/invites',  inviteRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/events',   eventRoutes);
app.use('/api/forum',    forumRoutes);
app.use('/api/teams',    teamRoutes);

// ─── Health check ────────────────────────────────────────────────────────────
app.get('/health', (_req: Request, res: Response) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// ─── 404 handler ─────────────────────────────────────────────────────────────
app.use((_req: Request, res: Response) => {
  res.status(404).json({ success: false, message: 'Route not found' });
});

// ─── Central error handler (must be last) ────────────────────────────────────
app.use(errorHandler as (err: any, req: Request, res: Response, next: NextFunction) => void);

// ─── HTTP server + Socket.IO ─────────────────────────────────────────────────
const httpServer = http.createServer(app);
attachSocketIO(httpServer);

// ─── Bootstrap ───────────────────────────────────────────────────────────────
const PORT = parseInt(process.env.PORT ?? '5000', 10);

(async () => {
  await connectDB();
  configureCloudinary();
  httpServer.listen(PORT, () => {
    console.log(`🚀  Server running on http://localhost:${PORT}`);
    console.log(`    ENV: ${process.env.NODE_ENV ?? 'development'}`);
  });
})();

export default app;
