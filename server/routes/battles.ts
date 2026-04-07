import { Router, Request, Response } from 'express';
import { eq, and, desc, or, inArray } from 'drizzle-orm';
import { db } from '../db';
import { battleHistory, characters } from '../db/schema';

function requireAuth(req: Request, res: Response, next: () => void) {
  if (req.session.userId === undefined) {
    res.status(401).json({ error: 'Not logged in' });
    return;
  }
  next();
}

const router = Router();

router.get('/', requireAuth, async (req: Request, res: Response) => {
  if (!db) return res.status(503).json({ error: 'Database not configured' });
  const userId = req.session.userId!;
  if (userId < 0) return res.json([]);

  const myChars = await db.select({ id: characters.id }).from(characters).where(eq(characters.userId, userId));
  const charIds = myChars.map((c) => c.id);
  if (charIds.length === 0) return res.json([]);

  const list = await db
    .select()
    .from(battleHistory)
    .where(
      or(
        inArray(battleHistory.player1Id, charIds),
        inArray(battleHistory.player2Id, charIds)
      )
    )
    .orderBy(desc(battleHistory.createdAt))
    .limit(50);

  return res.json(list);
});

const VALID_BATTLE_TYPES = ['pve', 'pvp'];

router.post('/', requireAuth, async (req: Request, res: Response) => {
  if (!db) return res.status(503).json({ error: 'Database not configured' });
  const { player1Id, player2Id, winnerId, battleType, durationMs, turnCount } = req.body;
  if (!player1Id || !battleType) {
    return res.status(400).json({ error: 'player1Id and battleType required' });
  }
  if (!VALID_BATTLE_TYPES.includes(battleType)) {
    return res.status(400).json({ error: 'battleType must be pve or pvp' });
  }
  if (winnerId != null && winnerId !== player1Id && winnerId !== player2Id) {
    return res.status(400).json({ error: 'winnerId must be player1Id or player2Id' });
  }
  if (durationMs != null && (typeof durationMs !== 'number' || durationMs < 0 || durationMs > 600000)) {
    return res.status(400).json({ error: 'durationMs must be 0-600000' });
  }
  if (turnCount != null && (typeof turnCount !== 'number' || turnCount < 1 || turnCount > 999)) {
    return res.status(400).json({ error: 'turnCount must be 1-999' });
  }

  const userId = req.session.userId!;
  const [c1] = await db.select().from(characters).where(and(eq(characters.id, player1Id), eq(characters.userId, userId)));
  if (!c1) return res.status(403).json({ error: 'Character not found' });

  if (player2Id != null) {
    const [c2] = await db.select().from(characters).where(eq(characters.id, player2Id));
    if (!c2) return res.status(400).json({ error: 'player2Id character not found' });
  }

  const [record] = await db
    .insert(battleHistory)
    .values({
      player1Id,
      player2Id: player2Id || null,
      winnerId: winnerId || null,
      battleType,
      durationMs: durationMs || null,
      turnCount: turnCount || null,
    })
    .returning();

  return res.status(201).json(record);
});

export default router;
