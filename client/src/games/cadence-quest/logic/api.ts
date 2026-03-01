const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3001';

function getCredentials() {
  return 'include' as RequestInit['credentials'];
}

export async function authGuest(): Promise<{ id: number; username: string }> {
  const res = await fetch(`${API_BASE}/api/auth/guest`, {
    method: 'POST',
    credentials: getCredentials(),
  });
  if (!res.ok) throw new Error('Guest auth failed');
  return res.json();
}

export async function authRegister(username: string, password: string): Promise<{ id: number; username: string }> {
  const res = await fetch(`${API_BASE}/api/auth/register`, {
    method: 'POST',
    credentials: getCredentials(),
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password }),
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error || 'Register failed');
  }
  return res.json();
}

export async function authLogin(username: string, password: string): Promise<{ id: number; username: string }> {
  const res = await fetch(`${API_BASE}/api/auth/login`, {
    method: 'POST',
    credentials: getCredentials(),
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password }),
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error || 'Login failed');
  }
  return res.json();
}

export async function authLogout(): Promise<void> {
  await fetch(`${API_BASE}/api/auth/logout`, {
    method: 'POST',
    credentials: getCredentials(),
  });
}

export async function authMe(): Promise<{ id: number; username: string } | null> {
  const res = await fetch(`${API_BASE}/api/auth/me`, { credentials: getCredentials() });
  if (res.status === 401) return null;
  if (!res.ok) return null;
  return res.json();
}

export interface CharacterApi {
  id: string;
  userId?: number;
  name: string;
  class: string;
  stats: {
    level: number;
    xp: number;
    hp: number;
    maxHp: number;
    skillPoints: number;
    skillTree: Record<string, number[]>;
  };
  regionProgress: Record<string, number>;
  equippedInstrument: string | null;
  equippedSpells: string[];
  ownedInstruments: string[];
  ownedSpells: string[];
}

export async function charactersList(): Promise<CharacterApi[]> {
  const res = await fetch(`${API_BASE}/api/characters`, { credentials: getCredentials() });
  if (res.status === 401) return [];
  if (!res.ok) throw new Error('Failed to fetch characters');
  return res.json();
}

export async function characterCreate(name: string, charClass: string): Promise<CharacterApi> {
  const res = await fetch(`${API_BASE}/api/characters`, {
    method: 'POST',
    credentials: getCredentials(),
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, class: charClass }),
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error || 'Create failed');
  }
  return res.json();
}

export async function characterGet(id: string): Promise<CharacterApi | null> {
  const res = await fetch(`${API_BASE}/api/characters/${id}`, { credentials: getCredentials() });
  if (res.status === 404) return null;
  if (!res.ok) throw new Error('Failed to fetch character');
  return res.json();
}

export async function characterUpdate(id: string, updates: Partial<{
  level: number;
  xp: number;
  hp: number;
  maxHp: number;
  skillPoints: number;
  regionProgress: Record<string, number>;
  equippedInstrument: string | null;
  equippedSpells: string[];
  ownedInstruments: string[];
  ownedSpells: string[];
  skillTree: Record<string, number[]>;
}>): Promise<CharacterApi> {
  const res = await fetch(`${API_BASE}/api/characters/${id}`, {
    method: 'PATCH',
    credentials: getCredentials(),
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(updates),
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error || 'Update failed');
  }
  return res.json();
}

export async function battleRecord(payload: {
  player1Id: number;
  player2Id?: number;
  winnerId?: number;
  battleType: 'pve' | 'pvp';
  durationMs?: number;
  turnCount?: number;
}): Promise<void> {
  const res = await fetch(`${API_BASE}/api/battles`, {
    method: 'POST',
    credentials: getCredentials(),
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error('Failed to record battle');
}
