# Teacher Question Pools — Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Let teachers create and manage question pools for Melody Dungeon, accessible to students via game codes.

**Architecture:** Google OAuth for teacher auth, PostgreSQL for pool/question storage, Express API for CRUD, React teacher dashboard at `/games/melody-dungeon/teacher`, game code entry on the Melody Dungeon start screen, new Wizard enemy type for freeform custom questions.

**Tech Stack:** Express + Passport (Google OAuth), Drizzle ORM + Neon PostgreSQL, React + Wouter, TanStack React Query

**Design doc:** `docs/plans/2026-03-03-teacher-question-pools-design.md`

---

### Task 1: Add Google OAuth Dependencies

**Files:**
- Modify: `package.json`

**Step 1: Install passport and Google OAuth strategy**

Run:
```bash
bun add passport passport-google-oauth20
bun add -d @types/passport @types/passport-google-oauth20
```

**Step 2: Verify installation**

Run: `bun check`
Expected: No type errors from new packages

**Step 3: Commit**

```bash
git add package.json bun.lockb
git commit -m "chore: add passport and Google OAuth dependencies"
```

---

### Task 2: Extend Database Schema

**Files:**
- Modify: `server/db/schema.ts`

**Step 1: Add new fields to users table and create new tables**

Add to `server/db/schema.ts` after the existing `users` table definition. Extend users with OAuth fields, then add the three new tables:

```typescript
// Add these columns to the users table definition:
//   email: text('email'),
//   googleId: text('google_id').unique(),
//   displayName: text('display_name'),
//   role: text('role').notNull().default('player'), // 'player' | 'teacher'

// Then add these new tables after the existing tables:

export const questionPools = pgTable('question_pools', {
  id: serial('id').primaryKey(),
  teacherId: integer('teacher_id').notNull().references(() => users.id),
  name: text('name').notNull(),
  gameCode: text('game_code').notNull().unique(),
  isShared: boolean('is_shared').notNull().default(false),
  useDefaults: boolean('use_defaults').notNull().default(true),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const poolVocabEntries = pgTable('pool_vocab_entries', {
  id: serial('id').primaryKey(),
  poolId: integer('pool_id').notNull().references(() => questionPools.id),
  term: text('term').notNull(),
  definition: text('definition').notNull(),
  symbol: text('symbol'),
  tier: integer('tier').notNull(), // 1-5
  category: text('category').notNull(), // 'dynamics' | 'tempo' | 'symbols' | 'terms'
  format: text('format'), // 'standard' | 'opposites' | 'ordering'
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const poolCustomQuestions = pgTable('pool_custom_questions', {
  id: serial('id').primaryKey(),
  poolId: integer('pool_id').notNull().references(() => questionPools.id),
  question: text('question').notNull(),
  correctAnswer: text('correct_answer').notNull(),
  wrongAnswer1: text('wrong_answer_1').notNull(),
  wrongAnswer2: text('wrong_answer_2').notNull(),
  wrongAnswer3: text('wrong_answer_3').notNull(),
  tier: integer('tier').notNull(), // 1-5
  createdAt: timestamp('created_at').defaultNow().notNull(),
});
```

**Step 2: Generate migration**

Run: `bun run db:generate`
Expected: New migration file created in `server/db/migrations/`

**Step 3: Apply migration**

Run: `bun run db:migrate`
Expected: Migration applied successfully

**Step 4: Commit**

```bash
git add server/db/schema.ts server/db/migrations/
git commit -m "feat: add question pools schema (users OAuth fields, pools, vocab entries, custom questions)"
```

---

### Task 3: Google OAuth Authentication

**Files:**
- Create: `server/routes/passport.ts`
- Modify: `server/routes/auth.ts`
- Modify: `server/index.ts`
- Modify: `server/session.d.ts`
- Modify: `.env.example`

**Step 1: Create Passport configuration**

Create `server/routes/passport.ts`:

```typescript
import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import { db } from '../db';
import { users } from '../db/schema';
import { eq } from 'drizzle-orm';

export function configurePassport() {
  const clientID = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
  const callbackURL = process.env.GOOGLE_CALLBACK_URL || 'http://localhost:3001/api/auth/google/callback';

  if (!clientID || !clientSecret) {
    console.warn('Google OAuth not configured — set GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET');
    return;
  }

  passport.use(
    new GoogleStrategy(
      { clientID, clientSecret, callbackURL },
      async (_accessToken, _refreshToken, profile, done) => {
        if (!db) return done(new Error('Database not configured'));
        try {
          const googleId = profile.id;
          const email = profile.emails?.[0]?.value ?? null;
          const displayName = profile.displayName ?? null;

          // Check if user exists by googleId
          const [existing] = await db
            .select()
            .from(users)
            .where(eq(users.googleId, googleId));

          if (existing) {
            done(null, existing);
            return;
          }

          // Create new user with teacher role
          const username = `google_${googleId}`;
          const [newUser] = await db
            .insert(users)
            .values({
              username,
              passwordHash: '', // No password for OAuth users
              email,
              googleId,
              displayName,
              role: 'teacher',
            })
            .returning();

          done(null, newUser);
        } catch (err) {
          done(err as Error);
        }
      }
    )
  );

  passport.serializeUser((user: any, done) => {
    done(null, user.id);
  });

  passport.deserializeUser(async (id: number, done) => {
    if (!db) return done(new Error('Database not configured'));
    try {
      const [user] = await db.select().from(users).where(eq(users.id, id));
      done(null, user ?? null);
    } catch (err) {
      done(err);
    }
  });
}
```

**Step 2: Add Google OAuth routes to auth.ts**

Add to `server/routes/auth.ts` — new endpoints after existing routes:

```typescript
import passport from 'passport';

// Google OAuth initiation
router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));

// Google OAuth callback
router.get(
  '/google/callback',
  passport.authenticate('google', { failureRedirect: '/games/melody-dungeon/teacher' }),
  (req: Request, res: Response) => {
    // Set session data from the authenticated user
    const user = req.user as any;
    req.session.userId = user.id;
    req.session.username = user.username;
    req.session.role = user.role;
    req.session.displayName = user.displayName;
    // Redirect to teacher dashboard
    const clientOrigin = process.env.CORS_ORIGIN || 'http://localhost:5174';
    res.redirect(`${clientOrigin}/games/melody-dungeon/teacher`);
  }
);

// Updated /me endpoint — add role and displayName to response
// Modify the existing /me handler to include:
//   role: req.session.role,
//   displayName: req.session.displayName,
```

**Step 3: Update session.d.ts**

Replace `server/session.d.ts`:

```typescript
import 'express-session';

declare module 'express-session' {
  interface SessionData {
    userId?: number;
    username?: string;
    role?: string;
    displayName?: string;
  }
}
```

**Step 4: Wire up Passport in server/index.ts**

Add to `server/index.ts` after session middleware setup:

```typescript
import passport from 'passport';
import { configurePassport } from './routes/passport';

// After app.use(sessionMiddleware):
configurePassport();
app.use(passport.initialize());
app.use(passport.session());
```

**Step 5: Update .env.example**

Add:
```
# Google OAuth (required for teacher dashboard)
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
GOOGLE_CALLBACK_URL=http://localhost:3001/api/auth/google/callback
```

