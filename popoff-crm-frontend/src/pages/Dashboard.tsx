import React, { useCallback, useEffect, useState } from 'react';
import { Card } from '../components/Card';
import { StatCard } from '../components/StatCard';
import { StatusBadge } from '../components/StatusBadge';
import { apiClient } from '../api/client';
import { DashboardStats, Deployment, EnvironmentWithProject, HealthOverview } from '../types';

export const Dashboard: React.FC = () => {
  const [stats, setStats] = useState<{ data: DashboardStats | null; loading: boolean; error: string | null }>(
    { data: null, loading: true, error: null }
  );
  const [deployments, setDeployments] = useState<{ data: Deployment[]; loading: boolean; error: string | null }>(
    { data: [], loading: true, error: null }
  );
  const [health, setHealth] = useState<{ data: HealthOverview[]; loading: boolean; error: string | null }>(
    { data: [], loading: true, error: null }
  );
  const [envMatrix, setEnvMatrix] = useState<EnvironmentWithProject[]>([]);

  const loadCoreData = useCallback(async () => {
    setStats((prev) => ({ ...prev, loading: true, error: null }));
    setDeployments((prev) => ({ ...prev, loading: true, error: null }));

    try {
      const [projects, servers, environments, deploymentList] = await Promise.all([
        apiClient.getProjects(),
        apiClient.getServers(),
        apiClient.getEnvironmentMatrix(),
        apiClient.getDeployments(),
      ]);

      setEnvMatrix(environments);
      setDeployments({ data: deploymentList.slice(0, 6), loading: false, error: null });
      setStats({
        data: {
          totalProjects: projects.length,
          totalEnvironments: environments.length,
          totalServers: servers.length,
          activeDeployments: deploymentList.filter((deployment) => deployment.status === 'Running').length,
        },
        loading: false,
        error: null,
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unable to load dashboard data.';
      setStats({ data: null, loading: false, error: message });
      setDeployments({ data: [], loading: false, error: message });
    }
  }, []);

  const loadHealth = useCallback(async () => {
    setHealth((prev) => ({ ...prev, loading: true, error: null }));
    try {
      const data = await apiClient.getHealthOverview();
      setHealth({ data, loading: false, error: null });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unable to load health overview.';
      setHealth({ data: [], loading: false, error: message });
    }
  }, []);

  useEffect(() => {
    loadCoreData();
    loadHealth();
  }, [loadCoreData, loadHealth]);

  const formatDate = (value: string | null | undefined) => (value ? new Date(value).toLocaleString() : '—');

  return (
    <div className="space-y-8 pb-12">
      <Card className="bg-gradient-to-r from-card/80 to-card/40 border-border/70">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <p className="text-primary">Welcome back, Popoff</p>
            <h2 className="text-2xl font-semibold text-text">Your code realm is humming along.</h2>
          </div>
          <div className="flex gap-3">
            {stats.loading ? (
              <div className="flex gap-3">
                {[1, 2, 3].map((key) => (
                  <div
                    key={key}
                    className="rounded-full bg-card/70 border border-border/70 px-6 py-2 text-sm text-primary animate-pulse"
                  >
                    &nbsp;
                  </div>
                ))}
              </div>
            ) : stats.data ? (
              <>
                <div className="rounded-full bg-card/70 border border-border/70 px-4 py-2 text-sm text-primary">
                  Projects: {stats.data.totalProjects}
                </div>
                <div className="rounded-full bg-card/70 border border-border/70 px-4 py-2 text-sm text-primary">
                  Envs: {stats.data.totalEnvironments}
                </div>
                <div className="rounded-full bg-card/70 border border-border/70 px-4 py-2 text-sm text-primary">
                  Servers: {stats.data.totalServers}
                </div>
              </>
            ) : null}
          </div>
        </div>
      </Card>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.loading &&
          Array.from({ length: 4 }).map((_, index) => (
            <div
              key={index}
              className="glass-panel card-glow rounded-2xl border border-border/70 p-5 shadow-soft animate-pulse"
            >
              <div className="h-4 w-24 bg-card rounded mb-3" />
              <div className="h-8 w-16 bg-card rounded" />
            </div>
          ))}

        {!stats.loading && stats.error && (
          <div className="col-span-full rounded-2xl border border-red-500/40 bg-red-500/10 p-4 text-red-200">
            <div className="flex items-center justify-between">
              <span>{stats.error}</span>
              <button
                onClick={loadCoreData}
                className="rounded-full bg-red-500/20 px-3 py-1 text-sm text-red-100 border border-red-500/40"
              >
                Retry
              </button>
            </div>
          </div>
        )}

        {!stats.loading && !stats.error && stats.data && (
          <>
            <StatCard label="Total Projects" value={stats.data.totalProjects} />
            <StatCard label="Total Environments" value={stats.data.totalEnvironments} />
            <StatCard label="Total Servers" value={stats.data.totalServers} />
            <StatCard label="Active Deployments" value={stats.data.activeDeployments} />
          </>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">Environment Health</h3>
            <span className="text-primary text-sm">live snapshot</span>
          </div>
          {health.loading ? (
            <div className="space-y-3">
              {Array.from({ length: 4 }).map((_, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between rounded-xl border border-border/60 bg-card/70 px-4 py-3 animate-pulse"
                >
                  <div className="space-y-2 w-full">
                    <div className="h-4 bg-card rounded w-1/3" />
                    <div className="h-3 bg-card rounded w-1/4" />
                  </div>
                </div>
              ))}
            </div>
          ) : health.error ? (
            <div className="rounded-xl border border-red-500/40 bg-red-500/10 px-4 py-3 text-red-100 flex items-center justify-between">
              <span>{health.error}</span>
              <button
                onClick={loadHealth}
                className="rounded-full bg-red-500/20 px-3 py-1 text-sm text-red-100 border border-red-500/40"
              >
                Retry
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {health.data.map((item) => (
                <div
                  key={item.environmentId}
                  className="flex items-center justify-between rounded-xl border border-border/60 bg-card/70 px-4 py-3"
                >
                  <div>
                    <div className="font-semibold text-text">{item.projectName} – {item.environmentName}</div>
                    <div className="text-primary text-xs">
                      Last check: {formatDate(item.checkedOn)}
                      {item.responseTimeMs ? ` • ${item.responseTimeMs}ms response` : ''}
                    </div>
                  </div>
                  <StatusBadge status={item.status} />
                </div>
              ))}
            </div>
          )}
        </Card>

        <Card>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">Recent Deployments</h3>
            <span className="text-primary text-sm">last updates</span>
          </div>
          {deployments.loading ? (
            <div className="space-y-2">
              {Array.from({ length: 4 }).map((_, index) => (
                <div key={index} className="rounded-xl border border-border/60 bg-card/70 px-4 py-3 animate-pulse">
                  <div className="grid grid-cols-5 gap-2">
                    <div className="h-4 bg-card rounded" />
                    <div className="h-4 bg-card rounded" />
                    <div className="h-4 bg-card rounded" />
                    <div className="h-4 bg-card rounded" />
                    <div className="h-4 bg-card rounded" />
                  </div>
                </div>
              ))}
            </div>
          ) : deployments.error ? (
            <div className="rounded-xl border border-red-500/40 bg-red-500/10 px-4 py-3 text-red-100 flex items-center justify-between">
              <span>{deployments.error}</span>
              <button
                onClick={loadCoreData}
                className="rounded-full bg-red-500/20 px-3 py-1 text-sm text-red-100 border border-red-500/40"
              >
                Retry
              </button>
            </div>
          ) : (
            <div className="overflow-hidden rounded-xl border border-border/70 bg-card/60">
              <table className="w-full text-sm">
                <thead className="bg-card/80 text-primary">
                  <tr>
                    <th className="text-left px-4 py-2">Project</th>
                    <th className="text-left px-4 py-2">Environment</th>
                    <th className="text-left px-4 py-2">Status</th>
                    <th className="text-left px-4 py-2">Started</th>
                    <th className="text-left px-4 py-2">Finished</th>
                  </tr>
                </thead>
                <tbody>
                  {deployments.data.map((d) => {
                    const env = envMatrix.find((e) => e.id === d.environmentId);
                    return (
                      <tr key={d.id} className="border-t border-border/60 hover:bg-card/60">
                        <td className="px-4 py-3 text-text">{env?.projectName ?? 'Unknown'}</td>
                        <td className="px-4 py-3 text-primary">{env?.name ?? '—'}</td>
                        <td className="px-4 py-3"><StatusBadge status={d.status} /></td>
                        <td className="px-4 py-3 text-text">{formatDate(d.startedAt)}</td>
                        <td className="px-4 py-3 text-text">{formatDate(d.finishedAt)}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
};
