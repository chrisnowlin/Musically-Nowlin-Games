import { Router, Request, Response } from 'express';
import { eq, and, desc } from 'drizzle-orm';
import { db } from '../db';
import {
  questionPools,
  poolVocabEntries,
  poolCustomQuestions,
} from '../db/schema';

const router = Router();

// ---------- Characters for non-ambiguous game codes ----------
const CODE_CHARS = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // no 0/O, 1/I/L

function generateGameCode(): string {
  let code = '';
  for (let i = 0; i < 6; i++) {
    code += CODE_CHARS[Math.floor(Math.random() * CODE_CHARS.length)];
  }
  return code;
}

// ---------- Valid categories for vocab entries ----------
const VALID_CATEGORIES = ['dynamics', 'tempo', 'symbols', 'terms'] as const;

// ---------- Middleware ----------

function requireAuth(req: Request, res: Response, next: () => void) {
  if (req.session.userId === undefined) {
    res.status(401).json({ error: 'Not logged in' });
    return;
  }
  next();
}

function requireTeacher(req: Request, res: Response, next: () => void) {
  if (req.session.role !== 'teacher') {
    res.status(403).json({ error: 'Teacher access required' });
    return;
  }
  next();
}

// =================================================================
// PUBLIC ROUTES (no auth) — must come before /:id
// =================================================================

// GET /join/:gameCode — fetch pool data by game code (case-insensitive)
router.get('/join/:gameCode', async (req: Request, res: Response) => {
  if (!db) return res.status(503).json({ error: 'Database not configured' });

  const gameCode = req.params.gameCode.toUpperCase().trim();
  if (!gameCode || gameCode.length !== 6) {
    return res.status(400).json({ error: 'Invalid game code' });
  }

  const [pool] = await db
    .select()
    .from(questionPools)
    .where(eq(questionPools.gameCode, gameCode));

  if (!pool) return res.status(404).json({ error: 'Pool not found' });

  const vocabEntries = await db
    .select()
    .from(poolVocabEntries)
    .where(eq(poolVocabEntries.poolId, pool.id));

  const customQuestions = await db
    .select()
    .from(poolCustomQuestions)
    .where(eq(poolCustomQuestions.poolId, pool.id));

  return res.json({
    id: pool.id,
    name: pool.name,
    useDefaults: pool.useDefaults,
    vocabEntries,
    customQuestions,
  });
});

// =================================================================
// COMMUNITY / SHARED ROUTES (requireAuth) — must come before /:id
// =================================================================

// GET /shared — list all shared pools
router.get('/shared', requireAuth, async (req: Request, res: Response) => {
  if (!db) return res.status(503).json({ error: 'Database not configured' });

  const pools = await db
    .select()
    .from(questionPools)
    .where(eq(questionPools.isShared, true))
    .orderBy(desc(questionPools.updatedAt));

  return res.json(pools);
});

// =================================================================
// POOL CRUD (requireAuth + requireTeacher)
// =================================================================

// GET / — list teacher's pools
router.get('/', requireAuth, requireTeacher, async (req: Request, res: Response) => {
  if (!db) return res.status(503).json({ error: 'Database not configured' });
  const teacherId = req.session.userId!;

  const pools = await db
    .select()
    .from(questionPools)
    .where(eq(questionPools.teacherId, teacherId))
    .orderBy(desc(questionPools.updatedAt));

  return res.json(pools);
});

// POST / — create pool
router.post('/', requireAuth, requireTeacher, async (req: Request, res: Response) => {
  if (!db) return res.status(503).json({ error: 'Database not configured' });
  const teacherId = req.session.userId!;

  const { name } = req.body;
  if (!name || typeof name !== 'string' || !name.trim()) {
    return res.status(400).json({ error: 'Pool name is required' });
  }

  // Generate unique game code with retry
  let gameCode = '';
  for (let attempt = 0; attempt < 10; attempt++) {
    const candidate = generateGameCode();
    const [existing] = await db
      .select()
      .from(questionPools)
      .where(eq(questionPools.gameCode, candidate));
    if (!existing) {
      gameCode = candidate;
      break;
    }
  }

  if (!gameCode) {
    return res.status(500).json({ error: 'Failed to generate unique game code' });
  }

  const [pool] = await db
    .insert(questionPools)
    .values({
      teacherId,
      name: name.trim().slice(0, 100),
      gameCode,
    })
    .returning();

  return res.status(201).json(pool);
});

