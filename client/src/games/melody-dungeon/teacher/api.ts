const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3001';

function creds() {
  return 'include' as RequestInit['credentials'];
}

// --- Auth ---

export async function logout(): Promise<void> {
  await fetch(`${API_BASE}/api/auth/logout`, { method: 'POST', credentials: creds() });
}

export async function authMe(): Promise<{ id: number; username: string; role?: string; displayName?: string } | null> {
  const res = await fetch(`${API_BASE}/api/auth/me`, { credentials: creds() });
  if (res.status === 401) return null;
  if (!res.ok) return null;
  return res.json();
}

export function getGoogleAuthUrl(): string {
  return `${API_BASE}/api/auth/google`;
}

export async function isGoogleAuthEnabled(): Promise<boolean> {
  try {
    const res = await fetch(`${API_BASE}/api/auth/google/status`);
    if (!res.ok) return false;
    const data = await res.json();
    return data.enabled === true;
  } catch {
    return false;
  }
}

// --- Types ---

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

// --- Pools ---

export async function listPools(): Promise<Pool[]> {
  const res = await fetch(`${API_BASE}/api/pools`, { credentials: creds() });
  if (!res.ok) throw new Error('Failed to list pools');
  return res.json();
}

export async function createPool(name: string): Promise<Pool> {
  const res = await fetch(`${API_BASE}/api/pools`, {
    method: 'POST', credentials: creds(),
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name }),
  });
  if (!res.ok) throw new Error('Failed to create pool');
  return res.json();
}

export async function getPool(id: number): Promise<PoolWithEntries> {
  const res = await fetch(`${API_BASE}/api/pools/${id}`, { credentials: creds() });
  if (!res.ok) throw new Error('Failed to get pool');
  return res.json();
}

export async function updatePool(id: number, updates: { name?: string; useDefaults?: boolean; isShared?: boolean }): Promise<Pool> {
  const res = await fetch(`${API_BASE}/api/pools/${id}`, {
    method: 'PUT', credentials: creds(),
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(updates),
  });
  if (!res.ok) throw new Error('Failed to update pool');
  return res.json();
}

export async function deletePool(id: number): Promise<void> {
  const res = await fetch(`${API_BASE}/api/pools/${id}`, { method: 'DELETE', credentials: creds() });
  if (!res.ok) throw new Error('Failed to delete pool');
}

export async function regenerateCode(id: number): Promise<Pool> {
  const res = await fetch(`${API_BASE}/api/pools/${id}/regenerate-code`, { method: 'POST', credentials: creds() });
  if (!res.ok) throw new Error('Failed to regenerate code');
  return res.json();
}

// --- Vocab ---

export async function addVocabEntry(poolId: number, entry: {
  term: string; definition: string; symbol?: string; tier: number; category: string; format?: string;
}): Promise<VocabEntryApi> {
  const res = await fetch(`${API_BASE}/api/pools/${poolId}/vocab`, {
    method: 'POST', credentials: creds(),
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
    method: 'PUT', credentials: creds(),
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(updates),
  });
  if (!res.ok) throw new Error('Failed to update vocab entry');
  return res.json();
}

export async function deleteVocabEntry(poolId: number, entryId: number): Promise<void> {
  const res = await fetch(`${API_BASE}/api/pools/${poolId}/vocab/${entryId}`, { method: 'DELETE', credentials: creds() });
  if (!res.ok) throw new Error('Failed to delete vocab entry');
}

// --- Custom Questions ---

export async function addCustomQuestion(poolId: number, q: {
  question: string; correctAnswer: string; wrongAnswer1: string; wrongAnswer2: string; wrongAnswer3: string; tier: number;
}): Promise<CustomQuestionApi> {
  const res = await fetch(`${API_BASE}/api/pools/${poolId}/custom`, {
    method: 'POST', credentials: creds(),
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
    method: 'PUT', credentials: creds(),
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(updates),
  });
  if (!res.ok) throw new Error('Failed to update custom question');
  return res.json();
}

export async function deleteCustomQuestion(poolId: number, qId: number): Promise<void> {
  const res = await fetch(`${API_BASE}/api/pools/${poolId}/custom/${qId}`, { method: 'DELETE', credentials: creds() });
  if (!res.ok) throw new Error('Failed to delete custom question');
}

// --- Community ---

export async function listSharedPools(): Promise<Pool[]> {
  const res = await fetch(`${API_BASE}/api/pools/shared`, { credentials: creds() });
  if (!res.ok) throw new Error('Failed to list shared pools');
  return res.json();
}

export async function clonePool(id: number): Promise<Pool> {
  const res = await fetch(`${API_BASE}/api/pools/${id}/clone`, { method: 'POST', credentials: creds() });
  if (!res.ok) throw new Error('Failed to clone pool');
  return res.json();
}