**Step 6: Verify server starts without errors**

Run: `bun run dev:server`
Expected: Server starts, logs warning about Google OAuth not configured (unless env vars are set)

**Step 7: Commit**

```bash
git add server/routes/passport.ts server/routes/auth.ts server/index.ts server/session.d.ts .env.example
git commit -m "feat: add Google OAuth authentication for teacher dashboard"
```

---

### Task 4: Question Pool API Routes

**Files:**
- Create: `server/routes/questionPools.ts`
- Modify: `server/index.ts`

**Step 1: Create the question pools route file**

Create `server/routes/questionPools.ts`:

```typescript
import { Router, Request, Response } from 'express';
import { db } from '../db';
import { questionPools, poolVocabEntries, poolCustomQuestions, users } from '../db/schema';
import { eq, and, desc } from 'drizzle-orm';

const router = Router();

// --- Middleware ---

function requireAuth(req: Request, res: Response, next: () => void) {
  if (req.session.userId === undefined) {
    res.status(401).json({ error: 'Not logged in' });
    return;
  }
  next();
}

function requireTeacher(req: Request, res: Response, next: () => void) {
  if (req.session.role !== 'teacher') {
    res.status(403).json({ error: 'Teacher role required' });
    return;
  }
  next();
}

function generateGameCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // No ambiguous chars (0/O, 1/I/L)
  let code = '';
  for (let i = 0; i < 6; i++) {
    code += chars[Math.floor(Math.random() * chars.length)];
  }
  return code;
}

// --- Pool CRUD ---

// List my pools
router.get('/', requireAuth, requireTeacher, async (req: Request, res: Response) => {
  if (!db) return res.status(503).json({ error: 'Database not configured' });
  const userId = req.session.userId!;
  const pools = await db
    .select()
    .from(questionPools)
    .where(eq(questionPools.teacherId, userId))
    .orderBy(desc(questionPools.updatedAt));
  return res.json(pools);
});

// Create pool
router.post('/', requireAuth, requireTeacher, async (req: Request, res: Response) => {
  if (!db) return res.status(503).json({ error: 'Database not configured' });
  const userId = req.session.userId!;
  const { name } = req.body;
  if (!name || typeof name !== 'string' || name.trim().length === 0) {
    return res.status(400).json({ error: 'Pool name is required' });
  }

  // Generate unique game code (retry on collision)
  let gameCode = generateGameCode();
  let attempts = 0;
  while (attempts < 10) {
    const [existing] = await db
      .select({ id: questionPools.id })
      .from(questionPools)
      .where(eq(questionPools.gameCode, gameCode));
    if (!existing) break;
    gameCode = generateGameCode();
    attempts++;
  }

  const [pool] = await db
    .insert(questionPools)
    .values({
      teacherId: userId,
      name: name.trim().slice(0, 100),
      gameCode,
    })
    .returning();

  return res.status(201).json(pool);
});

// Get pool with all entries
router.get('/:id', requireAuth, requireTeacher, async (req: Request, res: Response) => {
  if (!db) return res.status(503).json({ error: 'Database not configured' });
  const userId = req.session.userId!;
  const id = parseInt(req.params.id, 10);
  if (isNaN(id)) return res.status(400).json({ error: 'Invalid pool id' });

  const [pool] = await db
    .select()
    .from(questionPools)
    .where(and(eq(questionPools.id, id), eq(questionPools.teacherId, userId)));
  if (!pool) return res.status(404).json({ error: 'Pool not found' });

  const vocab = await db
    .select()
    .from(poolVocabEntries)
    .where(eq(poolVocabEntries.poolId, id));

  const custom = await db
    .select()
    .from(poolCustomQuestions)
    .where(eq(poolCustomQuestions.poolId, id));

  return res.json({ ...pool, vocabEntries: vocab, customQuestions: custom });
});

// Update pool metadata
router.put('/:id', requireAuth, requireTeacher, async (req: Request, res: Response) => {
  if (!db) return res.status(503).json({ error: 'Database not configured' });
  const userId = req.session.userId!;
  const id = parseInt(req.params.id, 10);
  if (isNaN(id)) return res.status(400).json({ error: 'Invalid pool id' });

  const { name, useDefaults, isShared } = req.body;
  const updates: Record<string, unknown> = { updatedAt: new Date() };
  if (typeof name === 'string' && name.trim().length > 0) updates.name = name.trim().slice(0, 100);
  if (typeof useDefaults === 'boolean') updates.useDefaults = useDefaults;
  if (typeof isShared === 'boolean') updates.isShared = isShared;

  const [pool] = await db
    .update(questionPools)
    .set(updates as typeof questionPools.$inferInsert)
    .where(and(eq(questionPools.id, id), eq(questionPools.teacherId, userId)))
    .returning();

  if (!pool) return res.status(404).json({ error: 'Pool not found' });
  return res.json(pool);
});

// Delete pool (cascades to entries)
router.delete('/:id', requireAuth, requireTeacher, async (req: Request, res: Response) => {
  if (!db) return res.status(503).json({ error: 'Database not configured' });
  const userId = req.session.userId!;
  const id = parseInt(req.params.id, 10);
  if (isNaN(id)) return res.status(400).json({ error: 'Invalid pool id' });

  // Verify ownership
  const [pool] = await db
    .select()
    .from(questionPools)
    .where(and(eq(questionPools.id, id), eq(questionPools.teacherId, userId)));
  if (!pool) return res.status(404).json({ error: 'Pool not found' });

  // Delete children first, then pool
  await db.delete(poolVocabEntries).where(eq(poolVocabEntries.poolId, id));
  await db.delete(poolCustomQuestions).where(eq(poolCustomQuestions.poolId, id));
  await db.delete(questionPools).where(eq(questionPools.id, id));

  return res.json({ success: true });
});

// Regenerate game code
router.post('/:id/regenerate-code', requireAuth, requireTeacher, async (req: Request, res: Response) => {
  if (!db) return res.status(503).json({ error: 'Database not configured' });
  const userId = req.session.userId!;
  const id = parseInt(req.params.id, 10);
  if (isNaN(id)) return res.status(400).json({ error: 'Invalid pool id' });

  let gameCode = generateGameCode();
  let attempts = 0;
  while (attempts < 10) {
    const [existing] = await db
      .select({ id: questionPools.id })
      .from(questionPools)
      .where(eq(questionPools.gameCode, gameCode));
    if (!existing) break;
    gameCode = generateGameCode();
    attempts++;
  }

  const [pool] = await db
    .update(questionPools)
    .set({ gameCode, updatedAt: new Date() })
    .where(and(eq(questionPools.id, id), eq(questionPools.teacherId, userId)))
    .returning();

  if (!pool) return res.status(404).json({ error: 'Pool not found' });
  return res.json(pool);
});

// --- Vocab Entry CRUD ---

router.post('/:id/vocab', requireAuth, requireTeacher, async (req: Request, res: Response) => {
  if (!db) return res.status(503).json({ error: 'Database not configured' });
  const userId = req.session.userId!;
  const poolId = parseInt(req.params.id, 10);
  if (isNaN(poolId)) return res.status(400).json({ error: 'Invalid pool id' });

  // Verify pool ownership
  const [pool] = await db
    .select()
    .from(questionPools)
    .where(and(eq(questionPools.id, poolId), eq(questionPools.teacherId, userId)));
  if (!pool) return res.status(404).json({ error: 'Pool not found' });

  const { term, definition, symbol, tier, category, format } = req.body;
  if (!term || !definition || !tier || !category) {
    return res.status(400).json({ error: 'term, definition, tier, and category are required' });
  }
  const VALID_CATEGORIES = ['dynamics', 'tempo', 'symbols', 'terms'];
  if (!VALID_CATEGORIES.includes(category)) {
    return res.status(400).json({ error: 'Invalid category' });
  }
  if (typeof tier !== 'number' || tier < 1 || tier > 5) {
    return res.status(400).json({ error: 'Tier must be 1-5' });
  }

  const [entry] = await db
    .insert(poolVocabEntries)
    .values({
      poolId,
      term: String(term).trim().slice(0, 200),
      definition: String(definition).trim().slice(0, 500),
      symbol: symbol ? String(symbol).trim().slice(0, 10) : null,
      tier,
      category,
      format: format || null,
    })
    .returning();

  // Touch pool updatedAt
  await db.update(questionPools).set({ updatedAt: new Date() }).where(eq(questionPools.id, poolId));

  return res.status(201).json(entry);
});

router.put('/:id/vocab/:entryId', requireAuth, requireTeacher, async (req: Request, res: Response) => {
  if (!db) return res.status(503).json({ error: 'Database not configured' });
  const userId = req.session.userId!;
  const poolId = parseInt(req.params.id, 10);
  const entryId = parseInt(req.params.entryId, 10);
  if (isNaN(poolId) || isNaN(entryId)) return res.status(400).json({ error: 'Invalid id' });

  // Verify pool ownership
  const [pool] = await db
    .select()
    .from(questionPools)
    .where(and(eq(questionPools.id, poolId), eq(questionPools.teacherId, userId)));
  if (!pool) return res.status(404).json({ error: 'Pool not found' });

  const { term, definition, symbol, tier, category, format } = req.body;
  const updates: Record<string, unknown> = {};
  if (typeof term === 'string') updates.term = term.trim().slice(0, 200);
  if (typeof definition === 'string') updates.definition = definition.trim().slice(0, 500);
  if (symbol !== undefined) updates.symbol = symbol ? String(symbol).trim().slice(0, 10) : null;
  if (typeof tier === 'number' && tier >= 1 && tier <= 5) updates.tier = tier;
  if (typeof category === 'string') updates.category = category;
  if (format !== undefined) updates.format = format || null;

  const [entry] = await db
    .update(poolVocabEntries)
    .set(updates as typeof poolVocabEntries.$inferInsert)
    .where(and(eq(poolVocabEntries.id, entryId), eq(poolVocabEntries.poolId, poolId)))
    .returning();

  if (!entry) return res.status(404).json({ error: 'Entry not found' });

  await db.update(questionPools).set({ updatedAt: new Date() }).where(eq(questionPools.id, poolId));
  return res.json(entry);
});

router.delete('/:id/vocab/:entryId', requireAuth, requireTeacher, async (req: Request, res: Response) => {
  if (!db) return res.status(503).json({ error: 'Database not configured' });
  const userId = req.session.userId!;
  const poolId = parseInt(req.params.id, 10);
  const entryId = parseInt(req.params.entryId, 10);
  if (isNaN(poolId) || isNaN(entryId)) return res.status(400).json({ error: 'Invalid id' });

  const [pool] = await db
    .select()
    .from(questionPools)
    .where(and(eq(questionPools.id, poolId), eq(questionPools.teacherId, userId)));
  if (!pool) return res.status(404).json({ error: 'Pool not found' });

  await db
    .delete(poolVocabEntries)
    .where(and(eq(poolVocabEntries.id, entryId), eq(poolVocabEntries.poolId, poolId)));

  await db.update(questionPools).set({ updatedAt: new Date() }).where(eq(questionPools.id, poolId));
  return res.json({ success: true });
});

// --- Custom Question CRUD ---

router.post('/:id/custom', requireAuth, requireTeacher, async (req: Request, res: Response) => {
  if (!db) return res.status(503).json({ error: 'Database not configured' });
  const userId = req.session.userId!;
  const poolId = parseInt(req.params.id, 10);
  if (isNaN(poolId)) return res.status(400).json({ error: 'Invalid pool id' });

  const [pool] = await db
    .select()
    .from(questionPools)
    .where(and(eq(questionPools.id, poolId), eq(questionPools.teacherId, userId)));
  if (!pool) return res.status(404).json({ error: 'Pool not found' });

  const { question, correctAnswer, wrongAnswer1, wrongAnswer2, wrongAnswer3, tier } = req.body;
  if (!question || !correctAnswer || !wrongAnswer1 || !wrongAnswer2 || !wrongAnswer3 || !tier) {
    return res.status(400).json({ error: 'All fields are required' });
  }
  if (typeof tier !== 'number' || tier < 1 || tier > 5) {
    return res.status(400).json({ error: 'Tier must be 1-5' });
  }

  const [entry] = await db
    .insert(poolCustomQuestions)
    .values({
      poolId,
      question: String(question).trim().slice(0, 500),
      correctAnswer: String(correctAnswer).trim().slice(0, 200),
      wrongAnswer1: String(wrongAnswer1).trim().slice(0, 200),
      wrongAnswer2: String(wrongAnswer2).trim().slice(0, 200),
      wrongAnswer3: String(wrongAnswer3).trim().slice(0, 200),
      tier,
    })
    .returning();

  await db.update(questionPools).set({ updatedAt: new Date() }).where(eq(questionPools.id, poolId));
  return res.status(201).json(entry);
});

router.put('/:id/custom/:qId', requireAuth, requireTeacher, async (req: Request, res: Response) => {
  if (!db) return res.status(503).json({ error: 'Database not configured' });
  const userId = req.session.userId!;
  const poolId = parseInt(req.params.id, 10);
  const qId = parseInt(req.params.qId, 10);
  if (isNaN(poolId) || isNaN(qId)) return res.status(400).json({ error: 'Invalid id' });

  const [pool] = await db
    .select()
    .from(questionPools)
    .where(and(eq(questionPools.id, poolId), eq(questionPools.teacherId, userId)));
  if (!pool) return res.status(404).json({ error: 'Pool not found' });

  const { question, correctAnswer, wrongAnswer1, wrongAnswer2, wrongAnswer3, tier } = req.body;
  const updates: Record<string, unknown> = {};
  if (typeof question === 'string') updates.question = question.trim().slice(0, 500);
  if (typeof correctAnswer === 'string') updates.correctAnswer = correctAnswer.trim().slice(0, 200);
  if (typeof wrongAnswer1 === 'string') updates.wrongAnswer1 = wrongAnswer1.trim().slice(0, 200);
  if (typeof wrongAnswer2 === 'string') updates.wrongAnswer2 = wrongAnswer2.trim().slice(0, 200);
  if (typeof wrongAnswer3 === 'string') updates.wrongAnswer3 = wrongAnswer3.trim().slice(0, 200);
  if (typeof tier === 'number' && tier >= 1 && tier <= 5) updates.tier = tier;

  const [entry] = await db
    .update(poolCustomQuestions)
    .set(updates as typeof poolCustomQuestions.$inferInsert)
    .where(and(eq(poolCustomQuestions.id, qId), eq(poolCustomQuestions.poolId, poolId)))
    .returning();

  if (!entry) return res.status(404).json({ error: 'Question not found' });

  await db.update(questionPools).set({ updatedAt: new Date() }).where(eq(questionPools.id, poolId));
  return res.json(entry);
});

router.delete('/:id/custom/:qId', requireAuth, requireTeacher, async (req: Request, res: Response) => {
  if (!db) return res.status(503).json({ error: 'Database not configured' });
  const userId = req.session.userId!;
  const poolId = parseInt(req.params.id, 10);
  const qId = parseInt(req.params.qId, 10);
  if (isNaN(poolId) || isNaN(qId)) return res.status(400).json({ error: 'Invalid id' });

  const [pool] = await db
    .select()
    .from(questionPools)
    .where(and(eq(questionPools.id, poolId), eq(questionPools.teacherId, userId)));
  if (!pool) return res.status(404).json({ error: 'Pool not found' });

  await db
    .delete(poolCustomQuestions)
    .where(and(eq(poolCustomQuestions.id, qId), eq(poolCustomQuestions.poolId, poolId)));

  await db.update(questionPools).set({ updatedAt: new Date() }).where(eq(questionPools.id, poolId));
  return res.json({ success: true });
});

// --- Community / Shared ---

router.get('/shared', requireAuth, async (req: Request, res: Response) => {
  if (!db) return res.status(503).json({ error: 'Database not configured' });

  const pools = await db
    .select({
      id: questionPools.id,
      name: questionPools.name,
      teacherId: questionPools.teacherId,
      gameCode: questionPools.gameCode,
      createdAt: questionPools.createdAt,
    })
    .from(questionPools)
    .where(eq(questionPools.isShared, true))
    .orderBy(desc(questionPools.updatedAt));

  return res.json(pools);
});

router.post('/:id/clone', requireAuth, requireTeacher, async (req: Request, res: Response) => {
  if (!db) return res.status(503).json({ error: 'Database not configured' });
  const userId = req.session.userId!;
  const sourceId = parseInt(req.params.id, 10);
  if (isNaN(sourceId)) return res.status(400).json({ error: 'Invalid pool id' });

  // Source must be shared
  const [source] = await db
    .select()
    .from(questionPools)
    .where(and(eq(questionPools.id, sourceId), eq(questionPools.isShared, true)));
  if (!source) return res.status(404).json({ error: 'Shared pool not found' });

  // Generate new game code
  let gameCode = generateGameCode();
  let attempts = 0;
  while (attempts < 10) {
    const [existing] = await db
      .select({ id: questionPools.id })
      .from(questionPools)
      .where(eq(questionPools.gameCode, gameCode));
    if (!existing) break;
    gameCode = generateGameCode();
    attempts++;
  }

  // Create the clone pool
  const [newPool] = await db
    .insert(questionPools)
    .values({
      teacherId: userId,
      name: `${source.name} (copy)`,
      gameCode,
      useDefaults: source.useDefaults,
      isShared: false,
    })
    .returning();

  // Copy vocab entries
  const sourceVocab = await db
    .select()
    .from(poolVocabEntries)
    .where(eq(poolVocabEntries.poolId, sourceId));

  if (sourceVocab.length > 0) {
    await db.insert(poolVocabEntries).values(
      sourceVocab.map((v) => ({
        poolId: newPool.id,
        term: v.term,
        definition: v.definition,
        symbol: v.symbol,
        tier: v.tier,
        category: v.category,
        format: v.format,
      }))
    );
  }

  // Copy custom questions
  const sourceCustom = await db
    .select()
    .from(poolCustomQuestions)
    .where(eq(poolCustomQuestions.poolId, sourceId));

  if (sourceCustom.length > 0) {
    await db.insert(poolCustomQuestions).values(
      sourceCustom.map((q) => ({
        poolId: newPool.id,
        question: q.question,
        correctAnswer: q.correctAnswer,
        wrongAnswer1: q.wrongAnswer1,
        wrongAnswer2: q.wrongAnswer2,
        wrongAnswer3: q.wrongAnswer3,
        tier: q.tier,
      }))
    );
  }

  return res.status(201).json(newPool);
});

// --- Student / Game (no auth) ---

router.get('/join/:gameCode', async (req: Request, res: Response) => {
  if (!db) return res.status(503).json({ error: 'Database not configured' });
  const code = req.params.gameCode.toUpperCase();

  const [pool] = await db
    .select()
    .from(questionPools)
    .where(eq(questionPools.gameCode, code));

  if (!pool) return res.status(404).json({ error: 'Invalid game code' });

  const vocab = await db
    .select()
    .from(poolVocabEntries)
    .where(eq(poolVocabEntries.poolId, pool.id));

  const custom = await db
    .select()
    .from(poolCustomQuestions)
    .where(eq(poolCustomQuestions.poolId, pool.id));

  return res.json({
    id: pool.id,
    name: pool.name,
    useDefaults: pool.useDefaults,
    vocabEntries: vocab,
    customQuestions: custom,
  });
});

export default router;
```