// GET /:id — get pool with all entries
router.get('/:id', requireAuth, requireTeacher, async (req: Request, res: Response) => {
  if (!db) return res.status(503).json({ error: 'Database not configured' });
  const teacherId = req.session.userId!;
  const id = parseInt(req.params.id, 10);
  if (isNaN(id)) return res.status(400).json({ error: 'Invalid id' });

  const [pool] = await db
    .select()
    .from(questionPools)
    .where(and(eq(questionPools.id, id), eq(questionPools.teacherId, teacherId)));

  if (!pool) return res.status(404).json({ error: 'Pool not found' });

  const vocabEntries = await db
    .select()
    .from(poolVocabEntries)
    .where(eq(poolVocabEntries.poolId, id));

  const customQuestions = await db
    .select()
    .from(poolCustomQuestions)
    .where(eq(poolCustomQuestions.poolId, id));

  return res.json({
    ...pool,
    vocabEntries,
    customQuestions,
  });
});

// PUT /:id — update pool
router.put('/:id', requireAuth, requireTeacher, async (req: Request, res: Response) => {
  if (!db) return res.status(503).json({ error: 'Database not configured' });
  const teacherId = req.session.userId!;
  const id = parseInt(req.params.id, 10);
  if (isNaN(id)) return res.status(400).json({ error: 'Invalid id' });

  const [existing] = await db
    .select()
    .from(questionPools)
    .where(and(eq(questionPools.id, id), eq(questionPools.teacherId, teacherId)));

  if (!existing) return res.status(404).json({ error: 'Pool not found' });

  const updates: Record<string, unknown> = { updatedAt: new Date() };

  if (req.body.name !== undefined) {
    if (typeof req.body.name !== 'string' || !req.body.name.trim()) {
      return res.status(400).json({ error: 'Pool name cannot be empty' });
    }
    updates.name = req.body.name.trim().slice(0, 100);
  }
  if (typeof req.body.useDefaults === 'boolean') {
    updates.useDefaults = req.body.useDefaults;
  }
  if (typeof req.body.isShared === 'boolean') {
    updates.isShared = req.body.isShared;
  }

  const [pool] = await db
    .update(questionPools)
    .set(updates as typeof questionPools.$inferInsert)
    .where(and(eq(questionPools.id, id), eq(questionPools.teacherId, teacherId)))
    .returning();

  return res.json(pool);
});

// DELETE /:id — delete pool and all children
router.delete('/:id', requireAuth, requireTeacher, async (req: Request, res: Response) => {
  if (!db) return res.status(503).json({ error: 'Database not configured' });
  const teacherId = req.session.userId!;
  const id = parseInt(req.params.id, 10);
  if (isNaN(id)) return res.status(400).json({ error: 'Invalid id' });

  const [existing] = await db
    .select()
    .from(questionPools)
    .where(and(eq(questionPools.id, id), eq(questionPools.teacherId, teacherId)));

  if (!existing) return res.status(404).json({ error: 'Pool not found' });

  // Delete children first
  await db.delete(poolVocabEntries).where(eq(poolVocabEntries.poolId, id));
  await db.delete(poolCustomQuestions).where(eq(poolCustomQuestions.poolId, id));
  // Delete pool
  await db.delete(questionPools).where(eq(questionPools.id, id));

  return res.json({ success: true });
});

// POST /:id/regenerate-code — generate new game code
router.post('/:id/regenerate-code', requireAuth, requireTeacher, async (req: Request, res: Response) => {
  if (!db) return res.status(503).json({ error: 'Database not configured' });
  const teacherId = req.session.userId!;
  const id = parseInt(req.params.id, 10);
  if (isNaN(id)) return res.status(400).json({ error: 'Invalid id' });

  const [existing] = await db
    .select()
    .from(questionPools)
    .where(and(eq(questionPools.id, id), eq(questionPools.teacherId, teacherId)));

  if (!existing) return res.status(404).json({ error: 'Pool not found' });

  let gameCode = '';
  for (let attempt = 0; attempt < 10; attempt++) {
    const candidate = generateGameCode();
    const [dup] = await db
      .select()
      .from(questionPools)
      .where(eq(questionPools.gameCode, candidate));
    if (!dup) {
      gameCode = candidate;
      break;
    }
  }

  if (!gameCode) {
    return res.status(500).json({ error: 'Failed to generate unique game code' });
  }

  const [pool] = await db
    .update(questionPools)
    .set({ gameCode, updatedAt: new Date() } as typeof questionPools.$inferInsert)
    .where(and(eq(questionPools.id, id), eq(questionPools.teacherId, teacherId)))
    .returning();

  return res.json(pool);
});

