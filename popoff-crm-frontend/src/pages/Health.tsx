import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Card } from '../components/Card';
import { StatusBadge } from '../components/StatusBadge';
import { apiClient } from '../api/client';
import { useToast } from '../contexts/ToastContext';
import { EnvironmentWithProject, HealthCheckResult, HealthOverview } from '../types';

export const Health: React.FC = () => {
  const [health, setHealth] = useState<HealthOverview[]>([]);
  const [envMatrix, setEnvMatrix] = useState<EnvironmentWithProject[]>([]);
  const [selectedEnvironment, setSelectedEnvironment] = useState('');
  const [environmentHistory, setEnvironmentHistory] = useState<HealthCheckResult[]>([]);
  const [isHistoryLoading, setIsHistoryLoading] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [historyError, setHistoryError] = useState('');
  const { showToast } = useToast();

  const loadOverview = useCallback(async () => {
    try {
      setLoading(true);
      const [overview, matrix] = await Promise.all([apiClient.getHealthOverview(), apiClient.getEnvironmentMatrix()]);
      setHealth(overview);
      setEnvMatrix(matrix);
      setError('');
    } catch (err) {
      setError('Unable to load health overview.');
      showToast({ type: 'error', title: 'Health', message: 'Failed to load current health status.' });
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  useEffect(() => {
    loadOverview();
  }, [loadOverview]);

  useEffect(() => {
    if (!selectedEnvironment && envMatrix.length > 0) {
      setSelectedEnvironment(envMatrix[0].id);
    }
  }, [envMatrix, selectedEnvironment]);

  const loadHistory = useCallback(
    async (environmentId: string) => {
      setIsHistoryLoading(true);
      setHistoryError('');
      try {
        const results = await apiClient.getHealthByEnvironment(environmentId);
        setEnvironmentHistory(results.sort((a, b) => b.checkedOn.localeCompare(a.checkedOn)));
      } catch (err) {
        setHistoryError('Failed to load health history.');
        showToast({ type: 'error', title: 'Health', message: 'Unable to load history for this environment.' });
      } finally {
        setIsHistoryLoading(false);
      }
    },
    [showToast],
  );

  useEffect(() => {
    if (!selectedEnvironment) return;
    loadHistory(selectedEnvironment);
  }, [loadHistory, selectedEnvironment]);

  const selectedEnvironmentMeta = useMemo(
    () => envMatrix.find((env) => env.id === selectedEnvironment),
    [envMatrix, selectedEnvironment]
  );

  return (
    <div className="space-y-6 pb-12">
      <Card>
        <h3 className="text-lg font-semibold mb-4">Current Health</h3>
        {loading && <div className="text-primary">Loading health overview...</div>}

        {error && !loading && (
          <div className="flex items-center justify-between rounded-lg border border-border/60 bg-card/60 px-4 py-3 text-sm text-primary">
            <span>{error}</span>
            <button
              onClick={loadOverview}
              className="rounded-lg border border-border/70 px-3 py-1 text-xs font-semibold text-text hover:bg-card"
            >
              Retry
            </button>
          </div>
        )}

        {!loading && !error && health.length === 0 && (
          <div className="rounded-lg border border-border/60 bg-card/60 p-6 text-center text-primary">
            <p className="mb-2 font-semibold text-text">No health data yet.</p>
            <p className="text-sm">Checks will appear here once environments report in.</p>
            <button
              onClick={loadOverview}
              className="mt-4 rounded-lg border border-border/70 px-4 py-2 text-sm font-semibold text-text hover:bg-card"
            >
              Refresh
            </button>
          </div>
        )}

        {!loading && !error && health.length > 0 && (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {health.map((item) => {
              const env = envMatrix.find((e) => e.id === item.environmentId);
              return (
                <Card key={`${item.environmentId}-${item.checkedOn}`} className="border-border/70">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-sm text-primary">{env?.projectName ?? item.projectName}</div>
                      <h4 className="text-xl font-semibold text-text">{env?.name ?? item.environmentName}</h4>
                      <p className="text-primary text-sm">Latency: {item.responseTimeMs ?? '—'} ms</p>
                      <p className="text-primary text-xs">Last check: {new Date(item.checkedOn).toLocaleTimeString()}</p>
                    </div>
                    <StatusBadge status={item.status} />
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </Card>

      <Card>
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between mb-2">
          <div>
            <h3 className="text-lg font-semibold">Environment health history</h3>
            <p className="text-primary text-sm">
              Review recent health checks for a specific environment.
            </p>
          </div>
          <div className="w-full md:w-72">
            <label className="text-xs text-primary">Environment</label>
            <select
              value={selectedEnvironment}
              onChange={(e) => setSelectedEnvironment(e.target.value)}
              className="mt-1 w-full rounded-lg bg-card/70 border border-border/70 px-3 py-2 text-sm text-text focus:outline-none focus:ring-2 focus:ring-primary/40"
            >
              {envMatrix.map((env) => (
                <option key={env.id} value={env.id}>
                  {env.projectName} – {env.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="text-left text-primary">
              <tr>
                <th className="pb-2 font-semibold">Status</th>
                <th className="pb-2 font-semibold">Checked on</th>
                <th className="pb-2 font-semibold">Response time</th>
                <th className="pb-2 font-semibold">Message</th>
              </tr>
            </thead>
            <tbody>
              {historyError && (
                <tr>
                  <td colSpan={4} className="py-4 text-center text-primary">
                    <div className="flex flex-col items-center gap-3">
                      <span>{historyError}</span>
                      <button
                        onClick={() => selectedEnvironment && loadHistory(selectedEnvironment)}
                        className="rounded-lg border border-border/70 px-3 py-1 text-xs font-semibold text-text hover:bg-card"
                      >
                        Retry
                      </button>
                    </div>
                  </td>
                </tr>
              )}

              {isHistoryLoading && (
                <tr>
                  <td colSpan={4} className="py-4 text-center text-primary">
                    Loading health checks...
                  </td>
                </tr>
              )}

              {!isHistoryLoading && environmentHistory.length === 0 && (
                <tr>
                  <td colSpan={4} className="py-4 text-center text-primary">
                    No health checks available for this environment.
                  </td>
                </tr>
              )}

              {!isHistoryLoading &&
                environmentHistory.map((item) => (
                  <tr key={item.id} className="border-t border-border/60">
                    <td className="py-3 pr-4">
                      <StatusBadge status={item.status} />
                    </td>
                    <td className="py-3 pr-4 text-text">
                      {new Date(item.checkedOn).toLocaleString()}
                    </td>
                    <td className="py-3 pr-4 text-text">
                      {item.responseTimeMs ? `${item.responseTimeMs} ms` : '—'}
                    </td>
                    <td className="py-3 text-primary">{item.message ?? 'No message'}</td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>

        {selectedEnvironmentMeta && (
          <div className="mt-4 text-xs text-primary">
            Viewing history for <span className="text-text font-semibold">{selectedEnvironmentMeta.name}</span> in{' '}
            <span className="text-text font-semibold">{selectedEnvironmentMeta.projectName}</span>.
          </div>
        )}
      </Card>
    </div>
  );
};