**Step 2: Register the route in server/index.ts**

Add after existing route registrations:

```typescript
import poolRoutes from './routes/questionPools';

// After existing app.use lines:
app.use('/api/pools', poolRoutes);
```

**Step 3: Verify server compiles**

Run: `bun check`
Expected: No type errors

**Step 4: Commit**

```bash
git add server/routes/questionPools.ts server/index.ts
git commit -m "feat: add question pool CRUD API routes (pools, vocab, custom questions, shared, join)"
```

---

### Task 5: Wizard Enemy Type & Custom Challenge Type

**Files:**
- Modify: `client/src/games/melody-dungeon/logic/dungeonTypes.ts`
- Modify: `client/src/games/melody-dungeon/challengeHelpers.ts`

**Step 1: Add wizard and custom to type definitions**

In `client/src/games/melody-dungeon/logic/dungeonTypes.ts`:

Update `ChallengeType` (line 18):
```typescript
export type ChallengeType = 'noteReading' | 'rhythmTap' | 'interval' | 'dynamics' | 'tempo' | 'symbols' | 'terms' | 'timbre' | 'custom';
```

Update `EnemySubtype` (line 22):
```typescript
export type EnemySubtype = 'ghost' | 'skeleton' | 'dragon' | 'goblin' | 'slime' | 'bat' | 'wraith' | 'spider' | 'shade' | 'siren' | 'wizard';
```

