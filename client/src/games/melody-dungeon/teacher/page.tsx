import React, { useEffect, useState } from 'react';
import { Switch, Route } from 'wouter';
import { QueryClientProvider, QueryClient } from '@tanstack/react-query';
import { authMe } from './api';
import TeacherLoginPage from './TeacherLoginPage';
import TeacherDashboard from './TeacherDashboard';
import PoolEditor from './PoolEditor';
import CommunityBrowser from './CommunityBrowser';

const teacherQueryClient = new QueryClient();

const TeacherPage: React.FC = () => {
  const [user, setUser] = useState<{ id: number; role?: string; displayName?: string } | null>(null);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    authMe().then((u) => {
      setUser(u);
      setChecking(false);
    }).catch(() => {
      setChecking(false);
    });
  }, []);

  if (checking) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <p className="text-slate-400">Loading...</p>
      </div>
    );
  }

  if (!user || user.role !== 'teacher') {
    return <TeacherLoginPage />;
  }

  return (
    <QueryClientProvider client={teacherQueryClient}>
      <Switch>
        <Route path="/games/melody-dungeon/teacher/pool/:id">
          {(params) => <PoolEditor poolId={parseInt(params.id, 10)} />}
        </Route>
        <Route path="/games/melody-dungeon/teacher/community" component={CommunityBrowser} />
        <Route path="/games/melody-dungeon/teacher" component={TeacherDashboard} />
      </Switch>
    </QueryClientProvider>
  );
};

export default TeacherPage;
