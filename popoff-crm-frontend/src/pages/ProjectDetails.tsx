import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Card } from '../components/Card';
import { StatusBadge } from '../components/StatusBadge';
import { mockClient } from '../api/mockClient';
import { Deployment, Environment, Project } from '../types';

export const ProjectDetails: React.FC = () => {
  const { projectId } = useParams<{ projectId: string }>();
  const [project, setProject] = useState<Project | null>(null);
  const [environments, setEnvironments] = useState<Environment[]>([]);
  const [deployments, setDeployments] = useState<Deployment[]>([]);

  useEffect(() => {
    if (projectId) {
      mockClient.getProject(projectId).then(setProject);
      mockClient.getEnvironmentsByProject(projectId).then(setEnvironments);
      mockClient.getDeployments({ projectId }).then(setDeployments);
    }
  }, [projectId]);

  if (!project) {
    return <div className="text-primary">Loading project...</div>;
  }

  return (
    <div className="space-y-6 pb-12">
      <Card className="border-white/10">
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
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {environments.map((env) => (
            <Card key={env.id} className="border-white/10">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm text-primary uppercase">{env.slug}</div>
                  <h4 className="text-xl font-semibold text-text">{env.name}</h4>
                  <p className="text-primary text-sm">Server: {env.serverId}</p>
                  <p className="text-primary text-sm">Branch: {env.gitBranch}</p>
                  <div className="text-xs text-primary mt-1">{env.frontendUrl}</div>
                  <div className="text-xs text-primary">{env.apiUrl}</div>
                </div>
                <div className="flex flex-col gap-2 items-end">
                  <StatusBadge status={env.isProduction ? 'Healthy' : 'Degraded'} />
                  <div className="flex gap-2 text-xs text-accent-2">
                    <button className="hover:underline">Quick deploy</button>
                    <Link className="hover:underline" to="/logs">
                      View logs
                    </Link>
                  </div>
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
        <div className="overflow-hidden rounded-xl border border-white/5">
          <table className="w-full text-sm">
            <thead className="bg-white/5 text-primary">
              <tr>
                <th className="text-left px-4 py-2">Environment</th>
                <th className="text-left px-4 py-2">Version</th>
                <th className="text-left px-4 py-2">Status</th>
                <th className="text-left px-4 py-2">Started</th>
              </tr>
            </thead>
            <tbody>
              {deployments.map((d) => {
                const env = environments.find((e) => e.id === d.environmentId);
                return (
                  <tr key={d.id} className="border-t border-white/5 hover:bg-white/5">
                    <td className="px-4 py-3 text-text">{env?.name}</td>
                    <td className="px-4 py-3 text-primary">{d.version}</td>
                    <td className="px-4 py-3"><StatusBadge status={d.status} /></td>
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
