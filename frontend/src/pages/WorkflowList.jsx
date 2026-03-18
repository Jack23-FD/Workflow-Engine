import React, { useState, useEffect } from 'react';
import { workflowService } from '../services/api';
import { Link, useNavigate } from 'react-router-dom';
import { Plus, Play, Edit, Trash2, GitBranch, CheckCircle, XCircle, Layers } from 'lucide-react';
import StatusBadge from '../components/StatusBadge';
import Loader from '../components/Loader';
import EmptyState from '../components/EmptyState';

const WorkflowList = () => {
  const [workflows, setWorkflows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [deleting, setDeleting] = useState(null);
  const navigate = useNavigate();

  const [alert, setAlert] = useState(null);

  const showAlert = (type, msg) => {
    setAlert({ type, msg });
    setTimeout(() => setAlert(null), 3000);
  };

  useEffect(() => {
    loadWorkflows();
  }, []);

  const loadWorkflows = async () => {
    try {
      const res = await workflowService.getAll();
      setWorkflows(res.data);
    } catch (err) {
      console.error('Error loading workflows', err);
      showAlert('error', 'Failed to load workflows.');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Delete workflow "${name}"? This cannot be undone.`)) return;
    setDeleting(id);
    try {
      await workflowService.delete(id);
      showAlert('success', `Workflow "${name}" deleted.`);
      loadWorkflows();
    } catch (err) {
      console.error('Delete failed', err);
      showAlert('error', err.response?.data?.message || 'Failed to delete workflow.');
    } finally {
      setDeleting(null);
    }
  };

  const filtered = workflows.filter(w =>
    w.name.toLowerCase().includes(search.toLowerCase())
  );

  const activeCount = workflows.filter(w => w.isActive).length;

  return (
    <>
      {/* Alerts */}
      {alert && <div className={`alert alert-${alert.type}`} style={{ margin: '16px 24px 0 24px' }}>
        {alert.type === 'success' ? '✓' : '⚠'} {alert.msg}
      </div>}
      {/* Page Header */}
      <div className="page-header">
        <div className="page-header-row">
          <div className="page-header-left">
            <h1 className="page-title">Workflows</h1>
            <p className="page-subtitle">Manage and run your automation workflows</p>
          </div>
          <div className="page-header-actions">
            <Link to="/editor" className="btn btn-primary">
              <Plus size={16} />
              New Workflow
            </Link>
          </div>
        </div>
      </div>

      {/* Stat Cards */}
      <div className="stat-cards">
        <div className="stat-card">
          <div className="stat-card-icon primary">
            <Layers size={22} />
          </div>
          <div>
            <div className="stat-card-label">Total Workflows</div>
            <div className="stat-card-value">{loading ? '—' : workflows.length}</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-card-icon success">
            <CheckCircle size={22} />
          </div>
          <div>
            <div className="stat-card-label">Active</div>
            <div className="stat-card-value">{loading ? '—' : activeCount}</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-card-icon danger">
            <XCircle size={22} />
          </div>
          <div>
            <div className="stat-card-label">Inactive</div>
            <div className="stat-card-value">{loading ? '—' : workflows.length - activeCount}</div>
          </div>
        </div>
      </div>

      {/* Search & Table */}
      <div className="card">
        <div className="card-header">
          <span className="card-title-text">All Workflows</span>
          <input
            className="form-control"
            style={{ width: 240, marginBottom: 0 }}
            placeholder="🔍  Search workflows..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>

        {loading ? (
          <Loader text="Loading workflows..." />
        ) : filtered.length === 0 ? (
          <EmptyState
            icon="🔁"
            title="No workflows found"
            message={search ? 'No workflows match your search.' : 'Create your first workflow to get started.'}
            action={!search && (
              <Link to="/editor" className="btn btn-primary">
                <Plus size={16} /> Create Workflow
              </Link>
            )}
          />
        ) : (
          <div className="table-wrapper" style={{ border: 'none', borderRadius: 0 }}>
            <table className="table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Version</th>
                  <th>Steps</th>
                  <th>Start Step</th>
                  <th>Status</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(wf => (
                  <tr key={wf.id}>
                    <td>
                      <div style={{ fontWeight: 600, display: 'flex', alignItems: 'center', gap: 8 }}>
                        <span style={{
                          width: 32, height: 32, background: 'var(--primary-light)',
                          borderRadius: 'var(--radius-sm)', display: 'inline-flex',
                          alignItems: 'center', justifyContent: 'center', color: 'var(--primary)'
                        }}>
                          <GitBranch size={16} />
                        </span>
                        {wf.name}
                      </div>
                    </td>
                    <td>
                      <span className="tag">v{wf.version}</span>
                    </td>
                    <td>
                      <span style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>
                        {wf.steps?.length || 0} step{wf.steps?.length !== 1 ? 's' : ''}
                      </span>
                    </td>
                    <td>
                      {wf.startStepId
                        ? <span style={{ color: 'var(--success)', fontSize: '0.8125rem' }}>✓ Configured</span>
                        : <span style={{ color: 'var(--danger)', fontSize: '0.8125rem' }}>⚠ Not set</span>
                      }
                    </td>
                    <td>
                      <StatusBadge status={wf.isActive ? 'active' : 'inactive'} />
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: 6, justifyContent: 'flex-end' }}>
                        <Link
                          to={`/editor/${wf.id}`}
                          className="btn btn-secondary btn-sm"
                          title="Edit"
                        >
                          <Edit size={14} /> Edit
                        </Link>
                        <Link
                          to={`/execute/${wf.id}`}
                          className="btn btn-primary btn-sm"
                          title="Execute"
                        >
                          <Play size={14} /> Run
                        </Link>
                        <button
                          onClick={() => handleDelete(wf.id, wf.name)}
                          className="btn btn-danger btn-sm btn-icon"
                          disabled={deleting === wf.id}
                          title="Delete"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </>
  );
};

export default WorkflowList;
