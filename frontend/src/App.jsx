import React from 'react';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import WorkflowList from './pages/WorkflowList';
import WorkflowEditor from './pages/WorkflowEditor';
import RuleEditor from './pages/RuleEditor';
import WorkflowExecution from './pages/WorkflowExecution';
import ExecutionLogs from './pages/ExecutionLogs';
import ExecutionHistory from './pages/ExecutionHistory';
import './styles/global.css';

// Route labels for the topbar
const PAGE_LABELS = {
  '/':            'Workflows',
  '/executions':  'Execution History',
  '/editor':      'Workflow Editor',
  '/rules':       'Rule Manager',
  '/execute':     'Run Workflow',
  '/logs':        'Execution Logs',
};

function TopBar() {
  const location = useLocation();
  const key = Object.keys(PAGE_LABELS)
    .filter(k => location.pathname !== '/' ? location.pathname.startsWith(k) : k === '/')
    .sort((a, b) => b.length - a.length)[0];
  const label = PAGE_LABELS[key] || 'WorkflowEngine';

  return (
    <div className="app-topbar">
      <div className="topbar-left">
        <span style={{ fontWeight: 700, fontSize: '1rem', color: 'var(--text)' }}>
          {PAGE_LABELS['/'] === label ? '🏠' : '📄'} {label}
        </span>
      </div>
      <div className="topbar-right">
        <span style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>
          Workflow Automation Engine
        </span>
        <div style={{
          width: 34, height: 34, borderRadius: '50%',
          background: 'var(--primary)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: '#fff', fontWeight: 700, fontSize: '0.875rem'
        }}>A</div>
      </div>
    </div>
  );
}

function AppShell() {
  return (
    <div className="app-layout">
      <Sidebar />
      <div className="app-main">
        <TopBar />
        <main className="page-content">
          <Routes>
            <Route path="/" element={<WorkflowList />} />
            <Route path="/editor/:id?" element={<WorkflowEditor />} />
            <Route path="/rules/:stepId" element={<RuleEditor />} />
            <Route path="/execute/:workflowId" element={<WorkflowExecution />} />
            <Route path="/logs/:executionId" element={<ExecutionLogs />} />
            <Route path="/executions" element={<ExecutionHistory />} />
          </Routes>
        </main>
      </div>
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AppShell />
    </BrowserRouter>
  );
}

export default App;
