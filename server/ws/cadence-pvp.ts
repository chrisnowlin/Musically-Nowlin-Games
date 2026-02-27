/**
 * Cadence Quest - PvP Matchmaking and Battle Rooms
 * Server-authoritative matchmaking and turn-based battle synchronization.
 */

import type { Server, Socket } from 'socket.io';
import { eq, and } from 'drizzle-orm';
import { db } from '../db';
import { characters } from '../db/schema';
import { processAnswer, toBattleCharacter } from '../../shared/logic/battle-engine';
import { validateAnswer } from '../../shared/logic/challenge-pool';
import { generateChallenge } from '../../shared/logic/challenge-pool';
import type {
  BattleState,
  MusicChallenge,
  ChallengeAnswer,
  BattleCharacter,
} from '../../shared/types/cadence-quest';

interface QueuedPlayer {
  socketId: string;
  characterId: number;
  userId: number;
}

interface BattleRoom {
  id: string;
  player1: { socketId: string; characterId: number };
  player2: { socketId: string; characterId: number };
  state: BattleState;
  currentChallenge: MusicChallenge | null;
}

const LEVEL_BRACKETS = 5; // 1-5 based on character level
const matchmakingQueues = new Map<number, QueuedPlayer[]>();
const battleRooms = new Map<string, BattleRoom>();
const socketToRoom = new Map<string, string>();
const socketToBracket = new Map<string, number>();

function getLevelBracket(level: number): number {
  return Math.min(LEVEL_BRACKETS, Math.max(1, Math.floor(level / 5) + 1));
}

