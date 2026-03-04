import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useLocation } from 'wouter';
import { listPools, createPool, deletePool, type Pool } from './api';

interface Props {
  user: { id: number; role?: string; displayName?: string } | null;
  onLogout: () => void;
}

const SYSTEM_POOL_ID = 2;

const TeacherDashboard: React.FC<Props> = ({ user, onLogout }) => {
  const [, setLocation] = useLocation();
  const queryClient = useQueryClient();

  const [showCreate, setShowCreate] = useState(false);
  const [newName, setNewName] = useState('');
  const [copiedId, setCopiedId] = useState<number | null>(null);

  const { data: pools, isLoading, error } = useQuery({
    queryKey: ['pools'],
    queryFn: listPools,
  });

  const isAdmin = user?.role === 'admin';

  const createMutation = useMutation({
    mutationFn: (name: string) => createPool(name),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pools'] });
      setNewName('');
      setShowCreate(false);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => deletePool(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['pools'] }),
  });

  function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = newName.trim();
    if (!trimmed) return;
    createMutation.mutate(trimmed);
  }

  function handleDelete(pool: Pool) {
    if (!window.confirm(`Delete "${pool.name}"? This cannot be undone.`)) return;
    deleteMutation.mutate(pool.id);
  }

  function handleCopy(pool: Pool) {
    navigator.clipboard.writeText(pool.gameCode).then(() => {
      setCopiedId(pool.id);
      setTimeout(() => setCopiedId(null), 2000);
    });
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-purple-950 p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-2xl font-bold text-white">My Question Pools</h1>
          <div className="flex items-center gap-4">
            <button
              onClick={() => setLocation('/games/da-capo-dungeon/teacher/community')}
              className="text-purple-300 hover:text-purple-200 text-sm font-medium transition-colors"
            >
              Browse Community
            </button>
            <div className="flex items-center gap-3 border-l border-slate-700 pl-4">
              {user?.displayName && (
                <span className="text-slate-400 text-sm">{user.displayName}</span>
              )}
              <button
                onClick={onLogout}
                className="text-slate-400 hover:text-red-400 text-sm font-medium transition-colors"
              >
                Sign out
              </button>
            </div>
          </div>
        </div>

        {/* Create Pool */}
        <div className="mb-8">
          {showCreate ? (
            <form onSubmit={handleCreate} className="flex items-center gap-3">
              <input
                type="text"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                placeholder="Pool name..."
                autoFocus
                className="flex-1 bg-slate-800 border border-slate-600 text-white rounded-lg px-4 py-2 text-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
              <button
                type="submit"
                disabled={createMutation.isPending || !newName.trim()}
                className="bg-purple-600 hover:bg-purple-500 disabled:bg-purple-800 disabled:opacity-50 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
              >
                {createMutation.isPending ? 'Creating...' : 'Create'}
              </button>
              <button
                type="button"
                onClick={() => { setShowCreate(false); setNewName(''); }}
                className="text-slate-400 hover:text-slate-300 px-3 py-2 text-sm transition-colors"
              >
                Cancel
              </button>
            </form>
          ) : (
            <button
              onClick={() => setShowCreate(true)}
              className="bg-purple-600 hover:bg-purple-500 text-white px-5 py-2.5 rounded-lg text-sm font-medium transition-colors"
            >
              + New Pool
            </button>
          )}
          {createMutation.isError && (
            <p className="text-red-400 text-sm mt-2">
              Failed to create pool. Please try again.
            </p>
          )}
        </div>

        {/* Loading */}
        {isLoading && (
          <div className="flex items-center justify-center py-20">
            <div className="w-8 h-8 border-4 border-purple-400 border-t-transparent rounded-full animate-spin" />
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="bg-red-900/30 border border-red-700 rounded-lg p-4 text-red-300 text-sm">
            Failed to load pools. Please refresh the page.
          </div>
        )}

        {/* Empty state */}
        {pools && pools.length === 0 && !isAdmin && (
          <div className="text-center py-20">
            <p className="text-slate-400 text-lg mb-2">No pools yet</p>
            <p className="text-slate-500 text-sm">
              Create your first question pool to get started.
            </p>
          </div>
        )}

        {/* Admin system pool */}
        {isAdmin && (
          <div className="mb-8">
            <h3 className="text-purple-300 text-sm font-medium mb-3">System Defaults</h3>
            <div className="bg-slate-800 border border-purple-500/50 rounded-xl p-5 flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <h2 className="text-white font-bold text-lg">Default Music Vocabulary</h2>
                <span className="bg-purple-600/30 border border-purple-500 text-purple-300 text-xs px-2 py-1 rounded-full">
                  System Pool
                </span>
              </div>
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1.5 bg-slate-900 rounded-md px-2.5 py-1">
                  <code className="text-purple-300 text-sm font-mono">SYSTEM_DEFAULTS</code>
                </div>
              </div>
              <button
                onClick={() => setLocation(`/games/da-capo-dungeon/teacher/pool/${SYSTEM_POOL_ID}`)}
                className="bg-purple-600 hover:bg-purple-500 text-white text-sm font-medium py-2 rounded-lg transition-colors"
              >
                Manage System Pool
              </button>
            </div>
          </div>
        )}

        {/* Pool grid */}
        {pools && pools.length > 0 && (
          <div>
            <h3 className="text-slate-400 text-sm font-medium mb-3">Your Pools</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {pools.map((pool) => (
                <div
                  key={pool.id}
                  className="bg-slate-800 border border-slate-700 rounded-xl p-5 flex flex-col gap-3"
                >
                  {/* Pool name */}
                  <h2 className="text-white font-bold text-lg truncate" title={pool.name}>
                    {pool.name}
                  </h2>

                  {/* Game code + shared badge */}
                  <div className="flex items-center gap-2 flex-wrap">
                    <div className="flex items-center gap-1.5 bg-slate-900 rounded-md px-2.5 py-1">
                      <code className="text-purple-300 text-sm font-mono">{pool.gameCode}</code>
                      <button
                        onClick={() => handleCopy(pool)}
                        className="text-slate-400 hover:text-white transition-colors ml-1"
                        title="Copy game code"
                      >
                        {copiedId === pool.id ? (
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
                    {pool.isShared && (
                      <span className="bg-purple-900/50 text-purple-300 text-xs font-medium px-2 py-0.5 rounded-full border border-purple-700">
                        Shared
                      </span>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 mt-auto pt-2">
                    <button
                      onClick={() => setLocation(`/games/da-capo-dungeon/teacher/pool/${pool.id}`)}
                      className="flex-1 bg-slate-700 hover:bg-slate-600 text-white text-sm font-medium py-2 rounded-lg transition-colors"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(pool)}
                      disabled={deleteMutation.isPending}
                      className="bg-slate-700 hover:bg-red-700 text-slate-300 hover:text-white text-sm font-medium py-2 px-3 rounded-lg transition-colors"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TeacherDashboard;
