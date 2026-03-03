import { Router, Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import passport from 'passport';
import { db } from '../db';
import { users } from '../db/schema';

const router = Router();
const SALT_ROUNDS = 10;

router.post('/register', async (req: Request, res: Response) => {
  if (!db) {
    return res.status(503).json({ error: 'Database not configured' });
  }
  const { username, password } = req.body;
  if (!username || !password || typeof username !== 'string' || typeof password !== 'string') {
    return res.status(400).json({ error: 'Username and password required' });
  }
  if (username.length < 2 || username.length > 20) {
    return res.status(400).json({ error: 'Username must be 2-20 characters' });
  }
  if (password.length < 6) {
    return res.status(400).json({ error: 'Password must be at least 6 characters' });
  }
  try {
    const hash = await bcrypt.hash(password, SALT_ROUNDS);
    const [user] = await db.insert(users).values({ username, passwordHash: hash }).returning();
    req.session.userId = user.id;
    req.session.username = user.username;
    return res.json({ id: user.id, username: user.username });
  } catch (err: unknown) {
    const e = err as { code?: string };
    if (e.code === '23505') {
      return res.status(409).json({ error: 'Username already taken' });
    }
    throw err;
  }
});

router.post('/login', async (req: Request, res: Response) => {
  if (!db) {
    return res.status(503).json({ error: 'Database not configured' });
  }
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({ error: 'Username and password required' });
  }
  const [user] = await db.select().from(users).where(users.username.eq(username));
  if (!user) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }
  const match = await bcrypt.compare(password, user.passwordHash);
  if (!match) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }
  req.session.userId = user.id;
  req.session.username = user.username;
  return res.json({ id: user.id, username: user.username });
});

router.post('/guest', (req: Request, res: Response) => {
  req.session.userId = -1;
  req.session.username = `guest_${Date.now()}`;
  return res.json({ id: -1, username: req.session.username });
});

router.post('/logout', (req: Request, res: Response) => {
  req.session.destroy(() => {});
  return res.json({ ok: true });
});

router.get('/me', (req: Request, res: Response) => {
  if (req.session.userId === undefined) {
    return res.status(401).json({ error: 'Not logged in' });
  }
  return res.json({
    id: req.session.userId,
    username: req.session.username,
    role: req.session.role,
    displayName: req.session.displayName,
  });
});

// Check at request time so Bun's auto-loaded .env.local is available
function isGoogleEnabled() {
  return !!(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET);
}

// Google OAuth availability check
router.get('/google/status', (_req: Request, res: Response) => {
  res.json({ enabled: isGoogleEnabled() });
});

// Google OAuth initiation
router.get('/google', (req, res, next) => {
  if (!isGoogleEnabled()) {
    return res.status(503).json({ error: 'Google OAuth is not configured. Set GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET.' });
  }
  passport.authenticate('google', { scope: ['profile', 'email'] })(req, res, next);
});

// Google OAuth callback
router.get(
  '/google/callback',
  (req, res, next) => {
    if (!isGoogleEnabled()) {
      return res.status(503).json({ error: 'Google OAuth is not configured' });
    }
    passport.authenticate('google', { failureRedirect: '/games/melody-dungeon/teacher' })(req, res, next);
  },
  (req: Request, res: Response) => {
    const user = req.user as any;
    req.session.userId = user.id;
    req.session.username = user.username;
    req.session.role = user.role;
    req.session.displayName = user.displayName;
    const clientOrigin = process.env.CORS_ORIGIN || 'http://localhost:5174';
    res.redirect(`${clientOrigin}/games/melody-dungeon/teacher`);
  }
);

export default router;
