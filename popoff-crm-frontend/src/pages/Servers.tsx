import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Card } from '../components/Card';
import { mockClient } from '../api/mockClient';
import { Server } from '../types';

export const Servers: React.FC = () => {
  const [servers, setServers] = useState<Server[]>([]);

  useEffect(() => {
    mockClient.getServers().then(setServers);
  }, []);

  return (
    <div className="space-y-6 pb-12">
      <Card>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">Servers</h3>
          <span className="text-primary text-sm">{servers.length} total</span>
        </div>
        <div className="space-y-3">
          {servers.map((server) => (
            <Card key={server.id} className="border-white/10">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-xl font-semibold text-text">{server.name}</h4>
                  <p className="text-primary text-sm">{server.description}</p>
                  <div className="text-sm text-primary">IP: {server.ipAddress}</div>
                </div>
                <Link to={`/servers/${server.id}`} className="text-accent-2 text-sm font-semibold hover:underline">
                  View server →
                </Link>
              </div>
            </Card>
          ))}
        </div>
      </Card>
    </div>
  );
};
