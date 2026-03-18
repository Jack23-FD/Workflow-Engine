import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Play, FileText, X, RefreshCw, CheckCircle, ChevronRight } from 'lucide-react';
import BackButton from '../components/BackButton';
import StatusBadge from '../components/StatusBadge';
import Loader from '../components/Loader';

const API = 'http://localhost:8080/api';

const WorkflowExecution = () => {
  const { workflowId } = useParams();
  const navigate = useNavigate();

  const [workflow, setWorkflow] = useState(null);
  const [schema, setSchema] = useState(null);
  const [formData, setFormData] = useState({});
  const [execution, setExecution] = useState(null);
  const [loading, setLoading] = useState(true);
  const [executing, setExecuting] = useState(false);
  const [error, setError] = useState(null);
  const [rejectReason, setRejectReason] = useState('');
  const [showRejectModal, setShowRejectModal] = useState(false);

  useEffect(() => {
    axios.get(`${API}/workflows/${workflowId}`)
      .then(res => {
        setWorkflow(res.data);
        if (res.data.inputSchema) {
          try {
            const parsedSchema = JSON.parse(res.data.inputSchema);
            setSchema(parsedSchema);
            // initialize form data
            const initialData = {};
            Object.keys(parsedSchema).forEach(key => {
              initialData[key] = parsedSchema[key].type === 'number' ? '' : '';
            });
            setFormData(initialData);
          } catch (e) {
            console.error('Failed to parse schema', e);
          }
        }
      })
      .catch(() => setError('Failed to load workflow.'))
      .finally(() => setLoading(false));
  }, [workflowId]);

  const handleRun = async () => {
    setError(null);
    
    // validate if required fields are missing
    if (schema) {
      for (const [key, field] of Object.entries(schema)) {
         if (field.required && (formData[key] === '' || formData[key] === null || formData[key] === undefined)) {
            setError(`Field "${key}" is required.`);
            return;
         }
      }
    }

    // copy to parsedData, converting numbers
    const parsedData = {};
    if (schema) {
        Object.keys(formData).forEach(key => {
            const val = formData[key];
            if (schema[key]?.type === 'number' && val !== '') {
                parsedData[key] = Number(val);
            } else {
                parsedData[key] = val;
            }
        });
    }

    setExecuting(true);
    try {
      const res = await axios.post(`${API}/workflows/${workflowId}/execute`, {
        data: parsedData, triggeredBy: 'Web UI'
      });
      setExecution(res.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Execution failed.');
    } finally {
      setExecuting(false);
    }
  };

  const handleCancel = async () => {
    if (!execution) return;
    try { const res = await axios.post(`${API}/executions/${execution.id}/cancel`); setExecution(res.data); }
    catch (err) { setError('Cancel failed: ' + (err.response?.data?.message || err.message)); }
  };

  const handleApprove = async () => {
    if (!execution) return;
    try { const res = await axios.post(`${API}/executions/${execution.id}/approve`, { approverId: 'Web User' }); setExecution(res.data); }
    catch (err) { setError('Approval failed: ' + (err.response?.data?.message || err.message)); }
  };

  const handleReject = async () => {
    if (!rejectReason.trim()) {
      setError("Rejection reason is required.");
      return;
    }
    setError(null);
    if (!execution) return;
    try { 
      const res = await axios.post(`${API}/executions/${execution.id}/reject`, { 
        approverId: 'Web User', 
        rejectionReason: rejectReason 
      }); 
      setExecution(res.data);
      setShowRejectModal(false);
    }
    catch (err) { setError('Rejection failed: ' + (err.response?.data?.message || err.message)); }
  };

  const handleRetry = async () => {
    if (!execution) return;
    try { const res = await axios.post(`${API}/executions/${execution.id}/retry`); setExecution(res.data); }
    catch (err) { setError('Retry failed: ' + (err.response?.data?.message || err.message)); }
  };

  if (loading) return <Loader text="Loading workflow..." />;

  return (
    <>
      {/* Page Header */}
      <div className="page-header">
        <BackButton to="/" label="Back to Workflows" />
        <div className="page-header-row" style={{ marginTop: 8 }}>
          <div className="page-header-left">
            <div className="breadcrumb">
              <span className="breadcrumb-link" onClick={() => navigate('/')}>Workflows</span>
              <ChevronRight size={14} className="breadcrumb-sep" />
              <span>Execute</span>
            </div>
            <h1 className="page-title">Run: {workflow?.name}</h1>
            <p className="page-subtitle">Trigger an execution of this workflow with your input data</p>
          </div>
          {execution && (
            <div className="page-header-actions">
              <StatusBadge status={execution.status} />
            </div>
          )}
        </div>
      </div>

      {/* Alerts */}
      {error && <div className="alert alert-error">⚠ {error}</div>}
      {execution?.status === 'completed' && (
        <div className="alert alert-success">
          <CheckCircle size={16} />
          Workflow completed successfully! {execution.logs?.length} step(s) executed.
        </div>
      )}

      {/* Approval Banner */}
      {execution?.status === 'pending' && (
        <div className="approval-banner">
          <div className="approval-banner-text">
            <h4>⏳ Approval Required</h4>
            <p>Workflow is paused at an approval step. Please choose an action.</p>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <button className="btn btn-danger" onClick={() => setShowRejectModal(true)}>✗ Reject</button>
            <button className="btn btn-success" onClick={handleApprove}>✓ Approve</button>
          </div>
        </div>
      )}

      {/* Rejection Modal */}
      {showRejectModal && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setShowRejectModal(false)}>
          <div className="modal">
            <div className="modal-header">
              <h3 className="modal-title">Reject Step</h3>
              <button className="modal-close" onClick={() => setShowRejectModal(false)}><X size={20} /></button>
            </div>
            <div className="modal-body">
              <div className="form-group">
                <label className="form-label form-label-required">Rejection Reason</label>
                <textarea
                  className="form-control"
                  rows={4}
                  value={rejectReason}
                  onChange={e => setRejectReason(e.target.value)}
                  placeholder="Explain why this is being rejected..."
                  autoFocus
                />
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => setShowRejectModal(false)}>Cancel</button>
              <button className="btn btn-danger" onClick={handleReject}>Reject Step</button>
            </div>
          </div>
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: execution ? '1fr 1fr' : '1fr', gap: 20 }}>
        {/* Input Form Card */}
        <div className="card">
          <div className="card-header">
            <span className="card-title-text">{execution ? '↩ Run Again' : '▶ Start Execution'}</span>
          </div>
          <div className="card-body">
            {schema ? (
              <div className="dynamic-form">
                {Object.entries(schema).map(([key, field]) => (
                  <div className="form-group" key={key}>
                    <label className={`form-label ${field.required ? 'form-label-required' : ''}`}>
                      {key} {field.type === 'number' ? '(Number)' : field.type === 'boolean' ? '(Boolean)' : '(Text)'}
                    </label>
                    {field.type === 'boolean' ? (
                      <select
                        className="form-control"
                        value={formData[key] || ''}
                        onChange={e => setFormData({ ...formData, [key]: e.target.value === 'true' })}
                        disabled={executing}
                      >
                        <option value="">Select...</option>
                        <option value="true">True</option>
                        <option value="false">False</option>
                      </select>
                    ) : (
                      <input
                        type={field.type === 'number' ? 'number' : 'text'}
                        className="form-control"
                        value={formData[key] || ''}
                        onChange={e => setFormData({ ...formData, [key]: e.target.value })}
                        disabled={executing}
                        required={field.required}
                      />
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="form-group">
                <label className="form-label">Input Data (JSON)</label>
                <textarea
                  className="form-control"
                  rows={8}
                  value={JSON.stringify(formData, null, 2) !== '{}' ? JSON.stringify(formData, null, 2) : '{\n}'}
                  onChange={e => {
                    try {
                      setFormData(JSON.parse(e.target.value));
                    } catch (err) {
                      // ignore parse errors while typing
                    }
                  }}
                  disabled={executing}
                  style={{ fontFamily: 'monospace', fontSize: '0.875rem' }}
                />
                <div className="form-hint">Provide the key-value pairs this workflow expects.</div>
              </div>
            )}
            <div style={{ display: 'flex', gap: 10, marginTop: 16 }}>
              <button
                className="btn btn-primary"
                onClick={handleRun}
                disabled={executing}
                style={{ flex: 1 }}
              >
                <Play size={16} />
                {executing ? 'Executing...' : 'Start Execution'}
              </button>
              {execution && (
                <button
                  className="btn btn-secondary"
                  onClick={() => navigate(`/logs/${execution.id}`)}
                >
                  <FileText size={16} /> View Logs
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Execution Result Card */}
        {execution && (
          <div className="card">
            <div className="card-header">
              <span className="card-title-text">Execution Result</span>
              <StatusBadge status={execution.status} />
            </div>
            <div className="card-body">
              <div className="detail-grid">
                <div className="detail-item">
                  <div className="detail-label">Status</div>
                  <div className="detail-value"><StatusBadge status={execution.status} dot={false} /></div>
                </div>
                <div className="detail-item">
                  <div className="detail-label">Steps Executed</div>
                  <div className="detail-value">{execution.logs?.length || 0}</div>
                </div>
                <div className="detail-item">
                  <div className="detail-label">Current Step</div>
                  <div className="detail-value">{execution.currentStepName || (execution.status === 'completed' ? '— Done —' : '—')}</div>
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
                  <div className="detail-label">Execution ID</div>
                  <div className="detail-value" style={{ fontSize: '0.75rem', wordBreak: 'break-all' }}>{execution.id}</div>
                </div>
              </div>

              <div className="divider" />

              {/* Step Timeline */}
              {execution.logs?.length > 0 && (
                <>
                  <div style={{ fontWeight: 700, marginBottom: 12, fontSize: '0.875rem', color: 'var(--text-muted)' }}>
                    STEP TIMELINE
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {execution.logs.map((log, idx) => (
                      <div key={log.id} style={{
                        display: 'flex', alignItems: 'center', gap: 10,
                        padding: '8px 12px', background: 'var(--gray-50)',
                        borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)'
                      }}>
                        <span style={{
                          width: 22, height: 22, borderRadius: '50%',
                          background: log.status === 'COMPLETED' ? 'var(--success-light)' : 'var(--danger-light)',
                          color: log.status === 'COMPLETED' ? 'var(--success)' : 'var(--danger)',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          fontSize: '0.75rem', fontWeight: 800, flexShrink: 0
                        }}>{idx + 1}</span>
                        <div style={{ flex: 1 }}>
                          <div style={{ fontWeight: 600, fontSize: '0.875rem' }}>{log.stepName}</div>
                          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                            {log.stepType} {log.selectedNextStep ? `→ ${log.selectedNextStep}` : '→ END'}
                          </div>
                        </div>
                        <StatusBadge status={log.status} dot={false} />
                      </div>
                    ))}
                  </div>
                </>
              )}

              <div style={{ display: 'flex', gap: 8, marginTop: 16 }}>
                <button
                  className="btn btn-secondary btn-sm"
                  onClick={() => navigate(`/logs/${execution.id}`)}
                >
                  <FileText size={14} /> Full Logs
                </button>
                {(execution.status === 'in_progress' || execution.status === 'pending') && (
                  <button className="btn btn-danger btn-sm" onClick={handleCancel}>
                    <X size={14} /> Cancel
                  </button>
                )}
                {execution.status === 'failed' && (
                  <button className="btn btn-primary btn-sm" onClick={handleRetry}>
                    <RefreshCw size={14} /> Retry
                  </button>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default WorkflowExecution;