function generateRoomId(): string {
  return `battle-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

async function getCharacter(id: number) {
  if (!db) return null;
  const [c] = await db.select().from(characters).where(eq(characters.id, id));
  return c;
}

export function registerCadencePvP(io: Server, getSessionUserId: (req: unknown) => number | undefined) {
  io.on('connection', (socket: Socket) => {
    const req = socket.request as { session?: { userId?: number } };
    const userId = req.session?.userId ?? getSessionUserId(socket.request) ?? -1;

    socket.on('matchmaking:join', async (payload: { characterId: number; levelBracket?: number }) => {
      if (userId === undefined || userId < 0) {
        socket.emit('matchmaking:error', { message: 'Login required for PvP' });
        return;
      }
      const characterId = Number(payload.characterId);
      if (!characterId || characterId < 1) {
        socket.emit('matchmaking:error', { message: 'Valid character required' });
        return;
      }
      if (!db) {
        socket.emit('matchmaking:error', { message: 'Server not configured' });
        return;
      }
      const [char] = await db
        .select()
        .from(characters)
        .where(and(eq(characters.id, characterId), eq(characters.userId, userId)));
      if (!char) {
        socket.emit('matchmaking:error', { message: 'Character not found' });
        return;
      }

      const bracket = getLevelBracket(char.level);
      const queue = matchmakingQueues.get(bracket) ?? [];
      const existing = queue.find((p) => p.socketId === socket.id);
      if (existing) return;

      queue.push({ socketId: socket.id, characterId, userId });
      matchmakingQueues.set(bracket, queue);
      socketToBracket.set(socket.id, bracket);
      socket.join(`matchmaking:${bracket}`);

      if (queue.length >= 2) {
        const [p1, p2] = queue.splice(0, 2);
        matchmakingQueues.set(bracket, queue);

        const char1 = await getCharacter(p1.characterId);
        const char2 = await getCharacter(p2.characterId);
        if (!char1 || !char2) {
          io.to(p1.socketId).emit('matchmaking:error', { message: 'Match failed' });
          io.to(p2.socketId).emit('matchmaking:error', { message: 'Match failed' });
          return;
        }

        const roomId = generateRoomId();
        const player1 = toBattleCharacter(
          String(char1.id),
          char1.name,
          char1.class as BattleCharacter['class'],
          char1.maxHp,
          true
        );
        const player2 = toBattleCharacter(
          String(char2.id),
          char2.name,
          char2.class as BattleCharacter['class'],
          char2.maxHp,
          false
        );

        const initialState: BattleState = {
          id: roomId,
          type: 'pvp',
          phase: 'challenge',
          player: player1,
          opponent: player2,
          activeTurn: 'player',
          currentChallenge: null,
          challengeShownAt: null,
          turnCount: 1,
          regionId: 'pvp-arena',
          isBoss: false,
        };

        const challenge = generateChallenge('theory', 'medium');

        const room: BattleRoom = {
          id: roomId,
          player1: { socketId: p1.socketId, characterId: p1.characterId },
          player2: { socketId: p2.socketId, characterId: p2.characterId },
          state: {
            ...initialState,
            currentChallenge: challenge,
            challengeShownAt: Date.now(),
          },
          currentChallenge: challenge,
        };
        battleRooms.set(roomId, room);
        socketToRoom.set(p1.socketId, roomId);
        socketToRoom.set(p2.socketId, roomId);

        const socket1 = io.sockets.sockets.get(p1.socketId);
        const socket2 = io.sockets.sockets.get(p2.socketId);
        if (socket1) socket1.leave(`matchmaking:${bracket}`);
        if (socket2) socket2.leave(`matchmaking:${bracket}`);

        const roomSockets = io.sockets.adapter.rooms.get(roomId);
        if (!roomSockets) {
          socket1?.join(roomId);
          socket2?.join(roomId);
        }

        const emitMatched = (sock: Socket | undefined, isPlayer1: boolean) => {
          if (!sock) return;
          sock.emit('matchmaking:matched', {
            battleRoomId: roomId,
            opponent: isPlayer1 ? player2 : player1,
            playerChar: isPlayer1 ? player1 : player2,
            characterId: isPlayer1 ? p1.characterId : p2.characterId,
            isPlayer1,
            challenge,
            shownAt: Date.now(),
          });
        };
        emitMatched(socket1, true);
        emitMatched(socket2, false);
      }
    });

    socket.on('matchmaking:leave', () => {
      const bracket = socketToBracket.get(socket.id);
      if (bracket !== undefined) {
        const queue = matchmakingQueues.get(bracket) ?? [];
        const idx = queue.findIndex((p) => p.socketId === socket.id);
        if (idx >= 0) {
          queue.splice(idx, 1);
          matchmakingQueues.set(bracket, queue);
        }
        socket.leave(`matchmaking:${bracket}`);
        socketToBracket.delete(socket.id);
      }
    });

    socket.on('battle:join', (payload: { battleRoomId: string }) => {
      const roomId = payload.battleRoomId;
      const room = battleRooms.get(roomId);
      if (!room) {
        socket.emit('battle:error', { message: 'Room not found' });
        return;
      }
      const isPlayer1 = room.player1.socketId === socket.id || room.player2.socketId === socket.id;
      if (!isPlayer1 && room.player2.socketId !== socket.id) {
        socket.emit('battle:error', { message: 'Not in this battle' });
        return;
      }
      socket.join(roomId);
      socketToRoom.set(socket.id, roomId);
    });

    socket.on('battle:answer', (payload: { battleRoomId: string; answer: ChallengeAnswer }) => {
      const roomId = payload.battleRoomId || socketToRoom.get(socket.id);
      const room = roomId ? battleRooms.get(roomId) : null;
      if (!room) return;

      const isPlayer1 = room.player1.socketId === socket.id;
      const activeIsPlayer1 = room.state.activeTurn === 'player';
      if (isPlayer1 !== activeIsPlayer1) {
        socket.emit('battle:error', { message: 'Not your turn' });
        return;
      }

      const answer = payload.answer;
      if (!room.state.currentChallenge || room.state.currentChallenge.id !== answer.challengeId) {
        socket.emit('battle:error', { message: 'Invalid challenge' });
        return;
      }

      try {
        const { result, nextState } = processAnswer(
          room.state,
          answer,
          validateAnswer
        );
        room.state = nextState;
        room.currentChallenge = null;

        const stateForP1 = nextState;
        const stateForP2: BattleState = {
          ...nextState,
          player: nextState.opponent,
          opponent: nextState.player,
          activeTurn: nextState.activeTurn === 'player' ? 'opponent' : 'player',
        };
        io.to(room.player1.socketId).emit('battle:result', { result, state: stateForP1 });
        io.to(room.player2.socketId).emit('battle:result', { result, state: stateForP2 });

        if (nextState.phase === 'victory' || nextState.phase === 'defeat') {
          const endedForP2: BattleState = {
          ...nextState,
          player: nextState.opponent,
          opponent: nextState.player,
          phase: nextState.phase === 'victory' ? 'defeat' : 'victory',
        };
        io.to(room.player1.socketId).emit('battle:ended', { state: nextState });
        io.to(room.player2.socketId).emit('battle:ended', { state: endedForP2 });
          battleRooms.delete(roomId);
          socketToRoom.delete(room.player1.socketId);
          socketToRoom.delete(room.player2.socketId);
          return;
        }

        const nextChallenge = generateChallenge('theory', 'medium');
        room.state = {
          ...nextState,
          phase: 'challenge',
          currentChallenge: nextChallenge,
          challengeShownAt: Date.now(),
        };
        room.currentChallenge = nextChallenge;
        const challengeState = room.state;
        const challengeStateP2: BattleState = {
          ...challengeState,
          player: challengeState.opponent,
          opponent: challengeState.player,
          activeTurn: challengeState.activeTurn === 'player' ? 'opponent' : 'player',
        };
        io.to(room.player1.socketId).emit('battle:challenge', {
          challenge: nextChallenge,
          shownAt: Date.now(),
          state: challengeState,
        });
        io.to(room.player2.socketId).emit('battle:challenge', {
          challenge: nextChallenge,
          shownAt: Date.now(),
          state: challengeStateP2,
        });
      } catch (err) {
        socket.emit('battle:error', { message: 'Invalid answer' });
      }
    });

    socket.on('disconnect', () => {
      const roomId = socketToRoom.get(socket.id);
      if (roomId) {
        const room = battleRooms.get(roomId);
        if (room) {
          io.to(roomId).emit('battle:opponent_left', {});
          battleRooms.delete(roomId);
          socketToRoom.delete(room.player1.socketId);
          socketToRoom.delete(room.player2.socketId);
        }
      }
      const bracket = socketToBracket.get(socket.id);
      if (bracket !== undefined) {
        const queue = matchmakingQueues.get(bracket) ?? [];
        const idx = queue.findIndex((p) => p.socketId === socket.id);
        if (idx >= 0) queue.splice(idx, 1);
        socketToBracket.delete(socket.id);
      }
    });
  });
}