// =================================================================
// VOCAB ENTRIES (requireAuth + requireTeacher, verify pool ownership)
// =================================================================

// POST /:id/vocab — add vocab entry
router.post('/:id/vocab', requireAuth, requireTeacher, async (req: Request, res: Response) => {
  if (!db) return res.status(503).json({ error: 'Database not configured' });
  const teacherId = req.session.userId!;
  const poolId = parseInt(req.params.id, 10);
  if (isNaN(poolId)) return res.status(400).json({ error: 'Invalid id' });

  const [pool] = await db
    .select()
    .from(questionPools)
    .where(and(eq(questionPools.id, poolId), eq(questionPools.teacherId, teacherId)));

  if (!pool) return res.status(404).json({ error: 'Pool not found' });

  const { term, definition, tier, category, symbol, format } = req.body;

  if (!term || typeof term !== 'string' || !term.trim()) {
    return res.status(400).json({ error: 'Term is required' });
  }
  if (!definition || typeof definition !== 'string' || !definition.trim()) {
    return res.status(400).json({ error: 'Definition is required' });
  }
  if (typeof tier !== 'number' || tier < 1 || tier > 5 || !Number.isInteger(tier)) {
    return res.status(400).json({ error: 'Tier must be an integer between 1 and 5' });
  }
  if (!category || !VALID_CATEGORIES.includes(category as (typeof VALID_CATEGORIES)[number])) {
    return res.status(400).json({ error: 'Category must be one of: dynamics, tempo, symbols, terms' });
  }

  const [entry] = await db
    .insert(poolVocabEntries)
    .values({
      poolId,
      term: term.trim().slice(0, 200),
      definition: definition.trim().slice(0, 500),
      tier,
      category,
      symbol: symbol ? String(symbol).trim().slice(0, 200) : null,
      format: format ? String(format).trim().slice(0, 100) : null,
    })
    .returning();

  // Touch pool's updatedAt
  await db
    .update(questionPools)
    .set({ updatedAt: new Date() } as typeof questionPools.$inferInsert)
    .where(eq(questionPools.id, poolId));

  return res.status(201).json(entry);
});

// PUT /:id/vocab/:entryId — edit vocab entry
router.put('/:id/vocab/:entryId', requireAuth, requireTeacher, async (req: Request, res: Response) => {
  if (!db) return res.status(503).json({ error: 'Database not configured' });
  const teacherId = req.session.userId!;
  const poolId = parseInt(req.params.id, 10);
  const entryId = parseInt(req.params.entryId, 10);
  if (isNaN(poolId) || isNaN(entryId)) return res.status(400).json({ error: 'Invalid id' });

  const [pool] = await db
    .select()
    .from(questionPools)
    .where(and(eq(questionPools.id, poolId), eq(questionPools.teacherId, teacherId)));

  if (!pool) return res.status(404).json({ error: 'Pool not found' });

  const [existing] = await db
    .select()
    .from(poolVocabEntries)
    .where(and(eq(poolVocabEntries.id, entryId), eq(poolVocabEntries.poolId, poolId)));

  if (!existing) return res.status(404).json({ error: 'Vocab entry not found' });

  const updates: Record<string, unknown> = {};

  if (req.body.term !== undefined) {
    if (typeof req.body.term !== 'string' || !req.body.term.trim()) {
      return res.status(400).json({ error: 'Term cannot be empty' });
    }
    updates.term = req.body.term.trim().slice(0, 200);
  }
  if (req.body.definition !== undefined) {
    if (typeof req.body.definition !== 'string' || !req.body.definition.trim()) {
      return res.status(400).json({ error: 'Definition cannot be empty' });
    }
    updates.definition = req.body.definition.trim().slice(0, 500);
  }
  if (req.body.tier !== undefined) {
    if (typeof req.body.tier !== 'number' || req.body.tier < 1 || req.body.tier > 5 || !Number.isInteger(req.body.tier)) {
      return res.status(400).json({ error: 'Tier must be an integer between 1 and 5' });
    }
    updates.tier = req.body.tier;
  }
  if (req.body.category !== undefined) {
    if (!VALID_CATEGORIES.includes(req.body.category as (typeof VALID_CATEGORIES)[number])) {
      return res.status(400).json({ error: 'Category must be one of: dynamics, tempo, symbols, terms' });
    }
    updates.category = req.body.category;
  }
  if (req.body.symbol !== undefined) {
    updates.symbol = req.body.symbol ? String(req.body.symbol).trim().slice(0, 200) : null;
  }
  if (req.body.format !== undefined) {
    updates.format = req.body.format ? String(req.body.format).trim().slice(0, 100) : null;
  }

  const [entry] = await db
    .update(poolVocabEntries)
    .set(updates as typeof poolVocabEntries.$inferInsert)
    .where(and(eq(poolVocabEntries.id, entryId), eq(poolVocabEntries.poolId, poolId)))
    .returning();

  // Touch pool's updatedAt
  await db
    .update(questionPools)
    .set({ updatedAt: new Date() } as typeof questionPools.$inferInsert)
    .where(eq(questionPools.id, poolId));

  return res.json(entry);
});