**Step 2: Add wizard to challenge helper mappings**

In `client/src/games/melody-dungeon/challengeHelpers.ts`:

Add wizard case in `getSubtypeChallengePool` (after the `siren` case, before `ghost`):
```typescript
case 'wizard': return allFloorTypes.includes('custom') ? ['custom'] : allFloorTypes;
```

Add `'wizard'` to the array in `getEnemySubtypesForFloor` — but note: wizard should NOT be in the default list. Wizards only appear when a teacher pool is active with custom questions. This function will be conditionally extended later in Task 8.

**Step 3: Verify types compile**

Run: `bun check`
Expected: No type errors (some may appear from ChallengeModal not handling 'custom' yet — that's expected and addressed in Task 6)

**Step 4: Commit**

```bash
git add client/src/games/melody-dungeon/logic/dungeonTypes.ts client/src/games/melody-dungeon/challengeHelpers.ts
git commit -m "feat: add wizard enemy subtype and custom challenge type"
```

---

### Task 6: Custom Challenge Component

**Files:**
- Create: `client/src/games/melody-dungeon/challenges/CustomChallenge.tsx`
- Modify: `client/src/games/melody-dungeon/ChallengeModal.tsx`

**Step 1: Create CustomChallenge component**

Create `client/src/games/melody-dungeon/challenges/CustomChallenge.tsx`:

```typescript
import React, { useState, useMemo } from 'react';
import { shuffle } from '../challengeHelpers';

export interface CustomQuestion {
  id: number;
  question: string;
  correctAnswer: string;
  wrongAnswer1: string;
  wrongAnswer2: string;
  wrongAnswer3: string;
  tier: number;
}

interface Props {
  questions: CustomQuestion[];
  tier: number;
  onResult: (correct: boolean) => void;
}

const CustomChallenge: React.FC<Props> = ({ questions, tier, onResult }) => {
  // Filter questions by tier (include all up to current tier)
  const eligible = useMemo(() => questions.filter((q) => q.tier <= tier), [questions, tier]);
  const selected = useMemo(() => {
    if (eligible.length === 0) return null;
    return eligible[Math.floor(Math.random() * eligible.length)];
  }, [eligible]);

  const options = useMemo(() => {
    if (!selected) return [];
    return shuffle([
      selected.correctAnswer,
      selected.wrongAnswer1,
      selected.wrongAnswer2,
      selected.wrongAnswer3,
    ]);
  }, [selected]);

  const [answered, setAnswered] = useState(false);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);

  if (!selected) {
    // No questions available — auto-pass
    React.useEffect(() => { onResult(true); }, []);
    return null;
  }

  const handleSelect = (answer: string) => {
    if (answered) return;
    setAnswered(true);
    setSelectedAnswer(answer);
    const correct = answer === selected.correctAnswer;
    setTimeout(() => onResult(correct), 1200);
  };

  return (
    <div className="flex flex-col items-center gap-4 p-4">
      <div className="text-purple-300 text-sm font-bold uppercase tracking-wider">
        Wizard's Riddle
      </div>
      <div className="text-white text-xl font-bold text-center max-w-md">
        {selected.question}
      </div>
      <div className="grid grid-cols-1 gap-2 w-full max-w-md mt-4">
        {options.map((option, i) => {
          let btnClass = 'bg-slate-700 hover:bg-slate-600 text-white';
          if (answered) {
            if (option === selected.correctAnswer) {
              btnClass = 'bg-green-700 text-white';
            } else if (option === selectedAnswer) {
              btnClass = 'bg-red-700 text-white';
            } else {
              btnClass = 'bg-slate-800 text-slate-500';
            }
          }
          return (
            <button
              key={i}
              onClick={() => handleSelect(option)}
              disabled={answered}
              className={`px-4 py-3 rounded-lg font-semibold text-left transition-colors ${btnClass}`}
            >
              {option}
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default CustomChallenge;
```

**Step 2: Wire into ChallengeModal**

In `client/src/games/melody-dungeon/ChallengeModal.tsx`:

Add import at top:
```typescript
import CustomChallenge from './challenges/CustomChallenge';
import type { CustomQuestion } from './challenges/CustomChallenge';
```

Add `customQuestions` to Props interface:
```typescript
customQuestions?: CustomQuestion[];
```

In the `ChallengeRenderer` function, add a case before the `default`:
```typescript
case 'custom':
  return <CustomChallenge questions={customQuestions ?? []} tier={tier} onResult={onResult} />;
```

The `ChallengeRenderer` function signature needs `customQuestions` added as a prop — pass it through from the parent ChallengeModal props.

**Step 3: Verify compilation**

Run: `bun check`
Expected: No type errors

**Step 4: Commit**

```bash
git add client/src/games/melody-dungeon/challenges/CustomChallenge.tsx client/src/games/melody-dungeon/ChallengeModal.tsx
git commit -m "feat: add CustomChallenge component for Wizard enemy encounters"
```

---

### Task 7: Teacher Pool Context Provider

**Files:**
- Create: `client/src/games/melody-dungeon/TeacherPoolContext.tsx`

**Step 1: Create context for pool data**

This React context holds the active teacher pool data (fetched via game code). It's provided at the MelodyDungeonGame level and consumed by challenge components.

Create `client/src/games/melody-dungeon/TeacherPoolContext.tsx`:

```typescript
import React, { createContext, useContext, useState, useCallback } from 'react';
import type { VocabEntry } from './logic/vocabData';
import type { CustomQuestion } from './challenges/CustomChallenge';

interface PoolData {
  id: number;
  name: string;
  useDefaults: boolean;
  vocabEntries: Array<{
    id: number;
    term: string;
    definition: string;
    symbol: string | null;
    tier: number;
    category: string;
    format: string | null;
  }>;
  customQuestions: CustomQuestion[];
}

interface TeacherPoolContextValue {
  pool: PoolData | null;
  loading: boolean;
  error: string | null;
  joinPool: (gameCode: string) => Promise<boolean>;
  leavePool: () => void;
}

const TeacherPoolContext = createContext<TeacherPoolContextValue>({
  pool: null,
  loading: false,
  error: null,
  joinPool: async () => false,
  leavePool: () => {},
});

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3001';

export const TeacherPoolProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [pool, setPool] = useState<PoolData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const joinPool = useCallback(async (gameCode: string): Promise<boolean> => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API_BASE}/api/pools/join/${gameCode.toUpperCase()}`);
      if (!res.ok) {
        const err = await res.json().catch(() => ({ error: 'Invalid game code' }));
        setError(err.error || 'Failed to join');
        setPool(null);
        return false;
      }
      const data = await res.json();
      setPool(data);
      return true;
    } catch {
      setError('Could not connect to server');
      setPool(null);
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  const leavePool = useCallback(() => {
    setPool(null);
    setError(null);
  }, []);

  return (
    <TeacherPoolContext.Provider value={{ pool, loading, error, joinPool, leavePool }}>
      {children}
    </TeacherPoolContext.Provider>
  );
};

