import { Router, Request, Response } from 'express';
import { eq, and } from 'drizzle-orm';
import { db } from '../db';
import { characters } from '../db/schema';
import type { CharacterClass } from '../../shared/types/cadence-quest';

const VALID_CLASSES: CharacterClass[] = ['bard', 'drummer', 'harmonist', 'conductor'];
const VALID_BRANCHES = ['rhythm', 'pitch', 'harmony', 'dynamics', 'theory'] as const;

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
  if (userId < 0) {
    return res.json([]);
  }
  const list = await db
    .select()
    .from(characters)
    .where(eq(characters.userId, userId));
  return res.json(
    list.map((c) => ({
      id: String(c.id),
      userId: c.userId,
      name: c.name,
      class: c.class,
      stats: {
        level: c.level,
        xp: c.xp,
        hp: c.hp,
        maxHp: c.maxHp,
        skillPoints: c.skillPoints,
        skillTree: c.skillTree,
      },
      regionProgress: c.regionProgress,
      equippedInstrument: c.equippedInstrument,
      equippedSpells: c.equippedSpells,
      ownedInstruments: c.ownedInstruments,
      ownedSpells: c.ownedSpells,
    }))
  );
});

router.post('/', requireAuth, async (req: Request, res: Response) => {
  if (!db) return res.status(503).json({ error: 'Database not configured' });
  const userId = req.session.userId!;
  if (userId < 0) {
    return res.status(403).json({ error: 'Guest users cannot save characters' });
  }
  const { name, class: charClass } = req.body;
  if (!name || !charClass || typeof name !== 'string') {
    return res.status(400).json({ error: 'Name and class required' });
  }
  if (!VALID_CLASSES.includes(charClass)) {
    return res.status(400).json({ error: 'Invalid class' });
  }
  const [c] = await db
    .insert(characters)
    .values({
      userId,
      name: name.trim().slice(0, 50),
      class: charClass,
    })
    .returning();
  return res.status(201).json({
    id: String(c.id),
    name: c.name,
    class: c.class,
    stats: {
      level: c.level,
      xp: c.xp,
      hp: c.hp,
      maxHp: c.maxHp,
      skillPoints: c.skillPoints,
      skillTree: c.skillTree,
    },
    regionProgress: c.regionProgress,
    equippedInstrument: c.equippedInstrument,
    equippedSpells: c.equippedSpells,
    ownedInstruments: c.ownedInstruments,
    ownedSpells: c.ownedSpells,
  });
});

router.get('/:id', requireAuth, async (req: Request, res: Response) => {
  if (!db) return res.status(503).json({ error: 'Database not configured' });
  const userId = req.session.userId!;
  const id = parseInt(req.params.id, 10);
  if (isNaN(id)) return res.status(400).json({ error: 'Invalid id' });
  const [c] = await db
    .select()
    .from(characters)
    .where(and(eq(characters.id, id), eq(characters.userId, userId)));
  if (!c) return res.status(404).json({ error: 'Character not found' });
  return res.json({
    id: String(c.id),
    userId: c.userId,
    name: c.name,
    class: c.class,
    stats: {
      level: c.level,
      xp: c.xp,
      hp: c.hp,
      maxHp: c.maxHp,
      skillPoints: c.skillPoints,
      skillTree: c.skillTree,
    },
    regionProgress: c.regionProgress,
    equippedInstrument: c.equippedInstrument,
    equippedSpells: c.equippedSpells,
    ownedInstruments: c.ownedInstruments,
    ownedSpells: c.ownedSpells,
  });
});

function validateSkillTree(tree: unknown): tree is Record<string, number[]> {
  if (!tree || typeof tree !== 'object') return false;
  for (const [branch, tiers] of Object.entries(tree)) {
    if (!VALID_BRANCHES.includes(branch as (typeof VALID_BRANCHES)[number])) return false;
    if (!Array.isArray(tiers)) return false;
    if (tiers.length > 5) return false;
    for (const t of tiers) {
      if (typeof t !== 'number' || t < 0 || t > 4 || !Number.isInteger(t)) return false;
    }
  }
  return true;
}

