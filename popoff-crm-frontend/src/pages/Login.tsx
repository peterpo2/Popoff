import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';

export const Login: React.FC = () => {
  const navigate = useNavigate();
  const { login, token } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (token) {
      navigate('/', { replace: true });
    }
  }, [token, navigate]);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);
    setLoading(true);

    try {
      await login(email, password);
      navigate('/', { replace: true });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-body relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-background via-body to-body opacity-80" />
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="relative z-10 w-full max-w-md bg-card/80 backdrop-blur-lg rounded-2xl shadow-2xl p-8 border border-border/60"
      >
        <div className="flex flex-col items-center gap-2 mb-6">
          <div className="h-14 w-14 rounded-full bg-gradient-to-br from-primary to-accent-2 flex items-center justify-center text-body font-semibold text-xl">
            P
          </div>
          <h1 className="text-2xl font-semibold text-text">Welcome back</h1>
          <p className="text-primary">Sign in to continue to Popoff CRM</p>
        </div>

        <form className="space-y-4" onSubmit={handleSubmit}>
          <div className="space-y-2">
            <label className="text-sm text-text" htmlFor="email">
              Email
            </label>
            <input
              id="email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-xl bg-body/80 border border-border/70 px-4 py-3 text-text placeholder:text-primary focus:outline-none focus:ring-2 focus:ring-primary/80"
              placeholder="you@example.com"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm text-text" htmlFor="password">
              Password
            </label>
            <input
              id="password"
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-xl bg-body/80 border border-border/70 px-4 py-3 text-text placeholder:text-primary focus:outline-none focus:ring-2 focus:ring-primary/80"
              placeholder="••••••••"
            />
          </div>

          {error && <div className="text-red-400 text-sm bg-red-500/10 border border-red-500/40 rounded-lg px-3 py-2">{error}</div>}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl bg-gradient-to-r from-primary to-accent-2 text-body font-semibold shadow-lg shadow-primary/20 hover:shadow-primary/30 transition hover:translate-y-[-1px] disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {loading ? 'Signing in...' : 'Sign in'}
          </button>
        </form>
      </motion.div>
    </div>
  );
};