export function useTeacherPool() {
  return useContext(TeacherPoolContext);
}

/** Convert pool vocab entries to the VocabEntry type used by VocabularyChallenge */
export function poolVocabToEntries(poolEntries: PoolData['vocabEntries']): VocabEntry[] {
  return poolEntries.map((e) => ({
    term: e.term,
    definition: e.definition,
    symbol: e.symbol ?? undefined,
    tier: e.tier as 1 | 2 | 3 | 4 | 5,
    category: e.category as VocabEntry['category'],
    format: (e.format as VocabEntry['format']) ?? undefined,
  }));
}
```

**Step 2: Commit**

```bash
git add client/src/games/melody-dungeon/TeacherPoolContext.tsx
git commit -m "feat: add TeacherPoolContext for game code pool data"
```

---

### Task 8: Game Integration — Start Screen & Pool Merging

**Files:**
- Modify: `client/src/games/melody-dungeon/MelodyDungeonGame.tsx`
- Modify: `client/src/games/melody-dungeon/challenges/VocabularyChallenge.tsx`
- Modify: `client/src/games/melody-dungeon/ChallengeModal.tsx`
- Modify: `client/src/games/melody-dungeon/logic/dungeonGenerator.ts`

This is the largest task — it integrates the teacher pool into the game flow. There are 4 sub-parts:

**Step 1: Add game code input to the start screen**

In `MelodyDungeonGame.tsx`, this component renders a `phase === 'menu'` screen before gameplay. Find where the menu phase is rendered and add a game code input field.

Add imports at top:
```typescript
import { TeacherPoolProvider, useTeacherPool } from './TeacherPoolContext';
```

Wrap the entire component return in `<TeacherPoolProvider>`.

In the menu phase rendering, add a game code section:
```tsx
// Game Code input section (in the menu phase)
const { pool, loading, error, joinPool, leavePool } = useTeacherPool();
const [gameCodeInput, setGameCodeInput] = useState('');

