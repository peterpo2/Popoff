import './App.css';
import { Route, Routes } from 'react-router-dom';
import { MainLayout } from './layouts/MainLayout';
import { Dashboard } from './pages/Dashboard';
import { Projects } from './pages/Projects';
import { ProjectDetails } from './pages/ProjectDetails';
import { Servers } from './pages/Servers';
import { ServerDetails } from './pages/ServerDetails';
import { Deployments } from './pages/Deployments';
import { Health } from './pages/Health';
import { Logs } from './pages/Logs';
import { Settings } from './pages/Settings';
import { Login } from './pages/Login';
import { RequireAuth } from './components/RequireAuth';

function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route element={<RequireAuth />}>
        <Route path="/" element={<MainLayout />}>
          <Route index element={<Dashboard />} />
          <Route path="projects" element={<Projects />} />
          <Route path="projects/:projectId" element={<ProjectDetails />} />
          <Route path="servers" element={<Servers />} />
          <Route path="servers/:serverId" element={<ServerDetails />} />
          <Route path="deployments" element={<Deployments />} />
          <Route path="health" element={<Health />} />
          <Route path="logs" element={<Logs />} />
          <Route path="settings" element={<Settings />} />
        </Route>
      </Route>
    </Routes>
  );
}

export default App;
