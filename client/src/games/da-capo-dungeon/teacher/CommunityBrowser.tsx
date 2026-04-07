import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useLocation } from 'wouter';
import { listSharedPools, clonePool, type Pool } from './api';

interface Props {
  onLogout?: () => void;
}

const CommunityBrowser: React.FC<Props> = ({ onLogout }) => {
  const [, setLocation] = useLocation();
  const queryClient = useQueryClient();

  const [clonedId, setClonedId] = useState<number | null>(null);

  const { data: pools, isLoading, error } = useQuery({
    queryKey: ['shared-pools'],
    queryFn: listSharedPools,
  });

  const cloneMutation = useMutation({
    mutationFn: (id: number) => clonePool(id),
    onSuccess: (_data, id) => {
      queryClient.invalidateQueries({ queryKey: ['pools'] });
      setClonedId(id);
      setTimeout(() => setClonedId(null), 2500);
    },
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-purple-950 p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-2xl font-bold text-white">Community Pools</h1>
          <div className="flex items-center gap-4">
            <button
              onClick={() => setLocation('/games/da-capo-dungeon/teacher')}
              className="text-purple-300 hover:text-purple-200 text-sm font-medium transition-colors"
            >
              Back to Dashboard
            </button>
            {onLogout && (
              <button
                onClick={onLogout}
                className="text-slate-400 hover:text-red-400 text-sm font-medium transition-colors border-l border-slate-700 pl-4"
              >
                Sign out
              </button>
            )}
          </div>
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
            Failed to load shared pools. Please refresh the page.
          </div>
        )}

        {/* Empty state */}
        {pools && pools.length === 0 && (
          <div className="text-center py-20">
            <p className="text-slate-400 text-lg mb-2">No shared pools yet</p>
            <p className="text-slate-500 text-sm">
              When teachers share their pools, they will appear here for you to clone.
            </p>
          </div>
        )}

        {/* Clone error */}
        {cloneMutation.isError && (
          <div className="bg-red-900/30 border border-red-700 rounded-lg p-4 text-red-300 text-sm mb-6">
            Failed to clone pool. Please try again.
          </div>
        )}

        {/* Pool grid */}
        {pools && pools.length > 0 && (
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

                {/* Game code */}
                <div className="flex items-center gap-2">
                  <div className="bg-slate-900 rounded-md px-2.5 py-1">
                    <code className="text-purple-300 text-sm font-mono">{pool.gameCode}</code>
                  </div>
                </div>

                {/* Clone action */}
                <div className="mt-auto pt-2">
                  {clonedId === pool.id ? (
                    <div className="flex items-center justify-center gap-2 bg-green-900/30 border border-green-700 text-green-300 text-sm font-medium py-2 rounded-lg">
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                      Cloned to your pools!
                    </div>
                  ) : (
                    <button
                      onClick={() => cloneMutation.mutate(pool.id)}
                      disabled={cloneMutation.isPending}
                      className="w-full bg-purple-600 hover:bg-purple-500 disabled:bg-purple-800 disabled:opacity-50 text-white text-sm font-medium py-2 rounded-lg transition-colors"
                    >
                      {cloneMutation.isPending ? 'Cloning...' : 'Clone'}
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default CommunityBrowser;
