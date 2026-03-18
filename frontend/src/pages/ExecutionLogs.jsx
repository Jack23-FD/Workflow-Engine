import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Play, X, RefreshCw, CheckCircle, AlertCircle, ChevronRight } from 'lucide-react';
import BackButton from '../components/BackButton';
import StatusBadge from '../components/StatusBadge';
import Loader from '../components/Loader';
import EmptyState from '../components/EmptyState';

const API = 'http://localhost:8080/api';

const ExecutionLogs = () => {
  const { executionId } = useParams();
  const navigate = useNavigate();
  const [execution, setExecution] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const load = useCallback(async () => {
    try {
      const res = await axios.get(`${API}/executions/${executionId}`);
      setExecution(res.data);
      setError(null);
    } catch (err) {
      setError('Failed to load execution: ' + (err.response?.data?.message || err.message));
    } finally {
      setLoading(false);
    }
  }, [executionId]);

  useEffect(() => {
    load();
    const interval = setInterval(() => {
      if (execution?.status === 'in_progress' || execution?.status === 'pending') load();
    }, 3000);
    return () => clearInterval(interval);
  }, [load, execution?.status]);

  const handleApprove = async () => {
    try { const res = await axios.post(`${API}/executions/${executionId}/approve`, { approverId: 'Web User' }); setExecution(res.data); }
    catch (err) { setError('Approval failed: ' + (err.response?.data?.message || err.message)); }
  };

  const handleCancel = async () => {
    try { const res = await axios.post(`${API}/executions/${executionId}/cancel`); setExecution(res.data); }
    catch (err) { setError('Cancel failed: ' + (err.response?.data?.message || err.message)); }
  };

  const handleRetry = async () => {
    try { const res = await axios.post(`${API}/executions/${executionId}/retry`); setExecution(res.data); }
    catch (err) { setError('Retry failed: ' + (err.response?.data?.message || err.message)); }
  };

  if (loading) return <Loader text="Loading execution details..." />;
  if (!execution) return (
    <div><BackButton /><div className="alert alert-error" style={{ marginTop: 16 }}>Execution not found.</div></div>
  );

  return (
    <>
      {/* Header */}
      <div className="page-header">
        <BackButton to="/executions" label="Back to History" />
        <div className="page-header-row" style={{ marginTop: 8 }}>
          <div className="page-header-left">
            <div className="breadcrumb">
              <span className="breadcrumb-link" onClick={() => navigate('/executions')}>Execution History</span>
              <ChevronRight size={14} className="breadcrumb-sep" />
              <span>Logs</span>
            </div>
            <h1 className="page-title">Execution Logs</h1>
            <p className="page-subtitle">{execution.workflowName}</p>
          </div>
          <div className="page-header-actions">
            <StatusBadge status={execution.status} />
          </div>
        </div>
      </div>

      {/* Alerts */}
      {error && <div className="alert alert-error">⚠ {error}</div>}
      {execution.status === 'completed' && (
        <div className="alert alert-success">
          <CheckCircle size={16} /> Workflow completed — {execution.logs?.length} step(s) executed successfully.
        </div>
      )}
      {execution.status === 'failed' && execution.logs?.find(l => l.status === 'FAILED')?.errorMessage && (
        <div className="alert alert-error">
          <AlertCircle size={16} /> {execution.logs.find(l => l.status === 'FAILED').errorMessage}
        </div>
      )}

      {/* Approval Banner */}
      {execution.status === 'pending' && (
        <div className="approval-banner">
          <div className="approval-banner-text">
            <h4>⏳ Approval Required</h4>
            <p>Workflow is paused at an approval step. Approve to continue execution.</p>
          </div>
          <button className="btn btn-success" onClick={handleApprove}>✓ Approve</button>
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 20 }}>
        {/* Summary Card */}
        <div className="card">
          <div className="card-header">
            <span className="card-title-text">Execution Summary</span>
            <div style={{ display: 'flex', gap: 8 }}>
              {(execution.status === 'in_progress' || execution.status === 'pending') && (
                <button className="btn btn-danger btn-sm" onClick={handleCancel}><X size={14} /> Cancel</button>
              )}
              {execution.status === 'failed' && (
                <button className="btn btn-primary btn-sm" onClick={handleRetry}><RefreshCw size={14} /> Retry</button>
              )}
              <button className="btn btn-secondary btn-sm" onClick={() => navigate(`/execute/${execution.workflowId}`)}>
                <Play size={14} /> Run Again
              </button>
            </div>
          </div>
          <div className="card-body">
            <div className="detail-grid">
              <div className="detail-item">
                <div className="detail-label">Execution ID</div>
                <div className="detail-value" style={{ fontSize: '0.75rem' }}>{execution.id}</div>
              </div>
              <div className="detail-item">
                <div className="detail-label">Workflow Version</div>
                <div className="detail-value">v{execution.workflowVersion}</div>
              </div>
              <div className="detail-item">
                <div className="detail-label">Status</div>
                <div className="detail-value"><StatusBadge status={execution.status} dot={false} /></div>
              </div>
              <div className="detail-item">
                <div className="detail-label">Steps Run</div>
                <div className="detail-value">{execution.logs?.length || 0}</div>
              </div>
              <div className="detail-item">
                <div className="detail-label">Triggered By</div>
                <div className="detail-value">{execution.triggeredBy}</div>
              </div>
              <div className="detail-item">
                <div className="detail-label">Retries</div>
                <div className="detail-value">{execution.retries ?? 0}</div>
              </div>
              <div className="detail-item">
                <div className="detail-label">Started At</div>
                <div className="detail-value">{execution.startedAt ? new Date(execution.startedAt).toLocaleString() : '—'}</div>
              </div>
              <div className="detail-item">
                <div className="detail-label">Ended At</div>
                <div className="detail-value">{execution.endedAt ? new Date(execution.endedAt).toLocaleString() : '—'}</div>
              </div>
            </div>
          </div>
        </div>

        {/* Step Log Table */}
        <div className="card">
          <div className="card-header">
            <span className="card-title-text">Step Execution Log</span>
          </div>
          {!execution.logs || execution.logs.length === 0 ? (
            <EmptyState icon="📋" title="No steps executed yet" message="Logs will appear here as steps run." />
          ) : (
            <div className="table-wrapper" style={{ border: 'none', borderRadius: 0 }}>
              <table className="table">
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Step</th>
                    <th>Type</th>
                    <th>Conditions Evaluated</th>
                    <th>Next Step</th>
                    <th>Status</th>
                    <th>Started</th>
                    <th>Duration</th>
                  </tr>
                </thead>
                <tbody>
                  {execution.logs.map((log, idx) => {
                    let rulesData = [];
                    try { rulesData = JSON.parse(log.evaluatedRules); } catch (_) {}
                    return (
                      <React.Fragment key={log.id}>
                        <tr>
                          <td style={{ color: 'var(--text-muted)', fontWeight: 600 }}>{idx + 1}</td>
                        <td style={{ fontWeight: 600 }}>{log.stepName}</td>
                        <td><StatusBadge status={log.stepType} dot={false} /></td>
                        <td>
                          {rulesData.length > 0
                            ? rulesData.map((r, i) => (
                              <div key={i} style={{ fontSize: '0.75rem', marginBottom: 2 }}>
                                <code style={{ background: 'var(--gray-100)', padding: '2px 5px', borderRadius: 3 }}>
                                  #{r.priority}: {r.condition}
                                </code>
                              </div>
                            ))
                            : <span style={{ color: 'var(--text-light)', fontSize: '0.8125rem' }}>—</span>
                          }
                        </td>
                        <td>
                          {log.selectedNextStep
                            ? <span className="tag">{log.selectedNextStep}</span>
                            : <span style={{ color: 'var(--text-muted)', fontSize: '0.8125rem' }}>END</span>}
                        </td>
                        <td><StatusBadge status={log.status} dot={false} /></td>
                        <td style={{ color: 'var(--text-muted)', fontSize: '0.8125rem' }}>
                          {log.startedAt ? new Date(log.startedAt).toLocaleTimeString() : '—'}
                        </td>
                        <td style={{ color: 'var(--text-muted)' }}>
                          {log.durationSeconds != null ? `${log.durationSeconds}s` : '...'}
                        </td>
                      </tr>
                      {log.rejectionReason && (
                        <tr>
                          <td colSpan="8" style={{ padding: '8px 16px', backgroundColor: 'var(--danger-light)', color: 'var(--danger)' }}>
                            <div style={{ fontSize: '0.875rem' }}>
                              <strong>Rejection Reason:</strong> {log.rejectionReason}
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Input Data */}
        {execution.data && (
          <div className="card">
            <div className="card-header">
              <span className="card-title-text">Input Data</span>
            </div>
            <div className="card-body">
              <pre className="pre-code">{JSON.stringify(execution.data, null, 2)}</pre>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default ExecutionLogs;
