import React, { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Card } from '../components/Card';
import { apiClient } from '../api/client';
import { useToast } from '../contexts/ToastContext';
import { EnvironmentWithProject, Project } from '../types';

export const Projects: React.FC = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [environments, setEnvironments] = useState<EnvironmentWithProject[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { showToast } = useToast();

  const load = useCallback(async () => {
    try {
      setLoading(true);
      const [projectsData, envMatrix] = await Promise.all([apiClient.getProjects(), apiClient.getEnvironmentMatrix()]);
      setProjects(projectsData);
      setEnvironments(envMatrix);
      setError('');
    } catch (err) {
      setError('Unable to load projects right now.');
      showToast({ type: 'error', title: 'Projects', message: 'Failed to fetch projects. Please try again.' });
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  useEffect(() => {
    load();
  }, [load]);

  const environmentCounts = environments.reduce<Record<string, number>>((acc, env) => {
    acc[env.projectId] = (acc[env.projectId] ?? 0) + 1;
    return acc;
  }, {});

  return (
    <div className="space-y-6 pb-12">
      <Card>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">Projects</h3>
          <span className="text-primary text-sm">{projects.length} total</span>
        </div>
        {loading && <div className="text-primary">Loading projects...</div>}

        {error && !loading && (
          <div className="flex items-center justify-between rounded-lg border border-border/60 bg-card/60 px-4 py-3 text-sm text-primary">
            <span>{error}</span>
            <div className="flex gap-2">
              <button
                onClick={load}
                className="rounded-lg border border-border/70 px-3 py-1 text-xs font-semibold text-text hover:bg-card"
              >
                Retry
              </button>
            </div>
          </div>
        )}

        {!loading && !error && projects.length === 0 && (
          <div className="rounded-lg border border-border/60 bg-card/60 p-6 text-center text-primary">
            <p className="mb-3 font-semibold text-text">No projects yet.</p>
            <p className="text-sm">Start by adding a project in the API, then refresh to see it here.</p>
            <button
              onClick={load}
              className="mt-4 rounded-lg border border-border/70 px-4 py-2 text-sm font-semibold text-text hover:bg-card"
            >
              Refresh
            </button>
          </div>
        )}

        {!loading && !error && projects.length > 0 && (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {projects.map((project) => (
              <Card key={project.id} className="border-border/70">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-sm text-primary">{project.code}</div>
                    <h4 className="text-xl font-semibold text-text">{project.name}</h4>
                    <p className="text-primary text-sm mt-1">{project.description}</p>
                    <div className="mt-3 text-xs text-primary space-y-1">
                      <div>Environments: {environmentCounts[project.id] ?? 0}</div>
                      <div>
                        Created: {project.createdOn ? new Date(project.createdOn).toLocaleDateString() : '—'}
                      </div>
                    </div>
                  </div>
                  <Link
                    to={`/projects/${project.id}`}
                    className="text-accent-2 text-sm font-semibold hover:underline"
                  >
                    View project →
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
