import React, { useEffect, useMemo, useState } from 'react';
import { Card } from '../components/Card';
import { StatusBadge } from '../components/StatusBadge';
import { apiClient } from '../api/client';
import { Deployment, EnvironmentWithProject, Project } from '../types';

export const Deployments: React.FC = () => {
  const [deployments, setDeployments] = useState<Deployment[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [environments, setEnvironments] = useState<EnvironmentWithProject[]>([]);
  const [selectedProject, setSelectedProject] = useState<string>('');
  const [selectedEnv, setSelectedEnv] = useState<string>('');
  const [selectedStatus, setSelectedStatus] = useState<string>('');

  useEffect(() => {
    apiClient.getDeployments().then(setDeployments);
    apiClient.getProjects().then(setProjects);
    apiClient.getEnvironmentMatrix().then((matrix) => setEnvironments(matrix));
  }, []);

  const filtered = useMemo(() => {
    return deployments.filter((d) => {
      const env = environments.find((e) => e.id === d.environmentId);
      if (selectedProject && env?.projectId !== selectedProject) return false;
      if (selectedEnv && env?.id !== selectedEnv) return false;
      if (selectedStatus && d.status !== selectedStatus) return false;
      return true;
    });
  }, [deployments, environments, selectedEnv, selectedProject, selectedStatus]);

  return (
    <div className="space-y-6 pb-12">
      <Card className="border-white/10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="text-xs text-primary">Project</label>
            <select
              value={selectedProject}
              onChange={(e) => {
                setSelectedProject(e.target.value);
                setSelectedEnv('');
              }}
              className="mt-1 w-full rounded-lg bg-body border border-white/10 px-3 py-2 text-sm"
            >
              <option value="">All projects</option>
              {projects.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-xs text-primary">Environment</label>
            <select
              value={selectedEnv}
              onChange={(e) => setSelectedEnv(e.target.value)}
              className="mt-1 w-full rounded-lg bg-body border border-white/10 px-3 py-2 text-sm"
            >
              <option value="">All environments</option>
              {environments
                .filter((env) => !selectedProject || env.projectId === selectedProject)
                .map((env) => (
                  <option key={env.id} value={env.id}>
                    {env.projectName} – {env.name}
                  </option>
                ))}
            </select>
          </div>
          <div>
            <label className="text-xs text-primary">Status</label>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="mt-1 w-full rounded-lg bg-body border border-white/10 px-3 py-2 text-sm"
            >
              <option value="">Any status</option>
              {['Pending', 'Running', 'Success', 'Failed'].map((status) => (
                <option key={status} value={status}>
                  {status}
                </option>
              ))}
            </select>
          </div>
          <div className="flex items-end">
            <button
              className="w-full rounded-lg bg-accent-2/20 border border-accent-2/50 text-accent-2 py-2 font-semibold hover:shadow-glow"
              onClick={() => {
                setSelectedEnv('');
                setSelectedProject('');
                setSelectedStatus('');
              }}
            >
              Clear filters
            </button>
          </div>
        </div>
      </Card>

      <Card>
        <div className="overflow-hidden rounded-xl border border-white/5">
          <table className="w-full text-sm">
            <thead className="bg-white/5 text-primary">
              <tr>
                <th className="text-left px-4 py-2">Project</th>
                <th className="text-left px-4 py-2">Environment</th>
                <th className="text-left px-4 py-2">Status</th>
                <th className="text-left px-4 py-2">Version</th>
                <th className="text-left px-4 py-2">Branch</th>
                <th className="text-left px-4 py-2">Started</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((d) => {
                const env = environments.find((e) => e.id === d.environmentId);
                return (
                  <tr key={d.id} className="border-t border-white/5 hover:bg-white/5">
                    <td className="px-4 py-3 text-text">{env?.projectName}</td>
                    <td className="px-4 py-3 text-primary">{env?.name}</td>
                    <td className="px-4 py-3"><StatusBadge status={d.status} /></td>
                    <td className="px-4 py-3 text-text">{d.version}</td>
                    <td className="px-4 py-3 text-primary">{d.branch}</td>
                    <td className="px-4 py-3 text-primary">{new Date(d.startedAt).toLocaleString()}</td>
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
