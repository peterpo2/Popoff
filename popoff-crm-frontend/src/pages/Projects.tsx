import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Card } from '../components/Card';
import { apiClient } from '../api/client';
import { Project } from '../types';

export const Projects: React.FC = () => {
  const [projects, setProjects] = useState<Project[]>([]);

  useEffect(() => {
    apiClient.getProjects().then(setProjects);
  }, []);

  return (
    <div className="space-y-6 pb-12">
      <Card>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">Projects</h3>
          <span className="text-primary text-sm">{projects.length} total</span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {projects.map((project) => (
            <Card key={project.id} className="border-border/70">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm text-primary">{project.code}</div>
                  <h4 className="text-xl font-semibold text-text">{project.name}</h4>
                  <p className="text-primary text-sm mt-1">{project.description}</p>
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
      </Card>
    </div>
  );
};
