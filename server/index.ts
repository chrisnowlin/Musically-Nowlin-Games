import 'dotenv/config';
import express from 'express';
import session from 'express-session';
import passport from 'passport';
import cors from 'cors';
import { createServer } from 'http';
import { Server } from 'socket.io';
import authRoutes from './routes/auth';
import characterRoutes from './routes/characters';
import battleRoutes from './routes/battles';
import { registerCadencePvP } from './ws/cadence-pvp';
import { configurePassport } from './routes/passport';

const app = express();
const httpServer = createServer(app);

const io = new Server(httpServer, {
  cors: {
    origin: process.env.CORS_ORIGIN || 'http://localhost:5174',
    methods: ['GET', 'POST'],
    credentials: true,
  },
});

app.use(
  cors({
    origin: process.env.CORS_ORIGIN || 'http://localhost:5174',
    credentials: true,
  })
);
app.use(express.json());
const sessionSecret = process.env.SESSION_SECRET;
if (process.env.NODE_ENV === 'production' && !sessionSecret) {
  throw new Error('SESSION_SECRET must be set in production');
}
const sessionMiddleware = session({
  secret: sessionSecret || 'cadence-quest-dev-secret',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
    maxAge: 7 * 24 * 60 * 60 * 1000,
  },
});
app.use(sessionMiddleware);
configurePassport();
app.use(passport.initialize());
app.use(passport.session());
io.engine.use(sessionMiddleware);

app.use('/api/auth', authRoutes);
app.use('/api/characters', characterRoutes);
app.use('/api/battles', battleRoutes);

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', service: 'cadence-quest-api' });
});

function getSessionUserId(req: unknown): number | undefined {
  const r = req as { session?: { userId?: number } };
  return r.session?.userId;
}
registerCadencePvP(io, getSessionUserId);

const PORT = parseInt(process.env.PORT || '3001', 10);
httpServer.listen(PORT, () => {
  console.log(`Cadence Quest API + WebSocket listening on port ${PORT}`);
});
