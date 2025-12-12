import React, { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Card } from '../components/Card';
import { apiClient } from '../api/client';
import { useToast } from '../contexts/ToastContext';
import { Server } from '../types';

export const Servers: React.FC = () => {
  const [servers, setServers] = useState<Server[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { showToast } = useToast();

  const load = useCallback(async () => {
    try {
      setLoading(true);
      const data = await apiClient.getServers();
      setServers(data);
      setError('');
    } catch (err) {
      setError('Unable to load servers at the moment.');
      showToast({ type: 'error', title: 'Servers', message: 'Failed to fetch servers. Try again shortly.' });
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  useEffect(() => {
    load();
  }, [load]);

  return (
    <div className="space-y-6 pb-12">
      <Card>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">Servers</h3>
          <span className="text-primary text-sm">{servers.length} total</span>
        </div>
        {loading && <div className="text-primary">Loading servers...</div>}

        {error && !loading && (
          <div className="flex items-center justify-between rounded-lg border border-border/60 bg-card/60 px-4 py-3 text-sm text-primary">
            <span>{error}</span>
            <button
              onClick={load}
              className="rounded-lg border border-border/70 px-3 py-1 text-xs font-semibold text-text hover:bg-card"
            >
              Retry
            </button>
          </div>
        )}

        {!loading && !error && servers.length === 0 && (
          <div className="rounded-lg border border-border/60 bg-card/60 p-6 text-center text-primary">
            <p className="mb-2 font-semibold text-text">No servers available.</p>
            <p className="text-sm">Add a server via the API, then reload this page.</p>
            <button
              onClick={load}
              className="mt-4 rounded-lg border border-border/70 px-4 py-2 text-sm font-semibold text-text hover:bg-card"
            >
              Refresh
            </button>
          </div>
        )}

        {!loading && !error && servers.length > 0 && (
          <div className="space-y-3">
            {servers.map((server) => (
              <Card key={server.id} className="border-border/70">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-xl font-semibold text-text">{server.name}</h4>
                    <p className="text-primary text-sm">{server.description}</p>
                    <div className="text-sm text-primary">Type: {server.type}</div>
                    <div className="text-sm text-primary">Reference: {server.referenceKey}</div>
                  </div>
                  <Link to={`/servers/${server.id}`} className="text-accent-2 text-sm font-semibold hover:underline">
                    View server →
                  </Link>
                </div>
              </Card>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
};
