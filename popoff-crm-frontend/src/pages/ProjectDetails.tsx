import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Card } from '../components/Card';
import { StatusBadge } from '../components/StatusBadge';
import { apiClient } from '../api/client';
import { Deployment, Environment, HealthOverview, Project } from '../types';

export const ProjectDetails: React.FC = () => {
  const { projectId } = useParams<{ projectId: string }>();
  const [project, setProject] = useState<Project | null>(null);
  const [environments, setEnvironments] = useState<Environment[]>([]);
  const [deployments, setDeployments] = useState<Deployment[]>([]);
  const [healthOverview, setHealthOverview] = useState<HealthOverview[]>([]);
  const [deployingId, setDeployingId] = useState<string | null>(null);
  const [toast, setToast] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const refreshDeployments = useCallback(() => {
    if (projectId) {
      apiClient
        .getDeployments({ projectId })
        .then((data) => setDeployments([...data].sort((a, b) => b.startedAt.localeCompare(a.startedAt))));
    }
  }, [projectId]);

  useEffect(() => {
    if (projectId) {
      apiClient.getProject(projectId).then(setProject);
      apiClient.getEnvironmentsByProject(projectId).then(setEnvironments);
      refreshDeployments();
      apiClient.getHealthOverview().then((overview) => {
        setHealthOverview(overview.filter((item) => item.projectId === projectId));
      });
    }
  }, [projectId, refreshDeployments]);

  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 4000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  const latestDeploymentByEnv = useMemo(() => {
    const map: Record<string, Deployment | undefined> = {};
    deployments.forEach((deployment) => {
      const existing = map[deployment.environmentId];
      if (!existing || deployment.startedAt.localeCompare(existing.startedAt) > 0) {
        map[deployment.environmentId] = deployment;
      }
    });
    return map;
  }, [deployments]);

  const healthByEnv = useMemo(() => {
    const map: Record<string, HealthOverview> = {};
    healthOverview.forEach((item) => {
      map[item.environmentId] = item;
    });
    return map;
  }, [healthOverview]);

  const handleDeploy = async (environmentId: string) => {
    try {
      setDeployingId(environmentId);
      await apiClient.deployEnvironment(environmentId);
      setToast({ type: 'success', message: 'Deployment triggered successfully.' });
      refreshDeployments();
    } catch (error) {
      setToast({ type: 'error', message: error instanceof Error ? error.message : 'Failed to trigger deployment.' });
    } finally {
      setDeployingId(null);
    }
  };

  if (!project) {
    return <div className="text-primary">Loading project...</div>;
  }

  return (
    <div className="space-y-6 pb-12">
      <Card className="border-border/70">
        <div className="flex flex-col gap-2">
          <div className="text-sm text-primary">{project.code}</div>
          <h2 className="text-2xl font-semibold text-text">{project.name}</h2>
          <p className="text-primary">{project.description}</p>
          {project.repositoryUrl && (
            <a
              href={project.repositoryUrl}
              target="_blank"
              rel="noreferrer"
              className="text-accent-2 text-sm hover:underline"
            >
              {project.repositoryUrl}
            </a>
          )}
        </div>
      </Card>

      <Card>
        {toast && (
          <div
            className={`mb-4 rounded-lg border px-4 py-3 text-sm ${
              toast.type === 'success' ? 'border-accent-2/50 text-accent-2' : 'border-red-500/50 text-red-300'
            }`}
          >
            {toast.message}
          </div>
        )}
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">Environments</h3>
          <span className="text-primary text-sm">{environments.length} total</span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {environments.map((env) => (
            <Card key={env.id} id={`env-${env.id}`} className="border-border/70">
              <div className="flex items-start justify-between gap-4">
                <div className="space-y-1">
                  <div className="text-sm text-primary uppercase">{env.slug}</div>
                  <h4 className="text-xl font-semibold text-text">{env.name}</h4>
                  <p className="text-primary text-sm">Server: {env.serverName ?? env.serverId}</p>
                  <p className="text-primary text-sm">Branch: {env.gitBranch}</p>
                  <div className="text-xs text-primary mt-1">Frontend: {env.frontendUrl ?? '—'}</div>
                  <div className="text-xs text-primary">API: {env.apiUrl ?? '—'}</div>
                  {latestDeploymentByEnv[env.id] && (
                    <div className="text-xs text-primary">
                      Last deployment: {new Date(latestDeploymentByEnv[env.id]!.startedAt).toLocaleString()} (
                      {latestDeploymentByEnv[env.id]!.status})
                    </div>
                  )}
                </div>
                <div className="flex flex-col gap-2 items-end">
                  <StatusBadge status={healthByEnv[env.id]?.status ?? 'Healthy'} />
                  <div className="flex gap-2 text-xs text-accent-2">
                    <a className="hover:underline" href={`#env-${env.id}`}>
                      View environment
                    </a>
                    <Link className="hover:underline" to="/logs">
                      View logs
                    </Link>
                  </div>
                  <button
                    onClick={() => handleDeploy(env.id)}
                    disabled={deployingId === env.id}
                    className="mt-2 rounded-lg bg-accent-2/20 border border-accent-2/40 text-accent-2 px-3 py-2 text-sm font-semibold hover:shadow-glow disabled:opacity-60"
                  >
                    {deployingId === env.id ? 'Deploying...' : 'Deploy'}
                  </button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </Card>

      <Card>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">Recent Deployments</h3>
        </div>
        <div className="overflow-hidden rounded-xl border border-border/70 bg-card/60">
          <table className="w-full text-sm">
            <thead className="bg-card/80 text-primary">
              <tr>
                <th className="text-left px-4 py-2">Environment</th>
                <th className="text-left px-4 py-2">Status</th>
                <th className="text-left px-4 py-2">Version</th>
                <th className="text-left px-4 py-2">Branch</th>
                <th className="text-left px-4 py-2">Started</th>
                <th className="text-left px-4 py-2">Finished</th>
                <th className="text-left px-4 py-2">Triggered By</th>
              </tr>
            </thead>
            <tbody>
              {deployments.map((d) => {
                const env = environments.find((e) => e.id === d.environmentId);
                return (
                  <tr key={d.id} className="border-t border-border/60 hover:bg-card/60">
                    <td className="px-4 py-3 text-text">{env?.name}</td>
                    <td className="px-4 py-3"><StatusBadge status={d.status} /></td>
                    <td className="px-4 py-3 text-primary">{d.version}</td>
                    <td className="px-4 py-3 text-primary">{d.branch}</td>
                    <td className="px-4 py-3 text-primary">{new Date(d.startedAt).toLocaleString()}</td>
                    <td className="px-4 py-3 text-primary">{d.finishedAt ? new Date(d.finishedAt).toLocaleString() : '—'}</td>
                    <td className="px-4 py-3 text-primary">{d.triggeredBy ?? '—'}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
};