// Add to menu UI:
<div className="flex flex-col items-center gap-2 mt-4">
  {pool ? (
    <div className="flex items-center gap-2 bg-purple-900/50 px-4 py-2 rounded-lg">
      <span className="text-purple-200 text-sm">Playing with: <strong>{pool.name}</strong></span>
      <button onClick={leavePool} className="text-purple-400 hover:text-purple-200 text-xs underline">Leave</button>
    </div>
  ) : (
    <div className="flex items-center gap-2">
      <input
        type="text"
        placeholder="Game Code"
        value={gameCodeInput}
        onChange={(e) => setGameCodeInput(e.target.value.toUpperCase().slice(0, 6))}
        className="px-3 py-2 rounded bg-slate-800 text-white text-center uppercase tracking-widest w-32 text-sm"
        maxLength={6}
      />
      <button
        onClick={() => gameCodeInput.length === 6 && joinPool(gameCodeInput)}
        disabled={gameCodeInput.length !== 6 || loading}
        className="px-3 py-2 rounded bg-purple-700 hover:bg-purple-600 text-white text-sm disabled:opacity-50"
      >
        {loading ? '...' : 'Join'}
      </button>
    </div>
  )}
  {error && <p className="text-red-400 text-xs">{error}</p>}
</div>
```

**Step 2: Modify VocabularyChallenge to accept pool entries**

In `client/src/games/melody-dungeon/challenges/VocabularyChallenge.tsx`:

Add optional `poolEntries` prop:
```typescript
interface Props {
  category: VocabCategory;
  tier: Tier;
  onResult: (correct: boolean) => void;
  poolEntries?: VocabEntry[];  // NEW — from teacher pool
  useDefaults?: boolean;       // NEW — whether to merge with built-in entries
}
```

Modify the entries useMemo (line 94):
```typescript
const entries = useMemo(() => {
  const builtIn = (useDefaults !== false) ? getVocabEntries(category, tier) : [];
  const poolFiltered = (poolEntries ?? []).filter((e) => e.category === category && e.tier <= tier);
  const combined = [...builtIn, ...poolFiltered];
  return combined.length > 0 ? combined : getVocabEntries(category, tier); // fallback to built-in if empty
}, [category, tier, poolEntries, useDefaults]);
```

**Step 3: Pass pool data through ChallengeModal**

In `ChallengeModal.tsx`, add pool-related props and pass them to VocabularyChallenge and CustomChallenge:

```typescript
// Add to Props:
poolVocabEntries?: VocabEntry[];
poolUseDefaults?: boolean;
customQuestions?: CustomQuestion[];
```

In `ChallengeRenderer`, pass them through:
```typescript
if (VOCAB_CATEGORIES.has(type)) {
  return (
    <VocabularyChallenge
      category={type as VocabCategory}
      tier={tier}
      onResult={onResult}
      poolEntries={poolVocabEntries}
      useDefaults={poolUseDefaults}
    />
  );
}
```

**Step 4: Conditionally inject wizard enemies in dungeon generator**

In `client/src/games/melody-dungeon/logic/dungeonGenerator.ts`, the `generateDungeon` function needs an optional parameter for whether custom questions are available. If so, include `'wizard'` in the available subtypes and `'custom'` in the challenge types.

Add optional parameter to `generateDungeon`:
```typescript
export function generateDungeon(floorNumber: number, options?: { hasCustomQuestions?: boolean }): DungeonFloor {
```

Where `availableSubtypes` is built (using `getEnemySubtypesForFloor`), conditionally add wizard:
```typescript
const availableSubtypes = getEnemySubtypesForFloor(floorNumber);
if (options?.hasCustomQuestions) {
  availableSubtypes.push('wizard');
}
```

Where `challengeTypes` is built (using `getChallengeTypesForFloor`), conditionally add custom:
```typescript
const challengeTypes = getChallengeTypesForFloor(floorNumber);
if (options?.hasCustomQuestions) {
  challengeTypes.push('custom');
}
```

In `MelodyDungeonGame.tsx`, pass the pool info when calling `generateDungeon`:
```typescript
const hasCustom = pool?.customQuestions && pool.customQuestions.length > 0;
generateDungeon(floorNumber, { hasCustomQuestions: hasCustom });
```

**Step 5: Verify compilation**

Run: `bun check`
Expected: No type errors

**Step 6: Commit**

```bash
git add client/src/games/melody-dungeon/MelodyDungeonGame.tsx \
  client/src/games/melody-dungeon/challenges/VocabularyChallenge.tsx \
  client/src/games/melody-dungeon/ChallengeModal.tsx \
  client/src/games/melody-dungeon/logic/dungeonGenerator.ts
git commit -m "feat: integrate teacher pool into gameplay (game code input, vocab merging, wizard spawning)"
```

---

### Task 9: Teacher Dashboard — API Client

**Files:**
- Create: `client/src/games/melody-dungeon/teacher/api.ts`

**Step 1: Create API client for teacher dashboard**

Create `client/src/games/melody-dungeon/teacher/api.ts`:

```typescript
const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3001';

function getCredentials() {
  return 'include' as RequestInit['credentials'];
}

// --- Auth ---

export async function authMe(): Promise<{ id: number; username: string; role?: string; displayName?: string } | null> {
  const res = await fetch(`${API_BASE}/api/auth/me`, { credentials: getCredentials() });
  if (res.status === 401) return null;
  if (!res.ok) return null;
  return res.json();
}

export function getGoogleAuthUrl(): string {
  return `${API_BASE}/api/auth/google`;
}

// --- Pools ---

export interface Pool {
  id: number;
  teacherId: number;
  name: string;
  gameCode: string;
  isShared: boolean;
  useDefaults: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface VocabEntryApi {
  id: number;
  poolId: number;
  term: string;
  definition: string;
  symbol: string | null;
  tier: number;
  category: string;
  format: string | null;
  createdAt: string;
}

export interface CustomQuestionApi {
  id: number;
  poolId: number;
  question: string;
  correctAnswer: string;
  wrongAnswer1: string;
  wrongAnswer2: string;
  wrongAnswer3: string;
  tier: number;
  createdAt: string;
}

export interface PoolWithEntries extends Pool {
  vocabEntries: VocabEntryApi[];
  customQuestions: CustomQuestionApi[];
}

export async function listPools(): Promise<Pool[]> {
  const res = await fetch(`${API_BASE}/api/pools`, { credentials: getCredentials() });
  if (!res.ok) throw new Error('Failed to list pools');
  return res.json();
}

export async function createPool(name: string): Promise<Pool> {
  const res = await fetch(`${API_BASE}/api/pools`, {
    method: 'POST',
    credentials: getCredentials(),
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name }),
  });
  if (!res.ok) throw new Error('Failed to create pool');
  return res.json();
}

