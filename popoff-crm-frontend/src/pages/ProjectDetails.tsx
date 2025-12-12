import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Card } from '../components/Card';
import { StatusBadge } from '../components/StatusBadge';
import { apiClient } from '../api/client';
import { useToast } from '../contexts/ToastContext';
import { Deployment, Environment, HealthOverview, Project, Server } from '../types';

export const ProjectDetails: React.FC = () => {
  const { projectId } = useParams<{ projectId: string }>();
  const [project, setProject] = useState<Project | null>(null);
  const [environments, setEnvironments] = useState<Environment[]>([]);
  const [deployments, setDeployments] = useState<Deployment[]>([]);
  const [healthOverview, setHealthOverview] = useState<HealthOverview[]>([]);
  const [deployingId, setDeployingId] = useState<string | null>(null);
  const [servers, setServers] = useState<Server[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [environmentForm, setEnvironmentForm] = useState({
    name: '',
    slug: '',
    serverId: '',
    isProduction: false,
    frontendUrl: '',
    apiUrl: '',
    dockerComposePath: '',
    dockerProjectName: '',
    gitBranch: '',
  });
  const { showToast } = useToast();

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
      apiClient.getServers().then(setServers);
      refreshDeployments();
      apiClient.getHealthOverview().then((overview) => {
        setHealthOverview(overview.filter((item) => item.projectId === projectId));
      });
    }
  }, [projectId, refreshDeployments]);

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
      showToast({ type: 'success', title: 'Deployment', message: 'Deployment triggered successfully.' });
      refreshDeployments();
    } catch (error) {
      showToast({
        type: 'error',
        title: 'Deployment',
        message: error instanceof Error ? error.message : 'Failed to trigger deployment.',
      });
    } finally {
      setDeployingId(null);
    }
  };

  const startEditEnvironment = (env?: Environment) => {
    setEditingId(env?.id ?? null);
    setEnvironmentForm({
      name: env?.name ?? '',
      slug: env?.slug ?? '',
      serverId: env?.serverId ?? servers[0]?.id ?? '',
      isProduction: env?.isProduction ?? false,
      frontendUrl: env?.frontendUrl ?? '',
      apiUrl: env?.apiUrl ?? '',
      dockerComposePath: env?.dockerComposePath ?? '',
      dockerProjectName: env?.dockerProjectName ?? '',
      gitBranch: env?.gitBranch ?? '',
    });
  };

  const saveEnvironment = async () => {
    if (!projectId || !environmentForm.serverId || !environmentForm.name || !environmentForm.slug) {
      showToast({ type: 'error', title: 'Environment', message: 'Name, slug, and server are required.' });
      return;
    }

    const payload: Partial<Environment> = {
      ...environmentForm,
      projectId,
    };

    try {
      let saved: Environment | null;
      if (editingId) {
        saved = await apiClient.updateEnvironment(editingId, payload);
        setEnvironments((prev) => prev.map((env) => (env.id === editingId && saved ? saved : env)));
      } else {
        saved = await apiClient.createEnvironment(payload);
        if (saved) {
          setEnvironments((prev) => [...prev, saved]);
        }
      }

      startEditEnvironment(undefined);
      showToast({
        type: 'success',
        title: 'Environment saved',
        message: 'Logical mapping stored. Credentials stay in configuration files.',
      });
    } catch (error) {
      showToast({ type: 'error', title: 'Environment', message: 'Unable to save environment right now.' });
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
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">Environments</h3>
          <span className="text-primary text-sm">{environments.length} total</span>
        </div>
        <div className="mb-4 rounded-lg border border-border/60 bg-card/60 p-4 space-y-3">
          <div className="text-sm text-primary">Define environments with logical server IDs only. Sensitive docker or API keys stay in appsettings.* files.</div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-xs text-primary block">Name</label>
              <input
                className="w-full rounded-lg border border-border/60 bg-card/40 px-3 py-2 text-sm text-text"
                value={environmentForm.name}
                onChange={(e) => setEnvironmentForm((prev) => ({ ...prev, name: e.target.value }))}
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs text-primary block">Slug</label>
              <input
                className="w-full rounded-lg border border-border/60 bg-card/40 px-3 py-2 text-sm text-text"
                value={environmentForm.slug}
                onChange={(e) => setEnvironmentForm((prev) => ({ ...prev, slug: e.target.value }))}
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs text-primary block">Server (logical)</label>
              <select
                className="w-full rounded-lg border border-border/60 bg-card/40 px-3 py-2 text-sm text-text"
                value={environmentForm.serverId}
                onChange={(e) => setEnvironmentForm((prev) => ({ ...prev, serverId: e.target.value }))}
              >
                <option value="">Select server</option>
                {servers.map((server) => (
                  <option key={server.id} value={server.id}>
                    {server.name} ({server.referenceKey})
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-1 flex items-center gap-2 pt-6">
              <input
                id="isProduction"
                type="checkbox"
                checked={environmentForm.isProduction}
                onChange={(e) => setEnvironmentForm((prev) => ({ ...prev, isProduction: e.target.checked }))}
              />
              <label htmlFor="isProduction" className="text-sm text-primary">Production environment</label>
            </div>
            <div className="space-y-1">
              <label className="text-xs text-primary block">Frontend URL</label>
              <input
                className="w-full rounded-lg border border-border/60 bg-card/40 px-3 py-2 text-sm text-text"
                value={environmentForm.frontendUrl}
                onChange={(e) => setEnvironmentForm((prev) => ({ ...prev, frontendUrl: e.target.value }))}
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs text-primary block">API URL</label>
              <input
                className="w-full rounded-lg border border-border/60 bg-card/40 px-3 py-2 text-sm text-text"
                value={environmentForm.apiUrl}
                onChange={(e) => setEnvironmentForm((prev) => ({ ...prev, apiUrl: e.target.value }))}
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs text-primary block">Docker compose path</label>
              <input
                className="w-full rounded-lg border border-border/60 bg-card/40 px-3 py-2 text-sm text-text"
                value={environmentForm.dockerComposePath}
                onChange={(e) => setEnvironmentForm((prev) => ({ ...prev, dockerComposePath: e.target.value }))}
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs text-primary block">Docker project name</label>
              <input
                className="w-full rounded-lg border border-border/60 bg-card/40 px-3 py-2 text-sm text-text"
                value={environmentForm.dockerProjectName}
                onChange={(e) => setEnvironmentForm((prev) => ({ ...prev, dockerProjectName: e.target.value }))}
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs text-primary block">Git branch</label>
              <input
                className="w-full rounded-lg border border-border/60 bg-card/40 px-3 py-2 text-sm text-text"
                value={environmentForm.gitBranch}
                onChange={(e) => setEnvironmentForm((prev) => ({ ...prev, gitBranch: e.target.value }))}
              />
            </div>
          </div>
          <div className="flex justify-end gap-2">
            {editingId && (
              <button
                onClick={() => startEditEnvironment(undefined)}
                className="rounded-lg border border-border/70 px-3 py-2 text-sm font-semibold text-text"
              >
                Cancel
              </button>
            )}
            <button
              onClick={saveEnvironment}
              className="rounded-lg bg-accent-2/20 border border-accent-2/40 text-accent-2 px-4 py-2 text-sm font-semibold hover:shadow-glow"
            >
              {editingId ? 'Save changes' : 'Add environment'}
            </button>
          </div>
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
                    <button className="hover:underline" onClick={() => startEditEnvironment(env)}>
                      Edit
                    </button>
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
        <div className="overflow-x-auto rounded-xl border border-border/70 bg-card/60">
          <table className="min-w-full text-sm">
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
