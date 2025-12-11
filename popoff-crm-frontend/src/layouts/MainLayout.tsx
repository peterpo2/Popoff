import React, { useEffect, useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { Sidebar } from '../components/Sidebar';
import { Header } from '../components/Header';
import { BackgroundEffects } from '../components/BackgroundEffects';
import { CursorGlow } from '../components/CursorGlow';
import { apiClient } from '../api/client';
import { User } from '../types';

export const MainLayout: React.FC = () => {
  const location = useLocation();
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    apiClient.getUser().then(setUser);
  }, []);

  const titles: Record<string, string> = {
    '/': 'Dashboard',
    '/projects': 'Projects',
    '/servers': 'Servers',
    '/deployments': 'Deployments',
    '/health': 'Health',
    '/logs': 'Logs',
    '/settings': 'Settings',
  };

  const title = Object.entries(titles).find(([path]) => location.pathname === path)?.[1] ?? 'Popoff CRM';

  return (
    <div className="app-shell relative flex bg-body text-text">
      <BackgroundEffects />
      <CursorGlow />
      <Sidebar />
      <main className="relative z-10 flex-1 px-8">
        <div className="max-w-6xl mx-auto">
          <Header title={title} subtitle="Your code realm is humming along." user={user ?? undefined} />
          <AnimatePresence mode="wait">
            <motion.div
              key={location.pathname}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.25 }}
            >
              <Outlet />
            </motion.div>
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
};