export async function getPool(id: number): Promise<PoolWithEntries> {
  const res = await fetch(`${API_BASE}/api/pools/${id}`, { credentials: getCredentials() });
  if (!res.ok) throw new Error('Failed to get pool');
  return res.json();
}

export async function updatePool(id: number, updates: { name?: string; useDefaults?: boolean; isShared?: boolean }): Promise<Pool> {
  const res = await fetch(`${API_BASE}/api/pools/${id}`, {
    method: 'PUT',
    credentials: getCredentials(),
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(updates),
  });
  if (!res.ok) throw new Error('Failed to update pool');
  return res.json();
}

export async function deletePool(id: number): Promise<void> {
  const res = await fetch(`${API_BASE}/api/pools/${id}`, {
    method: 'DELETE',
    credentials: getCredentials(),
  });
  if (!res.ok) throw new Error('Failed to delete pool');
}

export async function regenerateCode(id: number): Promise<Pool> {
  const res = await fetch(`${API_BASE}/api/pools/${id}/regenerate-code`, {
    method: 'POST',
    credentials: getCredentials(),
  });
  if (!res.ok) throw new Error('Failed to regenerate code');
  return res.json();
}

// --- Vocab Entries ---

export async function addVocabEntry(poolId: number, entry: {
  term: string; definition: string; symbol?: string; tier: number; category: string; format?: string;
}): Promise<VocabEntryApi> {
  const res = await fetch(`${API_BASE}/api/pools/${poolId}/vocab`, {
    method: 'POST',
    credentials: getCredentials(),
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(entry),
  });
  if (!res.ok) throw new Error('Failed to add vocab entry');
  return res.json();
}

export async function updateVocabEntry(poolId: number, entryId: number, updates: Partial<{
  term: string; definition: string; symbol: string | null; tier: number; category: string; format: string | null;
}>): Promise<VocabEntryApi> {
  const res = await fetch(`${API_BASE}/api/pools/${poolId}/vocab/${entryId}`, {
    method: 'PUT',
    credentials: getCredentials(),
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(updates),
  });
  if (!res.ok) throw new Error('Failed to update vocab entry');
  return res.json();
}

export async function deleteVocabEntry(poolId: number, entryId: number): Promise<void> {
  const res = await fetch(`${API_BASE}/api/pools/${poolId}/vocab/${entryId}`, {
    method: 'DELETE',
    credentials: getCredentials(),
  });
  if (!res.ok) throw new Error('Failed to delete vocab entry');
}

// --- Custom Questions ---

export async function addCustomQuestion(poolId: number, q: {
  question: string; correctAnswer: string; wrongAnswer1: string; wrongAnswer2: string; wrongAnswer3: string; tier: number;
}): Promise<CustomQuestionApi> {
  const res = await fetch(`${API_BASE}/api/pools/${poolId}/custom`, {
    method: 'POST',
    credentials: getCredentials(),
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(q),
  });
  if (!res.ok) throw new Error('Failed to add custom question');
  return res.json();
}

export async function updateCustomQuestion(poolId: number, qId: number, updates: Partial<{
  question: string; correctAnswer: string; wrongAnswer1: string; wrongAnswer2: string; wrongAnswer3: string; tier: number;
}>): Promise<CustomQuestionApi> {
  const res = await fetch(`${API_BASE}/api/pools/${poolId}/custom/${qId}`, {
    method: 'PUT',
    credentials: getCredentials(),
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(updates),
  });
  if (!res.ok) throw new Error('Failed to update custom question');
  return res.json();
}

export async function deleteCustomQuestion(poolId: number, qId: number): Promise<void> {
  const res = await fetch(`${API_BASE}/api/pools/${poolId}/custom/${qId}`, {
    method: 'DELETE',
    credentials: getCredentials(),
  });
  if (!res.ok) throw new Error('Failed to delete custom question');
}

// --- Community ---

export async function listSharedPools(): Promise<Pool[]> {
  const res = await fetch(`${API_BASE}/api/pools/shared`, { credentials: getCredentials() });
  if (!res.ok) throw new Error('Failed to list shared pools');
  return res.json();
}

export async function clonePool(id: number): Promise<Pool> {
  const res = await fetch(`${API_BASE}/api/pools/${id}/clone`, {
    method: 'POST',
    credentials: getCredentials(),
  });
  if (!res.ok) throw new Error('Failed to clone pool');
  return res.json();
}
```

**Step 2: Commit**

```bash
git add client/src/games/melody-dungeon/teacher/api.ts
git commit -m "feat: add teacher dashboard API client"
```

---

### Task 10: Teacher Dashboard — Login Page

**Files:**
- Create: `client/src/games/melody-dungeon/teacher/TeacherLoginPage.tsx`

**Step 1: Create login page component**

Create `client/src/games/melody-dungeon/teacher/TeacherLoginPage.tsx`:

```typescript
import React from 'react';
import { getGoogleAuthUrl } from './api';

const TeacherLoginPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-purple-950 flex items-center justify-center">
      <div className="bg-slate-800 rounded-xl p-8 shadow-xl max-w-md w-full text-center">
        <h1 className="text-2xl font-bold text-white mb-2">Melody Dungeon</h1>
        <h2 className="text-lg text-purple-300 mb-6">Teacher Dashboard</h2>
        <p className="text-slate-400 text-sm mb-8">
          Create custom question pools for your students. Sign in with your Google account to get started.
        </p>
        <a
          href={getGoogleAuthUrl()}
          className="inline-flex items-center gap-3 bg-white text-slate-800 px-6 py-3 rounded-lg font-semibold hover:bg-slate-100 transition-colors"
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24">
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/>
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
          </svg>
          Sign in with Google
        </a>
      </div>
    </div>
  );
};