router.patch('/:id', requireAuth, async (req: Request, res: Response) => {
  if (!db) return res.status(503).json({ error: 'Database not configured' });
  const userId = req.session.userId!;
  const id = parseInt(req.params.id, 10);
  if (isNaN(id)) return res.status(400).json({ error: 'Invalid id' });
  const [existing] = await db
    .select()
    .from(characters)
    .where(and(eq(characters.id, id), eq(characters.userId, userId)));
  if (!existing) return res.status(404).json({ error: 'Character not found' });

  const body = req.body;
  const updates: Record<string, unknown> = { updatedAt: new Date() };

  if (typeof body.level === 'number' && body.level >= 1 && body.level <= 99) updates.level = body.level;
  if (typeof body.xp === 'number' && body.xp >= 0) updates.xp = body.xp;
  if (typeof body.hp === 'number' && body.hp >= 0) updates.hp = body.hp;
  if (typeof body.maxHp === 'number' && body.maxHp >= 1 && body.maxHp <= 999) updates.maxHp = body.maxHp;
  if (typeof body.skillPoints === 'number' && body.skillPoints >= 0) updates.skillPoints = body.skillPoints;

  if (body.regionProgress && typeof body.regionProgress === 'object' && !Array.isArray(body.regionProgress)) {
    const rp = body.regionProgress as Record<string, unknown>;
    const valid: Record<string, number> = {};
    for (const [k, v] of Object.entries(rp)) {
      if (typeof k === 'string' && typeof v === 'number' && v >= 0 && v <= 20) valid[k] = v;
    }
    updates.regionProgress = valid;
  }

  if (body.equippedInstrument !== undefined) {
    if (body.equippedInstrument === null) {
      updates.equippedInstrument = null;
    } else if (typeof body.equippedInstrument === 'string') {
      const owned = (existing.ownedInstruments as string[]) ?? [];
      if (owned.includes(body.equippedInstrument)) {
        updates.equippedInstrument = body.equippedInstrument;
      }
    }
  }

  if (Array.isArray(body.equippedSpells)) {
    const owned = (existing.ownedSpells as string[]) ?? [];
    const valid = body.equippedSpells
      .filter((s): s is string => typeof s === 'string')
      .filter((s) => owned.includes(s))
      .slice(0, 2);
    updates.equippedSpells = valid;
  }

  if (Array.isArray(body.ownedInstruments)) {
    updates.ownedInstruments = body.ownedInstruments.filter((s): s is string => typeof s === 'string').slice(0, 50);
  }
  if (Array.isArray(body.ownedSpells)) {
    updates.ownedSpells = body.ownedSpells.filter((s): s is string => typeof s === 'string').slice(0, 50);
  }

  if (body.skillTree && typeof body.skillTree === 'object' && validateSkillTree(body.skillTree)) {
    updates.skillTree = body.skillTree;
  }

  const [c] = await db
    .update(characters)
    .set(updates as typeof characters.$inferInsert)
    .where(and(eq(characters.id, id), eq(characters.userId, userId)))
    .returning();
  if (!c) return res.status(404).json({ error: 'Character not found' });
  return res.json({
    id: String(c.id),
    name: c.name,
    class: c.class,
    stats: {
      level: c.level,
      xp: c.xp,
      hp: c.hp,
      maxHp: c.maxHp,
      skillPoints: c.skillPoints,
      skillTree: c.skillTree,
    },
    regionProgress: c.regionProgress,
    equippedInstrument: c.equippedInstrument,
    equippedSpells: c.equippedSpells,
    ownedInstruments: c.ownedInstruments,
    ownedSpells: c.ownedSpells,
  });
});

export default router;
