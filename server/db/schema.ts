/**
 * Cadence Quest - Database Schema
 * Drizzle ORM schema for users, characters, progression, and battles.
 */

import {
  pgTable,
  serial,
  text,
  integer,
  timestamp,
  jsonb,
  boolean,
} from 'drizzle-orm/pg-core';

export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  username: text('username').notNull().unique(),
  passwordHash: text('password_hash').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const characters = pgTable('characters', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').notNull().references(() => users.id),
  name: text('name').notNull(),
  class: text('class').notNull(), // bard | drummer | harmonist | conductor
  level: integer('level').notNull().default(1),
  xp: integer('xp').notNull().default(0),
  hp: integer('hp').notNull().default(100),
  maxHp: integer('max_hp').notNull().default(100),
  skillPoints: integer('skill_points').notNull().default(0),
  regionProgress: jsonb('region_progress').$type<Record<string, number>>().notNull().default({}),
  equippedInstrument: text('equipped_instrument'),
  equippedSpells: jsonb('equipped_spells').$type<string[]>().notNull().default([]),
  ownedInstruments: jsonb('owned_instruments').$type<string[]>().notNull().default([]),
  ownedSpells: jsonb('owned_spells').$type<string[]>().notNull().default([]),
  skillTree: jsonb('skill_tree').$type<Record<string, number[]>>().notNull().default({}),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const battleHistory = pgTable('battle_history', {
  id: serial('id').primaryKey(),
  player1Id: integer('player1_id').notNull().references(() => characters.id),
  player2Id: integer('player2_id').references(() => characters.id), // null for PvE
  winnerId: integer('winner_id').references(() => characters.id),
  battleType: text('battle_type').notNull(), // 'pve' | 'pvp'
  durationMs: integer('duration_ms'),
  turnCount: integer('turn_count'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const matchmakingSessions = pgTable('matchmaking_sessions', {
  id: serial('id').primaryKey(),
  characterId: integer('character_id').notNull().references(() => characters.id),
  levelBracket: integer('level_bracket').notNull(),
  status: text('status').notNull().default('searching'), // searching | matched
  battleRoomId: text('battle_room_id'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});
