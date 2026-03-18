import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { Play, FileText, Calendar, Filter } from 'lucide-react';
import StatusBadge from '../components/StatusBadge';
import Loader from '../components/Loader';
import EmptyState from '../components/EmptyState';

const API = 'http://localhost:8080/api';

const ExecutionHistory = () => {
  const [executions, setExecutions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('ALL');

  useEffect(() => {
    loadExecutions();
  }, []);

  const loadExecutions = async () => {
    try {
      const res = await axios.get(`${API}/executions`);
      // Sort by startedAt desc
      const sorted = res.data.sort((a, b) => new Date(b.startedAt) - new Date(a.startedAt));
      setExecutions(sorted);
    } catch (err) {
      console.error('Failed to load executions', err);
    } finally {
      setLoading(false);
    }
  };

  const filtered = executions.filter(e => {
    if (filter === 'ALL') return true;
    return e.status === filter;
  });

  return (
    <>
      {/* Page Header */}
      <div className="page-header">
        <div className="page-header-row">
          <div className="page-header-left">
            <h1 className="page-title">Execution History</h1>
            <p className="page-subtitle">View past and currently running workflow executions</p>
          </div>
        </div>
      </div>

      {/* Filter and Table */}
      <div className="card">
        <div className="card-header" style={{ display: 'flex', gap: 16 }}>
          <span className="card-title-text" style={{ flex: 1 }}>All Executions</span>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Filter size={16} className="text-muted" />
            <select 
              className="form-control" 
              style={{ width: 140, padding: '4px 8px', marginBottom: 0 }}
              value={filter}
              onChange={e => setFilter(e.target.value)}
            >
              <option value="ALL">All Statuses</option>
              <option value="pending">Pending</option>
              <option value="in_progress">In Progress</option>
              <option value="completed">Completed</option>
              <option value="failed">Failed</option>
              <option value="rejected">Rejected</option>
              <option value="canceled">Canceled</option>
            </select>
          </div>
        </div>
        
        {loading ? (
          <Loader text="Loading history..." />
        ) : filtered.length === 0 ? (
          <EmptyState 
            icon="⏱️" 
            title="No executions found" 
            message={filter === 'ALL' ? "You haven't run any workflows yet." : `No executions match the status filter "${filter}".`}
          />
        ) : (
          <div className="table-wrapper" style={{ border: 'none', borderRadius: 0 }}>
            <table className="table">
              <thead>
                <tr>
                  <th>Execution ID</th>
                  <th>Workflow</th>
                  <th>Triggered By</th>
                  <th>Started</th>
                  <th>Status</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(exec => (
                  <tr key={exec.id}>
                    <td>
                      <Link to={`/logs/${exec.id}`} style={{ fontFamily: 'monospace', color: 'var(--primary)', fontWeight: 600 }}>
                        {exec.id.substring(0, 8)}...
                      </Link>
                    </td>
                    <td style={{ fontWeight: 500 }}>{exec.workflowName} <span className="text-muted" style={{ fontSize: '0.8125rem' }}>v{exec.workflowVersion}</span></td>
                    <td style={{ color: 'var(--text-muted)' }}>{exec.triggeredBy}</td>
                    <td>
                      <div className="flex text-muted" style={{ fontSize: '0.875rem' }}>
                        <Calendar size={14} />
                        {exec.startedAt ? new Date(exec.startedAt).toLocaleString() : '—'}
                      </div>
                    </td>
                    <td>
                      <StatusBadge status={exec.status} />
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: 6, justifyContent: 'flex-end' }}>
                        <Link to={`/execute/${exec.workflowId}`} className="btn btn-secondary btn-sm" title="Run Again">
                          <Play size={14} />
                        </Link>
                        <Link to={`/logs/${exec.id}`} className="btn btn-secondary btn-sm" title="View Logs">
                          <FileText size={14} /> Details
                        </Link>
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

export default ExecutionHistory;