// DELETE /:id/vocab/:entryId — delete vocab entry
router.delete('/:id/vocab/:entryId', requireAuth, requireTeacher, async (req: Request, res: Response) => {
  if (!db) return res.status(503).json({ error: 'Database not configured' });
  const teacherId = req.session.userId!;
  const poolId = parseInt(req.params.id, 10);
  const entryId = parseInt(req.params.entryId, 10);
  if (isNaN(poolId) || isNaN(entryId)) return res.status(400).json({ error: 'Invalid id' });

  const [pool] = await db
    .select()
    .from(questionPools)
    .where(and(eq(questionPools.id, poolId), eq(questionPools.teacherId, teacherId)));

  if (!pool) return res.status(404).json({ error: 'Pool not found' });

  const [existing] = await db
    .select()
    .from(poolVocabEntries)
    .where(and(eq(poolVocabEntries.id, entryId), eq(poolVocabEntries.poolId, poolId)));

  if (!existing) return res.status(404).json({ error: 'Vocab entry not found' });

  await db.delete(poolVocabEntries).where(eq(poolVocabEntries.id, entryId));

  // Touch pool's updatedAt
  await db
    .update(questionPools)
    .set({ updatedAt: new Date() } as typeof questionPools.$inferInsert)
    .where(eq(questionPools.id, poolId));

  return res.json({ success: true });
});

// =================================================================
// CUSTOM QUESTIONS (requireAuth + requireTeacher, verify pool ownership)
// =================================================================

// POST /:id/custom — add custom question
router.post('/:id/custom', requireAuth, requireTeacher, async (req: Request, res: Response) => {
  if (!db) return res.status(503).json({ error: 'Database not configured' });
  const teacherId = req.session.userId!;
  const poolId = parseInt(req.params.id, 10);
  if (isNaN(poolId)) return res.status(400).json({ error: 'Invalid id' });

  const [pool] = await db
    .select()
    .from(questionPools)
    .where(and(eq(questionPools.id, poolId), eq(questionPools.teacherId, teacherId)));

  if (!pool) return res.status(404).json({ error: 'Pool not found' });

  const { question, correctAnswer, wrongAnswer1, wrongAnswer2, wrongAnswer3, tier } = req.body;

  if (!question || typeof question !== 'string' || !question.trim()) {
    return res.status(400).json({ error: 'Question is required' });
  }
  if (!correctAnswer || typeof correctAnswer !== 'string' || !correctAnswer.trim()) {
    return res.status(400).json({ error: 'Correct answer is required' });
  }
  if (!wrongAnswer1 || typeof wrongAnswer1 !== 'string' || !wrongAnswer1.trim()) {
    return res.status(400).json({ error: 'Wrong answer 1 is required' });
  }
  if (!wrongAnswer2 || typeof wrongAnswer2 !== 'string' || !wrongAnswer2.trim()) {
    return res.status(400).json({ error: 'Wrong answer 2 is required' });
  }
  if (!wrongAnswer3 || typeof wrongAnswer3 !== 'string' || !wrongAnswer3.trim()) {
    return res.status(400).json({ error: 'Wrong answer 3 is required' });
  }
  if (typeof tier !== 'number' || tier < 1 || tier > 5 || !Number.isInteger(tier)) {
    return res.status(400).json({ error: 'Tier must be an integer between 1 and 5' });
  }

  const [q] = await db
    .insert(poolCustomQuestions)
    .values({
      poolId,
      question: question.trim().slice(0, 500),
      correctAnswer: correctAnswer.trim().slice(0, 200),
      wrongAnswer1: wrongAnswer1.trim().slice(0, 200),
      wrongAnswer2: wrongAnswer2.trim().slice(0, 200),
      wrongAnswer3: wrongAnswer3.trim().slice(0, 200),
      tier,
    })
    .returning();

  // Touch pool's updatedAt
  await db
    .update(questionPools)
    .set({ updatedAt: new Date() } as typeof questionPools.$inferInsert)
    .where(eq(questionPools.id, poolId));

  return res.status(201).json(q);
});

