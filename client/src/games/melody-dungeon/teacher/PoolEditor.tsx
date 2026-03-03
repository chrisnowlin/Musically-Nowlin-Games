import React, { useState, useRef, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useLocation } from 'wouter';
import {
  getPool, updatePool, regenerateCode,
  addVocabEntry, updateVocabEntry, deleteVocabEntry,
  addCustomQuestion, updateCustomQuestion, deleteCustomQuestion,
  type PoolWithEntries, type VocabEntryApi, type CustomQuestionApi,
} from './api';

interface Props {
  poolId: number;
  onLogout?: () => void;
}

const CATEGORIES = ['dynamics', 'tempo', 'symbols', 'terms'] as const;
const TIERS = [1, 2, 3, 4, 5] as const;
const FORMATS = ['', 'standard', 'opposites', 'ordering'] as const;

const emptyVocab = { term: '', definition: '', symbol: '', tier: 1, category: 'dynamics', format: '' };
const emptyQuestion = { question: '', correctAnswer: '', wrongAnswer1: '', wrongAnswer2: '', wrongAnswer3: '', tier: 1 };

const PoolEditor: React.FC<Props> = ({ poolId, onLogout }) => {
  const [, setLocation] = useLocation();
  const queryClient = useQueryClient();

  // --- UI state ---
  const [activeTab, setActiveTab] = useState<'vocab' | 'custom'>('vocab');
  const [editingName, setEditingName] = useState(false);
  const [nameValue, setNameValue] = useState('');
  const [copiedCode, setCopiedCode] = useState(false);
  const nameInputRef = useRef<HTMLInputElement>(null);

  // Vocab editing state
  const [editingVocab, setEditingVocab] = useState<number | null>(null);
  const [editVocabForm, setEditVocabForm] = useState<Partial<VocabEntryApi>>({});
  const [newVocab, setNewVocab] = useState(emptyVocab);

  // Custom question editing state
  const [editingQuestion, setEditingQuestion] = useState<number | null>(null);
  const [editQuestionForm, setEditQuestionForm] = useState<Partial<CustomQuestionApi>>({});
  const [newQuestion, setNewQuestion] = useState(emptyQuestion);

  // --- Queries ---
  const { data: pool, isLoading, error } = useQuery({
    queryKey: ['pool', poolId],
    queryFn: () => getPool(poolId),
  });

  // Focus name input when entering edit mode
  useEffect(() => {
    if (editingName && nameInputRef.current) {
      nameInputRef.current.focus();
      nameInputRef.current.select();
    }
  }, [editingName]);

  // --- Pool mutations ---
  const updatePoolMut = useMutation({
    mutationFn: (updates: { name?: string; useDefaults?: boolean; isShared?: boolean }) =>
      updatePool(poolId, updates),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['pool', poolId] }),
  });

  const regenCodeMut = useMutation({
    mutationFn: () => regenerateCode(poolId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['pool', poolId] }),
  });

  // --- Vocab mutations ---
  const addVocabMut = useMutation({
    mutationFn: (entry: typeof newVocab) =>
      addVocabEntry(poolId, {
        term: entry.term,
        definition: entry.definition,
        symbol: entry.symbol || undefined,
        tier: entry.tier,
        category: entry.category,
        format: entry.format || undefined,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pool', poolId] });
      setNewVocab(emptyVocab);
    },
  });

  const updateVocabMut = useMutation({
    mutationFn: ({ entryId, updates }: { entryId: number; updates: Partial<VocabEntryApi> }) =>
      updateVocabEntry(poolId, entryId, {
        term: updates.term,
        definition: updates.definition,
        symbol: updates.symbol ?? null,
        tier: updates.tier,
        category: updates.category,
        format: updates.format ?? null,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pool', poolId] });
      setEditingVocab(null);
      setEditVocabForm({});
    },
  });

  const deleteVocabMut = useMutation({
    mutationFn: (entryId: number) => deleteVocabEntry(poolId, entryId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['pool', poolId] }),
  });

  // --- Custom question mutations ---
  const addQuestionMut = useMutation({
    mutationFn: (q: typeof newQuestion) => addCustomQuestion(poolId, q),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pool', poolId] });
      setNewQuestion(emptyQuestion);
    },
  });

  const updateQuestionMut = useMutation({
    mutationFn: ({ qId, updates }: { qId: number; updates: Partial<CustomQuestionApi> }) =>
      updateCustomQuestion(poolId, qId, {
        question: updates.question,
        correctAnswer: updates.correctAnswer,
        wrongAnswer1: updates.wrongAnswer1,
        wrongAnswer2: updates.wrongAnswer2,
        wrongAnswer3: updates.wrongAnswer3,
        tier: updates.tier,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pool', poolId] });
      setEditingQuestion(null);
      setEditQuestionForm({});
    },
  });

  const deleteQuestionMut = useMutation({
    mutationFn: (qId: number) => deleteCustomQuestion(poolId, qId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['pool', poolId] }),
  });

  // --- Handlers ---

  function handleNameSave() {
    const trimmed = nameValue.trim();
    if (trimmed && trimmed !== pool?.name) {
      updatePoolMut.mutate({ name: trimmed });
    }
    setEditingName(false);
  }

  function handleCopyCode() {
    if (!pool) return;
    navigator.clipboard.writeText(pool.gameCode).then(() => {
      setCopiedCode(true);
      setTimeout(() => setCopiedCode(false), 2000);
    });
  }

  function handleRegenCode() {
    if (!window.confirm('Regenerate game code? Students using the old code will need the new one.')) return;
    regenCodeMut.mutate();
  }

  function startEditVocab(entry: VocabEntryApi) {
    setEditingVocab(entry.id);
    setEditVocabForm({
      term: entry.term,
      definition: entry.definition,
      symbol: entry.symbol,
      tier: entry.tier,
      category: entry.category,
      format: entry.format,
    });
  }

  function handleSaveVocab() {
    if (editingVocab == null) return;
    updateVocabMut.mutate({ entryId: editingVocab, updates: editVocabForm });
  }

  function handleDeleteVocab(entry: VocabEntryApi) {
    if (!window.confirm(`Delete "${entry.term}"?`)) return;
    deleteVocabMut.mutate(entry.id);
  }

  function handleAddVocab(e: React.FormEvent) {
    e.preventDefault();
    if (!newVocab.term.trim() || !newVocab.definition.trim()) return;
    addVocabMut.mutate(newVocab);
  }

  function startEditQuestion(q: CustomQuestionApi) {
    setEditingQuestion(q.id);
    setEditQuestionForm({
      question: q.question,
      correctAnswer: q.correctAnswer,
      wrongAnswer1: q.wrongAnswer1,
      wrongAnswer2: q.wrongAnswer2,
      wrongAnswer3: q.wrongAnswer3,
      tier: q.tier,
    });
  }

  function handleSaveQuestion() {
    if (editingQuestion == null) return;
    updateQuestionMut.mutate({ qId: editingQuestion, updates: editQuestionForm });
  }

  function handleDeleteQuestion(q: CustomQuestionApi) {
    if (!window.confirm(`Delete question "${q.question.slice(0, 40)}..."?`)) return;
    deleteQuestionMut.mutate(q.id);
  }

  function handleAddQuestion(e: React.FormEvent) {
    e.preventDefault();
    if (!newQuestion.question.trim() || !newQuestion.correctAnswer.trim() ||
        !newQuestion.wrongAnswer1.trim() || !newQuestion.wrongAnswer2.trim() ||
        !newQuestion.wrongAnswer3.trim()) return;
    addQuestionMut.mutate(newQuestion);
  }

  // --- Shared input classes ---
  const inputClass = 'bg-slate-700 text-white rounded px-2 py-1 text-sm border border-slate-600 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent';
  const selectClass = `${inputClass} appearance-none`;

  // --- Loading / Error states ---

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 to-purple-950 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-purple-400 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (error || !pool) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 to-purple-950 p-6">
        <div className="max-w-5xl mx-auto">
          <button
            onClick={() => setLocation('/games/melody-dungeon/teacher')}
            className="text-purple-300 hover:text-purple-200 text-sm font-medium transition-colors mb-6"
          >
            &larr; Back to Dashboard
          </button>
          <div className="bg-red-900/30 border border-red-700 rounded-lg p-4 text-red-300 text-sm">
            {error ? 'Failed to load pool. Please try again.' : 'Pool not found.'}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-purple-950 p-6">
      <div className="max-w-5xl mx-auto">

        {/* ===== Header ===== */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <button
              onClick={() => setLocation('/games/melody-dungeon/teacher')}
              className="text-purple-300 hover:text-purple-200 text-sm font-medium transition-colors"
            >
              &larr; Back to Dashboard
            </button>
            {onLogout && (
              <button
                onClick={onLogout}
                className="text-slate-400 hover:text-red-400 text-sm font-medium transition-colors"
              >
                Sign out
              </button>
            )}
          </div>

          {/* Pool name (inline edit) */}
          <div className="flex items-center gap-3 mb-4">
            {editingName ? (
              <input
                ref={nameInputRef}
                type="text"
                value={nameValue}
                onChange={(e) => setNameValue(e.target.value)}
                onBlur={handleNameSave}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleNameSave();
                  if (e.key === 'Escape') setEditingName(false);
                }}
                className="text-2xl font-bold bg-slate-800 text-white border border-purple-500 rounded-lg px-3 py-1 focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            ) : (
              <h1
                className="text-2xl font-bold text-white cursor-pointer hover:text-purple-200 transition-colors"
                onClick={() => {
                  setNameValue(pool.name);
                  setEditingName(true);
                }}
                title="Click to edit pool name"
              >
                {pool.name}
              </h1>
            )}
            {updatePoolMut.isPending && (
              <span className="text-purple-400 text-sm">Saving...</span>
            )}
          </div>

          {/* Game code row */}
          <div className="flex flex-wrap items-center gap-3 mb-4">
            <span className="text-slate-400 text-sm">Game Code:</span>
            <div className="flex items-center gap-1.5 bg-slate-800 border border-slate-700 rounded-md px-3 py-1.5">
              <code className="text-purple-300 text-sm font-mono tracking-wider">{pool.gameCode}</code>
              <button
                onClick={handleCopyCode}
                className="text-slate-400 hover:text-white transition-colors ml-1"
                title="Copy game code"
              >
                {copiedCode ? (
                  <svg className="w-4 h-4 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                ) : (
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                )}
              </button>
            </div>
            <button
              onClick={handleRegenCode}
              disabled={regenCodeMut.isPending}
              className="text-slate-400 hover:text-purple-300 text-sm transition-colors disabled:opacity-50"
            >
              {regenCodeMut.isPending ? 'Regenerating...' : 'Regenerate'}
            </button>
          </div>

          {/* Toggles */}
          <div className="flex flex-wrap items-center gap-6">
            <label className="flex items-center gap-2 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={pool.useDefaults}
                onChange={(e) => updatePoolMut.mutate({ useDefaults: e.target.checked })}
                className="w-4 h-4 rounded border-slate-600 bg-slate-700 text-purple-500 focus:ring-purple-500 focus:ring-offset-0"
              />
              <span className="text-slate-300 text-sm">Include built-in questions</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={pool.isShared}
                onChange={(e) => updatePoolMut.mutate({ isShared: e.target.checked })}
                className="w-4 h-4 rounded border-slate-600 bg-slate-700 text-purple-500 focus:ring-purple-500 focus:ring-offset-0"
              />
              <span className="text-slate-300 text-sm">Share with community</span>
            </label>
          </div>
        </div>

        {/* ===== Tab Bar ===== */}
        <div className="flex border-b border-slate-700 mb-6">
          <button
            onClick={() => setActiveTab('vocab')}
            className={`px-5 py-2.5 text-sm font-medium transition-colors border-b-2 -mb-px ${
              activeTab === 'vocab'
                ? 'border-purple-500 text-purple-300'
                : 'border-transparent text-slate-400 hover:text-slate-300'
            }`}
          >
            Vocabulary
            {pool.vocabEntries.length > 0 && (
              <span className="ml-2 bg-slate-700 text-slate-300 text-xs px-1.5 py-0.5 rounded-full">
                {pool.vocabEntries.length}
              </span>
            )}
          </button>
          <button
            onClick={() => setActiveTab('custom')}
            className={`px-5 py-2.5 text-sm font-medium transition-colors border-b-2 -mb-px ${
              activeTab === 'custom'
                ? 'border-purple-500 text-purple-300'
                : 'border-transparent text-slate-400 hover:text-slate-300'
            }`}
          >
            Custom Questions (Wizard)
            {pool.customQuestions.length > 0 && (
              <span className="ml-2 bg-slate-700 text-slate-300 text-xs px-1.5 py-0.5 rounded-full">
                {pool.customQuestions.length}
              </span>
            )}
          </button>
        </div>

        {/* ===== Vocabulary Tab ===== */}
        {activeTab === 'vocab' && (
          <div>
            {/* Error banners */}
            {(addVocabMut.isError || updateVocabMut.isError || deleteVocabMut.isError) && (
              <div className="bg-red-900/30 border border-red-700 rounded-lg p-3 text-red-300 text-sm mb-4">
                An error occurred. Please try again.
              </div>
            )}

            {/* Table */}
            <div className="overflow-x-auto rounded-lg border border-slate-700">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-slate-800 text-slate-300 text-left">
                    <th className="px-3 py-2 font-medium">Term</th>
                    <th className="px-3 py-2 font-medium">Definition</th>
                    <th className="px-3 py-2 font-medium">Symbol</th>
                    <th className="px-3 py-2 font-medium">Tier</th>
                    <th className="px-3 py-2 font-medium">Category</th>
                    <th className="px-3 py-2 font-medium">Format</th>
                    <th className="px-3 py-2 font-medium text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {pool.vocabEntries.length === 0 && (
                    <tr>
                      <td colSpan={7} className="text-center py-8 text-slate-500">
                        No vocabulary entries yet. Add one below.
                      </td>
                    </tr>
                  )}
                  {pool.vocabEntries.map((entry) => (
                    <tr
                      key={entry.id}
                      className="border-t border-slate-700 bg-slate-800/50 hover:bg-slate-800"
                    >
                      {editingVocab === entry.id ? (
                        <>
                          <td className="px-3 py-2">
                            <input
                              type="text"
                              value={editVocabForm.term ?? ''}
                              onChange={(e) => setEditVocabForm((f) => ({ ...f, term: e.target.value }))}
                              className={`${inputClass} w-full`}
                            />
                          </td>
                          <td className="px-3 py-2">
                            <input
                              type="text"
                              value={editVocabForm.definition ?? ''}
                              onChange={(e) => setEditVocabForm((f) => ({ ...f, definition: e.target.value }))}
                              className={`${inputClass} w-full`}
                            />
                          </td>
                          <td className="px-3 py-2">
                            <input
                              type="text"
                              value={editVocabForm.symbol ?? ''}
                              onChange={(e) => setEditVocabForm((f) => ({ ...f, symbol: e.target.value || null }))}
                              className={`${inputClass} w-20`}
                            />
                          </td>
                          <td className="px-3 py-2">
                            <select
                              value={editVocabForm.tier ?? 1}
                              onChange={(e) => setEditVocabForm((f) => ({ ...f, tier: Number(e.target.value) }))}
                              className={`${selectClass} w-16`}
                            >
                              {TIERS.map((t) => <option key={t} value={t}>{t}</option>)}
                            </select>
                          </td>
                          <td className="px-3 py-2">
                            <select
                              value={editVocabForm.category ?? 'dynamics'}
                              onChange={(e) => setEditVocabForm((f) => ({ ...f, category: e.target.value }))}
                              className={selectClass}
                            >
                              {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
                            </select>
                          </td>
                          <td className="px-3 py-2">
                            <select
                              value={editVocabForm.format ?? ''}
                              onChange={(e) => setEditVocabForm((f) => ({ ...f, format: e.target.value || null }))}
                              className={selectClass}
                            >
                              {FORMATS.map((f) => <option key={f} value={f}>{f || '(none)'}</option>)}
                            </select>
                          </td>
                          <td className="px-3 py-2 text-right whitespace-nowrap">
                            <button
                              onClick={handleSaveVocab}
                              disabled={updateVocabMut.isPending}
                              className="bg-purple-600 hover:bg-purple-500 disabled:opacity-50 text-white px-2.5 py-1 rounded text-xs font-medium transition-colors mr-1"
                            >
                              {updateVocabMut.isPending ? 'Saving...' : 'Save'}
                            </button>
                            <button
                              onClick={() => { setEditingVocab(null); setEditVocabForm({}); }}
                              className="text-slate-400 hover:text-slate-300 px-2 py-1 text-xs transition-colors"
                            >
                              Cancel
                            </button>
                          </td>
                        </>
                      ) : (
                        <>
                          <td className="px-3 py-2 text-white font-medium">{entry.term}</td>
                          <td className="px-3 py-2 text-slate-300">{entry.definition}</td>
                          <td className="px-3 py-2 text-slate-400">{entry.symbol || '-'}</td>
                          <td className="px-3 py-2 text-slate-400">{entry.tier}</td>
                          <td className="px-3 py-2 text-slate-400 capitalize">{entry.category}</td>
                          <td className="px-3 py-2 text-slate-400">{entry.format || '-'}</td>
                          <td className="px-3 py-2 text-right whitespace-nowrap">
                            <button
                              onClick={() => startEditVocab(entry)}
                              className="text-purple-400 hover:text-purple-300 px-2 py-1 text-xs font-medium transition-colors mr-1"
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => handleDeleteVocab(entry)}
                              disabled={deleteVocabMut.isPending}
                              className="text-red-400 hover:text-red-300 px-2 py-1 text-xs font-medium transition-colors disabled:opacity-50"
                            >
                              Delete
                            </button>
                          </td>
                        </>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Add Vocab Form */}
            <form
              onSubmit={handleAddVocab}
              className="mt-4 bg-slate-800 border border-slate-700 rounded-lg p-4"
            >
              <h3 className="text-white text-sm font-semibold mb-3">Add Entry</h3>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                <div>
                  <label className="block text-slate-400 text-xs mb-1">Term *</label>
                  <input
                    type="text"
                    value={newVocab.term}
                    onChange={(e) => setNewVocab((v) => ({ ...v, term: e.target.value }))}
                    placeholder="e.g. forte"
                    className={`${inputClass} w-full`}
                  />
                </div>
                <div>
                  <label className="block text-slate-400 text-xs mb-1">Definition *</label>
                  <input
                    type="text"
                    value={newVocab.definition}
                    onChange={(e) => setNewVocab((v) => ({ ...v, definition: e.target.value }))}
                    placeholder="e.g. loud"
                    className={`${inputClass} w-full`}
                  />
                </div>
                <div>
                  <label className="block text-slate-400 text-xs mb-1">Symbol</label>
                  <input
                    type="text"
                    value={newVocab.symbol}
                    onChange={(e) => setNewVocab((v) => ({ ...v, symbol: e.target.value }))}
                    placeholder="e.g. f"
                    className={`${inputClass} w-full`}
                  />
                </div>
                <div>
                  <label className="block text-slate-400 text-xs mb-1">Tier</label>
                  <select
                    value={newVocab.tier}
                    onChange={(e) => setNewVocab((v) => ({ ...v, tier: Number(e.target.value) }))}
                    className={`${selectClass} w-full`}
                  >
                    {TIERS.map((t) => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-slate-400 text-xs mb-1">Category</label>
                  <select
                    value={newVocab.category}
                    onChange={(e) => setNewVocab((v) => ({ ...v, category: e.target.value }))}
                    className={`${selectClass} w-full`}
                  >
                    {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-slate-400 text-xs mb-1">Format</label>
                  <select
                    value={newVocab.format}
                    onChange={(e) => setNewVocab((v) => ({ ...v, format: e.target.value }))}
                    className={`${selectClass} w-full`}
                  >
                    {FORMATS.map((f) => <option key={f} value={f}>{f || '(none)'}</option>)}
                  </select>
                </div>
              </div>
              <div className="mt-3 flex items-center gap-3">
                <button
                  type="submit"
                  disabled={addVocabMut.isPending || !newVocab.term.trim() || !newVocab.definition.trim()}
                  className="bg-purple-600 hover:bg-purple-500 disabled:bg-purple-800 disabled:opacity-50 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                >
                  {addVocabMut.isPending ? 'Adding...' : 'Add Entry'}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* ===== Custom Questions Tab ===== */}
        {activeTab === 'custom' && (
          <div>
            {/* Error banners */}
            {(addQuestionMut.isError || updateQuestionMut.isError || deleteQuestionMut.isError) && (
              <div className="bg-red-900/30 border border-red-700 rounded-lg p-3 text-red-300 text-sm mb-4">
                An error occurred. Please try again.
              </div>
            )}

            {/* Table */}
            <div className="overflow-x-auto rounded-lg border border-slate-700">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-slate-800 text-slate-300 text-left">
                    <th className="px-3 py-2 font-medium">Question</th>
                    <th className="px-3 py-2 font-medium">Correct Answer</th>
                    <th className="px-3 py-2 font-medium">Wrong Answers</th>
                    <th className="px-3 py-2 font-medium">Tier</th>
                    <th className="px-3 py-2 font-medium text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {pool.customQuestions.length === 0 && (
                    <tr>
                      <td colSpan={5} className="text-center py-8 text-slate-500">
                        No custom questions yet. Add one below.
                      </td>
                    </tr>
                  )}
                  {pool.customQuestions.map((q) => (
                    <tr
                      key={q.id}
                      className="border-t border-slate-700 bg-slate-800/50 hover:bg-slate-800"
                    >
                      {editingQuestion === q.id ? (
                        <>
                          <td className="px-3 py-2">
                            <input
                              type="text"
                              value={editQuestionForm.question ?? ''}
                              onChange={(e) => setEditQuestionForm((f) => ({ ...f, question: e.target.value }))}
                              className={`${inputClass} w-full`}
                            />
                          </td>
                          <td className="px-3 py-2">
                            <input
                              type="text"
                              value={editQuestionForm.correctAnswer ?? ''}
                              onChange={(e) => setEditQuestionForm((f) => ({ ...f, correctAnswer: e.target.value }))}
                              className={`${inputClass} w-full`}
                            />
                          </td>
                          <td className="px-3 py-2">
                            <div className="flex flex-col gap-1">
                              <input
                                type="text"
                                value={editQuestionForm.wrongAnswer1 ?? ''}
                                onChange={(e) => setEditQuestionForm((f) => ({ ...f, wrongAnswer1: e.target.value }))}
                                placeholder="Wrong answer 1"
                                className={`${inputClass} w-full`}
                              />
                              <input
                                type="text"
                                value={editQuestionForm.wrongAnswer2 ?? ''}
                                onChange={(e) => setEditQuestionForm((f) => ({ ...f, wrongAnswer2: e.target.value }))}
                                placeholder="Wrong answer 2"
                                className={`${inputClass} w-full`}
                              />
                              <input
                                type="text"
                                value={editQuestionForm.wrongAnswer3 ?? ''}
                                onChange={(e) => setEditQuestionForm((f) => ({ ...f, wrongAnswer3: e.target.value }))}
                                placeholder="Wrong answer 3"
                                className={`${inputClass} w-full`}
                              />
                            </div>
                          </td>
                          <td className="px-3 py-2">
                            <select
                              value={editQuestionForm.tier ?? 1}
                              onChange={(e) => setEditQuestionForm((f) => ({ ...f, tier: Number(e.target.value) }))}
                              className={`${selectClass} w-16`}
                            >
                              {TIERS.map((t) => <option key={t} value={t}>{t}</option>)}
                            </select>
                          </td>
                          <td className="px-3 py-2 text-right whitespace-nowrap align-top">
                            <button
                              onClick={handleSaveQuestion}
                              disabled={updateQuestionMut.isPending}
                              className="bg-purple-600 hover:bg-purple-500 disabled:opacity-50 text-white px-2.5 py-1 rounded text-xs font-medium transition-colors mr-1"
                            >
                              {updateQuestionMut.isPending ? 'Saving...' : 'Save'}
                            </button>
                            <button
                              onClick={() => { setEditingQuestion(null); setEditQuestionForm({}); }}
                              className="text-slate-400 hover:text-slate-300 px-2 py-1 text-xs transition-colors"
                            >
                              Cancel
                            </button>
                          </td>
                        </>
                      ) : (
                        <>
                          <td className="px-3 py-2 text-white font-medium max-w-xs truncate">{q.question}</td>
                          <td className="px-3 py-2 text-green-400">{q.correctAnswer}</td>
                          <td className="px-3 py-2 text-slate-400">
                            {q.wrongAnswer1}, {q.wrongAnswer2}, {q.wrongAnswer3}
                          </td>
                          <td className="px-3 py-2 text-slate-400">{q.tier}</td>
                          <td className="px-3 py-2 text-right whitespace-nowrap">
                            <button
                              onClick={() => startEditQuestion(q)}
                              className="text-purple-400 hover:text-purple-300 px-2 py-1 text-xs font-medium transition-colors mr-1"
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => handleDeleteQuestion(q)}
                              disabled={deleteQuestionMut.isPending}
                              className="text-red-400 hover:text-red-300 px-2 py-1 text-xs font-medium transition-colors disabled:opacity-50"
                            >
                              Delete
                            </button>
                          </td>
                        </>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Add Question Form */}
            <form
              onSubmit={handleAddQuestion}
              className="mt-4 bg-slate-800 border border-slate-700 rounded-lg p-4"
            >
              <h3 className="text-white text-sm font-semibold mb-3">Add Question</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="md:col-span-2">
                  <label className="block text-slate-400 text-xs mb-1">Question *</label>
                  <input
                    type="text"
                    value={newQuestion.question}
                    onChange={(e) => setNewQuestion((q) => ({ ...q, question: e.target.value }))}
                    placeholder="e.g. What does pianissimo mean?"
                    className={`${inputClass} w-full`}
                  />
                </div>
                <div>
                  <label className="block text-slate-400 text-xs mb-1">Correct Answer *</label>
                  <input
                    type="text"
                    value={newQuestion.correctAnswer}
                    onChange={(e) => setNewQuestion((q) => ({ ...q, correctAnswer: e.target.value }))}
                    placeholder="e.g. very soft"
                    className={`${inputClass} w-full`}
                  />
                </div>
                <div>
                  <label className="block text-slate-400 text-xs mb-1">Wrong Answer 1 *</label>
                  <input
                    type="text"
                    value={newQuestion.wrongAnswer1}
                    onChange={(e) => setNewQuestion((q) => ({ ...q, wrongAnswer1: e.target.value }))}
                    placeholder="e.g. very loud"
                    className={`${inputClass} w-full`}
                  />
                </div>
                <div>
                  <label className="block text-slate-400 text-xs mb-1">Wrong Answer 2 *</label>
                  <input
                    type="text"
                    value={newQuestion.wrongAnswer2}
                    onChange={(e) => setNewQuestion((q) => ({ ...q, wrongAnswer2: e.target.value }))}
                    placeholder="e.g. medium volume"
                    className={`${inputClass} w-full`}
                  />
                </div>
                <div>
                  <label className="block text-slate-400 text-xs mb-1">Wrong Answer 3 *</label>
                  <input
                    type="text"
                    value={newQuestion.wrongAnswer3}
                    onChange={(e) => setNewQuestion((q) => ({ ...q, wrongAnswer3: e.target.value }))}
                    placeholder="e.g. gradually louder"
                    className={`${inputClass} w-full`}
                  />
                </div>
                <div>
                  <label className="block text-slate-400 text-xs mb-1">Tier</label>
                  <select
                    value={newQuestion.tier}
                    onChange={(e) => setNewQuestion((q) => ({ ...q, tier: Number(e.target.value) }))}
                    className={`${selectClass} w-full`}
                  >
                    {TIERS.map((t) => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
              </div>
              <div className="mt-3 flex items-center gap-3">
                <button
                  type="submit"
                  disabled={
                    addQuestionMut.isPending ||
                    !newQuestion.question.trim() ||
                    !newQuestion.correctAnswer.trim() ||
                    !newQuestion.wrongAnswer1.trim() ||
                    !newQuestion.wrongAnswer2.trim() ||
                    !newQuestion.wrongAnswer3.trim()
                  }
                  className="bg-purple-600 hover:bg-purple-500 disabled:bg-purple-800 disabled:opacity-50 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                >
                  {addQuestionMut.isPending ? 'Adding...' : 'Add Question'}
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};

export default PoolEditor;