export default TeacherLoginPage;
```

**Step 2: Commit**

```bash
git add client/src/games/melody-dungeon/teacher/TeacherLoginPage.tsx
git commit -m "feat: add teacher login page with Google sign-in"
```

---

### Task 11: Teacher Dashboard — Pool List Page

**Files:**
- Create: `client/src/games/melody-dungeon/teacher/TeacherDashboard.tsx`

**Step 1: Create dashboard (pool list) component**

Create `client/src/games/melody-dungeon/teacher/TeacherDashboard.tsx`:

This component shows a card grid of the teacher's pools with game codes, question counts, and create/delete actions. Uses React Query for data fetching with `listPools`, `createPool`, `deletePool` from the API client.

Key elements:
- "Create New Pool" button with a name input modal/inline
- Card for each pool: name, game code (with copy-to-clipboard), shared badge, "Edit" link, "Delete" button
- "Browse Community" link
- Pool cards link to the pool editor: `/games/melody-dungeon/teacher/pool/:id`

Implementation should follow the existing codebase patterns — functional components with hooks, Tailwind CSS for styling. Use `useLocation` from Wouter for navigation.

The component is approximately 150-200 lines. Build it with:
- `useQuery` from TanStack React Query to fetch pools
- `useMutation` for create/delete
- Simple card grid layout with Tailwind
- Clipboard copy using `navigator.clipboard.writeText`

**Step 2: Commit**

```bash
git add client/src/games/melody-dungeon/teacher/TeacherDashboard.tsx
git commit -m "feat: add teacher dashboard pool list page"
```

---

### Task 12: Teacher Dashboard — Pool Editor Page

**Files:**
- Create: `client/src/games/melody-dungeon/teacher/PoolEditor.tsx`

**Step 1: Create pool editor component**

Create `client/src/games/melody-dungeon/teacher/PoolEditor.tsx`:

This is the main editing interface. It has:
- **Header:** Pool name (editable inline), game code display with copy + regenerate button, useDefaults toggle, isShared toggle
- **Tabs:** "Vocabulary" and "Custom Questions (Wizard)"
- **Vocab tab:** Table showing term, definition, symbol, tier, category, format. Add row form at bottom. Edit/delete per row.
- **Custom Questions tab:** Table showing question, correct answer, wrong answers, tier. Add row form at bottom. Edit/delete per row.

Key patterns:
- Fetch pool with entries using `getPool(id)` via React Query
- Inline editing with local state, save on blur/enter
- Mutations for add/edit/delete operations
- Tier selection as a dropdown (1-5)
- Category selection as a dropdown (dynamics, tempo, symbols, terms)

The component is approximately 300-500 lines. Use existing Tailwind patterns from the codebase.

**Step 2: Commit**

```bash
git add client/src/games/melody-dungeon/teacher/PoolEditor.tsx
git commit -m "feat: add pool editor with vocab and custom question tabs"
```

---

### Task 13: Teacher Dashboard — Community Browser

**Files:**
- Create: `client/src/games/melody-dungeon/teacher/CommunityBrowser.tsx`

**Step 1: Create community browser component**

Create `client/src/games/melody-dungeon/teacher/CommunityBrowser.tsx`:

Simple grid of shared pools from other teachers. Each card shows pool name, game code, and a "Clone" button. Uses `listSharedPools` and `clonePool` from the API.

**Step 2: Commit**

```bash
git add client/src/games/melody-dungeon/teacher/CommunityBrowser.tsx
git commit -m "feat: add community pool browser with clone functionality"
```

---

### Task 14: Teacher Dashboard — Routing

**Files:**
- Create: `client/src/games/melody-dungeon/teacher/page.tsx`
- Modify: `client/src/App.tsx`

**Step 1: Create teacher page with sub-routing**

Create `client/src/games/melody-dungeon/teacher/page.tsx`:

```typescript
import React, { useEffect, useState } from 'react';
import { Switch, Route } from 'wouter';
import { QueryClientProvider, QueryClient } from '@tanstack/react-query';
import { authMe } from './api';
import TeacherLoginPage from './TeacherLoginPage';
import TeacherDashboard from './TeacherDashboard';
import PoolEditor from './PoolEditor';
import CommunityBrowser from './CommunityBrowser';

const teacherQueryClient = new QueryClient();

const TeacherPage: React.FC = () => {
  const [user, setUser] = useState<{ id: number; role?: string; displayName?: string } | null>(null);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    authMe().then((u) => {
      setUser(u);
      setChecking(false);
    });
  }, []);

  if (checking) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <p className="text-slate-400">Loading...</p>
      </div>
    );
  }

  if (!user || user.role !== 'teacher') {
    return <TeacherLoginPage />;
  }

  return (
    <QueryClientProvider client={teacherQueryClient}>
      <Switch>
        <Route path="/games/melody-dungeon/teacher" component={TeacherDashboard} />
        <Route path="/games/melody-dungeon/teacher/pool/:id">
          {(params) => <PoolEditor poolId={parseInt(params.id, 10)} />}
        </Route>
        <Route path="/games/melody-dungeon/teacher/community" component={CommunityBrowser} />
      </Switch>
    </QueryClientProvider>
  );
};

export default TeacherPage;
```

**Step 2: Add route to App.tsx**

In `client/src/App.tsx`, add:

Lazy import:
```typescript
const TeacherDashboardPage = lazy(() => import("@/games/melody-dungeon/teacher/page"));
```

Route (add BEFORE the `/games/melody-dungeon` route so it matches first):
```tsx
<Route path="/games/melody-dungeon/teacher/:rest*" component={TeacherDashboardPage} />
<Route path="/games/melody-dungeon/teacher" component={TeacherDashboardPage} />
```

**Step 3: Verify compilation**

Run: `bun check`
Expected: No type errors

**Step 4: Commit**

```bash
git add client/src/games/melody-dungeon/teacher/page.tsx client/src/App.tsx
git commit -m "feat: add teacher dashboard routing and auth gating"
```

---

### Task 15: Wizard Sprite Asset

**Files:**
- Create: `client/public/images/melody-dungeon/wizard.png`
- Modify: `client/src/games/melody-dungeon/DungeonGrid.tsx` (or wherever enemy sprites are mapped)

**Step 1: Create or source a wizard sprite**

The wizard sprite needs to match the existing pixel-art style used by other enemies (slime, skeleton, ghost, etc.). Check the existing sprite dimensions and style.

Look at `client/public/images/melody-dungeon/` for reference. The sprite should be the same dimensions as other enemy sprites.

Options:
- Use an AI image generator to create a matching pixel-art wizard
- Create a simple placeholder colored square with "W" text
- Use a free pixel-art wizard asset

**Step 2: Add wizard to the sprite mapping**

Find where enemy subtypes map to sprite image paths (likely in `DungeonGrid.tsx` or a sprites utility file) and add:
```typescript
wizard: '/images/melody-dungeon/wizard.png',
```

**Step 3: Add wizard to enemy label/name mapping**

In `ChallengeModal.tsx`, in `getBossLabel` function (line 47), add:
```typescript
case 'wizard': return 'Wizard';
```

**Step 4: Commit**

```bash
git add client/public/images/melody-dungeon/wizard.png client/src/games/melody-dungeon/DungeonGrid.tsx client/src/games/melody-dungeon/ChallengeModal.tsx
git commit -m "feat: add wizard enemy sprite and UI mappings"
```

---

### Task 16: End-to-End Testing

**Step 1: Manual test sequence**

Set up Google OAuth credentials (or temporarily bypass auth for testing) and verify the full flow:

1. Visit `/games/melody-dungeon/teacher` — should show login page
2. Sign in with Google — should redirect to dashboard
3. Create a new pool — should appear in list with game code
4. Add vocab entries (multiple categories and tiers)
5. Add custom questions (Wizard)
6. Toggle useDefaults and isShared
7. Copy game code
8. Visit `/games/melody-dungeon` — enter the game code on start screen
9. Start playing — verify:
   - Vocab challenges include custom entries
   - Wizard enemies spawn and show custom questions
   - If useDefaults is false, only pool entries appear for vocab
10. Test community: share a pool, browse community as another user, clone it

**Step 2: Verify type safety**

Run: `bun check`
Expected: No type errors

**Step 3: Final commit**

```bash
git add -A
git commit -m "feat: teacher question pools — complete Phase 1 implementation"
```
