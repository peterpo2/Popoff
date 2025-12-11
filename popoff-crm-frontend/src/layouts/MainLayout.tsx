import React, { useEffect, useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { Sidebar } from '../components/Sidebar';
import { Header } from '../components/Header';
import { BackgroundEffects } from '../components/BackgroundEffects';
import { CursorGlow } from '../components/CursorGlow';
import { useAuth } from '../contexts/AuthContext';
import { useUISettings } from '../contexts/UISettingsContext';

export const MainLayout: React.FC = () => {
  const location = useLocation();
  const { user, logout } = useAuth();
  const { ambientEnabled, cursorTrailEnabled } = useUISettings();
  const [isSidebarOpen, setSidebarOpen] = useState(false);

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

  useEffect(() => {
    setSidebarOpen(false);
  }, [location.pathname]);

  return (
    <div className="app-shell relative flex bg-body text-text">
      {ambientEnabled && <BackgroundEffects />}
      {cursorTrailEnabled && <CursorGlow />}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 z-20 bg-black/50 backdrop-blur-sm md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
      <Sidebar isOpen={isSidebarOpen} onClose={() => setSidebarOpen(false)} />
      <main className="relative z-10 flex-1 px-4 md:px-8">
        <div className="mx-auto max-w-6xl">
          <Header
            title={title}
            subtitle="Your code realm is humming along."
            user={user ?? undefined}
            onLogout={logout}
            onMenuToggle={() => setSidebarOpen(true)}
          />
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