// PUT /:id/custom/:qId — edit custom question
router.put('/:id/custom/:qId', requireAuth, requireTeacher, async (req: Request, res: Response) => {
  if (!db) return res.status(503).json({ error: 'Database not configured' });
  const teacherId = req.session.userId!;
  const poolId = parseInt(req.params.id, 10);
  const qId = parseInt(req.params.qId, 10);
  if (isNaN(poolId) || isNaN(qId)) return res.status(400).json({ error: 'Invalid id' });

  const [pool] = await db
    .select()
    .from(questionPools)
    .where(and(eq(questionPools.id, poolId), eq(questionPools.teacherId, teacherId)));

  if (!pool) return res.status(404).json({ error: 'Pool not found' });

  const [existing] = await db
    .select()
    .from(poolCustomQuestions)
    .where(and(eq(poolCustomQuestions.id, qId), eq(poolCustomQuestions.poolId, poolId)));

  if (!existing) return res.status(404).json({ error: 'Custom question not found' });

  const updates: Record<string, unknown> = {};

  if (req.body.question !== undefined) {
    if (typeof req.body.question !== 'string' || !req.body.question.trim()) {
      return res.status(400).json({ error: 'Question cannot be empty' });
    }
    updates.question = req.body.question.trim().slice(0, 500);
  }
  if (req.body.correctAnswer !== undefined) {
    if (typeof req.body.correctAnswer !== 'string' || !req.body.correctAnswer.trim()) {
      return res.status(400).json({ error: 'Correct answer cannot be empty' });
    }
    updates.correctAnswer = req.body.correctAnswer.trim().slice(0, 200);
  }
  if (req.body.wrongAnswer1 !== undefined) {
    if (typeof req.body.wrongAnswer1 !== 'string' || !req.body.wrongAnswer1.trim()) {
      return res.status(400).json({ error: 'Wrong answer 1 cannot be empty' });
    }
    updates.wrongAnswer1 = req.body.wrongAnswer1.trim().slice(0, 200);
  }
  if (req.body.wrongAnswer2 !== undefined) {
    if (typeof req.body.wrongAnswer2 !== 'string' || !req.body.wrongAnswer2.trim()) {
      return res.status(400).json({ error: 'Wrong answer 2 cannot be empty' });
    }
    updates.wrongAnswer2 = req.body.wrongAnswer2.trim().slice(0, 200);
  }
  if (req.body.wrongAnswer3 !== undefined) {
    if (typeof req.body.wrongAnswer3 !== 'string' || !req.body.wrongAnswer3.trim()) {
      return res.status(400).json({ error: 'Wrong answer 3 cannot be empty' });
    }
    updates.wrongAnswer3 = req.body.wrongAnswer3.trim().slice(0, 200);
  }
  if (req.body.tier !== undefined) {
    if (typeof req.body.tier !== 'number' || req.body.tier < 1 || req.body.tier > 5 || !Number.isInteger(req.body.tier)) {
      return res.status(400).json({ error: 'Tier must be an integer between 1 and 5' });
    }
    updates.tier = req.body.tier;
  }

  const [q] = await db
    .update(poolCustomQuestions)
    .set(updates as typeof poolCustomQuestions.$inferInsert)
    .where(and(eq(poolCustomQuestions.id, qId), eq(poolCustomQuestions.poolId, poolId)))
    .returning();

  // Touch pool's updatedAt
  await db
    .update(questionPools)
    .set({ updatedAt: new Date() } as typeof questionPools.$inferInsert)
    .where(eq(questionPools.id, poolId));

  return res.json(q);
});

