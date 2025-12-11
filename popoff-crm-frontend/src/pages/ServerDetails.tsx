import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Card } from '../components/Card';
import { mockClient } from '../api/mockClient';
import { EnvironmentWithProject, Server } from '../types';

export const ServerDetails: React.FC = () => {
  const { serverId } = useParams<{ serverId: string }>();
  const [server, setServer] = useState<Server | null>(null);
  const [environments, setEnvironments] = useState<EnvironmentWithProject[]>([]);

  useEffect(() => {
    if (serverId) {
      mockClient.getServer(serverId).then(setServer);
      mockClient.getEnvironmentMatrix().then((matrix) => {
        setEnvironments(matrix.filter((env) => env.serverId === serverId));
      });
    }
  }, [serverId]);

  if (!server) return <div className="text-primary">Loading server...</div>;

  return (
    <div className="space-y-6 pb-12">
      <Card>
        <h2 className="text-2xl font-semibold text-text">{server.name}</h2>
        <p className="text-primary">{server.description}</p>
        <div className="text-sm text-primary mt-2">IP: {server.ipAddress}</div>
        <div className="text-sm text-primary">Connection: {server.connectionType}</div>
      </Card>

      <Card>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">Hosted Environments</h3>
          <span className="text-primary text-sm">{environments.length} on this server</span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {environments.map((env) => (
            <Card key={env.id} className="border-white/10">
              <div className="text-sm text-primary">{env.projectName}</div>
              <h4 className="text-xl font-semibold text-text">{env.name}</h4>
              <p className="text-primary text-sm">URL: {env.frontendUrl}</p>
            </Card>
          ))}
        </div>
      </Card>
    </div>
  );
};
