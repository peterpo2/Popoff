import React, { useEffect, useState } from 'react';
import { Card } from '../components/Card';
import { StatCard } from '../components/StatCard';
import { StatusBadge } from '../components/StatusBadge';
import { apiClient } from '../api/client';
import { DashboardStats } from '../types';
import { Deployment, EnvironmentWithProject } from '../types';

export const Dashboard: React.FC = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [deployments, setDeployments] = useState<Deployment[]>([]);
  const [envMatrix, setEnvMatrix] = useState<EnvironmentWithProject[]>([]);

  useEffect(() => {
    apiClient.getDashboardStats().then(setStats);
    apiClient.getDeployments().then((data) => setDeployments(data.slice(0, 6)));
    apiClient.getEnvironmentMatrix().then(setEnvMatrix);
  }, []);

  return (
    <div className="space-y-8 pb-12">
      <Card className="bg-gradient-to-r from-card/80 to-card/40 border-border/70">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <p className="text-primary">Welcome back, Popoff</p>
            <h2 className="text-2xl font-semibold text-text">Your code realm is humming along.</h2>
          </div>
          {stats && (
            <div className="flex gap-3">
              <div className="rounded-full bg-card/70 border border-border/70 px-4 py-2 text-sm text-primary">Projects: {stats.totalProjects}</div>
              <div className="rounded-full bg-card/70 border border-border/70 px-4 py-2 text-sm text-primary">Envs: {stats.totalEnvironments}</div>
              <div className="rounded-full bg-card/70 border border-border/70 px-4 py-2 text-sm text-primary">Servers: {stats.totalServers}</div>
            </div>
          )}
        </div>
      </Card>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Total Projects" value={stats?.totalProjects ?? '...'} />
        <StatCard label="Total Environments" value={stats?.totalEnvironments ?? '...'} />
        <StatCard label="Total Servers" value={stats?.totalServers ?? '...'} />
        <StatCard label="Active Deployments" value={stats?.activeDeployments ?? '...'} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">Environment Health</h3>
            <span className="text-primary text-sm">live snapshot</span>
          </div>
          <div className="space-y-3">
            {envMatrix.map((env) => (
              <div
                key={env.id}
                className="flex items-center justify-between rounded-xl border border-border/60 bg-card/70 px-4 py-3"
              >
                <div>
                  <div className="font-semibold text-text">{env.projectName} – {env.name}</div>
                  <div className="text-primary text-xs">Last check: a moment ago</div>
                </div>
                <StatusBadge status={env.isProduction ? 'Healthy' : 'Degraded'} />
              </div>
            ))}
          </div>
        </Card>

        <Card>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">Recent Deployments</h3>
            <span className="text-primary text-sm">last updates</span>
          </div>
          <div className="overflow-hidden rounded-xl border border-border/70 bg-card/60">
            <table className="w-full text-sm">
              <thead className="bg-card/80 text-primary">
                <tr>
                  <th className="text-left px-4 py-2">Project</th>
                  <th className="text-left px-4 py-2">Environment</th>
                  <th className="text-left px-4 py-2">Version</th>
                  <th className="text-left px-4 py-2">Status</th>
                </tr>
              </thead>
              <tbody>
                {deployments.map((d) => {
                  const env = envMatrix.find((e) => e.id === d.environmentId);
                  return (
                    <tr key={d.id} className="border-t border-border/60 hover:bg-card/60">
                      <td className="px-4 py-3 text-text">{env?.projectName ?? 'Unknown'}</td>
                      <td className="px-4 py-3 text-primary">{env?.name}</td>
                      <td className="px-4 py-3 text-text">{d.version}</td>
                      <td className="px-4 py-3"><StatusBadge status={d.status} /></td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </div>
  );
};