// DELETE /:id/custom/:qId — delete custom question
router.delete('/:id/custom/:qId', requireAuth, requireTeacher, async (req: Request, res: Response) => {
  if (!db) return res.status(503).json({ error: 'Database not configured' });
  const teacherId = req.session.userId!;
  const poolId = parseInt(req.params.id, 10);
  const qId = parseInt(req.params.qId, 10);
  if (isNaN(poolId) || isNaN(qId)) return res.status(400).json({ error: 'Invalid id' });

  const [pool] = await db
    .select()
    .from(questionPools)
    .where(and(eq(questionPools.id, poolId), eq(questionPools.teacherId, teacherId)));

  if (!pool) return res.status(404).json({ error: 'Pool not found' });

  const [existing] = await db
    .select()
    .from(poolCustomQuestions)
    .where(and(eq(poolCustomQuestions.id, qId), eq(poolCustomQuestions.poolId, poolId)));

  if (!existing) return res.status(404).json({ error: 'Custom question not found' });

  await db.delete(poolCustomQuestions).where(eq(poolCustomQuestions.id, qId));

  // Touch pool's updatedAt
  await db
    .update(questionPools)
    .set({ updatedAt: new Date() } as typeof questionPools.$inferInsert)
    .where(eq(questionPools.id, poolId));

  return res.json({ success: true });
});

// =================================================================
// CLONE (requireAuth)
// =================================================================

// POST /:id/clone — clone a shared pool
router.post('/:id/clone', requireAuth, async (req: Request, res: Response) => {
  if (!db) return res.status(503).json({ error: 'Database not configured' });
  const userId = req.session.userId!;
  const sourceId = parseInt(req.params.id, 10);
  if (isNaN(sourceId)) return res.status(400).json({ error: 'Invalid id' });

  // Verify the source pool exists and is shared
  const [source] = await db
    .select()
    .from(questionPools)
    .where(and(eq(questionPools.id, sourceId), eq(questionPools.isShared, true)));

  if (!source) return res.status(404).json({ error: 'Shared pool not found' });

  // Generate unique game code for the clone
  let gameCode = '';
  for (let attempt = 0; attempt < 10; attempt++) {
    const candidate = generateGameCode();
    const [existing] = await db
      .select()
      .from(questionPools)
      .where(eq(questionPools.gameCode, candidate));
    if (!existing) {
      gameCode = candidate;
      break;
    }
  }

  if (!gameCode) {
    return res.status(500).json({ error: 'Failed to generate unique game code' });
  }

  // Create the new pool (private, owned by current user)
  const [newPool] = await db
    .insert(questionPools)
    .values({
      teacherId: userId,
      name: `${source.name} (Copy)`.slice(0, 100),
      gameCode,
      isShared: false,
      useDefaults: source.useDefaults,
    })
    .returning();

  // Copy vocab entries
  const vocabEntries = await db
    .select()
    .from(poolVocabEntries)
    .where(eq(poolVocabEntries.poolId, sourceId));

  for (const entry of vocabEntries) {
    await db.insert(poolVocabEntries).values({
      poolId: newPool.id,
      term: entry.term,
      definition: entry.definition,
      symbol: entry.symbol,
      tier: entry.tier,
      category: entry.category,
      format: entry.format,
    });
  }

  // Copy custom questions
  const customQuestions = await db
    .select()
    .from(poolCustomQuestions)
    .where(eq(poolCustomQuestions.poolId, sourceId));

  for (const q of customQuestions) {
    await db.insert(poolCustomQuestions).values({
      poolId: newPool.id,
      question: q.question,
      correctAnswer: q.correctAnswer,
      wrongAnswer1: q.wrongAnswer1,
      wrongAnswer2: q.wrongAnswer2,
      wrongAnswer3: q.wrongAnswer3,
      tier: q.tier,
    });
  }

  return res.status(201).json(newPool);
});

export default router;
